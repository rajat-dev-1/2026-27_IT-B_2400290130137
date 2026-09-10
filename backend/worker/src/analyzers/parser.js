import Parser from 'tree-sitter';
import JavaScript from 'tree-sitter-javascript';
import TypeScript from 'tree-sitter-typescript';

const parsers = {
  js: new Parser(),
  ts: new Parser(),
  tsx: new Parser(),
};

parsers.js.setLanguage(JavaScript);
parsers.ts.setLanguage(TypeScript.typescript);
parsers.tsx.setLanguage(TypeScript.tsx);

/**
 * Parses a given source string into a Tree-sitter AST based on the file extension.
 * @param {string} filePath - Path of the file (used to determine language)
 * @param {string} content - Source code content
 * @returns {Object} - An object containing filePath, content, and the parsed tree.
 */
export function parseFile(filePath, content) {
  const ext = filePath.split('.').pop().toLowerCase();
  
  let parser;
  if (ext === 'ts') {
    parser = parsers.ts;
  } else if (ext === 'tsx') {
    parser = parsers.tsx;
  } else if (ext === 'js' || ext === 'jsx' || ext === 'mjs' || ext === 'cjs') {
    parser = parsers.js;
  } else {
    throw new Error(`Unsupported file extension: ${ext}`);
  }

  const tree = parser.parse(content);
  return {
    filePath,
    content,
    tree,
  };
}
