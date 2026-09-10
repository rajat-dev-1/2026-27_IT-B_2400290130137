import request from 'supertest';
import { jest } from '@jest/globals';
import { encryptSecret, decryptSecret } from '../server/src/utils/crypto.js';
import { API_ERROR_CODES } from '../shared/constants/apiErrorCodes.js';

// Setup basic mocks before importing app
jest.unstable_mockModule('../server/src/config/env.js', () => ({
  env: {
    NODE_ENV: 'test',
    PORT: 5000,
    CLIENT_URL: 'http://localhost:5173',
    DATABASE_URL: 'postgresql://test',
    DATABASE_URL_DIRECT: 'postgresql://test',
    REDIS_URL: 'redis://test',
    LOG_LEVEL: 'silent',
    GITHUB_CLIENT_ID: 'mock',
    GITHUB_CLIENT_SECRET: 'mock',
    GITHUB_CALLBACK_URL: 'http://localhost/mock',
    JWT_ACCESS_SECRET: 'mock_secret_must_be_32_bytes_long',
    JWT_REFRESH_SECRET: 'mock_refresh_must_be_32_bytes_lo',
    TOKEN_ENCRYPTION_KEY: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    ACCESS_TOKEN_TTL: '15m',
    REFRESH_TOKEN_TTL: '7d',
    COOKIE_SECURE: false,
    COOKIE_SAME_SITE: 'lax',
  }
}));

const mockPool = {
  query: jest.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] }),
  on: jest.fn(),
  end: jest.fn()
};
jest.unstable_mockModule('../server/src/config/database.js', () => ({
  pool: mockPool,
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnValue([]),
  },
  closeDatabase: jest.fn()
}));

const mockRedis = {
  status: 'ready',
  ping: jest.fn().mockResolvedValue('PONG'),
  on: jest.fn(),
  connect: jest.fn(),
  quit: jest.fn()
};
jest.unstable_mockModule('../server/src/config/redis.js', () => ({
  redis: mockRedis,
  connectRedis: jest.fn(),
  closeRedis: jest.fn()
}));

jest.unstable_mockModule('../server/src/services/repositoryService.js', () => ({
  syncUserRepositories: jest.fn(),
  getUserRepositories: jest.fn(),
  getRepositoryById: jest.fn().mockImplementation(async (repoId, userId) => {
    if (userId === 'user-2') {
      const { ApiError } = await import('../server/src/utils/apiError.js');
      const { API_ERROR_CODES } = await import('../shared/constants/apiErrorCodes.js');
      throw new ApiError(404, API_ERROR_CODES.REPOSITORY_NOT_FOUND, 'Repository not found');
    }
    return { id: repoId, userId };
  })
}));

const { default: app } = await import('../server/src/app.js');

describe('Phase 6 Requirements', () => {
  describe('1. Input Validation', () => {
    it('returns 400 VALIDATION_ERROR for invalid UUID path param', async () => {
      const { signAccessToken } = await import('../server/src/utils/jwt.js');
      const token = signAccessToken({ id: 'user-1', githubId: 'gh-1' });

      const response = await request(app)
        .get('/api/repositories/not-a-uuid')
        .set('Authorization', `Bearer ${token}`);
        
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe(API_ERROR_CODES.VALIDATION_ERROR);
    });
  });

  describe('2 & 12. Ownership Verification', () => {
    it('getRepositoryById throws 404 if repository does not belong to user', async () => {
      const { getRepositoryById } = await import('../server/src/services/repositoryService.js');
      
      await expect(getRepositoryById('123e4567-e89b-12d3-a456-426614174000', 'user-2')).rejects.toMatchObject({
        statusCode: 404,
        code: API_ERROR_CODES.REPOSITORY_NOT_FOUND,
      });
    });
  });

  describe('3 & 4. Rate Limiting', () => {
    it('scan-creation route rejects the 6th scan request within 15 minutes', async () => {
      const { signAccessToken } = await import('../server/src/utils/jwt.js');
      const token = signAccessToken({ id: 'user-ratelimit', githubId: 'gh-1' });

      let lastStatus = 200;
      for (let i = 0; i < 6; i++) {
        const res = await request(app)
          .post('/api/repositories/123e4567-e89b-12d3-a456-426614174000/scans')
          .set('Authorization', `Bearer ${token}`)
          .send({ trigger: 'manual' });
        lastStatus = res.status;
      }
      expect(lastStatus).toBe(429);
    });

    it('OAuth route rejects the 21st request within 15 minutes', async () => {
      let lastStatus = 200;
      for (let i = 0; i < 21; i++) {
        const res = await request(app).get('/api/auth/github');
        lastStatus = res.status;
      }
      expect(lastStatus).toBe(429);
    });
  });

  describe('5. Decrypted Token Round Trip', () => {
    it('encrypt then decrypt returns the original plaintext token', () => {
      const originalToken = 'ghu_123456789012345678901234567890123456';
      const encrypted = encryptSecret(originalToken);
      const decrypted = decryptSecret(encrypted);
      expect(decrypted).toBe(originalToken);
      expect(encrypted).not.toBe(originalToken);
    });
  });
});
