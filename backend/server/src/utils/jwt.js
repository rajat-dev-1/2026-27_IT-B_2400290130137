import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from './apiError.js';
import { API_ERROR_CODES } from '../../../shared/constants/apiErrorCodes.js';

/**
 * Signs a short-lived access token.
 * @param {Object} user - The user object from database
 * @returns {string} The signed JWT
 */
export function signAccessToken(user) {
  const payload = {
    sub: user.id,
    githubId: user.githubId,
    type: 'access',
  };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL,
  });
}

/**
 * Verifies an access token and returns the decoded payload.
 * @param {string} token 
 * @returns {Object} Decoded payload
 * @throws {ApiError} If invalid or wrong type
 */
export function verifyAccessToken(token) {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }
    return payload;
  } catch (error) {
    throw new ApiError(401, API_ERROR_CODES.INVALID_TOKEN, 'Your session has expired. Please sign in again.');
  }
}

/**
 * Signs a long-lived refresh token.
 * @param {Object} user 
 * @returns {string} The signed JWT
 */
export function signRefreshToken(user) {
  const payload = {
    sub: user.id,
    type: 'refresh',
  };

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.REFRESH_TOKEN_TTL,
  });
}

/**
 * Verifies a refresh token and returns the decoded payload.
 * @param {string} token 
 * @returns {Object} Decoded payload
 * @throws {ApiError} If invalid or wrong type
 */
export function verifyRefreshToken(token) {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return payload;
  } catch (error) {
    throw new ApiError(401, API_ERROR_CODES.INVALID_TOKEN, 'Your session has expired. Please sign in again.');
  }
}
