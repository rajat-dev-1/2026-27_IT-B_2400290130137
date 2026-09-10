import { db } from './backend/server/src/config/database.js';
import { scans } from './backend/server/src/db/schema/scans.js';
import { scanFiles } from './backend/server/src/db/schema/scanFiles.js';
import { issues } from './backend/server/src/db/schema/issues.js';
import { dependencies } from './backend/server/src/db/schema/dependencies.js';
import { desc } from 'drizzle-orm';

async function generateReport() {
  const [latestScan] = await db.select().from(scans).orderBy(desc(scans.createdAt)).limit(1);
  
  if (!latestScan) {
    console.log("No scans found.");
    process.exit(0);
  }

  const { id } = latestScan;
  
  const [filesCount] = await db.execute(`SELECT COUNT(*) FROM scan_files WHERE scan_id = '${id}'`);
  const [issuesCount] = await db.execute(`SELECT COUNT(*), type, severity FROM issues WHERE scan_id = '${id}' GROUP BY type, severity`);
  const [depsCount] = await db.execute(`SELECT COUNT(*) FROM dependencies WHERE scan_id = '${id}'`);

  const allIssues = await db.execute(`SELECT type, severity, COUNT(*) as cnt FROM issues WHERE scan_id = '${id}' GROUP BY type, severity`);

  console.log(JSON.stringify({
    scan: latestScan,
    fileCount: filesCount?.count || 0,
    depsCount: depsCount?.count || 0,
    issues: allIssues,
  }, null, 2));

  process.exit(0);
}

generateReport().catch(console.error);
