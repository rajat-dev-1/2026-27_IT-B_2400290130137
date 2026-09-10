import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Setup mocks first
const mockScanService = {
  updateScanRecord: jest.fn().mockResolvedValue({}),
  getScanByRepoAndCommit: jest.fn(),
  createScanRecord: jest.fn(),
  getScanByIdAndUserId: jest.fn(),
};

const mockGithubService = {
  getDefaultBranchCommitSha: jest.fn().mockResolvedValue('commit-sha-123'),
  buildGitHubAuthorizeUrl: jest.fn(),
  exchangeAuthorizationCode: jest.fn(),
  getGitHubProfile: jest.fn(),
  getGitHubPrimaryEmail: jest.fn(),
  listGitHubRepositories: jest.fn()
};

const mockScanQueue = {
  enqueueRepositoryScan: jest.fn().mockResolvedValue({ id: 'job-1' })
};

jest.unstable_mockModule('../server/src/services/scanService.js', () => mockScanService);
jest.unstable_mockModule('../server/src/services/githubService.js', () => mockGithubService);
jest.unstable_mockModule('../server/src/queues/scanQueue.js', () => mockScanQueue);
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
jest.unstable_mockModule('../server/src/middleware/authenticate.js', () => ({
  authenticate: (req, res, next) => next()
}));
jest.unstable_mockModule('../server/src/middleware/authorizeRepository.js', () => ({
  authorizeRepository: (req, res, next) => next()
}));

const { repositoryScansRouter, scansRouter } = await import('../server/src/routes/scanRoutes.js');
const { SCAN_STATUS } = await import('../shared/constants/scanStatus.js');

// Setup Express app for testing
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  if (req.headers.authorization === 'Bearer valid') {
    req.userId = 'mock-user-id';
    req.githubToken = 'mock-token';
    next();
  } else {
    res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED' } });
  }
});
app.use('/api/repositories/:repoId', (req, res, next) => {
  if (req.params.repoId === '223e4567-e89b-12d3-a456-426614174000' || req.params.repoId === 'invalid-uuid') {
    req.repository = { id: req.params.repoId, owner: 'mock-owner', name: 'mock-repo' };
    next();
  } else {
    res.status(404).json({ success: false, error: { code: 'REPOSITORY_NOT_FOUND' } });
  }
});

app.use('/api/repositories/:repoId/scans', repositoryScansRouter);
app.use('/api/scans', scansRouter);

const { errorHandler } = await import('../server/src/middleware/errorHandler.js');
app.use(errorHandler);

describe('Scan Routes', () => {
  const validUUID = '123e4567-e89b-12d3-a456-426614174000';
  const repoUUID = '223e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/repositories/:repoId/scans', () => {
    test('returns 401 without auth', async () => {
      const res = await request(app).post(`/api/repositories/${repoUUID}/scans`);
      expect(res.status).toBe(401);
    });

    test('invalid repository UUID returns 400', async () => {
      const res = await request(app)
        .post('/api/repositories/invalid-uuid/scans')
        .set('Authorization', 'Bearer valid');
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('repository not owned returns 404', async () => {
      const res = await request(app)
        .post(`/api/repositories/${validUUID}/scans`) // valid uuid but not repoUUID
        .set('Authorization', 'Bearer valid');
      expect(res.status).toBe(404);
    });

    test('new valid scan request creates queued scan and enqueues job', async () => {
      mockScanService.getScanByRepoAndCommit.mockResolvedValue(null);
      mockScanService.createScanRecord.mockResolvedValue({
        id: validUUID,
        status: SCAN_STATUS.QUEUED
      });

      const res = await request(app)
        .post(`/api/repositories/${repoUUID}/scans`)
        .set('Authorization', 'Bearer valid');
      
      expect(res.status).toBe(202);
      expect(res.body.data.scanId).toBe(validUUID);
    });
  });

  describe('GET /api/scans/:scanId', () => {
    test('returns 401 without auth', async () => {
      const res = await request(app).get(`/api/scans/${validUUID}`);
      expect(res.status).toBe(401);
    });

    test('scan status returns safe 404 for a different user', async () => {
      mockScanService.getScanByIdAndUserId.mockResolvedValue(null);
      
      const res = await request(app)
        .get(`/api/scans/${validUUID}`)
        .set('Authorization', 'Bearer valid');
        
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('SCAN_NOT_FOUND');
    });

    test('scan status returns safe fields for owner', async () => {
      mockScanService.getScanByIdAndUserId.mockResolvedValue({
        id: validUUID,
        repositoryId: repoUUID,
        status: SCAN_STATUS.RUNNING,
        progress: 50,
        progressMessage: 'Running',
      });
      
      const res = await request(app)
        .get(`/api/scans/${validUUID}`)
        .set('Authorization', 'Bearer valid');
        
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(SCAN_STATUS.RUNNING);
    });
  });

  describe('POST /api/scans/:scanId/retry', () => {
    test('retry returns 202 only for failed owner scan', async () => {
      mockScanService.getScanByIdAndUserId.mockResolvedValue({
        id: validUUID,
        status: SCAN_STATUS.FAILED,
        repositoryId: repoUUID,
        commitSha: 'commit-123'
      });
      
      const res = await request(app)
        .post(`/api/scans/${validUUID}/retry`)
        .set('Authorization', 'Bearer valid');
        
      expect(res.status).toBe(202);
      expect(mockScanService.updateScanRecord).toHaveBeenCalled();
      expect(mockScanQueue.enqueueRepositoryScan).toHaveBeenCalled();
    });

    test('retry on running scan returns 409 SCAN_NOT_RETRYABLE', async () => {
      mockScanService.getScanByIdAndUserId.mockResolvedValue({
        id: validUUID,
        status: SCAN_STATUS.RUNNING
      });
      
      const res = await request(app)
        .post(`/api/scans/${validUUID}/retry`)
        .set('Authorization', 'Bearer valid');
        
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('SCAN_NOT_RETRYABLE');
    });
  });
});
