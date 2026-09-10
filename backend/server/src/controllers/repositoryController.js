import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { syncUserRepositories, getUserRepositories } from '../services/repositoryService.js';
import { logger } from '../utils/logger.js';
import { db } from '../config/database.js';
import { scanFiles } from '../db/schema/scanFiles.js';
import { issues } from '../db/schema/issues.js';
import { eq } from 'drizzle-orm';

/**
 * GET /api/repositories
 * Syncs from GitHub and lists all repositories for the authenticated user.
 */
export const listRepositories = asyncHandler(async (req, res) => {
  const start = Date.now();
  logger.info({ event: 'repository.sync_started', userId: req.userId, requestId: req.id });

  try {
    const repos = await syncUserRepositories(req.userId);
    
    logger.info({ 
      event: 'repository.sync_completed', 
      userId: req.userId, 
      repositoryCount: repos.length,
      durationMs: Date.now() - start,
      requestId: req.id 
    });

    sendSuccess(res, repos);
  } catch (error) {
    logger.error({ 
      err: error, 
      event: 'repository.sync_failed', 
      userId: req.userId,
      durationMs: Date.now() - start,
      requestId: req.id 
    }, 'Repository sync failed');
    throw error;
  }
});

/**
 * GET /api/repositories/:repoId
 * Returns a single repository. Validation and authorization is handled by middleware.
 */
export const getRepository = asyncHandler(async (req, res) => {
  // req.repository is populated by the authorizeRepository middleware
  sendSuccess(res, req.repository);
});

export const getRepositoryFiles = asyncHandler(async (req, res) => {
  const { lastScanId } = req.repository;
  if (!lastScanId) return sendSuccess(res, []);
  
  const files = await db.select().from(scanFiles).where(eq(scanFiles.scanId, lastScanId));
  sendSuccess(res, files);
});

export const getRepositoryIssues = asyncHandler(async (req, res) => {
  const { lastScanId } = req.repository;
  if (!lastScanId) return sendSuccess(res, []);
  
  const results = await db.select().from(issues).where(eq(issues.scanId, lastScanId));
  sendSuccess(res, results);
});

export const getRepositoryRecommendations = asyncHandler(async (req, res) => {
  const { lastScanId } = req.repository;
  if (!lastScanId) return sendSuccess(res, []);
  
  const results = await db.select().from(issues).where(eq(issues.scanId, lastScanId));
  // Filter for unique recommendations
  const recommendationsMap = new Map();
  for (const issue of results) {
    if (issue.recommendation && !recommendationsMap.has(issue.recommendation)) {
      recommendationsMap.set(issue.recommendation, {
        title: issue.title,
        description: issue.description,
        recommendation: issue.recommendation,
        type: issue.type,
        severity: issue.severity,
      });
    }
  }
  sendSuccess(res, Array.from(recommendationsMap.values()));
});
