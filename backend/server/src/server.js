import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { closeDatabase } from './config/database.js';
import { connectRedis, closeRedis, redis } from './config/redis.js';

let server;

const startServer = async () => {
  try {
    await connectRedis();
    
    // Add real Redis PING readiness check
    const pingResponse = await redis.ping();
    if (pingResponse !== 'PONG') {
      throw new Error(`Unexpected Redis ping response: ${pingResponse}`);
    }
    
    server = app.listen(env.PORT, () => {
      logger.info({ event: 'api.started', port: env.PORT }, `API server is listening on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error({ err: error, event: 'api.startup_failed' }, 'Failed to start API server');
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  logger.info({ event: 'api.shutdown_started', signal }, `Shutdown started (signal: ${signal})`);
  
  if (server) {
    server.close(async (err) => {
      if (err) {
        logger.error({ err, event: 'api.shutdown_error' }, 'Error during server closure');
      }
      
      try {
        await closeRedis();
        await closeDatabase();
        logger.info({ event: 'api.shutdown_completed' }, 'Shutdown completed');
        process.exit(err ? 1 : 0);
      } catch (closeError) {
        logger.error({ err: closeError, event: 'api.shutdown_error' }, 'Error during dependencies closure');
        process.exit(1);
      }
    });
  } else {
    await closeRedis();
    await closeDatabase();
    logger.info({ event: 'api.shutdown_completed' }, 'Shutdown completed');
    process.exit(0);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();
