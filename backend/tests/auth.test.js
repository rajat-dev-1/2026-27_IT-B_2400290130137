import request from 'supertest';
import { jest } from '@jest/globals';

// Mock GitHub Service
jest.unstable_mockModule('../server/src/services/githubService.js', () => ({
  buildGitHubAuthorizeUrl: jest.fn((state) => `https://github.com/login/oauth/authorize?state=${state}`),
  exchangeAuthorizationCode: jest.fn().mockResolvedValue('mock_github_token'),
  getGitHubProfile: jest.fn().mockResolvedValue({
    id: 12345,
    login: 'testuser',
    avatar_url: 'https://example.com/avatar.jpg'
  }),
  getGitHubPrimaryEmail: jest.fn().mockResolvedValue('test@example.com'),
  listGitHubRepositories: jest.fn().mockResolvedValue([]),
  getDefaultBranchCommitSha: jest.fn()
}));

jest.unstable_mockModule('../server/src/services/authService.js', () => ({
  processGitHubLogin: jest.fn().mockResolvedValue({
    accessToken: 'mock_access_token',
    refreshToken: 'mock_refresh_token',
    user: { id: 'uuid-123', githubId: '12345' }
  }),
  refreshUserSession: jest.fn().mockResolvedValue('new_mock_access_token'),
  getCurrentUserProfile: jest.fn().mockResolvedValue({
    id: 'uuid-123',
    username: 'testuser',
    email: 'test@example.com',
    avatarUrl: 'https://example.com/avatar.jpg'
  })
}));

const { signAccessToken, signRefreshToken } = await import('../server/src/utils/jwt.js');
const { default: app } = await import('../server/src/app.js');

describe('Authentication Flow', () => {
  describe('GET /api/auth/github', () => {
    it('redirects to GitHub authorization URL with state', async () => {
      const res = await request(app).get('/api/auth/github');
      
      expect(res.status).toBe(302);
      expect(res.header.location).toContain('https://github.com/login/oauth/authorize');
      expect(res.header.location).toContain('state=');
      
      // Should set a state cookie
      const cookies = res.header['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('codehealth_oauth_state=');
    });
  });

  describe('GET /api/auth/github/callback', () => {
    it('handles GitHub denied consent safely', async () => {
      const res = await request(app).get('/api/auth/github/callback?error=access_denied');
      
      expect(res.status).toBe(302);
      expect(res.header.location).toContain('status=error&reason=github_denied');
    });

    it('redirects safely if state is missing or invalid', async () => {
      // No cookie sent
      const res = await request(app).get('/api/auth/github/callback?code=123&state=abc');
      
      expect(res.status).toBe(302);
      expect(res.header.location).toContain('status=error&reason=invalid_state');
    });

    it('processes successful OAuth callback and sets refresh cookie', async () => {
      // Simulate valid state cookie
      const state = 'valid_state_abc123';
      
      const res = await request(app)
        .get(`/api/auth/github/callback?code=mock_code&state=${state}`)
        .set('Cookie', [`codehealth_oauth_state=${state}`]);
        
      expect(res.status).toBe(302);
      expect(res.header.location).toContain('status=success');
      
      // Refresh cookie should be set
      const cookies = res.header['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(c => c.includes('codehealth_refresh='))).toBe(true);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns 401 without Bearer token', async () => {
      const res = await request(app).get('/api/auth/me');
      
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHENTICATED');
    });

    it('returns profile with valid access token', async () => {
      // Generate a real token so the middleware passes
      const validToken = signAccessToken({ id: 'uuid-123', githubId: '12345' });
      
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validToken}`);
        
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.username).toBe('testuser');
      expect(res.body.data.encryptedAccessToken).toBeUndefined();
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('returns 401 if no refresh cookie is provided', async () => {
      const res = await request(app).post('/api/auth/refresh');
      
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('returns new access token with valid refresh cookie', async () => {
      const validRefreshToken = signRefreshToken({ id: 'uuid-123' });
      
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`codehealth_refresh=${validRefreshToken}`]);
        
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBe('new_mock_access_token');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('clears refresh cookie and returns success', async () => {
      const res = await request(app).post('/api/auth/logout');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      
      // Cookie should be cleared
      const cookies = res.header['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(c => c.includes('codehealth_refresh=; Max-Age=0')) || cookies.some(c => c.includes('Expires=Thu, 01 Jan 1970 00:00:00 GMT'))).toBe(true);
    });
  });
});
