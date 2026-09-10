import pinoHttp from 'pino-http';
import { logger } from '../utils/logger.js';

export const requestLogger = pinoHttp({
  logger,
  genReqId: (req) => req.id,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["set-cookie"]',
      'res.headers["set-cookie"]',
      'req.query.code',
      'req.query.state',
      'req.query.iss',
      'req.body.accessToken',
      'req.body.refreshToken'
    ],
    censor: '[REDACTED]'
  },
  autoLogging: {
    ignore: (req) => req.url === '/health/live' || req.url === '/health/ready'
  },
});
