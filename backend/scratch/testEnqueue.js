import { connectRedis, closeRedis } from './server/src/config/redis.js';
import { enqueueRepositoryScan, initScanQueue, closeScanQueue } from './server/src/queues/scanQueue.js';

async function testEnqueue() {
  try {
    await connectRedis();
    initScanQueue();
    console.log('Attempting to enqueue...');
    const job = await enqueueRepositoryScan({
      scanId: '123e4567-e89b-12d3-a456-426614174000',
      repoId: '123e4567-e89b-12d3-a456-426614174001',
      userId: '123e4567-e89b-12d3-a456-426614174002',
      commitSHA: 'abcdef',
      trigger: 'manual'
    }, 'test_job_1');
    console.log('Success! Job ID:', job.id);
  } catch (e) {
    console.error('Failed to enqueue:', e);
  } finally {
    await closeScanQueue();
    await closeRedis();
  }
}

testEnqueue();
