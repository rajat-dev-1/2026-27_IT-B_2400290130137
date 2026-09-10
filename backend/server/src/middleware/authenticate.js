import { verifyAccessToken } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';
import { API_ERROR_CODES } from '../../../shared/constants/apiErrorCodes.js';

/**
 * Middleware to authenticate requests using JWT access tokens.
 * Extracts the Bearer token, verifies it, and populates req.auth and req.userId.
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, API_ERROR_CODES.UNAUTHENTICATED, 'Authentication is required.'));
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const payload = verifyAccessToken(token);
    
    // Attach user data to request
    req.userId = payload.sub;
    req.auth = {
      userId: payload.sub,
      githubId: payload.githubId,
    };
    
    next();
  } catch (error) {
    // verifyAccessToken already throws an ApiError, we just pass it to next()
    next(error);
  }
}
