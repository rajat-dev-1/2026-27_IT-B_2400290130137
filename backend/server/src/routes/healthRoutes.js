import express from 'express';
import { sendSuccess, sendError } from '../utils/response.js';
import { API_ERROR_CODES } from '../../../shared/constants/apiErrorCodes.js';
import { logger } from '../utils/logger.js';
import { pool } from '../config/database.js';
import { redis } from '../config/redis.js';

const router = express.Router();

router.get('/live', (req, res) => {
  return sendSuccess(res, {
    status: 'ok',
    service: 'codehealth-api'
  });
});

router.get('/ready', async (req, res) => {
  let dbStatus = 'disconnected';
  let redisStatus = 'disconnected';
  let isHealthy = true;

  try {
    await pool.query('SELECT 1;');
    dbStatus = 'connected';
  } catch (error) {
    isHealthy = false;
    logger.error({ err: error, event: 'health.ready.db_failed' }, 'Database readiness check failed');
  }

  try {
    if (redis.status === 'ready') {
      await redis.ping();
      redisStatus = 'connected';
    } else {
      throw new Error(`Redis status is ${redis.status}`);
    }
  } catch (error) {
    isHealthy = false;
    logger.error({ err: error, event: 'health.ready.redis_failed' }, 'Redis readiness check failed');
  }

  if (isHealthy) {
    return sendSuccess(res, {
      status: 'ok',
      database: dbStatus,
      redis: redisStatus
    });
  } else {
    return sendError(
      res,
      503,
      API_ERROR_CODES.DATABASE_UNAVAILABLE,
      'A required service is currently unavailable.',
      { requestId: req.id }
    );
  }
});

export default router;
