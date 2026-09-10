import { parseFile } from './worker/src/analyzers/parser.js';

const code = `
import defaultThing from './thing';
import { helper } from './utils';
import { helper as localHelper } from './utils';
import * as utils from './utils';
import './setup';

export const helper = () => {};
export let value = 1;
export function calculate() {}
export class Formatter {}
export { helper };
export { helper as publicHelper };
export { helper as default };
export { sourceHelper } from './source';
export * from './source';
export default function run() {}
export default class App {}
export default expression;
`;

const { tree } = parseFile('test.ts', code);
tree.rootNode.children.forEach(c => {
  if (c.type === 'import_statement' || c.type === 'export_statement') {
    console.log('--- ' + c.type + ' ---');
    console.log(c.text);
    console.log(c.children.map(ch => `${ch.type}(${ch.text})`).join(', '));
    if (c.type === 'import_statement') {
      const importClause = c.children.find(ch => ch.type === 'import_clause');
      if (importClause) {
         console.log('  Import Clause:', importClause.children.map(ch => `${ch.type}(${ch.text})`).join(', '));
         const namedImports = importClause.children.find(ch => ch.type === 'named_imports');
         if (namedImports) {
            console.log('    Named Imports:', namedImports.children.map(ch => `${ch.type}(${ch.text})`).join(', '));
         }
      }
    } else if (c.type === 'export_statement') {
       const exportClause = c.children.find(ch => ch.type === 'export_clause');
       if (exportClause) {
          console.log('  Export Clause:', exportClause.children.map(ch => `${ch.type}(${ch.text})`).join(', '));
       }
       const lexical = c.children.find(ch => ch.type === 'lexical_declaration' || ch.type === 'variable_declaration');
       if (lexical) {
          console.log('  Lexical:', lexical.children.map(ch => `${ch.type}(${ch.text})`).join(', '));
          const declarator = lexical.children.find(ch => ch.type === 'variable_declarator');
          if (declarator) {
             console.log('    Declarator:', declarator.children.map(ch => `${ch.type}(${ch.text})`).join(', '));
          }
       }
    }
  }
});
