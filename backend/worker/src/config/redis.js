import { Redis } from 'ioredis';
import { env } from '../../../server/src/config/env.js';
import { logger } from '../utils/logger.js';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  lazyConnect: true,
  connectTimeout: 10000,
  retryStrategy: (attempt) => Math.min(attempt * 200, 2000),
  family: 4,
});

redis.on('connect', () => {
  logger.info({ event: 'redis.connecting' }, 'Connecting to Redis (Worker)...');
});

redis.on('ready', () => {
  logger.info({ event: 'redis.connected' }, 'Redis connection established (Worker)');
});

redis.on('error', (err) => {
  logger.error({ err, event: 'redis.error' }, 'Redis error (Worker)');
});

redis.on('reconnecting', () => {
  logger.warn({ event: 'redis.reconnecting' }, 'Redis reconnecting... (Worker)');
});

export const connectRedis = async () => {
  if (redis.status !== 'ready' && redis.status !== 'connecting') {
    await redis.connect();
  }
};

export const closeRedis = async () => {
  logger.info({ event: 'redis.disconnecting' }, 'Closing Redis connection (Worker)');
  await redis.quit();
  logger.info({ event: 'redis.disconnected' }, 'Redis connection closed (Worker)');
};
