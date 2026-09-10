import { ApiError } from '../utils/apiError.js';
import { API_ERROR_CODES } from '../../../shared/constants/apiErrorCodes.js';
import { logger } from '../utils/logger.js';

export const validateRequest = (schemas) => {
  return (req, res, next) => {
    try {
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query);
        for (const key in req.query) delete req.query[key];
        Object.assign(req.query, parsedQuery);
      }
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      next();
    } catch (error) {
      // Build a safe list of Zod issues: only paths + codes, never raw input values
      const safeIssues = error?.issues?.map(issue => ({
        path: issue.path,
        code: issue.code,
        expected: issue.expected,
        received: issue.received,
      })) ?? [];

      logger.warn({
        event: 'scan.validation_failed',
        stage: 'request-validation',
        requestId: req.id,
        userId: req.userId ?? null,
        repoId: req.params?.repoId ?? null,
        method: req.method,
        path: req.path,
        issues: safeIssues,
      }, 'Request validation failed');

      next(new ApiError(
        400,
        API_ERROR_CODES.VALIDATION_ERROR,
        'Invalid request data. Please check your inputs.',
        { requestId: req.id }
      ));
    }
  };
};
