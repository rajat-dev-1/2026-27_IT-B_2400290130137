import { ApiError } from '../utils/apiError.js';
import { sendError } from '../utils/response.js';
import { API_ERROR_CODES } from '../../../shared/constants/apiErrorCodes.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const requestId = req.id;
  
  if (err instanceof ApiError) {
    if (env.NODE_ENV === 'development') {
      logger.error({ err, requestId, event: 'api.error' }, 'API Error');
    }
    return sendError(res, err.statusCode, err.code, err.message, { requestId });
  }

  // Fallback for unknown errors
  logger.error({ err, requestId, event: 'api.unhandled_error' }, 'Unhandled Error');
  return sendError(
    res,
    500,
    API_ERROR_CODES.INTERNAL_ERROR,
    'An unexpected error occurred.',
    { requestId }
  );
};
