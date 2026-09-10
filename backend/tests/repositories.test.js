import request from 'supertest';
import { jest } from '@jest/globals';
import { API_ERROR_CODES } from '../shared/constants/apiErrorCodes.js';
import { ApiError } from '../server/src/utils/apiError.js';

const VALID_REPO_ID = '123e4567-e89b-12d3-a456-426614174000';

// Mock repository service
jest.unstable_mockModule('../server/src/services/repositoryService.js', () => ({
  syncUserRepositories: jest.fn().mockResolvedValue([
    {
      id: VALID_REPO_ID,
      name: 'codehealth-demo',
      fullName: 'testuser/codehealth-demo',
      primaryLanguage: 'TypeScript',
      description: 'A demo repo',
      isPrivate: false,
      currentHealthScore: null,
      lastScannedAt: null,
    }
  ]),
  getUserRepositories: jest.fn().mockResolvedValue([]),
  getRepositoryById: jest.fn().mockImplementation((repoId, userId) => {
    if (repoId === VALID_REPO_ID && userId === 'uuid-123') {
      return Promise.resolve({
        id: VALID_REPO_ID,
        name: 'codehealth-demo',
        fullName: 'testuser/codehealth-demo',
        primaryLanguage: 'TypeScript',
        description: 'A demo repo',
        isPrivate: false,
        currentHealthScore: null,
        lastScannedAt: null,
      });
    }
    
    return Promise.reject(new ApiError(404, API_ERROR_CODES.REPOSITORY_NOT_FOUND, 'Repository was not found or you do not have access.'));
  })
}));

const { signAccessToken } = await import('../server/src/utils/jwt.js');
const { default: app } = await import('../server/src/app.js');

describe('Repository Endpoints', () => {
  const validToken = signAccessToken({ id: 'uuid-123', githubId: '12345' });
  const otherUserToken = signAccessToken({ id: 'uuid-456', githubId: '67890' });

  describe('GET /api/repositories', () => {
    it('returns 401 without valid access token', async () => {
      const res = await request(app).get('/api/repositories');
      expect(res.status).toBe(401);
    });

    it('returns synced repository list for authenticated user', async () => {
      const res = await request(app)
        .get('/api/repositories')
        .set('Authorization', `Bearer ${validToken}`);
        
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].name).toBe('codehealth-demo');
      expect(res.body.data[0].encryptedAccessToken).toBeUndefined(); // ensure no secrets
    });
  });

  describe('GET /api/repositories/:repoId', () => {
    it('returns repository when repoId and userId match', async () => {
      const res = await request(app)
        .get(`/api/repositories/${VALID_REPO_ID}`)
        .set('Authorization', `Bearer ${validToken}`);
        
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(VALID_REPO_ID);
    });

    it('returns 404 when repository belongs to another user', async () => {
      const res = await request(app)
        .get(`/api/repositories/${VALID_REPO_ID}`)
        .set('Authorization', `Bearer ${otherUserToken}`);
        
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('REPOSITORY_NOT_FOUND');
    });

    it('returns validation error for invalid UUID repo ID', async () => {
      const res = await request(app)
        .get('/api/repositories/invalid-uuid-format')
        .set('Authorization', `Bearer ${validToken}`);
        
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
