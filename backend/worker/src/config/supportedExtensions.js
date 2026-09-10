export const SUPPORTED_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.json'];
export const IGNORED_DIRS = ['node_modules', 'dist', 'build', '.next', 'coverage', 'vendor', '.git'];

/**
 * Checks if a file has a supported extension
 */
export function isSupportedExtension(filePath) {
  return SUPPORTED_EXTENSIONS.some(ext => filePath.toLowerCase().endsWith(ext));
}

/**
 * Checks if a file path belongs to an ignored directory
 */
export function isIgnoredPath(filePath) {
  const parts = filePath.split('/');
  return parts.some(part => IGNORED_DIRS.includes(part));
}
