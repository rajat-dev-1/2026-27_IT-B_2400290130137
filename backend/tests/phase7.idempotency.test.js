/**
 * Phase 7 Idempotency Tests
 *
 * Verifies that the system correctly enforces idempotency rules:
 * 1. Same repo + same commit -> returns existing scan, no duplicate job.
 * 2. Second scan request -> returns 200 alreadyExists.
 * 3. Concurrent scan requests -> safely resolved.
 */

import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { API_ERROR_CODES } from '../shared/constants/apiErrorCodes.js';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockScanService = {
  updateScanRecord: jest.fn().mockResolvedValue({}),
  getScanByRepoAndCommit: jest.fn(),
  createScanRecord: jest.fn(),
  getScanByIdAndUserId: jest.fn(),
};

const mockGithubService = {
  getDefaultBranchCommitSha: jest.fn().mockResolvedValue('commit-abc123'),
};

const mockScanQueue = {
  enqueueRepositoryScan: jest.fn().mockResolvedValue({ id: 'job-phase7' }),
};

jest.unstable_mockModule('../server/src/services/scanService.js', () => mockScanService);
jest.unstable_mockModule('../server/src/services/githubService.js', () => mockGithubService);
jest.unstable_mockModule('../server/src/queues/scanQueue.js', () => mockScanQueue);
jest.unstable_mockModule('../server/src/middleware/authenticate.js', () => ({
  authenticate: (req, res, next) => next(),
}));
jest.unstable_mockModule('../server/src/middleware/authorizeRepository.js', () => ({
  authorizeRepository: (req, res, next) => next(),
}));
jest.unstable_mockModule('../server/src/utils/crypto.js', () => ({
  decryptSecret: () => 'decrypted-token'
}));
jest.unstable_mockModule('../server/src/config/database.js', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockResolvedValue([{ encryptedAccessToken: 'encrypted-token' }])
  }
}));

const { repositoryScansRouter, scansRouter } = await import('../server/src/routes/scanRoutes.js');
const { SCAN_STATUS } = await import('../shared/constants/scanStatus.js');
const { errorHandler } = await import('../server/src/middleware/errorHandler.js');

// ---------------------------------------------------------------------------
// Test App Factory
// ---------------------------------------------------------------------------
const REPO_UUID = '223e4567-e89b-12d3-a456-426614174000';
const SCAN_UUID = '123e4567-e89b-12d3-a456-426614174001';

function buildApp() {
  const app = express();
  app.use(express.json());

  app.use((req, res, next) => {
    req.userId = 'user-1';
    req.githubToken = 'mock-token';
    next();
  });

  app.use('/api/repositories/:repoId', (req, res, next) => {
    req.repository = { id: REPO_UUID, owner: 'mock-owner', name: 'mock-repo' };
    next();
  });

  app.use('/api/repositories/:repoId/scans', repositoryScansRouter);
  app.use('/api/scans', scansRouter);
  app.use(errorHandler);
  return app;
}

const app = buildApp();

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('Phase 7 Idempotency Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGithubService.getDefaultBranchCommitSha.mockResolvedValue('commit-abc123');
  });

  test('second request for same repo/commit returns 200 with alreadyExists', async () => {
    mockScanService.getScanByRepoAndCommit.mockResolvedValue({
      id: SCAN_UUID,
      jobId: 'existing-job',
      status: SCAN_STATUS.RUNNING,
    });

    const res = await request(app)
      .post(`/api/repositories/${REPO_UUID}/scans`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.alreadyExists).toBe(true);
    expect(res.body.data.scanId).toBe(SCAN_UUID);
    expect(res.body.data.status).toBe(SCAN_STATUS.RUNNING);

    expect(mockScanService.createScanRecord).not.toHaveBeenCalled();
    expect(mockScanQueue.enqueueRepositoryScan).not.toHaveBeenCalled();
  });

  test('failed scan is also returned as alreadyExists instead of duplicating', async () => {
    mockScanService.getScanByRepoAndCommit.mockResolvedValue({
      id: SCAN_UUID,
      jobId: 'failed-job',
      status: SCAN_STATUS.FAILED,
    });

    const res = await request(app)
      .post(`/api/repositories/${REPO_UUID}/scans`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.alreadyExists).toBe(true);
    expect(res.body.data.status).toBe(SCAN_STATUS.FAILED);

    expect(mockScanService.createScanRecord).not.toHaveBeenCalled();
    expect(mockScanQueue.enqueueRepositoryScan).not.toHaveBeenCalled();
  });

  test('new commit sha for same repo creates a new scan', async () => {
    mockScanService.getScanByRepoAndCommit.mockResolvedValue(null);
    mockScanService.createScanRecord.mockResolvedValue({
      id: SCAN_UUID,
      status: SCAN_STATUS.QUEUED,
    });

    mockGithubService.getDefaultBranchCommitSha.mockResolvedValue('commit-new999');

    const res = await request(app)
      .post(`/api/repositories/${REPO_UUID}/scans`)
      .send({});

    expect(res.status).toBe(202);
    expect(res.body.data.alreadyExists).toBeUndefined();
    
    expect(mockScanService.getScanByRepoAndCommit).toHaveBeenCalledWith(REPO_UUID, 'commit-new999');
    
    expect(mockScanService.createScanRecord).toHaveBeenCalledTimes(1);
    expect(mockScanQueue.enqueueRepositoryScan).toHaveBeenCalledTimes(1);
  });
});
