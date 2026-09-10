import { db } from '../config/database.js';
import { users } from '../db/schema/users.js';
import { eq, and, desc } from 'drizzle-orm';
import { decryptSecret } from '../utils/crypto.js';
import { ApiError } from '../utils/apiError.js';
import { API_ERROR_CODES } from '../../../shared/constants/apiErrorCodes.js';
import { getDefaultBranchCommitSha } from '../services/githubService.js';
import { createScanRecord, getScanByRepoAndCommit, updateScanRecord, getScanByIdAndUserId } from '../services/scanService.js';
import { enqueueRepositoryScan } from '../queues/scanQueue.js';
import { SCAN_STATUS } from '../../../shared/constants/scanStatus.js';
import { logger } from '../utils/logger.js';

/**
 * Requests a new scan for a repository
 */
export async function requestScan(req, res, next) {
  try {
    const { userId, repository } = req;
    const requestId = req.id;

    logger.info({
      event: 'scan.request_received',
      requestId,
      userId,
      repoId: repository.id,
      force: req.body.force || false,
    }, 'Scan request received');

    // Validation already passed (middleware), and repository ownership confirmed (authorizeRepository).
    logger.info({
      event: 'scan.validation_succeeded',
      requestId,
      userId,
      repoId: repository.id,
    }, 'Request validation succeeded');

    logger.info({
      event: 'scan.repository_verified',
      requestId,
      userId,
      repoId: repository.id,
    }, 'Repository ownership verified');

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user || !user.encryptedAccessToken) {
      throw new ApiError(401, API_ERROR_CODES.UNAUTHENTICATED, 'Authentication is required.');
    }
    const githubToken = decryptSecret(user.encryptedAccessToken);

    logger.info({
      event: 'scan.commit_lookup_started',
      requestId,
      userId,
      repoId: repository.id,
      repoFullName: repository.fullName,
    }, 'Starting GitHub commit SHA lookup');

    let commitSha;
    try {
      commitSha = await getDefaultBranchCommitSha(repository, githubToken);
    } catch (ghError) {
      logger.warn({
        event: 'scan.commit_lookup_failed',
        requestId,
        userId,
        repoId: repository.id,
        errCode: ghError.code ?? null,
        errStatus: ghError.status ?? null,
      }, 'Failed to obtain commit SHA from GitHub');
      throw ghError;
    }

    if (!commitSha || typeof commitSha !== 'string' || commitSha.trim() === '') {
      logger.warn({
        event: 'scan.commit_lookup_failed',
        requestId,
        userId,
        repoId: repository.id,
        reason: 'empty_sha',
      }, 'GitHub returned an empty commit SHA');
      throw new ApiError(502, API_ERROR_CODES.GITHUB_API_UNAVAILABLE, 'Could not resolve current commit SHA from GitHub.');
    }

    logger.info({
      event: 'scan.commit_lookup_succeeded',
      requestId,
      userId,
      repoId: repository.id,
    }, 'Commit SHA resolved successfully');

    let scan;
    const forceRescan = req.body.force === true;
    
    if (!forceRescan) {
      scan = await getScanByRepoAndCommit(repository.id, commitSha);
  
      logger.info({
        event: 'scan.idempotency_checked',
        requestId,
        userId,
        repoId: repository.id,
        existingScanId: scan?.id ?? null,
        existingStatus: scan?.status ?? null,
      }, 'Idempotency check complete');
  
      if (scan) {
        let safeError = null;
        let safeApiCode = null;
        if (scan.status === SCAN_STATUS.FAILED && scan.errorLog && scan.errorLog.length > 0) {
          safeError = scan.errorLog[scan.errorLog.length - 1].message || 'Scan failed.';
          safeApiCode = scan.errorLog[scan.errorLog.length - 1].apiCode || null;
        }

        // Existing scan found — return it without creating a duplicate
        return res.status(200).json({
          success: true,
          data: {
            scanId: scan.id,
            repoId: repository.id,
            jobId: scan.jobId ?? null,
            status: scan.status,
            progress: scan.progress,
            error: safeError,
            apiCode: safeApiCode,
            alreadyExists: true,
            isRescan: scan.isRescan,
          }
        });
      }
    }

    scan = await createScanRecord({
      repositoryId: repository.id,
      userId: userId,
      commitSha: commitSha,
      status: SCAN_STATUS.QUEUED,
      progress: 0,
      progressMessage: 'Scan is waiting for a worker.',
      isRescan: forceRescan,
    });

    if (!scan) {
      // Conflict happened and we missed the read (or failed to insert runNumber), fetch it
      scan = await getScanByRepoAndCommit(repository.id, commitSha);
      let safeError = null;
      let safeApiCode = null;
      if (scan.status === SCAN_STATUS.FAILED && scan.errorLog && scan.errorLog.length > 0) {
        safeError = scan.errorLog[scan.errorLog.length - 1].message || 'Scan failed.';
        safeApiCode = scan.errorLog[scan.errorLog.length - 1].apiCode || null;
      }
      return res.status(200).json({
        success: true,
        data: {
          scanId: scan.id,
          repoId: repository.id,
          jobId: scan.jobId ?? null,
          status: scan.status,
          progress: scan.progress,
          error: safeError,
          apiCode: safeApiCode,
          alreadyExists: true,
          isRescan: scan.isRescan,
        }
      });
    }

    logger.info({
      event: 'scan.row_created',
      requestId,
      userId,
      repoId: repository.id,
      scanId: scan.id,
    }, 'Scan row created in database');

    const jobId = `scan_${scan.id}`;

    logger.info({
      event: 'scan.enqueue_started',
      requestId,
      userId,
      repoId: repository.id,
      scanId: scan.id,
      jobId,
    }, 'Attempting to enqueue scan job');

    try {
      await enqueueRepositoryScan({
        scanId: scan.id,
        repoId: repository.id,
        userId: userId,
        commitSHA: commitSha,
        trigger: 'manual'
      }, jobId);

      await updateScanRecord(scan.id, { jobId });

      logger.info({
        event: 'scan.enqueue_succeeded',
        requestId,
        userId,
        repoId: repository.id,
        scanId: scan.id,
        jobId,
      }, 'Scan job enqueued successfully');

    } catch (queueError) {
      logger.error({
        err: { message: queueError.message, code: queueError.code },
        event: 'scan.enqueue_failed',
        requestId,
        scanId: scan.id,
      }, 'Failed to enqueue repository scan');
      // Mark scan failed
      await updateScanRecord(scan.id, {
        status: SCAN_STATUS.FAILED,
        errorLog: [{ stage: 'queue-enqueue', message: 'Failed to enqueue job due to queue unavailability', occurredAt: new Date().toISOString() }]
      });
      throw new ApiError(503, API_ERROR_CODES.QUEUE_UNAVAILABLE, 'Queue is currently unavailable. Please try again later.');
    }

    logger.info({
      event: 'scan.response_sent',
      requestId,
      userId,
      repoId: repository.id,
      scanId: scan.id,
      jobId,
      status: SCAN_STATUS.QUEUED,
    }, 'Scan 202 response sent');

    return res.status(202).json({
      success: true,
      data: {
        scanId: scan.id,
        jobId: jobId,
        repoId: repository.id,
        status: SCAN_STATUS.QUEUED,
        progress: 0,
        progressMessage: 'Scan is waiting for a worker.',
        message: 'Repository scan has been queued.',
        alreadyScanned: false,
        isRescan: forceRescan,
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Gets the status of a specific scan
 */
export async function getScanStatus(req, res, next) {
  try {
    const { scanId } = req.params;
    const { userId } = req;

    const scan = await getScanByIdAndUserId(scanId, userId);
    if (!scan) {
      throw new ApiError(404, API_ERROR_CODES.SCAN_NOT_FOUND, 'Scan not found.');
    }

    // safe user-facing error string
    let safeError = null;
    let safeApiCode = null;
    if (scan.status === SCAN_STATUS.FAILED && scan.errorLog && scan.errorLog.length > 0) {
      safeError = scan.errorLog[scan.errorLog.length - 1].message || 'Scan failed.';
      safeApiCode = scan.errorLog[scan.errorLog.length - 1].apiCode || null;
    }

    return res.status(200).json({
      success: true,
      data: {
        scanId: scan.id,
        repoId: scan.repositoryId,
        status: scan.status,
        progress: scan.progress,
        progressMessage: scan.progressMessage,
        startedAt: scan.startedAt,
        completedAt: scan.completedAt,
        error: safeError,
        apiCode: safeApiCode
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retries a failed scan
 */
export async function retryScan(req, res, next) {
  try {
    const { scanId } = req.params;
    const { userId } = req;
    const requestId = req.id;

    const scan = await getScanByIdAndUserId(scanId, userId);
    if (!scan) {
      throw new ApiError(404, API_ERROR_CODES.SCAN_NOT_FOUND, 'Scan not found.');
    }

    if (scan.status !== SCAN_STATUS.FAILED) {
      throw new ApiError(409, API_ERROR_CODES.SCAN_NOT_RETRYABLE, 'This scan cannot be retried in its current state.');
    }

    const timestamp = Date.now();
    const newJobId = `scan_${scan.id}_retry_${timestamp}`;

    await updateScanRecord(scan.id, {
      status: SCAN_STATUS.QUEUED,
      progress: 0,
      progressMessage: 'Scan retry is waiting for a worker.',
      startedAt: null,
      completedAt: null,
      durationMs: null,
      jobId: newJobId,
      attemptCount: scan.attemptCount + 1
    });

    logger.info({
      event: 'scan.enqueue_started',
      requestId,
      userId,
      scanId: scan.id,
      jobId: newJobId,
    }, 'Attempting to enqueue scan retry job');

    try {
      await enqueueRepositoryScan({
        scanId: scan.id,
        repoId: scan.repositoryId,
        userId: scan.userId,
        commitSHA: scan.commitSha,
        trigger: 'manual'
      }, newJobId);

      logger.info({
        event: 'scan.enqueue_succeeded',
        requestId,
        userId,
        scanId: scan.id,
        jobId: newJobId,
      }, 'Scan retry job enqueued successfully');

    } catch (queueError) {
      logger.error({
        err: { message: queueError.message, code: queueError.code },
        event: 'scan.enqueue_failed',
        requestId,
        scanId: scan.id,
      }, 'Failed to enqueue repository scan retry');
      await updateScanRecord(scan.id, {
        status: SCAN_STATUS.FAILED,
        errorLog: [...(scan.errorLog || []), { stage: 'queue-enqueue-retry', message: 'Failed to enqueue retry job due to queue unavailability', occurredAt: new Date().toISOString() }]
      });
      throw new ApiError(503, API_ERROR_CODES.QUEUE_UNAVAILABLE, 'Queue is currently unavailable. Please try again later.');
    }

    return res.status(202).json({
      success: true,
      data: {
        scanId: scan.id,
        jobId: newJobId,
        repoId: scan.repositoryId,
        status: SCAN_STATUS.QUEUED,
        progress: 0,
        progressMessage: 'Scan retry is waiting for a worker.'
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Gets the latest completed scan for a repository
 */
export async function getLatestScan(req, res, next) {
  try {
    const { repoId } = req.params;
    const { userId } = req;
    
    // We import scans schema dynamically here if it's not imported.
    const { scans } = await import('../db/schema/scans.js');

    const result = await db.select().from(scans)
      .where(
        and(
          eq(scans.repositoryId, repoId),
          eq(scans.userId, userId),
          eq(scans.status, SCAN_STATUS.COMPLETED)
        )
      )
      .orderBy(desc(scans.createdAt))
      .limit(1);

    const latestScan = result[0];

    if (!latestScan) {
      throw new ApiError(404, API_ERROR_CODES.SCAN_NOT_FOUND, 'No completed scan found for this repository.');
    }

    return res.status(200).json({
      success: true,
      data: {
        ...latestScan,
        scanId: latestScan.id,
        repoId: latestScan.repositoryId,
        commitSHA: latestScan.commitSha
      }
    });
  } catch (error) {
    next(error);
  }
}
