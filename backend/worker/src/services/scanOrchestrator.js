import { fetchRepositoryFiles } from './repositoryFetcher.js';
import { analyzeComplexity } from '../analyzers/complexityAnalyzer.js';
import { analyzeDependencies } from '../analyzers/dependencyAnalyzer.js';
import { analyzePossibleUnusedExports } from '../analyzers/deadCodeAnalyzer.js';
import { analyzeDuplication } from '../analyzers/duplicationAnalyzer.js';
import { persistScanResults } from './resultWriter.js';
import { logger } from '../utils/logger.js';
import { db } from '../config/database.js';
import { users } from '../../../server/src/db/schema/users.js';
import { eq } from 'drizzle-orm';
import { SCAN_STATUS } from '../../../shared/constants/scanStatus.js';
import { decryptSecret } from '../../../server/src/utils/crypto.js';
import { getDefaultBranchCommitSha } from '../../../server/src/services/githubService.js';
import { scans } from '../../../server/src/db/schema/scans.js';
import { parseFile } from '../analyzers/parser.js';

export async function runScanPipeline(scan, repository, job, updateScanProgress) {
  const startTime = Date.now();
  const logCtx = {
    scanId: scan.id,
    jobId: job.id,
    repoId: repository.id,
    userId: scan.userId,
    commitSHA: scan.commitSha,
  };

  logger.info({ ...logCtx, event: 'worker.pipeline_started', stage: 'init' });

  try {
    // ── 1. Load user token ──────────────────────────────────────────────────
    const [user] = await db.select().from(users).where(eq(users.id, scan.userId));
    if (!user || !user.encryptedAccessToken) {
      const e = new Error('User GitHub token not found');
      e.code = 'GITHUB_REAUTH_REQUIRED';
      throw e;
    }

    let token;
    try {
      token = decryptSecret(user.encryptedAccessToken);
    } catch (e) {
      logger.error({ ...logCtx, event: 'worker.token_decryption_failed', err: e.message });
      const err = new Error('Failed to decrypt GitHub token');
      err.code = 'GITHUB_REAUTH_REQUIRED';
      throw err;
    }

    // ── 2. Resolve commit SHA (use stored if already present) ───────────────
    let commitSha = scan.commitSha;

    logger.info({ ...logCtx, event: 'worker.github_metadata_started', stage: 'github-metadata' });
    try {
      // Only re-fetch if commitSha missing — controller already resolves it
      if (!commitSha) {
        commitSha = await getDefaultBranchCommitSha(repository, token);
        if (!commitSha) throw new Error('Latest commit SHA is null');
      }
      logger.info({ ...logCtx, event: 'worker.github_metadata_succeeded', stage: 'github-metadata', sha: commitSha });
    } catch (e) {
      logger.error({ ...logCtx, event: 'worker.github_metadata_failed', stage: 'github-metadata', err: e.message, errCode: e.code });
      throw e;
    }

    // Update DB with resolved SHA if changed
    if (commitSha !== scan.commitSha) {
      await db.update(scans).set({ commitSha }).where(eq(scans.id, scan.id));
    }

    await updateScanProgress(20, 'Fetching repository files...');

    // ── 3. Fetch Files ──────────────────────────────────────────────────────
    const { files: rawFiles, metadata: fetchMetadata } = await fetchRepositoryFiles(repository, commitSha, token);

    logger.info({
      ...logCtx,
      event: 'worker.files_selected',
      stage: 'fetch',
      treeEntryCount: fetchMetadata.totalEntries,
      ignoredEntryCount: fetchMetadata.excludedByIgnoredPath,
      unsupportedEntryCount: fetchMetadata.excludedByUnsupportedExt,
      selectedFileCount: fetchMetadata.supportedEntries,
      fetchedFileCount: rawFiles.length,
      skippedFileCount: fetchMetadata.sourceFilesSkipped,
    });

    if (rawFiles.length === 0) {
      logger.warn({ ...logCtx, event: 'worker.no_files_fetched', stage: 'fetch', metadata: fetchMetadata });
      const error = new Error('No supported files found in the repository.');
      error.code = 'NO_SUPPORTED_FILES';
      throw error;
    }

    logger.info({ ...logCtx, event: 'worker.file_contents_fetched', stage: 'fetch', fetchedFileCount: rawFiles.length });

    await updateScanProgress(35, 'Parsing source files...');

    // ── 4. Parse Files ──────────────────────────────────────────────────────
    // Parse all JS/TS files. JSON files skip the parser but continue through dependency analyzer.
    const parseWarnings = [];
    let parseSuccessCount = 0;
    let parseFailureCount = 0;

    // Build a fileMetrics map keyed by filePath — we'll populate this incrementally
    const fileMetricsMap = new Map(); // filePath → { lines, functions, classes, complexity, duplication, healthScore }

    for (const file of rawFiles) {
      const lineCount = file.content ? file.content.split('\n').length : 0;
      fileMetricsMap.set(file.filePath, {
        lines: lineCount,
        functions: 0,
        classes: 0,
        complexity: 0,
        duplication: 0,
        healthScore: null,
      });

      // JSON files don't need AST parsing
      if (file.filePath.endsWith('.json')) {
        parseSuccessCount++;
        continue;
      }

      try {
        parseFile(file.filePath, file.content);
        parseSuccessCount++;
      } catch (parseErr) {
        parseFailureCount++;
        const safeMsg = `Parse error in ${file.filePath}: ${parseErr.message?.substring(0, 120) ?? 'unknown parse error'}`;
        parseWarnings.push({ stage: 'parse', file: file.filePath, message: safeMsg });
        logger.warn({ ...logCtx, event: 'worker.file_parse_failed', stage: 'parse', file: file.filePath, err: parseErr.message });
        // Mark the file parse status but keep it in the list for metric recording
        file._parseFailed = true;
      }
    }

    logger.info({
      ...logCtx,
      event: 'worker.files_parsed',
      stage: 'parse',
      parseSuccessCount,
      parseFailureCount,
    });

    if (parseSuccessCount === 0) {
      logger.warn({ ...logCtx, event: 'worker.all_parse_failed', stage: 'parse' });
      // Don't mark entire scan failed — we still have file rows to write
    }

    // Only pass successfully-parseable files to AST-based analyzers
    const analyzableFiles = rawFiles.filter(f => !f._parseFailed && !f.filePath.endsWith('.json'));
    const allFiles = rawFiles; // includes JSON for dep analyzer

    await updateScanProgress(45, 'Running static analysis...');

    // ── 5. Complexity Analyzer ──────────────────────────────────────────────
    let complexityFindings = [];
    try {
      const compResults = analyzeComplexity(analyzableFiles);
      complexityFindings = compResults.findings;

      // Extract per-file complexity metrics
      for (const finding of complexityFindings) {
        const fm = fileMetricsMap.get(finding.file);
        if (fm && finding.metrics?.complexity) {
          fm.complexity = Math.max(fm.complexity, finding.metrics.complexity);
        }
      }

      // Count functions per file from all parsed files
      _countFunctionsClasses(analyzableFiles, fileMetricsMap);

      logger.info({
        ...logCtx,
        event: 'analysis.complexity_completed',
        stage: 'complexity',
        complexityFindingCount: complexityFindings.length,
      });
    } catch (e) {
      logger.error({ ...logCtx, event: 'analysis.complexity_failed', stage: 'complexity', err: e.message });
    }

    await updateScanProgress(55, 'Detecting duplicate code...');

    // ── 6. Duplication Analyzer ─────────────────────────────────────────────
    let duplicationFindings = [];
    try {
      const dupResults = analyzeDuplication(analyzableFiles);
      // analyzeDuplication returns a plain array of issue objects
      duplicationFindings = Array.isArray(dupResults) ? dupResults : [];

      // Record duplication metric per file
      for (const issue of duplicationFindings) {
        const fm = fileMetricsMap.get(issue.file);
        if (fm) {
          fm.duplication = Math.min(100, fm.duplication + (issue.metrics?.duplicatedLines ?? 0));
        }
      }

      logger.info({
        ...logCtx,
        event: 'analysis.duplication_completed',
        stage: 'duplication',
        duplicationFindingCount: duplicationFindings.length,
      });
    } catch (e) {
      logger.error({ ...logCtx, event: 'analysis.duplication_failed', stage: 'duplication', err: e.message });
    }

    await updateScanProgress(65, 'Detecting unused exports...');

    // ── 7. Dead Code / Unused Export Analyzer ──────────────────────────────
    let unusedExportFindings = [];
    try {
      const deadResults = analyzePossibleUnusedExports(analyzableFiles);
      unusedExportFindings = deadResults.findings || [];

      logger.info({
        ...logCtx,
        event: 'analysis.possible_unused_exports_completed',
        stage: 'dead-code',
        unusedExportFindingCount: unusedExportFindings.length,
      });
    } catch (e) {
      logger.error({ ...logCtx, event: 'analysis.dead_code_failed', stage: 'dead-code', err: e.message });
    }

    await updateScanProgress(72, 'Analyzing dependencies...');

    // ── 8. Dependency Analyzer ──────────────────────────────────────────────
    let dependencyFindings = [];
    let depsList = [];
    try {
      const depResults = analyzeDependencies(allFiles);
      dependencyFindings = depResults.findings || [];
      depsList = depResults.dependencies || [];

      logger.info({
        ...logCtx,
        event: 'analysis.dependencies_completed',
        stage: 'dependencies',
        dependencyCount: depsList.length,
      });
    } catch (e) {
      logger.error({ ...logCtx, event: 'analysis.dependencies_failed', stage: 'dependencies', err: e.message });
    }

    // ── 9. Merge all issues ─────────────────────────────────────────────────
    const allIssues = [
      ...complexityFindings,
      ...duplicationFindings,
      ...unusedExportFindings,
      ...dependencyFindings,
    ];

    logger.info({
      ...logCtx,
      event: 'analysis.scores_completed',
      stage: 'scoring',
      totalIssueCount: allIssues.length,
      complexityFindingCount: complexityFindings.length,
      duplicationFindingCount: duplicationFindings.length,
      unusedExportFindingCount: unusedExportFindings.length,
      dependencyFindingCount: dependencyFindings.length,
    });

    await updateScanProgress(80, 'Saving results...');

    // ── 10. Persist Results ─────────────────────────────────────────────────
    const scanDurationMs = Date.now() - startTime;

    logger.info({ ...logCtx, event: 'result_write.started', stage: 'persist' });

    await persistScanResults(
      scan.id,
      rawFiles,
      allIssues,
      depsList,
      fetchMetadata,
      scanDurationMs,
      fileMetricsMap,
      parseWarnings,
    );

    logger.info({
      ...logCtx,
      event: 'result_write.scan_completed',
      stage: 'persist',
      durationMs: Date.now() - startTime,
    });

  } catch (error) {
    logger.error({ ...logCtx, event: 'worker.job_failed', stage: error.stage || 'unknown', err: error.message, errCode: error.code });
    throw error;
  }
}

/**
 * Counts functions and classes per file by traversing the parse tree.
 * Mutates fileMetricsMap in place.
 */
function _countFunctionsClasses(files, fileMetricsMap) {
  const FUNC_TYPES = new Set([
    'function_declaration',
    'generator_function_declaration',
    'function',
    'generator_function',
    'arrow_function',
    'method_definition',
  ]);
  const CLASS_TYPES = new Set(['class_declaration', 'class']);

  for (const file of files) {
    const fm = fileMetricsMap.get(file.filePath);
    if (!fm) continue;

    try {
      const { tree } = parseFile(file.filePath, file.content);
      if (!tree?.rootNode) continue;

      let funcCount = 0;
      let classCount = 0;

      function traverse(node) {
        if (!node) return;
        if (FUNC_TYPES.has(node.type)) funcCount++;
        if (CLASS_TYPES.has(node.type)) classCount++;
        if (node.children) {
          for (const child of node.children) traverse(child);
        }
      }
      traverse(tree.rootNode);

      fm.functions = funcCount;
      fm.classes = classCount;
    } catch {
      // Parse errors are already captured; skip silently
    }
  }
}
