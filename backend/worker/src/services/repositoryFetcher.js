import { fetchRepositoryTree, fetchFileContent } from '../../../server/src/services/githubService.js';
import { isSupportedExtension, isIgnoredPath } from '../config/supportedExtensions.js';
import { logger } from '../utils/logger.js';

/**
 * Fetches the repository tree and supported file contents
 * @param {Object} repository 
 * @param {string} commitSha 
 * @param {string} decryptedToken 
 * @returns {Promise<Object>} { files, metadata }
 */
export async function fetchRepositoryFiles(repository, commitSha, decryptedToken) {
  logger.info({ event: 'worker.tree_fetch_started', repo: repository.name, sha: commitSha });

  let tree;
  try {
    tree = await fetchRepositoryTree(repository, commitSha, decryptedToken);
    logger.info({ event: 'worker.tree_fetch_succeeded', repo: repository.name, sha: commitSha, entries: tree.length });
  } catch (err) {
    logger.error({ event: 'worker.tree_fetch_failed', repo: repository.name, sha: commitSha, err });
    throw err;
  }
  
  let totalEntries = tree.length;
  let excludedByIgnoredPath = 0;
  let excludedByUnsupportedExt = 0;
  let sourceFilesSkipped = 0;
  
  const supportedEntries = [];

  for (const entry of tree) {
    if (entry.type !== 'blob') continue;

    if (isIgnoredPath(entry.path)) {
      excludedByIgnoredPath++;
      continue;
    }

    if (!isSupportedExtension(entry.path)) {
      excludedByUnsupportedExt++;
      continue;
    }

    supportedEntries.push(entry);
  }

  const fetchedFiles = [];

  logger.info({ event: 'worker.content_fetch_started', repo: repository.name, filesToFetch: supportedEntries.length });

  // Fetch file contents (with some concurrency limit, e.g. 5 at a time)
  // For simplicity and to avoid rate limits we can do it sequentially or batch it
  const BATCH_SIZE = 5;
  for (let i = 0; i < supportedEntries.length; i += BATCH_SIZE) {
    const batch = supportedEntries.slice(i, i + BATCH_SIZE);
    
    await Promise.all(batch.map(async (entry) => {
      try {
        // Skip files that are likely too large based on size (> 1MB)
        if (entry.size && entry.size > 1024 * 1024) {
          sourceFilesSkipped++;
          return;
        }

        const content = await fetchFileContent(repository, entry.sha, decryptedToken);
        fetchedFiles.push({
          filePath: entry.path,
          content,
          size: entry.size
        });
      } catch (err) {
        logger.error({ event: 'fetcher.file_fetch_failed', file: entry.path, err });
        sourceFilesSkipped++;
      }
    }));
  }

  const metadata = {
    totalEntries,
    excludedByIgnoredPath,
    excludedByUnsupportedExt,
    supportedEntries: supportedEntries.length,
    fetchedFiles: fetchedFiles.length,
    sourceFilesSkipped
  };

  if (sourceFilesSkipped > 0 && fetchedFiles.length === 0) {
    logger.warn({ event: 'worker.content_fetch_failed', repo: repository.name, metadata });
  } else {
    logger.info({ event: 'worker.content_fetch_succeeded', repo: repository.name, metadata });
  }

  return { files: fetchedFiles, metadata };
}
