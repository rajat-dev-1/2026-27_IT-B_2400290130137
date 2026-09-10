import dotenv from 'dotenv';
dotenv.config();

import { db } from './server/src/config/database.js';
import { repositories } from './server/src/db/schema/repositories.js';
import { scans } from './server/src/db/schema/scans.js';
import { eq, desc } from 'drizzle-orm';

async function run() {
  const [repo] = await db.select().from(repositories).where(eq(repositories.id, 'fe92cc1b-ea65-442e-87e5-65f94888307c'));
  const scanList = await db.select().from(scans).where(eq(scans.repositoryId, repo.id)).orderBy(desc(scans.createdAt)).limit(1);
  const scan = scanList[0];
  
  console.log('Final Scan Status:', scan.status);
  console.log('Final Error Log:', JSON.stringify(scan.errorLog, null, 2));
  process.exit(0);
}

run();
