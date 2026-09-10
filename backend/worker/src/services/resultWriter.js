import { db } from '../config/database.js';
import { scans } from '../../../server/src/db/schema/scans.js';
import { scanFiles } from '../../../server/src/db/schema/scanFiles.js';
import { issues } from '../../../server/src/db/schema/issues.js';
import { dependencies } from '../../../server/src/db/schema/dependencies.js';
import { repositories } from '../../../server/src/db/schema/repositories.js';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger.js';
import { SCAN_STATUS } from '../../../shared/constants/scanStatus.js';
import { calculateScores } from './healthScoreService.js';

/**
 * Maps analyzer severity → priority tier (P1/P2/P3)
 */
function severityToPriority(severity) {
  switch (severity) {
    case 'critical':
    case 'high':
      return 'P1';
    case 'medium':
      return 'P2';
    case 'low':
    default:
      return 'P3';
  }
}

/**
 * Calculates per-file health score from its issues.
 * Returns 0-100.
 */
function calculateFileHealthScore(filePath, allIssues) {
  const fileIssues = allIssues.filter(i => i.file === filePath);
  let deduction = 0;
  for (const issue of fileIssues) {
    if (issue.severity === 'critical') deduction += 25;
    else if (issue.severity === 'high') deduction += 12;
    else if (issue.severity === 'medium') deduction += 5;
    else deduction += 2;
  }
  return Math.max(0, Math.min(100, 100 - deduction));
}

/**
 * Persists the complete scan results to Neon PostgreSQL.
 *
 * @param {string} scanId
 * @param {Array}  files          - raw fetched files: { filePath, content, size }
 * @param {Array}  allIssues      - merged analyzer issues
 * @param {Array}  depsList       - dependency records
 * @param {Object} fetchMetadata  - fetcher aggregate counts
 * @param {number} scanDurationMs
 * @param {Map}    fileMetricsMap - filePath → { lines, functions, classes, complexity, duplication }
 * @param {Array}  parseWarnings  - list of parse warning objects
 */
export async function persistScanResults(
  scanId,
  files,
  allIssues,
  depsList,
  fetchMetadata,
  scanDurationMs,
  fileMetricsMap = new Map(),
  parseWarnings = [],
) {
  logger.info({ event: 'result_write.started', scanId, fileCount: files.length, issueCount: allIssues.length, depCount: depsList.length });

  try {
    await db.transaction(async (tx) => {

      // ── 1. Clean up any incomplete child rows from a previous retry ────────
      // IMPORTANT: only touch rows belonging to THIS scan ID.
      // Do not delete rows from other scans.
      await tx.delete(issues).where(eq(issues.scanId, scanId));
      await tx.delete(dependencies).where(eq(dependencies.scanId, scanId));
      await tx.delete(scanFiles).where(eq(scanFiles.scanId, scanId));

      // ── 2. Insert scan_files with full metrics ────────────────────────────
      const filePathToId = new Map();
      let scanFileRowCount = 0;

      if (files.length > 0) {
        const BATCH_SIZE = 200;
        for (let i = 0; i < files.length; i += BATCH_SIZE) {
          const batch = files.slice(i, i + BATCH_SIZE).map(f => {
            const metrics = fileMetricsMap.get(f.filePath) ?? {};
            const fileHealthScore = calculateFileHealthScore(f.filePath, allIssues);

            return {
              scanId,
              path: f.filePath,
              language: _resolveLanguage(f.filePath),
              lines: metrics.lines ?? (f.content ? f.content.split('\n').length : 0),
              functions: metrics.functions ?? 0,
              classes: metrics.classes ?? 0,
              complexity: metrics.complexity ?? 0,
              duplication: String(metrics.duplication ?? 0),
              healthScore: String(fileHealthScore),
              metadata: { size: f.size ?? 0, parseFailed: !!f._parseFailed },
            };
          });

          const result = await tx
            .insert(scanFiles)
            .values(batch)
            .onConflictDoNothing()
            .returning({ id: scanFiles.id, path: scanFiles.path });

          for (const row of result) {
            filePathToId.set(row.path, row.id);
          }
          scanFileRowCount += result.length;
        }
      }

      logger.info({ event: 'result_write.files_completed', scanId, scanFileRowCount });

      // ── 3. Insert dependencies ─────────────────────────────────────────────
      let dependencyRowCount = 0;
      if (depsList.length > 0) {
        const seenDeps = new Set();
        const uniqueDeps = [];
        for (const d of depsList) {
          if (!seenDeps.has(d.name)) {
            seenDeps.add(d.name);
            uniqueDeps.push({ scanId, ...d });
          }
        }
        if (uniqueDeps.length > 0) {
          await tx.insert(dependencies).values(uniqueDeps).onConflictDoNothing();
          dependencyRowCount = uniqueDeps.length;
        }
      }

      logger.info({ event: 'result_write.dependencies_completed', scanId, dependencyRowCount });

      // ── 4. Insert issues with correct priority and filePath ────────────────
      let issueRowCount = 0;
      if (allIssues.length > 0) {
        const BATCH_SIZE = 500;
        const issueBatch = allIssues.map(i => ({
          scanId,
          // i.file is the field set by all analyzers; filePath is the DB column name
          scanFileId: filePathToId.get(i.file) ?? null,
          filePath: i.file,          // ← use i.file for the filePath DB column
          line: i.line ?? null,
          type: i.type,
          severity: i.severity,
          priority: severityToPriority(i.severity),   // ← real P1/P2/P3 mapping
          title: i.title,
          description: i.description ?? null,
          recommendation: i.recommendation ?? null,
          metrics: i.metrics ?? {},
        }));

        for (let i = 0; i < issueBatch.length; i += BATCH_SIZE) {
          await tx.insert(issues).values(issueBatch.slice(i, i + BATCH_SIZE));
        }
        issueRowCount = issueBatch.length;
      }

      logger.info({ event: 'result_write.issues_completed', scanId, issueRowCount });

      // ── 5. Calculate scores ────────────────────────────────────────────────
      const scores = calculateScores(allIssues, files.length);

      // ── 6. Build final metrics ─────────────────────────────────────────────
      const finalMetrics = {
        totalFiles: files.length,
        totalIssues: allIssues.length,
        totalDependencies: depsList.length,
        parseWarningCount: parseWarnings.length,
        ...fetchMetadata,
      };

      // ── 7. Update scan record ──────────────────────────────────────────────
      await tx.update(scans).set({
        status: SCAN_STATUS.COMPLETED,
        progress: 100,
        progressMessage: 'Analysis complete. Results saved.',
        completedAt: new Date(),
        durationMs: scanDurationMs,
        metrics: finalMetrics,
        warnings: parseWarnings,
        overallScore: String(scores.overallScore),
        complexityScore: String(scores.complexityScore),
        duplicationScore: String(scores.duplicationScore),
        deadCodeScore: String(scores.deadCodeScore),
        dependencyScore: String(scores.dependencyScore),
        architectureScore: String(scores.architectureScore),
        updatedAt: new Date(),
      }).where(eq(scans.id, scanId));

      logger.info({
        event: 'result_write.scan_completed',
        scanId,
        scores,
        scanFileRowCount,
        issueRowCount,
        dependencyRowCount,
      });

      // ── 8. Update repository summary (race-condition safe) ─────────────────
      const [currentScan] = await tx.select({
        createdAt: scans.createdAt,
        repositoryId: scans.repositoryId,
      }).from(scans).where(eq(scans.id, scanId));

      if (currentScan) {
        const [repo] = await tx.select({
          lastScannedAt: repositories.lastScannedAt,
        }).from(repositories).where(eq(repositories.id, currentScan.repositoryId));

        if (repo && (!repo.lastScannedAt || currentScan.createdAt >= repo.lastScannedAt)) {
          await tx.update(repositories).set({
            lastScanId: scanId,
            lastScannedAt: currentScan.createdAt,
            currentHealthScore: String(scores.overallScore),
            updatedAt: new Date(),
          }).where(eq(repositories.id, currentScan.repositoryId));

          logger.info({ event: 'persist.repository_summary_updated', repoId: currentScan.repositoryId, scanId });
        } else {
          logger.info({ event: 'persist.repository_summary_skipped', repoId: currentScan?.repositoryId, scanId, reason: 'older_run' });
        }
      }
    });
  } catch (error) {
    logger.error({ event: 'persist.failed', scanId, err: error.message });
    throw error;
  }
}

/**
 * Resolve a human-readable language label from file extension.
 */
function _resolveLanguage(filePath) {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
  const map = {
    js: 'JavaScript',
    jsx: 'JavaScript (JSX)',
    ts: 'TypeScript',
    tsx: 'TypeScript (TSX)',
    json: 'JSON',
    mjs: 'JavaScript (ESM)',
    cjs: 'JavaScript (CJS)',
  };
  return map[ext] ?? ext;
}
