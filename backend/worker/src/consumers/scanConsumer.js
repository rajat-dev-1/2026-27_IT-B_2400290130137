import { Worker } from 'bullmq';
import { env } from '../../../server/src/config/env.js';
import { logger } from '../utils/logger.js';
import { processScanLifecycle } from '../services/scanLifecycleProcessor.js';
import { db } from '../config/database.js';
import { scans } from '../../../server/src/db/schema/scans.js';
import { eq } from 'drizzle-orm';
import { SCAN_STATUS } from '../../../shared/constants/scanStatus.js';
import { redis } from '../config/redis.js';

let scanWorker;

/**
 * Initializes and starts the BullMQ scan consumer
 */
export function startScanConsumer() {
  logger.info({ event: 'queue.starting_consumer' }, 'Starting repository-scan consumer');

  scanWorker = new Worker('repository-scan', async (job) => {
    await processScanLifecycle(job);
  }, {
    connection: redis,
    concurrency: 1, // concurrency must be 1 for Phase 3
  });

  scanWorker.on('ready', () => {
    logger.info({ event: 'queue.worker_ready' }, 'Scan worker is ready and listening for jobs');
  });

  scanWorker.on('completed', (job) => {
    logger.info({ event: 'scan.job_completed', jobId: job.id }, 'Job completed successfully');
  });

  scanWorker.on('failed', async (job, err) => {
    logger.error({ event: 'scan.job_failed', jobId: job?.id, err }, 'Job failed');
    
    // If job has exhausted retries, mark it as failed in the database
    if (job && job.attemptsMade >= job.opts.attempts) {
      logger.info({ event: 'scan.final_failure', jobId: job.id }, 'Job exhausted retries, marking as FAILED in DB');
      try {
        if (job.data && job.data.scanId) {
          await db.update(scans)
            .set({ status: SCAN_STATUS.FAILED, updatedAt: new Date() })
            .where(eq(scans.id, job.data.scanId));
        }
      } catch (dbError) {
        logger.error({ event: 'scan.db_update_error', err: dbError }, 'Failed to update scan status to failed in DB');
      }
    } else if (job) {
      logger.info({ event: 'scan.retry_scheduled', jobId: job.id, attempt: job.attemptsMade }, 'Job failed but has retries remaining');
    }
  });

  scanWorker.on('error', err => {
    logger.error({ event: 'worker.error', err }, 'Worker encountered an error');
  });

  return scanWorker;
}

/**
 * Closes the scan worker gracefully
 */
export async function closeScanConsumer() {
  if (scanWorker) {
    await scanWorker.close();
    logger.info({ event: 'worker.closed' }, 'Scan worker closed gracefully');
  }
}
