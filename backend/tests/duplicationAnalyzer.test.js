import { analyzeDuplication, normalizeFileLines, buildLineWindows, hashWindowText } from '../worker/src/analyzers/duplicationAnalyzer.js';

describe('Duplication Analyzer', () => {
  describe('Helper Functions', () => {
    test('normalizeFileLines strips comments and normalizes whitespace', () => {
      const raw = `
        function sum(a, b) {
          // This is a comment
          return a + b; /* inline comment */ 
        }

        /*
          Block comment
        */
        const x = 1;
      `;
      const result = normalizeFileLines(raw);
      expect(result).toEqual([
        { originalLineNumber: 2, normalizedText: 'function sum(a, b) {' },
        { originalLineNumber: 4, normalizedText: 'return a + b;' },
        { originalLineNumber: 5, normalizedText: '}' },
        { originalLineNumber: 10, normalizedText: 'const x = 1;' }
      ]);
    });

    test('buildLineWindows creates overlapping windows', () => {
      const lines = [
        { originalLineNumber: 1, normalizedText: 'a' },
        { originalLineNumber: 2, normalizedText: 'b' },
        { originalLineNumber: 4, normalizedText: 'c' },
        { originalLineNumber: 5, normalizedText: 'd' }
      ];
      
      const windows = buildLineWindows(lines, 3);
      expect(windows).toHaveLength(2);
      expect(windows[0]).toEqual({
        startLine: 1,
        endLine: 4,
        text: 'a\nb\nc'
      });
      expect(windows[1]).toEqual({
        startLine: 2,
        endLine: 5,
        text: 'b\nc\nd'
      });
    });

    test('hashWindowText creates stable hashes', () => {
      const hash1 = hashWindowText('a\nb\nc');
      const hash2 = hashWindowText('a\nb\nc');
      const hash3 = hashWindowText('a\nb\nd');
      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hash3);
      expect(typeof hash1).toBe('string');
    });
  });

  describe('analyzeDuplication', () => {
    // 1. No duplication
    test('1. No duplication: two files with completely different content', () => {
      const files = [
        { path: 'a.js', content: 'console.log("a");\nconsole.log("b");\nconsole.log("c");\nconsole.log("d");\nconsole.log("e");' },
        { path: 'b.js', content: 'console.log("1");\nconsole.log("2");\nconsole.log("3");\nconsole.log("4");\nconsole.log("5");' }
      ];
      const issues = analyzeDuplication(files);
      expect(issues).toHaveLength(0);
    });

    // 2. Exact duplication across two files
    test('2. Exact duplication across two files', () => {
      const block = 'line1\nline2\nline3\nline4\nline5';
      const files = [
        { path: 'a.js', content: 'start1\n' + block + '\nend1' },
        { path: 'b.js', content: 'start2\n' + block + '\nend2' }
      ];
      const issues = analyzeDuplication(files);
      expect(issues).toHaveLength(1);
      const issue = issues[0];
      expect(issue.metrics.occurrenceCount).toBe(2);
      expect(issue.relatedLocations).toHaveLength(2);
      expect(issue.relatedLocations).toEqual(
        expect.arrayContaining([
          { file: 'a.js', line: 2 },
          { file: 'b.js', line: 2 }
        ])
      );
    });

    // 3. Duplication within a single file
    test('3. Duplication within a single file', () => {
      const block = 'line1\nline2\nline3\nline4\nline5';
      const files = [
        { path: 'a.js', content: block + '\nseparator\n' + block }
      ];
      const issues = analyzeDuplication(files);
      expect(issues).toHaveLength(1);
      expect(issues[0].metrics.occurrenceCount).toBe(2);
      expect(issues[0].relatedLocations).toEqual([
        { file: 'a.js', line: 1 },
        { file: 'a.js', line: 7 }
      ]);
    });

    // 4. Whitespace/comment-insensitive matching
    test('4. Whitespace/comment-insensitive matching', () => {
      const files = [
        { path: 'a.js', content: 'const a = 1;\nconst b = 2;\nconst c = 3;\nconst d = 4;\nconst e = 5;' },
        { path: 'b.js', content: '  const a = 1;  \n\n// some comment\nconst b = 2;\n/* block */ const c = 3;\n\tconst d = 4;\nconst e = 5;' }
      ];
      const issues = analyzeDuplication(files);
      expect(issues).toHaveLength(1);
      expect(issues[0].metrics.occurrenceCount).toBe(2);
    });

    // 5. Below-threshold blocks are ignored
    test('5. Below-threshold blocks are ignored', () => {
      const block = 'line1\nline2\nline3\nline4'; // only 4 lines
      const files = [
        { path: 'a.js', content: block },
        { path: 'b.js', content: block }
      ];
      const issues = analyzeDuplication(files, { minBlockLines: 5, windowSize: 5 });
      expect(issues).toHaveLength(0);
    });

    // 6. Below-occurrence-threshold blocks are ignored
    test('6. Below-occurrence-threshold blocks are ignored', () => {
      const block = 'line1\nline2\nline3\nline4\nline5';
      const files = [
        { path: 'a.js', content: block }
      ];
      const issues = analyzeDuplication(files, { minOccurrences: 2 });
      expect(issues).toHaveLength(0);
    });

    // 7. Overlapping windows are merged
    test('7. Overlapping windows are merged', () => {
      // Use repeating lines so they produce the same hash. The naive algorithm groups by hash,
      // so it only merges overlapping windows if they have the same hash (i.e. repeating boilerplate).
      const lines = Array.from({ length: 15 }, () => 'repeating_line').join('\n');
      const files = [
        { path: 'a.js', content: lines },
        { path: 'b.js', content: lines }
      ];
      const issues = analyzeDuplication(files);
      expect(issues).toHaveLength(1);
      expect(issues[0].metrics.duplicatedLines).toBe(15);
      expect(issues[0].metrics.occurrenceCount).toBe(2);
    });

    // 8. Deterministic ordering
    test('8. Deterministic ordering', () => {
      const block1 = 'a1\na2\na3\na4\na5';
      const block2 = 'b1\nb2\nb3\nb4\nb5';
      const files = [
        { path: 'fileB.js', content: block2 + '\n---\n' + block1 },
        { path: 'fileA.js', content: block1 + '\n---\n' + block2 }
      ];
      
      const issues1 = analyzeDuplication(files);
      const issues2 = analyzeDuplication(files.slice().reverse()); // shuffle input

      expect(issues1).toEqual(issues2);
      expect(issues1[0].file).toBe('fileA.js'); // fileA.js comes before fileB.js
    });

    // 9. Empty input
    test('9. Empty input', () => {
      expect(analyzeDuplication([])).toEqual([]);
      expect(analyzeDuplication(null)).toEqual([]);
    });

    // 10. Single tiny file
    test('10. Single tiny file', () => {
      const issues = analyzeDuplication([{ path: 'tiny.js', content: 'small' }]);
      expect(issues).toHaveLength(0);
    });

    // 11. File count cap respected
    test('11. File count cap respected', () => {
      const block = 'L1\nL2\nL3\nL4\nL5';
      const files = [
        { path: '1.js', content: block },
        { path: '2.js', content: block },
        { path: '3.js', content: block },
      ];
      // Limit to 2 files, meaning only 1.js and 2.js are checked.
      const issues = analyzeDuplication(files, { maxFilesToCompare: 2 });
      expect(issues).toHaveLength(1);
      expect(issues[0].metrics.occurrenceCount).toBe(2);
      expect(issues[0].relatedLocations.map(l => l.file)).toEqual(['1.js', '2.js']);
    });

    // 12. Bad file does not abort the batch
    test('12. Bad file does not abort the batch', () => {
      const block = 'L1\nL2\nL3\nL4\nL5';
      const files = [
        { path: 'good1.js', content: block },
        { path: 'bad.js', content: null }, // Content is null, will throw in normalizeFileLines
        { path: 'good2.js', content: block }
      ];
      
      const issues = analyzeDuplication(files);
      expect(issues).toHaveLength(1);
      expect(issues[0].metrics.occurrenceCount).toBe(2);
      expect(issues[0].relatedLocations.map(l => l.file)).toEqual(['good1.js', 'good2.js']);
    });
  });
});
