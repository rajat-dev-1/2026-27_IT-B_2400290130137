import dotenv from 'dotenv';
dotenv.config();

import { db } from './server/src/config/database.js';
import { repositories } from './server/src/db/schema/repositories.js';
import { scans } from './server/src/db/schema/scans.js';
import { eq, desc } from 'drizzle-orm';
import { SCAN_STATUS } from './shared/constants/scanStatus.js';
import { enqueueRepositoryScan } from './server/src/queues/scanQueue.js';

async function run() {
  const [repo] = await db.select().from(repositories).where(eq(repositories.id, 'fe92cc1b-ea65-442e-87e5-65f94888307c'));
  if (!repo) {
    console.log('Repo not found');
    process.exit(1);
  }

  const scanList = await db.select().from(scans).where(eq(scans.repositoryId, repo.id)).orderBy(desc(scans.createdAt)).limit(1);
  const scan = scanList[0];
  if (!scan) {
    console.log('No scans found');
    process.exit(1);
  }
  
  console.log('Current Scan Status:', scan.status);
  console.log('Current Error Log:', JSON.stringify(scan.errorLog, null, 2));

  await db.update(scans).set({
    status: SCAN_STATUS.QUEUED,
    attemptCount: 0,
    progress: 0,
    progressMessage: 'Scan requested',
    errorLog: []
  }).where(eq(scans.id, scan.id));
  console.log('Scan set to QUEUED.');

  await enqueueRepositoryScan(
    { scanId: scan.id, repoId: repo.id, userId: scan.userId, commitSHA: scan.commitSha || 'unknown', trigger: 'manual' },
    scan.id
  );
  
  console.log('Job Enqueued!');
  
  await new Promise(r => setTimeout(r, 2000));
  
  const scanListAfter = await db.select().from(scans).where(eq(scans.id, scan.id));
  const scanAfter = scanListAfter[0];
  
  console.log('After Worker processed Scan Status:', scanAfter.status);
  console.log('After Worker Error Log:', JSON.stringify(scanAfter.errorLog, null, 2));
  
  process.exit(0);
}

run();
