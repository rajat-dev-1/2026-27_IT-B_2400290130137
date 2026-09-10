import { db } from '../config/database.js';
import { users } from '../db/schema/users.js';
import { eq } from 'drizzle-orm';
import { 
  exchangeAuthorizationCode, 
  getGitHubProfile, 
  getGitHubPrimaryEmail 
} from './githubService.js';
import { encryptSecret } from '../utils/crypto.js';
import { signAccessToken, signRefreshToken } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';
import { API_ERROR_CODES } from '../../../shared/constants/apiErrorCodes.js';

/**
 * Coordinates the GitHub OAuth token exchange, fetches user data, 
 * upserts into the database, and returns JWT tokens.
 * 
 * @param {string} code - GitHub authorization code
 * @returns {Promise<{ accessToken: string, refreshToken: string, user: Object }>}
 */
export async function processGitHubLogin(code) {
  // 1. Exchange code for GitHub access token
  const githubAccessToken = await exchangeAuthorizationCode(code);

  // 2. Fetch GitHub profile and email
  const profile = await getGitHubProfile(githubAccessToken);
  const email = await getGitHubPrimaryEmail(githubAccessToken);

  // 3. Encrypt GitHub access token before storing
  const encryptedAccessToken = encryptSecret(githubAccessToken);

  // 4. Upsert user in database
  const [user] = await db.insert(users)
    .values({
      githubId: String(profile.id),
      githubUsername: profile.login,
      email: email,
      avatarUrl: profile.avatar_url,
      encryptedAccessToken,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: users.githubId,
      set: {
        githubUsername: profile.login,
        email: email,
        avatarUrl: profile.avatar_url,
        encryptedAccessToken,
        updatedAt: new Date(),
      }
    })
    .returning();

  // 5. Create application session tokens
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return { accessToken, refreshToken, user };
}

/**
 * Creates a new access token for a valid refresh token user.
 * 
 * @param {string} userId - User ID from refresh token
 * @returns {Promise<string>} The new access token
 */
export async function refreshUserSession(userId) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  
  if (!user) {
    throw new ApiError(401, API_ERROR_CODES.USER_NOT_FOUND, 'Your session has expired. Please sign in again.');
  }

  return signAccessToken(user);
}

/**
 * Gets a safe user profile for the /me endpoint.
 * 
 * @param {string} userId - Internal user UUID
 * @returns {Promise<Object>}
 */
export async function getCurrentUserProfile(userId) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  
  if (!user) {
    throw new ApiError(401, API_ERROR_CODES.UNAUTHENTICATED, 'Authentication is required.');
  }

  return {
    id: user.id,
    username: user.githubUsername,
    email: user.email,
    avatarUrl: user.avatarUrl,
  };
}
