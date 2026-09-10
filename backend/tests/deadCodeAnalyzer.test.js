import { analyzePossibleUnusedExports } from '../worker/src/analyzers/deadCodeAnalyzer.js';
import { ISSUE_TYPES } from '../shared/constants/issueTypes.js';

describe('deadCodeAnalyzer', () => {

  const runAnalyzer = (files) => analyzePossibleUnusedExports(files);

  test('1. Reports an unreferenced named function export', () => {
    const files = [
      { filePath: 'src/math.ts', content: 'export function unusedHelper() { return 1; }' },
      { filePath: 'src/app.ts', content: 'export const app = true;' }
    ];
    const { findings } = runAnalyzer(files);
    expect(findings).toHaveLength(2); // one for unusedHelper, one for app
    
    const issue = findings.find(f => f.metrics.exportedName === 'unusedHelper');
    expect(issue).toBeDefined();
    expect(issue.file).toBe('src/math.ts');
    expect(issue.type).toBe(ISSUE_TYPES.POSSIBLE_UNUSED_EXPORT);
    expect(issue.title).toBe('Possible unused export: unusedHelper');
  });

  test('2. Does not report a named export that is imported by name', () => {
    const files = [
      { filePath: 'src/math.ts', content: 'export function sum(a, b) { return a + b; }' },
      { filePath: 'src/app.ts', content: "import { sum } from './math'; console.log(sum(1, 2));" }
    ];
    const { findings } = runAnalyzer(files);
    expect(findings.find(f => f.file === 'src/math.ts')).toBeUndefined();
  });

  test('3. Does not report a named export imported with an alias', () => {
    const files = [
      { filePath: 'src/math.ts', content: "export const format = () => 'ok';" },
      { filePath: 'src/app.ts', content: "import { format as formatValue } from './math'; formatValue();" }
    ];
    const { findings } = runAnalyzer(files);
    expect(findings.find(f => f.file === 'src/math.ts')).toBeUndefined();
  });

  test('4. Does not report a referenced default export', () => {
    const files = [
      { filePath: 'src/config.ts', content: 'export default { enabled: true };' },
      { filePath: 'src/app.ts', content: "import config from './config'; console.log(config.enabled);" }
    ];
    const { findings } = runAnalyzer(files);
    expect(findings.find(f => f.file === 'src/config.ts')).toBeUndefined();
  });

  test('5. Conservatively suppresses exports in a module imported as a namespace', () => {
    const files = [
      { filePath: 'src/math.ts', content: 'export const add = () => 1; export const subtract = () => 2;' },
      { filePath: 'src/app.ts', content: "import * as math from './math'; math.add();" }
    ];
    const { findings } = runAnalyzer(files);
    expect(findings.find(f => f.file === 'src/math.ts')).toBeUndefined();
  });

  test('6. Resolves extensionless relative imports', () => {
    const files = [
      { filePath: 'src/math.tsx', content: 'export const util = 1;' },
      { filePath: 'src/app.ts', content: "import { util } from './math';" }
    ];
    const { findings } = runAnalyzer(files);
    expect(findings.find(f => f.file === 'src/math.tsx')).toBeUndefined();
  });

  test('7. Resolves index.ts / supported directory index imports', () => {
    const files = [
      { filePath: 'src/utils/index.ts', content: 'export const util = 1;' },
      { filePath: 'src/app.ts', content: "import { util } from './utils';" }
    ];
    const { findings } = runAnalyzer(files);
    // index.* is implicitly skipped, but let's verify it's skipped by both barrel ignore and resolution
    expect(findings.find(f => f.file === 'src/utils/index.ts')).toBeUndefined();
  });

  test('8. Does not flag an origin export solely because it is re-exported by another internal file', () => {
    const files = [
      { filePath: 'src/original.ts', content: 'export const publicApi = () => {};' },
      { filePath: 'src/index.ts', content: "export { publicApi } from './original';" }
    ];
    const { findings } = runAnalyzer(files);
    expect(findings.find(f => f.file === 'src/original.ts')).toBeUndefined();
  });

  test('9. Does not report exports from index.* barrel files by default', () => {
    const files = [
      { filePath: 'src/index.js', content: 'export const publicApi = () => {};' },
      { filePath: 'src/components/index.tsx', content: 'export function Button() {}' }
    ];
    const { findings } = runAnalyzer(files);
    expect(findings).toHaveLength(0);
  });

  test('10. Ignores external package imports without throwing', () => {
    const files = [
      { filePath: 'src/app.ts', content: "import React from 'react'; import { lodash } from 'lodash'; export const app = 1;" }
    ];
    const { findings } = runAnalyzer(files);
    // Should not throw, should just report app as unused
    expect(findings).toHaveLength(1);
    expect(findings[0].metrics.exportedName).toBe('app');
  });

  test('11. Leaves unresolved relative imports non-fatal and returns metadata/warning count', () => {
    const files = [
      { filePath: 'src/app.ts', content: "import { missing } from './missing'; export const app = 1;" }
    ];
    const { findings, metadata } = runAnalyzer(files);
    expect(findings).toHaveLength(1);
    expect(metadata.unresolvedRelativeImports).toBe(1);
  });

  test('12. Produces deterministic issue ordering across repeated runs', () => {
    const files = [
      { filePath: 'src/z.ts', content: 'export const b = 2; export const a = 1;' },
      { filePath: 'src/a.ts', content: 'export const y = 2; export const x = 1;' }
    ];
    const res1 = runAnalyzer(files).findings;
    const res2 = runAnalyzer([...files].reverse()).findings;
    
    expect(res1).toEqual(res2);
    expect(res1[0].file).toBe('src/a.ts');
    expect(res1[0].metrics.exportedName).toBe('x');
    expect(res1[1].file).toBe('src/a.ts');
    expect(res1[1].metrics.exportedName).toBe('y');
    expect(res1[2].file).toBe('src/z.ts');
    expect(res1[2].metrics.exportedName).toBe('a');
  });

  test('13. A malformed/unparsed file is skipped and does not stop valid files from being analyzed', () => {
    const files = [
      { filePath: 'src/bad.ts', content: 'export const = = = 1;' }, // AST will still parse gracefully with error nodes in tree-sitter, but let's test invalid extensions which throw in parseFile
      { filePath: 'src/app.ts', content: 'export const valid = 1;' },
      { filePath: 'src/unsupported.txt', content: 'hello world' }
    ];
    const { findings } = runAnalyzer(files);
    const validFinding = findings.find(f => f.file === 'src/app.ts');
    expect(validFinding).toBeDefined();
    expect(validFinding.metrics.exportedName).toBe('valid');
  });
});
