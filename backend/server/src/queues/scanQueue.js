import { Queue } from 'bullmq';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { redis } from '../config/redis.js';

let scanQueue;

/**
 * Initializes the repository-scan queue
 */
export function initScanQueue() {
  if (scanQueue) return scanQueue;

  scanQueue = new Queue('repository-scan', {
    connection: redis,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 10000,
      },
      removeOnComplete: {
        age: 86400, // 24 hours
        count: 500,
      },
      removeOnFail: false,
    },
  });

  logger.info({ event: 'queue.initialized', queueName: 'repository-scan' }, 'Scan queue initialized');
  return scanQueue;
}

/**
 * Enqueues a new repository scan job.
 * @param {Object} payload 
 * @param {string} jobId 
 */
export async function enqueueRepositoryScan(payload, jobId) {
  if (!scanQueue) {
    initScanQueue();
  }

  const job = await scanQueue.add('analyze-repository', payload, { jobId });
  logger.info({ event: 'queue.job_enqueued', jobId, queueName: 'repository-scan' }, 'Enqueued repository scan job');
  return job;
}

/**
 * Checks queue health.
 */
export async function getQueueHealth() {
  if (!scanQueue) return { status: 'down' };
  try {
    const client = await scanQueue.client;
    const ping = await client.ping();
    return { status: ping === 'PONG' ? 'up' : 'down' };
  } catch (error) {
    return { status: 'down', error: error.message };
  }
}

/**
 * Closes the scan queue connection gracefully.
 */
export async function closeScanQueue() {
  if (scanQueue) {
    await scanQueue.close();
    logger.info({ event: 'queue.closed', queueName: 'repository-scan' }, 'Scan queue closed');
  }
}
