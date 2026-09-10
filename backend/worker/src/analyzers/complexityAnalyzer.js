import { parseFile } from './parser.js';
import { ISSUE_TYPES } from '../../../shared/constants/issueTypes.js';
import { SEVERITY } from '../../../shared/constants/severity.js';

/**
 * Calculates Cyclomatic Complexity for a single AST node recursively.
 */
function calculateComplexity(node) {
  let complexity = 1; // base complexity
  
  if (!node || !node.children) return complexity;
  
  const complexityNodes = [
    'if_statement',
    'while_statement',
    'do_statement',
    'for_statement',
    'for_in_statement',
    'catch_clause',
    'ternary_expression',
    'logical_and',
    'logical_or'
  ];

  function traverse(n) {
    if (complexityNodes.includes(n.type)) {
      complexity++;
    }
    // Check switch cases
    if (n.type === 'switch_case') {
      complexity++;
    }
    
    if (n.children) {
      for (const child of n.children) {
        traverse(child);
      }
    }
  }

  traverse(node);
  return complexity;
}

export function analyzeComplexity(files) {
  const findings = [];
  let totalFunctionsAnalyzed = 0;

  for (const file of files) {
    // Skip JSON files for complexity
    if (file.filePath.endsWith('.json')) continue;

    let tree;
    try {
      const parsed = parseFile(file.filePath, file.content);
      tree = parsed.tree;
    } catch (err) {
      continue;
    }

    if (!tree || !tree.rootNode) continue;

    function findFunctions(node) {
      const funcTypes = [
        'function_declaration',
        'generator_function_declaration',
        'function',
        'generator_function',
        'arrow_function',
        'method_definition'
      ];

      if (funcTypes.includes(node.type)) {
        totalFunctionsAnalyzed++;
        const complexity = calculateComplexity(node.children.find(c => c.type === 'statement_block') || node);
        
        if (complexity > 10) {
          // Find function name if possible
          let funcName = 'anonymous';
          const idNode = node.children.find(c => c.type === 'identifier' || c.type === 'property_identifier');
          if (idNode) {
            funcName = idNode.text;
          }

          findings.push({
            type: ISSUE_TYPES.HIGH_COMPLEXITY,
            severity: complexity > 20 ? SEVERITY.CRITICAL : SEVERITY.HIGH,
            file: file.filePath,
            line: node.startPosition.row + 1,
            title: `High complexity in function "${funcName}"`,
            description: `Function "${funcName}" has a cyclomatic complexity of ${complexity}, which exceeds the recommended threshold of 10.`,
            recommendation: 'Consider extracting parts of this function into smaller, more focused helper functions to improve readability and maintainability.',
            metrics: {
              complexity,
              functionName: funcName,
              analyzer: 'complexityAnalyzer'
            }
          });
        }
      }

      if (node.children) {
        for (const child of node.children) {
          findFunctions(child);
        }
      }
    }

    findFunctions(tree.rootNode);
  }

  return {
    findings,
    metadata: {
      totalFunctionsAnalyzed,
      highComplexityCount: findings.length
    }
  };
}
