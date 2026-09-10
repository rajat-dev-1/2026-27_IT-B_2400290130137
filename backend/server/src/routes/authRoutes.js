import { Router } from 'express';
import { oauthRateLimiter } from '../middleware/rateLimiter.js';
import { authenticate } from '../middleware/authenticate.js';
import { 
  beginGitHubOAuth, 
  handleGitHubCallback, 
  getCurrentUser, 
  refreshSession, 
  logout 
} from '../controllers/authController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authCallbackQuerySchema } from '../validators/authValidators.js';

const router = Router();

// OAuth flow
router.get('/github', oauthRateLimiter, beginGitHubOAuth);
router.get('/github/callback', oauthRateLimiter, validateRequest({ query: authCallbackQuerySchema }), handleGitHubCallback);

// Session management
router.post('/refresh', refreshSession);
router.post('/logout', logout);

// Protected user profile
router.get('/me', authenticate, getCurrentUser);

export default router;
