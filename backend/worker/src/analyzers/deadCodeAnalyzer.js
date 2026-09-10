import { ISSUE_TYPES } from '../../../shared/constants/issueTypes.js';
import { SEVERITY } from '../../../shared/constants/severity.js';
import { SUPPORTED_EXTENSIONS } from '../../../shared/constants/supportedExtensions.js';
import { parseFile } from './parser.js';

function normalizePath(p) {
  return p.replace(/\\/g, '/');
}

/**
 * Strips quotes from a string literal node's text
 */
function stripQuotes(str) {
  if (!str) return str;
  if ((str.startsWith("'") && str.endsWith("'")) || 
      (str.startsWith('"') && str.endsWith('"')) ||
      (str.startsWith('`') && str.endsWith('`'))) {
    return str.slice(1, -1);
  }
  return str;
}

/**
 * @param {string} importerPath 
 * @param {string} specifier 
 * @param {Set<string>} scannedFilePaths 
 * @returns {string|null} Resolved path or null
 */
function resolveRelativeImport(importerPath, specifier, scannedFilePaths) {
  if (!specifier.startsWith('.')) {
    return null; // External/package import
  }

  const importerParts = importerPath.split('/');
  importerParts.pop(); // remove file name
  const specifierParts = specifier.split('/');
  
  const resolvedParts = [...importerParts];
  for (const part of specifierParts) {
    if (part === '.') continue;
    if (part === '..') {
      resolvedParts.pop();
    } else {
      resolvedParts.push(part);
    }
  }

  const basePath = resolvedParts.join('/');

  // 1. Exact match (if it has an extension)
  if (scannedFilePaths.has(basePath)) return basePath;

  // 2. Append extensions
  for (const ext of SUPPORTED_EXTENSIONS) {
    const p = basePath + ext;
    if (scannedFilePaths.has(p)) return p;
  }

  // 3. Directory index
  for (const ext of SUPPORTED_EXTENSIONS) {
    const p = basePath + '/index' + ext;
    if (scannedFilePaths.has(p)) return p;
  }

  return null;
}

/**
 * Main analyzer function
 * @param {Array<{filePath: string, content: string}>} files 
 */
export function analyzePossibleUnusedExports(files) {
  const findings = [];
  let resolvedInternalImports = 0;
  let unresolvedRelativeImports = 0;
  let exportsExamined = 0;

  // Normalize all incoming paths
  const scannedFiles = files.map(f => ({
    filePath: normalizePath(f.filePath),
    content: f.content
  })).sort((a, b) => a.filePath.localeCompare(b.filePath));

  const scannedFilePaths = new Set(scannedFiles.map(f => f.filePath));

  const allExports = [];
  const allImports = [];

  for (const file of scannedFiles) {
    let tree;
    try {
      const parsed = parseFile(file.filePath, file.content);
      tree = parsed.tree;
    } catch (err) {
      // Parse error on one file shouldn't crash the whole analyzer
      continue; 
    }

    // Skip index files from being reported as unused
    const isBarrel = file.filePath.match(/\/index\.[a-z]+$/) || !file.filePath.includes('/');

    const fileExports = [];
    
    if (!tree) continue;
    if (typeof tree.rootNode === 'undefined') {
      console.log('tree.rootNode is undefined. tree keys:', Object.keys(tree));
      continue;
    }
    if (!tree.rootNode.children) {
      console.log('tree.rootNode.children is undefined');
      continue;
    }
    
    // Traverse AST
    for (const node of tree.rootNode.children) {
      if (node.type === 'export_statement') {
        // Find default or named exports
        const isDefault = node.children.some(c => c.type === 'default');
        
        let sourceModule = null;
        const stringNode = node.children.find(c => c.type === 'string');
        if (stringNode) {
          sourceModule = stripQuotes(stringNode.text);
        }

        if (node.children.some(c => c.type === '*')) {
          // export * from './foo'
          fileExports.push({
            filePath: file.filePath,
            exportedName: '*',
            localName: '*',
            kind: 're-export-all',
            line: node.startPosition.row + 1,
            column: node.startPosition.column + 1,
            sourceModule
          });
          continue;
        }

        // Check declarations
        const funcDecl = node.children.find(c => c.type === 'function_declaration' || c.type === 'generator_function_declaration');
        const classDecl = node.children.find(c => c.type === 'class_declaration');
        const lexicalDecl = node.children.find(c => c.type === 'lexical_declaration' || c.type === 'variable_declaration');
        const exportClause = node.children.find(c => c.type === 'export_clause');

        if (funcDecl || classDecl) {
          const decl = funcDecl || classDecl;
          const idNode = decl.children.find(c => c.type === 'identifier');
          const name = idNode ? idNode.text : (isDefault ? 'default' : 'unknown');
          
          fileExports.push({
            filePath: file.filePath,
            exportedName: isDefault ? 'default' : name,
            localName: name,
            kind: isDefault ? 'default' : (funcDecl ? 'function' : 'class'),
            line: decl.startPosition.row + 1,
            column: decl.startPosition.column + 1,
            sourceModule: null
          });
        } else if (lexicalDecl) {
          const declarator = lexicalDecl.children.find(c => c.type === 'variable_declarator');
          if (declarator) {
             const idNode = declarator.children.find(c => c.type === 'identifier');
             if (idNode) {
               fileExports.push({
                 filePath: file.filePath,
                 exportedName: idNode.text,
                 localName: idNode.text,
                 kind: 'const',
                 line: declarator.startPosition.row + 1,
                 column: declarator.startPosition.column + 1,
                 sourceModule: null
               });
             }
          }
        } else if (exportClause) {
          // export { a, b as c }
          for (const specifier of exportClause.children.filter(c => c.type === 'export_specifier')) {
             const ids = specifier.children.filter(c => c.type === 'identifier');
             if (ids.length === 1) {
                fileExports.push({
                  filePath: file.filePath,
                  exportedName: ids[0].text,
                  localName: ids[0].text,
                  kind: sourceModule ? 're-export' : 'named',
                  line: specifier.startPosition.row + 1,
                  column: specifier.startPosition.column + 1,
                  sourceModule
                });
             } else if (ids.length >= 2) {
                // First is local name, second is exported name (in Tree-sitter, or vice versa depending on grammar, usually local as exported)
                // export { helper as publicHelper } -> helper (ids[0]), publicHelper (ids[1])
                fileExports.push({
                  filePath: file.filePath,
                  exportedName: ids[1].text,
                  localName: ids[0].text,
                  kind: sourceModule ? 're-export' : 'named',
                  line: specifier.startPosition.row + 1,
                  column: specifier.startPosition.column + 1,
                  sourceModule
                });
             }
          }
        } else if (isDefault) {
          // export default expression;
          const expr = node.children.find(c => c.type === 'identifier' || c.type === 'arrow_function' || c.type === 'object');
          if (expr) {
            fileExports.push({
              filePath: file.filePath,
              exportedName: 'default',
              localName: expr.type === 'identifier' ? expr.text : 'default',
              kind: 'default',
              line: expr.startPosition.row + 1,
              column: expr.startPosition.column + 1,
              sourceModule: null
            });
          }
        }

      } else if (node.type === 'import_statement') {
        const stringNode = node.children.find(c => c.type === 'string');
        if (!stringNode) continue;
        const specifier = stripQuotes(stringNode.text);
        
        const importClause = node.children.find(c => c.type === 'import_clause');
        
        if (!importClause) {
          // Side effect import
          allImports.push({
            importerPath: file.filePath,
            specifier,
            kind: null,
            importedName: null,
            localName: null,
            line: node.startPosition.row + 1
          });
          continue;
        }

        // Check default import
        const defaultId = importClause.children.find(c => c.type === 'identifier');
        if (defaultId) {
          allImports.push({
            importerPath: file.filePath,
            specifier,
            kind: 'default',
            importedName: 'default',
            localName: defaultId.text,
            line: defaultId.startPosition.row + 1
          });
        }

        // Check namespace import
        const namespaceImport = importClause.children.find(c => c.type === 'namespace_import');
        if (namespaceImport) {
          allImports.push({
            importerPath: file.filePath,
            specifier,
            kind: 'namespace',
            importedName: '*',
            localName: namespaceImport.text,
            line: namespaceImport.startPosition.row + 1
          });
        }

        // Check named imports
        const namedImports = importClause.children.find(c => c.type === 'named_imports');
        if (namedImports) {
          for (const spec of namedImports.children.filter(c => c.type === 'import_specifier')) {
             const ids = spec.children.filter(c => c.type === 'identifier');
             if (ids.length === 1) {
               allImports.push({
                 importerPath: file.filePath,
                 specifier,
                 kind: 'named',
                 importedName: ids[0].text,
                 localName: ids[0].text,
                 line: spec.startPosition.row + 1
               });
             } else if (ids.length >= 2) {
               // import { x as y }
               allImports.push({
                 importerPath: file.filePath,
                 specifier,
                 kind: 'named',
                 importedName: ids[0].text,
                 localName: ids[1].text,
                 line: spec.startPosition.row + 1
               });
             }
          }
        }
      }
    }
    
    // Tag exports from barrel files to ignore by default
    fileExports.forEach(e => {
       e._isBarrel = isBarrel;
       allExports.push(e);
    });
  }

  // Resolve imports to internal files
  const edges = [];
  for (const imp of allImports) {
    const resolved = resolveRelativeImport(imp.importerPath, imp.specifier, scannedFilePaths);
    if (resolved) {
      resolvedInternalImports++;
      edges.push({ ...imp, targetPath: resolved });
    } else if (imp.specifier.startsWith('.')) {
      unresolvedRelativeImports++;
    }
  }
  
  // Re-exports also create reference edges
  for (const exp of allExports) {
     if (exp.sourceModule && exp.sourceModule.startsWith('.')) {
        const resolved = resolveRelativeImport(exp.filePath, exp.sourceModule, scannedFilePaths);
        if (resolved) {
           resolvedInternalImports++;
           edges.push({
              importerPath: exp.filePath,
              specifier: exp.sourceModule,
              kind: exp.exportedName === '*' ? 'namespace' : 'named',
              importedName: exp.localName, // The symbol imported from source
              localName: exp.exportedName,
              line: exp.line,
              targetPath: resolved
           });
        } else {
           unresolvedRelativeImports++;
        }
     }
  }

  // Calculate usage
  const referenced = new Set(); // store "filePath::exportedName"
  const completelyReferencedModules = new Set(); // For side-effects and namespace imports

  for (const edge of edges) {
    if (edge.kind === null || edge.kind === 'namespace') {
      completelyReferencedModules.add(edge.targetPath);
    } else {
      referenced.add(`${edge.targetPath}::${edge.importedName}`);
    }
  }

  // Identify unused
  for (const exp of allExports) {
    exportsExamined++;
    
    if (exp._isBarrel) continue;
    if (exp.kind === 're-export' || exp.kind === 're-export-all') continue;
    
    if (completelyReferencedModules.has(exp.filePath)) continue;
    if (referenced.has(`${exp.filePath}::${exp.exportedName}`)) continue;

    findings.push({
      type: ISSUE_TYPES.POSSIBLE_UNUSED_EXPORT,
      severity: SEVERITY.LOW,
      file: exp.filePath,
      line: exp.line,
      title: `Possible unused export: ${exp.exportedName}`,
      description: `The export "${exp.exportedName}" was not referenced by scanned repository files.`,
      recommendation: 'Confirm that this export is not used by framework entry points, dynamic imports, or external consumers.',
      metrics: {
        exportedName: exp.exportedName,
        exportKind: exp.kind,
        internalReferenceCount: 0,
        analyzer: ISSUE_TYPES.POSSIBLE_UNUSED_EXPORT
      }
    });
  }

  // Sort findings: file, then exportedName, then line
  findings.sort((a, b) => {
    if (a.file !== b.file) return a.file.localeCompare(b.file);
    if (a.metrics.exportedName !== b.metrics.exportedName) return a.metrics.exportedName.localeCompare(b.metrics.exportedName);
    return a.line - b.line;
  });

  return {
    findings,
    metadata: {
      resolvedInternalImports,
      unresolvedRelativeImports,
      exportsExamined,
      possibleUnusedExportCount: findings.length
    }
  };
}
