import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { db } from './server/src/config/database.js';
import { repositories } from './server/src/db/schema/repositories.js';
import { scans } from './server/src/db/schema/scans.js';
import { eq, desc, like } from 'drizzle-orm';

async function run() {
  const repoList = await db.select().from(repositories).where(like(repositories.name, '%Cognibloom-Backend%'));
  if (repoList.length === 0) {
    console.log('Repo not found');
    process.exit(1);
  }
  const repo = repoList[0];
  console.log('Repo:', repo.fullName, repo.id);

  const scanList = await db.select().from(scans).where(eq(scans.repositoryId, repo.id)).orderBy(desc(scans.createdAt)).limit(1);
  const scan = scanList[0];
  
  if (!scan) {
    console.log('No scans found');
    process.exit(1);
  }

  console.log('Scan ID:', scan.id);
  console.log('Final Scan Status:', scan.status);
  console.log('Error Log:', JSON.stringify(scan.errorLog, null, 2));

  process.exit(0);
}

run();
