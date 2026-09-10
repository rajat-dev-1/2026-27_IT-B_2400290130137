import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRepository } from '../middleware/authorizeRepository.js';
import { requestScan, getScanStatus, retryScan, getLatestScan } from '../controllers/scanController.js';
import { scanCreationLimiter } from '../middleware/rateLimiter.js';
import { scanParamsSchema, scanBodySchema } from '../validators/scanValidators.js';
import { ApiError } from '../utils/apiError.js';
import { API_ERROR_CODES } from '../../../shared/constants/apiErrorCodes.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

// Rate limiter for retries: 3 requests per 15 minutes
import rateLimit from 'express-rate-limit';
const retryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { success: false, error: { code: API_ERROR_CODES.RATE_LIMITED, message: 'Too many retry requests. Please try again later.' } }
});

const validateParams = validateRequest({ params: scanParamsSchema });

// We will mount this router twice or split them in index.js. 
// For cleaner approach, export separate routers or use full paths.
export const repositoryScansRouter = Router({ mergeParams: true });
repositoryScansRouter.use(authenticate, validateParams, authorizeRepository);
repositoryScansRouter.post('/', scanCreationLimiter, validateRequest({ body: scanBodySchema }), requestScan);
repositoryScansRouter.get('/latest', getLatestScan);

export const scansRouter = Router({ mergeParams: true });
scansRouter.use(authenticate, validateParams);
scansRouter.get('/:scanId', getScanStatus);
scansRouter.post('/:scanId/retry', retryLimiter, retryScan);
