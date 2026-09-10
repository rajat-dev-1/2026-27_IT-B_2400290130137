import crypto from 'crypto';
import ms from 'ms';
import { env } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { processGitHubLogin, refreshUserSession, getCurrentUserProfile } from '../services/authService.js';
import { buildGitHubAuthorizeUrl } from '../services/githubService.js';
import { logger } from '../utils/logger.js';

const OAUTH_STATE_COOKIE = 'codehealth_oauth_state';
const REFRESH_COOKIE = 'codehealth_refresh';

const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAME_SITE,
  path: '/api/auth',
  maxAge: ms(env.REFRESH_TOKEN_TTL),
});

/**
 * GET /api/auth/github
 * Redirects user to GitHub OAuth consent screen
 */
export const beginGitHubOAuth = asyncHandler(async (req, res) => {
  const state = crypto.randomBytes(32).toString('hex');

  // Store state in a short-lived cookie for CSRF protection
  res.cookie(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000, // 10 minutes
  });

  const authorizeUrl = buildGitHubAuthorizeUrl(state);
  
  logger.info({ event: 'auth.oauth_started', requestId: req.id });
  res.redirect(authorizeUrl);
});

/**
 * GET /api/auth/github/callback
 * Handles GitHub OAuth redirect, exchanges code, and creates session
 */
export const handleGitHubCallback = asyncHandler(async (req, res) => {
  const { code, state, error } = req.query;

  // Handle user denying access
  if (error) {
    logger.info({ event: 'auth.oauth_callback_failed', failureCode: 'github_denied', requestId: req.id });
    return res.redirect(`${env.CLIENT_URL}/auth/callback?status=error&reason=github_denied`);
  }

  // Validate state
  const storedState = req.cookies[OAUTH_STATE_COOKIE];
  res.clearCookie(OAUTH_STATE_COOKIE);

  if (!state || !storedState || state !== storedState) {
    logger.warn({ event: 'auth.oauth_callback_failed', failureCode: 'invalid_state', requestId: req.id });
    return res.redirect(`${env.CLIENT_URL}/auth/callback?status=error&reason=invalid_state`);
  }

  try {
    const { accessToken, refreshToken, user } = await processGitHubLogin(code);

    res.cookie(REFRESH_COOKIE, refreshToken, getRefreshCookieOptions());

    logger.info({ event: 'auth.oauth_callback_success', userId: user.id, requestId: req.id });
    
    // Redirect to frontend callback without exposing tokens in URL
    res.redirect(`${env.CLIENT_URL}/auth/callback?status=success`);
  } catch (err) {
    logger.error({ err, event: 'auth.oauth_callback_failed', failureCode: 'exchange_failed', requestId: req.id }, 'OAuth exchange failed');
    res.redirect(`${env.CLIENT_URL}/auth/callback?status=error&reason=exchange_failed`);
  }
});

/**
 * GET /api/auth/me
 * Returns the current authenticated user's profile
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const profile = await getCurrentUserProfile(req.userId);
  sendSuccess(res, profile);
});

/**
 * POST /api/auth/refresh
 * Exchanges a valid refresh cookie for a new access token
 */
export const refreshSession = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies[REFRESH_COOKIE];
  
  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'No refresh token provided. Please sign in again.'
      }
    });
  }

  // We need to extract the user ID from the refresh token manually if we are doing logic in controller.
  // Actually, wait, refreshUserSession inside authService can just verify it.
  // We need to import verifyRefreshToken to decode it first, or let authService do both.
  // The prompt said: "POST /api/auth/refresh reads refresh token from cookie, verifies it, and returns a fresh access token in JSON."
  // So let's verify it here.
  const { verifyRefreshToken } = await import('../utils/jwt.js');
  
  const payload = verifyRefreshToken(refreshToken);
  const newAccessToken = await refreshUserSession(payload.sub);
  
  logger.info({ event: 'auth.session_refreshed', userId: payload.sub, requestId: req.id });

  sendSuccess(res, { accessToken: newAccessToken });
});

/**
 * POST /api/auth/logout
 * Clears the refresh cookie
 */
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(REFRESH_COOKIE, getRefreshCookieOptions());
  logger.info({ event: 'auth.logout', requestId: req.id });
  sendSuccess(res, { message: 'Logged out successfully.' });
});
