import request from 'supertest';
import { jest } from '@jest/globals';

// We must mock the environment and database/redis before importing app
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
  db: {},
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

const { default: app } = await import('../server/src/app.js');

describe('Health Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health/live', () => {
    it('should return 200 with ok status', async () => {
      const response = await request(app).get('/health/live');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          data: {
            status: 'ok',
            service: 'codehealth-api'
          }
        })
      );
    });
  });

  describe('GET /health/ready', () => {
    it('should return 200 when both dependencies are healthy', async () => {
      const response = await request(app).get('/health/ready');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          data: {
            status: 'ok',
            database: 'connected',
            redis: 'connected'
          }
        })
      );
    });

    it('should return 503 if database check fails', async () => {
      mockPool.query.mockRejectedValueOnce(new Error('DB Connection Failed'));
      
      const response = await request(app).get('/health/ready');
      
      expect(response.status).toBe(503);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          error: {
            code: 'DATABASE_UNAVAILABLE',
            message: 'A required service is currently unavailable.'
          }
        })
      );
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown route', async () => {
      const response = await request(app).get('/unknown-route-123');
      
      expect(response.status).toBe(404);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'The requested resource was not found.'
          }
        })
      );
    });
  });
});
