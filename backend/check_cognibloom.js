import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { db } from './server/src/config/database.js';
import { repositories } from './server/src/db/schema/repositories.js';
import { scans } from './server/src/db/schema/scans.js';
import { scanFiles } from './server/src/db/schema/scanFiles.js';
import { issues } from './server/src/db/schema/issues.js';
import { dependencies } from './server/src/db/schema/dependencies.js';
import { eq, desc } from 'drizzle-orm';

async function run() {
  const [repo] = await db.select().from(repositories).where(eq(repositories.id, '7e7b1bb8-dc6e-4f1e-a68f-788b7ef8c25a'));
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

  console.log('Scan ID:', scan.id);
  console.log('Final Scan Status:', scan.status);
  
  const filesList = await db.select().from(scanFiles).where(eq(scanFiles.scanId, scan.id));
  console.log('scan_files count:', filesList.length);
  
  const issuesList = await db.select().from(issues).where(eq(issues.scanId, scan.id));
  console.log('issues count:', issuesList.length);
  
  const depsList = await db.select().from(dependencies).where(eq(dependencies.scanId, scan.id));
  console.log('dependencies count:', depsList.length);

  process.exit(0);
}

run();
