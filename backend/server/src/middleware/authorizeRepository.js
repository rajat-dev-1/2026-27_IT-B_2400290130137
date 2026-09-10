import { getRepositoryById } from '../services/repositoryService.js';
import { z } from 'zod';
import { ApiError } from '../utils/apiError.js';
import { API_ERROR_CODES } from '../../../shared/constants/apiErrorCodes.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Schema for UUID validation
const uuidSchema = z.string().uuid();

/**
 * Middleware to authorize access to a specific repository.
 * Must run after authenticate middleware.
 */
export const authorizeRepository = asyncHandler(async (req, res, next) => {
  const { repoId } = req.params;
  
  if (!repoId) {
    return next(new ApiError(400, API_ERROR_CODES.VALIDATION_ERROR, 'Repository ID is required.'));
  }
  
  // Validate it's a UUID
  const parsed = uuidSchema.safeParse(repoId);
  if (!parsed.success) {
    return next(new ApiError(400, API_ERROR_CODES.VALIDATION_ERROR, 'Invalid Repository ID format.'));
  }
  
  // getRepositoryById will throw the safe 404 error if not found or unauthorized
  const repository = await getRepositoryById(repoId, req.userId);
  
  // Attach to request
  req.repository = repository;
  
  next();
});
