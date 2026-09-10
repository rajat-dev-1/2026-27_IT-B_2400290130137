import { env } from '../../../server/src/config/env.js';
import { logger } from '../utils/logger.js';
import { scanJobSchema } from '../../../shared/schemas/scanJobSchema.js';
import { db } from '../config/database.js';
import { scans } from '../../../server/src/db/schema/scans.js';
import { repositories } from '../../../server/src/db/schema/repositories.js';
import { eq, and } from 'drizzle-orm';
import { SCAN_STATUS } from '../../../shared/constants/scanStatus.js';
import { runScanPipeline } from './scanOrchestrator.js';

// Helper for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function processScanLifecycle(job) {
  logger.info({ 
    event: 'worker.job_received', 
    jobId: job.id, 
    scanId: job.data.scanId,
    repoId: job.data.repoId,
    userId: job.data.userId
  });

  // 1. Validate job payload
  const result = scanJobSchema.safeParse(job.data);
  if (!result.success) {
    logger.error({ event: 'scan.validation_failed', err: result.error, jobId: job.id }, 'Invalid job payload');
    throw new Error('Invalid job payload');
  }

  const { scanId, repoId, userId } = result.data;

  // 2. Load scan
  const [scan] = await db.select().from(scans).where(
    and(
      eq(scans.id, scanId),
      eq(scans.repositoryId, repoId),
      eq(scans.userId, userId)
    )
  );

  if (!scan) {
    logger.error({ event: 'scan.not_found', scanId }, 'Scan not found in database');
    throw new Error(`Scan not found: ${scanId}`);
  }

  // 4. Check if already completed (idempotent success)
  if (scan.status === SCAN_STATUS.COMPLETED) {
    logger.info({ event: 'scan.already_completed', scanId }, 'Scan is already completed. Skipping.');
    return;
  }

  // 5. If status is neither queued nor failed, might be running by another worker/zombie. Handle safely.
  if (scan.status !== SCAN_STATUS.QUEUED && scan.status !== SCAN_STATUS.FAILED) {
    logger.warn({ event: 'scan.invalid_start_status', scanId, status: scan.status }, 'Scan is in an unexpected state for processing.');
    // We could proceed if we assume it's a retry of a stalled job. We'll proceed but log it.
  }

  try {
    // 6. Set to running
    await updateScan(scanId, {
      status: SCAN_STATUS.RUNNING,
      attemptCount: job.attemptsMade || scan.attemptCount + 1,
      startedAt: scan.startedAt || new Date(),
      progress: 5,
      progressMessage: 'Preparing repository scan.'
    }, job, 5);

    logger.info({ 
      event: 'worker.scan_started', 
      scanId,
      jobId: job.id,
      attemptCount: job.attemptsMade || scan.attemptCount + 1
    });

    // Fetch repository data
    const [repository] = await db.select().from(repositories).where(eq(repositories.id, repoId));
    
    if (!repository) {
      throw new Error(`Repository not found: ${repoId}`);
    }

    logger.info({ 
      event: 'worker.repository_loaded', 
      scanId, 
      repoId, 
      repositoryFullName: repository.fullName 
    });

    // Call orchestrator
    await runScanPipeline(scan, repository, job, async (progress, message) => {
      await updateScan(scanId, { progress, progressMessage: message }, job, progress);
    });

  } catch (error) {
    logger.error({ 
      event: 'worker.scan_failed', 
      scanId,
      jobId: job.id,
      repoId,
      userId,
      err: error 
    }, 'Processor encountered an error');
    
    let stage = error.stage || 'queue-lifecycle';
    let message = error.message || 'The scan worker could not complete this job.';
    let githubStatus = error.status || error.statusCode || null;
    let apiCode = error.code || null;

    if (error.statusCode) {
      message = error.message || message;
      apiCode = error.code || apiCode;
    } else if (apiCode === 'NO_SUPPORTED_FILES') {
      message = 'Failed: No supported files found (.js, .jsx, .ts, .tsx, .json) outside of ignored directories.';
    } else if (!error.stage) {
       // generic worker error
       apiCode = 'WORKER_ANALYSIS_ERROR';
    }

    const errorEntry = {
      stage,
      message,
      apiCode,
      githubStatus,
      occurredAt: new Date().toISOString()
    };
    
    await db.update(scans)
      .set({
        status: SCAN_STATUS.FAILED,
        progressMessage: message.substring(0, 255),
        errorLog: [...(scan.errorLog || []), errorEntry],
        updatedAt: new Date(),
      })
      .where(eq(scans.id, scanId));

    // Do not endlessly retry certain GitHub errors
    const nonRetryableCodes = [
       'GITHUB_REAUTH_REQUIRED', 
       'GITHUB_REPOSITORY_ACCESS_DENIED', 
       'GITHUB_REPOSITORY_NOT_FOUND_OR_INACCESSIBLE',
       'GITHUB_REPOSITORY_EMPTY',
       'NO_SUPPORTED_FILES',
       'WORKER_ANALYSIS_ERROR'
    ];
    
    if (nonRetryableCodes.includes(apiCode)) {
      // Discard job completely to avoid retries
      job.discard();
    }

    throw error;
  }
}

/**
 * Helper to update scan row and notify BullMQ job progress
 */
async function updateScan(scanId, data, job, jobProgress) {
  // Update DB
  await db.update(scans).set({ ...data, updatedAt: new Date() }).where(eq(scans.id, scanId));
  
  // Update BullMQ progress
  if (jobProgress !== undefined) {
    await job.updateProgress(jobProgress);
  }
  
  logger.info({ event: 'scan.progress_updated', scanId, progress: jobProgress, message: data.progressMessage });
}
