import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { sendError } from '../utils/response.js';
import { API_ERROR_CODES } from '../../../shared/constants/apiErrorCodes.js';

// Safe key generator: use userId when available (post-auth routes), otherwise fall back to
// the built-in ipKeyGenerator which handles IPv4/IPv6 correctly.
const userOrIpKey = (req) => req.userId || ipKeyGenerator(req);

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: userOrIpKey,
  handler: (req, res) => {
    sendError(
      res,
      429,
      API_ERROR_CODES.RATE_LIMITED,
      'Too many requests, please try again later.',
      { requestId: req.id }
    );
  },
});

export const oauthRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  handler: (req, res) => {
    sendError(
      res,
      429,
      API_ERROR_CODES.RATE_LIMITED,
      'Too many sign-in attempts, please try again later.',
      { requestId: req.id }
    );
  },
});

export const scanCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: userOrIpKey,
  handler: (req, res) => {
    sendError(
      res,
      429,
      API_ERROR_CODES.RATE_LIMITED,
      'Too many scan requests. Please try again later.',
      { requestId: req.id }
    );
  },
});

