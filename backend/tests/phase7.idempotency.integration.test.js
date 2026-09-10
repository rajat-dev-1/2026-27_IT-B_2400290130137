import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { db } from '../server/src/config/database.js';
import { users } from '../server/src/db/schema/users.js';
import { repositories } from '../server/src/db/schema/repositories.js';
import { scans } from '../server/src/db/schema/scans.js';
import { encryptSecret } from '../server/src/utils/crypto.js';
import { eq } from 'drizzle-orm';
import { persistScanResults } from '../worker/src/services/resultWriter.js';
import { getScanByIdAndUserId } from '../server/src/services/scanService.js';

let testUser;
let testRepo;

describe('Phase 7 Idempotency & Multi-Run Rescan Tests', () => {
  beforeAll(async () => {
    const mockToken = encryptSecret('gho_mockTokenForTest');
    const [user] = await db.insert(users).values({
      githubId: 88888,
      githubUsername: 'rescan-tester',
      email: 'rescan@test.com',
      avatarUrl: 'https://example.com/rescan.png',
      encryptedAccessToken: mockToken,
    }).returning();
    testUser = user;

    const [repo] = await db.insert(repositories).values({
      userId: user.id,
      githubRepoId: 99999,
      owner: 'rescan-tester',
      name: 'rescan-repo',
      fullName: 'rescan-tester/rescan-repo',
      isPrivate: false
    }).returning();
    testRepo = repo;
  });

  afterAll(async () => {
    if (testUser?.id) {
      await db.delete(users).where(eq(users.id, testUser.id));
    }
  });

  it('Race condition: newer run completing before older run does not get overwritten', async () => {
    const [scanA] = await db.insert(scans).values({
      repositoryId: testRepo.id,
      userId: testUser.id,
      commitSha: 'abcdef',
      status: 'running',
      runNumber: 1,
      isRescan: false
    }).returning();
    
    await new Promise(resolve => setTimeout(resolve, 100));

    const [scanB] = await db.insert(scans).values({
      repositoryId: testRepo.id,
      userId: testUser.id,
      commitSha: 'abcdef',
      status: 'running',
      runNumber: 2,
      isRescan: true
    }).returning();

    await persistScanResults(scanB.id, [], [], [], { totalFiles: 0, totalIssues: 0, totalDependencies: 0 }, 1000);
    
    let [repo] = await db.select().from(repositories).where(eq(repositories.id, testRepo.id));
    expect(repo.lastScanId).toBe(scanB.id);

    await persistScanResults(scanA.id, [], [], [], { totalFiles: 0, totalIssues: 0, totalDependencies: 0 }, 5000);

    [repo] = await db.select().from(repositories).where(eq(repositories.id, testRepo.id));
    expect(repo.lastScanId).toBe(scanB.id); 
  });
});
