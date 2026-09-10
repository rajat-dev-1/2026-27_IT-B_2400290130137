import { jest } from '@jest/globals';
import { db } from '../server/src/config/database.js';
import { scans } from '../server/src/db/schema/scans.js';
import { users } from '../server/src/db/schema/users.js';
import { repositories } from '../server/src/db/schema/repositories.js';
import { eq } from 'drizzle-orm';
import { SCAN_STATUS } from '../shared/constants/scanStatus.js';
import { encryptSecret } from '../server/src/utils/crypto.js';

jest.unstable_mockModule('../server/src/services/githubService.js', () => ({
  fetchRepositoryTree: jest.fn(),
  fetchFileContent: jest.fn(),
  getDefaultBranchCommitSha: jest.fn()
}));

const githubService = await import('../server/src/services/githubService.js');
const { processScanLifecycle } = await import('../worker/src/services/scanLifecycleProcessor.js');

describe('Fetch Error Handling Integration', () => {
  let testUser;
  let testRepo;
  let testScan;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const randomId = Math.floor(Math.random() * 1000000).toString();
    const [u] = await db.insert(users).values({
      githubId: randomId,
      githubUsername: 'test-user',
      encryptedAccessToken: encryptSecret('real-plaintext-token')
    }).returning();
    testUser = u;

    const [r] = await db.insert(repositories).values({
      userId: testUser.id,
      githubRepoId: parseInt(randomId, 10),
      owner: 'test-owner',
      name: 'test-repo',
      fullName: 'test-owner/test-repo',
      defaultBranch: 'main'
    }).returning();
    testRepo = r;

    const [s] = await db.insert(scans).values({
      repositoryId: testRepo.id,
      userId: testUser.id,
      commitSha: 'mock-sha',
      status: SCAN_STATUS.QUEUED,
    }).returning();
    testScan = s;
  });

  afterEach(async () => {
    await db.delete(scans).where(eq(scans.id, testScan.id));
    await db.delete(repositories).where(eq(repositories.id, testRepo.id));
    await db.delete(users).where(eq(users.id, testUser.id));
  });

  function createMockJob() {
    return {
      id: 'job-123',
      data: {
        scanId: testScan.id,
        repoId: testRepo.id,
        userId: testUser.id,
        attemptCount: 1,
        commitSHA: 'mock-sha',
        trigger: 'manual'
      },
      attemptsMade: 0,
      updateProgress: jest.fn(),
      discard: jest.fn()
    };
  }

  async function getDbScan() {
    const [s] = await db.select().from(scans).where(eq(scans.id, testScan.id));
    return s;
  }

  it('handles GitHub 401 correctly and marks as non-retryable', async () => {
    // In githubService.js, 401 is handled and it throws ApiError.
    // For this mock, we throw the actual ApiError since we mocked the handler function
    // Wait, the handler function is inside githubService.js!
    // Since we mocked githubService entirely, we need to throw the ApiError ourselves in the mock.
    const { ApiError } = await import('../server/src/utils/apiError.js');
    githubService.getDefaultBranchCommitSha.mockRejectedValue(new ApiError(401, 'GITHUB_REAUTH_REQUIRED', 'auth required'));

    const job = createMockJob();
    await expect(processScanLifecycle(job)).rejects.toThrow();

    expect(job.discard).toHaveBeenCalled();

    const updated = await getDbScan();
    expect(updated.status).toBe(SCAN_STATUS.FAILED);
    expect(updated.errorLog.length).toBeGreaterThan(0);
    const log = updated.errorLog[updated.errorLog.length - 1];
    expect(log.apiCode).toBe('GITHUB_REAUTH_REQUIRED');
  });
  
  it('handles GitHub 403 correctly', async () => {
    const { ApiError } = await import('../server/src/utils/apiError.js');
    githubService.getDefaultBranchCommitSha.mockRejectedValue(new ApiError(403, 'GITHUB_REPOSITORY_ACCESS_DENIED', 'access denied'));
    const job = createMockJob();
    await expect(processScanLifecycle(job)).rejects.toThrow();
    expect(job.discard).toHaveBeenCalled();
    const updated = await getDbScan();
    expect(updated.errorLog[updated.errorLog.length - 1].apiCode).toBe('GITHUB_REPOSITORY_ACCESS_DENIED');
  });

  it('handles GitHub 404 correctly', async () => {
    const { ApiError } = await import('../server/src/utils/apiError.js');
    githubService.getDefaultBranchCommitSha.mockRejectedValue(new ApiError(404, 'GITHUB_REPOSITORY_NOT_FOUND_OR_INACCESSIBLE', 'not found'));
    const job = createMockJob();
    await expect(processScanLifecycle(job)).rejects.toThrow();
    expect(job.discard).toHaveBeenCalled();
    const updated = await getDbScan();
    expect(updated.errorLog[updated.errorLog.length - 1].apiCode).toBe('GITHUB_REPOSITORY_NOT_FOUND_OR_INACCESSIBLE');
  });

  it('handles empty repository correctly', async () => {
    const { ApiError } = await import('../server/src/utils/apiError.js');
    githubService.getDefaultBranchCommitSha.mockRejectedValue(new ApiError(409, 'GITHUB_REPOSITORY_EMPTY', 'empty'));
    const job = createMockJob();
    await expect(processScanLifecycle(job)).rejects.toThrow();
    expect(job.discard).toHaveBeenCalled();
    const updated = await getDbScan();
    expect(updated.errorLog[updated.errorLog.length - 1].apiCode).toBe('GITHUB_REPOSITORY_EMPTY');
  });

  it('handles transient GitHub 5xx retry', async () => {
    const { ApiError } = await import('../server/src/utils/apiError.js');
    githubService.getDefaultBranchCommitSha.mockRejectedValue(new ApiError(502, 'GITHUB_API_UNAVAILABLE', 'unavailable'));
    const job = createMockJob();
    await expect(processScanLifecycle(job)).rejects.toThrow();
    expect(job.discard).not.toHaveBeenCalled(); // Retried by BullMQ
    const updated = await getDbScan();
    expect(updated.errorLog[updated.errorLog.length - 1].apiCode).toBe('GITHUB_API_UNAVAILABLE');
  });

  it('handles tree fetch failure', async () => {
    const { ApiError } = await import('../server/src/utils/apiError.js');
    githubService.getDefaultBranchCommitSha.mockResolvedValue('mock-sha-123');
    githubService.fetchRepositoryTree.mockRejectedValue(new ApiError(502, 'GITHUB_API_UNAVAILABLE', 'tree failed'));
    const job = createMockJob();
    await expect(processScanLifecycle(job)).rejects.toThrow();
    const updated = await getDbScan();
    expect(updated.errorLog[updated.errorLog.length - 1].apiCode).toBe('GITHUB_API_UNAVAILABLE');
  });

  it('handles successful fetch of a private repository with mocked GitHub client', async () => {
    githubService.getDefaultBranchCommitSha.mockResolvedValue('mock-sha-123');
    githubService.fetchRepositoryTree.mockResolvedValue([
      { path: 'test.js', type: 'blob', sha: 'file-sha', size: 100 }
    ]);
    githubService.fetchFileContent.mockResolvedValue('const a = 1;');
    
    const job = createMockJob();
    await processScanLifecycle(job);
    
    const updated = await getDbScan();
    expect(updated.status).toBe(SCAN_STATUS.COMPLETED);
    expect(updated.commitSha).toBe('mock-sha-123');
  });

  it('handles content fetch failure for one file without failing the scan', async () => {
    githubService.getDefaultBranchCommitSha.mockResolvedValue('mock-sha-123');
    githubService.fetchRepositoryTree.mockResolvedValue([
      { path: 'test1.js', type: 'blob', sha: 'file-sha-1', size: 100 },
      { path: 'test2.js', type: 'blob', sha: 'file-sha-2', size: 100 }
    ]);
    githubService.fetchFileContent.mockImplementation(async (repo, sha) => {
      if (sha === 'file-sha-1') throw new Error('fetch error');
      return 'const b = 2;';
    });
    
    const job = createMockJob();
    await processScanLifecycle(job);
    
    const updated = await getDbScan();
    expect(updated.status).toBe(SCAN_STATUS.COMPLETED);
  });

  it('handles all files failing', async () => {
    githubService.getDefaultBranchCommitSha.mockResolvedValue('mock-sha-123');
    githubService.fetchRepositoryTree.mockResolvedValue([
      { path: 'test1.js', type: 'blob', sha: 'file-sha-1', size: 100 },
      { path: 'test2.js', type: 'blob', sha: 'file-sha-2', size: 100 }
    ]);
    githubService.fetchFileContent.mockRejectedValue(new Error('fetch error'));
    
    const job = createMockJob();
    await expect(processScanLifecycle(job)).rejects.toThrow();
    
    const updated = await getDbScan();
    expect(updated.status).toBe(SCAN_STATUS.FAILED);
    expect(job.discard).toHaveBeenCalled(); // non-retryable NO_SUPPORTED_FILES
    expect(updated.errorLog[updated.errorLog.length - 1].apiCode).toBe('NO_SUPPORTED_FILES');
  });

  it('handles no supported files', async () => {
    githubService.getDefaultBranchCommitSha.mockResolvedValue('mock-sha-123');
    githubService.fetchRepositoryTree.mockResolvedValue([
      { path: 'test1.md', type: 'blob', sha: 'file-sha-1', size: 100 }
    ]);
    
    const job = createMockJob();
    await expect(processScanLifecycle(job)).rejects.toThrow();
    
    const updated = await getDbScan();
    expect(updated.status).toBe(SCAN_STATUS.FAILED);
    expect(job.discard).toHaveBeenCalled();
    expect(updated.errorLog[updated.errorLog.length - 1].apiCode).toBe('NO_SUPPORTED_FILES');
  });
});
