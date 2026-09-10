/**
 * Duplication Analyzer (MVP heuristic)
 *
 * Detects likely duplicate code blocks using line-based hashing:
 * comments and whitespace are normalized, files are split into
 * overlapping 5-line windows, and windows are hashed and grouped
 * by exact match across the whole scan.
 *
 * This is intentionally a heuristic, not a semantic clone detector.
 * It will miss duplicates that differ in variable names, formatting
 * beyond whitespace, or structural equivalence without identical text.
 * It may also occasionally group unrelated boilerplate (e.g. repeated
 * import blocks) if they happen to match exactly — this is expected
 * and acceptable for an MVP signal, not a guarantee of true logical
 * duplication.
 */

import { createHash } from 'crypto';
import { logger } from '../utils/logger.js';
import { ISSUE_TYPES } from '../../../shared/constants/issueTypes.js';

// Hardcoding missing constants from shared configuration
const DEFAULT_MAX_FILES = 200;

export function normalizeFileLines(rawContent) {
  const lines = rawContent.split(/\r?\n/);
  const normalizedLines = [];
  
  let inBlockComment = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const originalLineNumber = i + 1;

    // Handle block comments and single-line comments in a simplified way
    // Note: This regex-based approach might mis-strip inside string literals,
    // which is a documented MVP limitation.
    
    // If we're inside a block comment, look for the end
    if (inBlockComment) {
      const endIdx = line.indexOf('*/');
      if (endIdx !== -1) {
        inBlockComment = false;
        line = line.substring(endIdx + 2);
      } else {
        // Skip this line entirely
        continue;
      }
    }

    // Process line while outside of block comments
    while (line.includes('/*')) {
      const startIdx = line.indexOf('/*');
      const endIdx = line.indexOf('*/', startIdx + 2);
      
      if (endIdx !== -1) {
        // Comment starts and ends on the same line
        line = line.substring(0, startIdx) + line.substring(endIdx + 2);
      } else {
        // Comment starts and continues to next lines
        inBlockComment = true;
        line = line.substring(0, startIdx);
        break;
      }
    }

    if (!inBlockComment) {
      // Strip single line comments
      const singleLineIdx = line.indexOf('//');
      if (singleLineIdx !== -1) {
        line = line.substring(0, singleLineIdx);
      }
    }

    // Normalize whitespace
    line = line.trim().replace(/\s+/g, ' ');

    if (line.length > 0) {
      normalizedLines.push({
        originalLineNumber,
        normalizedText: line
      });
    }
  }

  return normalizedLines;
}

export function buildLineWindows(normalizedLines, windowSize) {
  const windows = [];
  
  if (normalizedLines.length < windowSize) {
    return windows;
  }

  for (let i = 0; i <= normalizedLines.length - windowSize; i++) {
    const windowLines = normalizedLines.slice(i, i + windowSize);
    windows.push({
      startLine: windowLines[0].originalLineNumber,
      endLine: windowLines[windowSize - 1].originalLineNumber,
      text: windowLines.map(l => l.normalizedText).join('\n')
    });
  }

  return windows;
}

export function hashWindowText(text) {
  return createHash('sha1').update(text).digest('hex');
}

export function findDuplicateGroups(fileWindowsByPath, { minOccurrences, minBlockLines, windowSize }) {
  const windowMap = new Map();

  // 1. Group all windows by hash
  for (const [filePath, windows] of fileWindowsByPath.entries()) {
    for (const window of windows) {
      const hash = window.hash;
      if (!windowMap.has(hash)) {
        windowMap.set(hash, []);
      }
      windowMap.get(hash).push({
        file: filePath,
        startLine: window.startLine,
        endLine: window.endLine
      });
    }
  }

  const resultGroups = [];

  // 2. Filter by minOccurrences
  for (const [hash, occurrences] of windowMap.entries()) {
    if (occurrences.length < minOccurrences) {
      continue;
    }

    // 3. Merge overlapping/adjacent windows within the same file
    const occurrencesByFile = new Map();
    for (const occ of occurrences) {
      if (!occurrencesByFile.has(occ.file)) {
        occurrencesByFile.set(occ.file, []);
      }
      occurrencesByFile.get(occ.file).push(occ);
    }

    const mergedOccurrences = [];

    for (const [file, occs] of occurrencesByFile.entries()) {
      occs.sort((a, b) => a.startLine - b.startLine);

      let currentBlock = null;

      for (const occ of occs) {
        if (!currentBlock) {
          currentBlock = { ...occ };
        } else {
          // If the new occurrence overlaps or is adjacent
          // The distance threshold is windowSize - 1. If startLine is <= currentBlock.endLine + 1, it's contiguous.
          if (occ.startLine <= currentBlock.endLine + 1) {
            currentBlock.endLine = Math.max(currentBlock.endLine, occ.endLine);
          } else {
            mergedOccurrences.push(currentBlock);
            currentBlock = { ...occ };
          }
        }
      }
      
      if (currentBlock) {
        mergedOccurrences.push(currentBlock);
      }
    }

    // Calculate the size of the block using the first occurrence as representative
    if (mergedOccurrences.length === 0) continue;
    
    // Note: Due to whitespace removal, original line ranges might have differing numbers of raw lines.
    // However, they cover the exact same number of *normalized* lines.
    // For simplicity, we calculate duplicatedLines based on the first occurrence's raw line span.
    const representative = mergedOccurrences[0];
    const duplicatedLines = representative.endLine - representative.startLine + 1;

    // 4. Discard blocks smaller than minBlockLines
    if (duplicatedLines < minBlockLines) {
      continue;
    }

    // 5. Ensure we still have at least minOccurrences after merging
    if (mergedOccurrences.length < minOccurrences) {
      continue;
    }

    resultGroups.push({
      hash, // Original hash of the first window (informational, not strictly needed after this)
      occurrences: mergedOccurrences,
      duplicatedLines
    });
  }

  return resultGroups;
}

export function buildDuplicationIssues(duplicateGroups) {
  const issues = [];

  for (const group of duplicateGroups) {
    // Sort primarily by file path, then by start line for determinism
    const sortedOccurrences = group.occurrences.sort((a, b) => {
      if (a.file !== b.file) {
        return a.file.localeCompare(b.file);
      }
      return a.startLine - b.startLine;
    });

    const primary = sortedOccurrences[0];
    const occurrenceCount = sortedOccurrences.length;
    const duplicatedLines = group.duplicatedLines;

    let severity = 'low';
    if (duplicatedLines >= 20 || occurrenceCount >= 4) {
      severity = 'high';
    } else if (duplicatedLines >= 10 || occurrenceCount === 3) {
      severity = 'medium';
    }

    issues.push({
      type: ISSUE_TYPES.DUPLICATED_CODE,
      severity,
      file: primary.file,
      line: primary.startLine,
      title: 'Duplicate code block detected',
      description: `This ${duplicatedLines}-line block appears in ${occurrenceCount} locations across the repository.`,
      metrics: {
        duplicatedLines,
        occurrenceCount,
        // The instructions don't strictly require windowSize in metrics, but the example included it.
        // I will omit windowSize here since it wasn't passed down, but the prompt says 
        // "At minimum, each issue must include... windowSize: 5". 
        // I'll add it by accepting it in this function or hardcoding. Let's assume windowSize is known or not strictly required to be exact if not available.
        // Wait, I can pass it from analyzeDuplication. But the prompt function signature is `buildDuplicationIssues(duplicateGroups)`.
        // The example shows `windowSize: 5`. I will just put the default or extract from somewhere if needed, but let's leave it as 5.
        windowSize: 5
      },
      relatedLocations: sortedOccurrences.map(occ => ({
        file: occ.file,
        line: occ.startLine
      }))
    });
  }

  return issues;
}

export function analyzeDuplication(files, options = {}) {
  const {
    windowSize = 5,
    minOccurrences = 2,
    minBlockLines = 5,
    maxFilesToCompare = DEFAULT_MAX_FILES
  } = options;

  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }

  const filesToAnalyze = files.slice(0, maxFilesToCompare);
  const fileWindowsByPath = new Map();

  for (const file of filesToAnalyze) {
    try {
      const normalizedLines = normalizeFileLines(file.content || '');
      const windows = buildLineWindows(normalizedLines, windowSize).map((window) => ({
        ...window,
        hash: hashWindowText(window.text)
      }));
      fileWindowsByPath.set(file.filePath, windows);
    } catch (err) {
      if (logger && typeof logger.warn === 'function') {
        logger.warn({ event: 'duplication_analyzer.file_skipped', file: file.filePath, err: err.message }, 'Skipped file due to normalization error');
      } else {
        console.warn(`[duplication_analyzer.file_skipped] Skipped ${file.filePath}: ${err.message}`);
      }
    }
  }

  const duplicateGroups = findDuplicateGroups(fileWindowsByPath, {
    minOccurrences,
    minBlockLines,
    windowSize
  });

  // Re-map to include windowSize if necessary
  const issues = buildDuplicationIssues(duplicateGroups);
  
  // Patch windowSize in metrics to use the dynamic option if needed
  issues.forEach(issue => {
    issue.metrics.windowSize = windowSize;
  });

  // Sort issues deterministically (e.g. by file, then line)
  issues.sort((a, b) => {
    if (a.file !== b.file) return a.file.localeCompare(b.file);
    return a.line - b.line;
  });

  return issues;
}
