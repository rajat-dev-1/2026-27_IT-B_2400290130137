import { env } from '../../server/src/config/env.js';
import { logger } from './utils/logger.js';
import { connectDatabase, closeDatabase } from './config/database.js';
import { connectRedis, closeRedis, redis } from './config/redis.js';
import { startScanConsumer, closeScanConsumer } from './consumers/scanConsumer.js';

const startWorker = async () => {
  try {
    logger.info({ event: 'worker.started' }, 'Starting Worker Process...');
    
    // Attempt connections
    await connectRedis();
    
    await connectDatabase();
    
    logger.info({ event: 'worker.dependencies_ready' }, 'Worker dependencies are ready');
    
    // Start consumers
    startScanConsumer();
    
    // We stay alive via the open connections to Redis and Postgres pool.
    
  } catch (error) {
    logger.error({ err: error, event: 'worker.startup_failed' }, 'Failed to start worker');
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  logger.info({ event: 'worker.shutdown_started', signal }, `Worker shutdown started (signal: ${signal})`);
  
  try {
    await closeScanConsumer();
    await closeRedis();
    await closeDatabase();
    logger.info({ event: 'worker.shutdown_completed' }, 'Worker shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error({ err: error, event: 'worker.shutdown_error' }, 'Error during worker shutdown');
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startWorker();
