import { jest } from '@jest/globals';
import { db } from '../server/src/config/database.js';
import { scans } from '../server/src/db/schema/scans.js';
import { scanFiles } from '../server/src/db/schema/scanFiles.js';
import { issues } from '../server/src/db/schema/issues.js';
import { dependencies } from '../server/src/db/schema/dependencies.js';
import { users } from '../server/src/db/schema/users.js';
import { repositories } from '../server/src/db/schema/repositories.js';
import { eq } from 'drizzle-orm';
import { SCAN_STATUS } from '../shared/constants/scanStatus.js';
import { mockTree, mockContents } from './fixtures/controlled_fixture.js';

jest.unstable_mockModule('../server/src/services/githubService.js', () => ({
  fetchRepositoryTree: jest.fn(),
  fetchFileContent: jest.fn()
}));

const githubService = await import('../server/src/services/githubService.js');
const { runScanPipeline } = await import('../worker/src/services/scanOrchestrator.js');


describe('Worker Pipeline Integration', () => {
  let testUser;
  let testRepo;
  let testScan;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Setup Database records
    const randomId = Math.floor(Math.random() * 1000000).toString();
    const [u] = await db.insert(users).values({
      githubId: randomId,
      githubUsername: 'test-user',
      encryptedAccessToken: 'mock-token'
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
      userId: testUser.id,
      repositoryId: testRepo.id,
      commitSha: 'mock-sha',
      status: SCAN_STATUS.RUNNING
    }).returning();
    testScan = s;
  });

  afterEach(async () => {
    await db.delete(scans).where(eq(scans.id, testScan.id));
    await db.delete(repositories).where(eq(repositories.id, testRepo.id));
    await db.delete(users).where(eq(users.id, testUser.id));
  });

  it('runs the full pipeline and writes expected rows', async () => {
    githubService.fetchRepositoryTree.mockResolvedValue(mockTree);
    githubService.fetchFileContent.mockImplementation(async (repo, sha) => {
      return mockContents[sha];
    });

    const updateScanProgress = jest.fn();

    await runScanPipeline(testScan, testRepo, {}, updateScanProgress);

    // Assertions
    const [updatedScan] = await db.select().from(scans).where(eq(scans.id, testScan.id));
    expect(updatedScan.status).toBe(SCAN_STATUS.COMPLETED);
    expect(updatedScan.metrics.totalFiles).toBe(6); // 6 supported files (including package.json)
    
    // Check scan_files rows
    const files = await db.select().from(scanFiles).where(eq(scanFiles.scanId, testScan.id));
    expect(files.length).toBe(6);
    expect(files.find(f => f.path === 'src/complex.js')).toBeDefined();

    // Check issues rows
    const allIssues = await db.select().from(issues).where(eq(issues.scanId, testScan.id));
    expect(allIssues.length).toBeGreaterThan(0);

    const hasComplexity = allIssues.some(i => i.type === 'high_complexity');
    const hasDuplication = allIssues.some(i => i.type === 'duplicated_code');
    const hasUnused = allIssues.some(i => i.type === 'possible-unused-export');
    const hasDependency = allIssues.some(i => i.type === 'outdated_dependency');

    expect(hasComplexity).toBe(true);
    expect(hasDuplication).toBe(true);
    expect(hasUnused).toBe(true);
    expect(hasDependency).toBe(true);

    // Check dependencies rows
    const deps = await db.select().from(dependencies).where(eq(dependencies.scanId, testScan.id));
    expect(deps.length).toBe(3); // outdated, vulnerable, good

    // Check score metrics
    expect(updatedScan.overallScore).toBeDefined();
    expect(updatedScan.overallScore).not.toBeNull();
    expect(Number(updatedScan.overallScore)).toBeGreaterThan(0);

    // Malformed file didn't crash
    const malformed = files.find(f => f.path === 'src/malformed.js');
    expect(malformed).toBeDefined();
  });

  it('fails with NO_SUPPORTED_FILES if repo has no supported code', async () => {
    githubService.fetchRepositoryTree.mockResolvedValue([
      { path: 'image.png', type: 'blob', size: 1000, sha: 'shaX' },
      { path: 'README.md', type: 'blob', size: 200, sha: 'shaY' }
    ]);

    const updateScanProgress = jest.fn();

    await expect(runScanPipeline(testScan, testRepo, {}, updateScanProgress)).rejects.toThrow('No supported files found');
  });
});
