import pino from 'pino';
import { env } from '../../../server/src/config/env.js';

export const logger = pino({
  level: env.LOG_LEVEL,
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
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
});
