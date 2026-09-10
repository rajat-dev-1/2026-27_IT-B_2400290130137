import { db } from '../config/database.js';
import { repositories } from '../db/schema/repositories.js';
import { users } from '../db/schema/users.js';
import { eq, and } from 'drizzle-orm';
import { listGitHubRepositories } from './githubService.js';
import { decryptSecret } from '../utils/crypto.js';
import { ApiError } from '../utils/apiError.js';
import { API_ERROR_CODES } from '../../../shared/constants/apiErrorCodes.js';

import { logger } from '../utils/logger.js';

/**
 * Syncs repositories from GitHub for the given user, storing them in the DB.
 * 
 * @param {string} userId - Internal user UUID
 * @returns {Promise<Array>} Normalized list of repositories
 */
export async function syncUserRepositories(userId) {
  // 1. Get user to retrieve encrypted GitHub token
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  
  if (!user || !user.encryptedAccessToken) {
    throw new ApiError(401, API_ERROR_CODES.UNAUTHENTICATED, 'Authentication is required.');
  }

  // 2. Decrypt token in memory
  let githubAccessToken;
  try {
    githubAccessToken = decryptSecret(user.encryptedAccessToken);
  } catch (error) {
    logger.error({ event: 'github.authentication_rejected', userId }, 'Failed to decrypt GitHub token');
    throw new ApiError(401, API_ERROR_CODES.GITHUB_REAUTH_REQUIRED, 'Your GitHub connection has expired or was revoked. Please reconnect GitHub.');
  }

  if (!githubAccessToken) {
    logger.error({ event: 'github.authentication_rejected', userId }, 'GitHub token is missing after decryption');
    throw new ApiError(401, API_ERROR_CODES.GITHUB_REAUTH_REQUIRED, 'Your GitHub connection has expired or was revoked. Please reconnect GitHub.');
  }

  logger.info({ event: 'github.repositories_fetch_started', userId });
  const startTime = Date.now();

  try {
    // 3. Fetch from GitHub
    const githubRepos = await listGitHubRepositories(githubAccessToken);

  // 4. Upsert into database
  const normalizedRepos = [];
  
  // Note: For a very large number of repos, batch inserts would be better.
  // We process sequentially or in chunks for the MVP.
  for (const repo of githubRepos) {
    const [syncedRepo] = await db.insert(repositories)
      .values({
        userId,
        githubRepoId: repo.githubRepoId,
        owner: repo.owner,
        name: repo.name,
        fullName: repo.fullName,
        defaultBranch: repo.defaultBranch,
        primaryLanguage: repo.primaryLanguage,
        description: repo.description,
        isPrivate: repo.isPrivate,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [repositories.userId, repositories.githubRepoId],
        set: {
          owner: repo.owner,
          name: repo.name,
          fullName: repo.fullName,
          defaultBranch: repo.defaultBranch,
          primaryLanguage: repo.primaryLanguage,
          description: repo.description,
          isPrivate: repo.isPrivate,
          updatedAt: new Date(),
        }
      })
      .returning();
      
      normalizedRepos.push({
        id: syncedRepo.id,
        name: syncedRepo.name,
        fullName: syncedRepo.fullName,
        primaryLanguage: syncedRepo.primaryLanguage,
        description: syncedRepo.description,
        isPrivate: syncedRepo.isPrivate,
        currentHealthScore: syncedRepo.currentHealthScore,
        lastScanId: syncedRepo.lastScanId,
        lastScannedAt: syncedRepo.lastScannedAt,
      });
  }
  
    logger.info({ 
      event: 'github.repositories_fetch_succeeded', 
      userId, 
      durationMs: Date.now() - startTime 
    });
    
    return normalizedRepos;
  } catch (error) {
    logger.error({ 
      event: 'repository.sync_failed', 
      userId, 
      error: error.message, 
      errorCode: error.code || API_ERROR_CODES.GITHUB_API_UNAVAILABLE,
      durationMs: Date.now() - startTime
    });
    
    if (error.code === API_ERROR_CODES.GITHUB_REAUTH_REQUIRED) {
       logger.info({ event: 'github.authentication_rejected', userId });
    }
    
    throw error;
  }
}

/**
 * Retrieves all synced repositories for a user.
 * 
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
export async function getUserRepositories(userId) {
  const userRepos = await db.select()
    .from(repositories)
    .where(eq(repositories.userId, userId));
    
  return userRepos.map(repo => ({
    id: repo.id,
    owner: repo.owner,
    name: repo.name,
    fullName: repo.fullName,
    defaultBranch: repo.defaultBranch,
    primaryLanguage: repo.primaryLanguage,
    description: repo.description,
    isPrivate: repo.isPrivate,
    currentHealthScore: repo.currentHealthScore,
    lastScanId: repo.lastScanId,
    lastScannedAt: repo.lastScannedAt,
  }));
}

/**
 * Gets a specific repository ensuring ownership.
 * 
 * @param {string} repoId 
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
export async function getRepositoryById(repoId, userId) {
  const [repo] = await db.select()
    .from(repositories)
    .where(and(
      eq(repositories.id, repoId),
      eq(repositories.userId, userId)
    ));
    
  if (!repo) {
    throw new ApiError(
      404, 
      API_ERROR_CODES.REPOSITORY_NOT_FOUND,
      'Repository was not found or you do not have access.'
    );
  }
  
  return {
    id: repo.id,
    owner: repo.owner,
    name: repo.name,
    fullName: repo.fullName,
    defaultBranch: repo.defaultBranch,
    primaryLanguage: repo.primaryLanguage,
    description: repo.description,
    isPrivate: repo.isPrivate,
    currentHealthScore: repo.currentHealthScore,
    lastScanId: repo.lastScanId,
    lastScannedAt: repo.lastScannedAt,
  };
}
