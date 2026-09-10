import { describe, it, expect } from '@jest/globals';
import { db } from '../server/src/config/database.js';
import { scans } from '../server/src/db/schema/scans.js';
import { desc } from 'drizzle-orm';

describe('Final Report Generation', () => {
  it('Outputs the requested metrics', async () => {
    const [latestScan] = await db.select().from(scans).orderBy(desc(scans.createdAt)).limit(1);
    
    if (!latestScan) {
      console.log("No scans found.");
      return;
    }

    const { id } = latestScan;
    
    const { rows: filesRows } = await db.execute(`SELECT COUNT(*) FROM scan_files WHERE scan_id = '${id}'`);
    const { rows: issuesRows } = await db.execute(`SELECT type, severity, COUNT(*) as cnt FROM issues WHERE scan_id = '${id}' GROUP BY type, severity`);
    const { rows: depsRows } = await db.execute(`SELECT COUNT(*) FROM dependencies WHERE scan_id = '${id}'`);

    console.log("=== FINAL REPORT DATA ===");
    console.log(JSON.stringify({
      scanStatus: latestScan.status,
      scanProgress: latestScan.progress,
      metrics: latestScan.metrics,
      scores: {
        overall: latestScan.overallScore,
        complexity: latestScan.complexityScore,
        duplication: latestScan.duplicationScore,
        deadCode: latestScan.deadCodeScore,
        dependency: latestScan.dependencyScore
      },
      fileCount: filesRows[0]?.count || 0,
      depsCount: depsRows[0]?.count || 0,
      issues: issuesRows,
    }, null, 2));
    console.log("=========================");
  });
});
