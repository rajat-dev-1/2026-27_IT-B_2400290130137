/**
 * Phase 7 Unit Tests
 * 
 * Tests deterministic behavior of:
 *  - duplicationAnalyzer helpers
 *  - deadCodeAnalyzer (possibleUnusedExports)
 *  - Severity priority ordering
 *  - Template explanation fallback shape
 * 
 * No live GitHub, Groq, Neon, or Redis calls are made.
 */

import { jest } from "@jest/globals";
import {
  analyzeDuplication,
  normalizeFileLines,
  buildLineWindows,
  hashWindowText,
} from "../worker/src/analyzers/duplicationAnalyzer.js";
import { analyzePossibleUnusedExports } from "../worker/src/analyzers/deadCodeAnalyzer.js";
import { ISSUE_TYPES } from "../shared/constants/issueTypes.js";
import { SEVERITY } from "../shared/constants/severity.js";

// ---------------------------------------------------------------------------
// 1. Duplication Analyzer - edge cases beyond existing suite
// ---------------------------------------------------------------------------
describe("Phase 7 Unit: DuplicationAnalyzer", () => {
  describe("normalizeFileLines", () => {
    test("deterministically strips block comments spanning multiple lines", () => {
      const raw = `const a = 1;\n/* start\n   middle\n   end */\nconst b = 2;`;
      const result = normalizeFileLines(raw);
      expect(result.map(l => l.normalizedText)).toEqual(["const a = 1;", "const b = 2;"]);
    });

    test("preserves line numbers correctly after comment removal", () => {
      const raw = `// comment\nconst x = 1;\nconst y = 2;`;
      const result = normalizeFileLines(raw);
      expect(result[0].originalLineNumber).toBe(2);
      expect(result[1].originalLineNumber).toBe(3);
    });

    test("empty string returns empty array", () => {
      expect(normalizeFileLines("")).toEqual([]);
    });

    test("file of only comments returns empty array", () => {
      const raw = `// comment\n/* block */\n// another`;
      expect(normalizeFileLines(raw)).toEqual([]);
    });
  });

  describe("buildLineWindows", () => {
    test("fewer lines than windowSize returns empty array", () => {
      const lines = [
        { originalLineNumber: 1, normalizedText: "a" },
        { originalLineNumber: 2, normalizedText: "b" },
      ];
      expect(buildLineWindows(lines, 5)).toEqual([]);
    });

    test("exactly windowSize lines produces exactly one window", () => {
      const lines = [
        { originalLineNumber: 1, normalizedText: "a" },
        { originalLineNumber: 2, normalizedText: "b" },
        { originalLineNumber: 3, normalizedText: "c" },
        { originalLineNumber: 4, normalizedText: "d" },
        { originalLineNumber: 5, normalizedText: "e" },
      ];
      const windows = buildLineWindows(lines, 5);
      expect(windows).toHaveLength(1);
      expect(windows[0].startLine).toBe(1);
      expect(windows[0].endLine).toBe(5);
    });
  });

  describe("hashWindowText", () => {
    test("hash is stable across repeated calls", () => {
      const text = "const x = 1;\nconst y = 2;\nconst z = 3;";
      expect(hashWindowText(text)).toBe(hashWindowText(text));
    });

    test("different text produces different hash", () => {
      expect(hashWindowText("abc\ndef\nghi\njkl\nmno")).not.toBe(
        hashWindowText("abc\ndef\nghi\njkl\nXXX")
      );
    });
  });

  describe("analyzeDuplication - boundary values", () => {
    test("null files array returns empty (safe fallback)", () => {
      expect(analyzeDuplication(null)).toEqual([]);
    });

    test("undefined files array returns empty (safe fallback)", () => {
      expect(analyzeDuplication(undefined)).toEqual([]);
    });

    test("high-occurrence duplicate gets high severity", () => {
      const block = "L1\nL2\nL3\nL4\nL5\nL6\nL7\nL8\nL9\nL10\nL11\nL12\nL13\nL14\nL15\nL16\nL17\nL18\nL19\nL20";
      const files = [
        { path: "a.js", content: block },
        { path: "b.js", content: block },
        { path: "c.js", content: block },
        { path: "d.js", content: block },
      ];
      const issues = analyzeDuplication(files);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe("high");
    });

    test("output is stable across repeated runs with same input", () => {
      const block = "X1\nX2\nX3\nX4\nX5";
      const files = [
        { path: "a.js", content: block },
        { path: "b.js", content: block },
      ];
      const run1 = JSON.stringify(analyzeDuplication(files));
      const run2 = JSON.stringify(analyzeDuplication(files));
      expect(run1).toBe(run2);
    });
  });
});

// ---------------------------------------------------------------------------
// 2. DeadCode Analyzer - additional edge cases
// ---------------------------------------------------------------------------
describe("Phase 7 Unit: DeadCodeAnalyzer", () => {
  const run = (files) => analyzePossibleUnusedExports(files);

  test("named export imported via alias is NOT reported as unused", () => {
    const files = [
      { filePath: "src/utils.ts", content: 'export const format = () => "ok";' },
      { filePath: "src/app.ts", content: "import { format as fmt } from './utils'; fmt();" },
    ];
    const { findings } = run(files);
    expect(findings.find(f => f.file === "src/utils.ts")).toBeUndefined();
  });

  test("namespace import (* as x) marks ALL exports in that module as used", () => {
    const files = [
      { filePath: "src/math.ts", content: "export const a = 1; export const b = 2;" },
      { filePath: "src/app.ts", content: "import * as math from './math'; math.a();" },
    ];
    const { findings } = run(files);
    expect(findings.find(f => f.file === "src/math.ts")).toBeUndefined();
  });

  test("re-export does not report origin as unused", () => {
    const files = [
      { filePath: "src/original.ts", content: "export const publicFn = () => {};" },
      { filePath: "src/barrel.ts", content: "export { publicFn } from './original';" },
    ];
    const { findings } = run(files);
    expect(findings.find(f => f.file === "src/original.ts")).toBeUndefined();
  });

  test("findings are labelled POSSIBLE_UNUSED_EXPORT, not dead-code", () => {
    const files = [
      { filePath: "src/lib.ts", content: "export const helper = () => {};" },
    ];
    const { findings } = run(files);
    expect(findings.length).toBeGreaterThan(0);
    findings.forEach(f => {
      expect(f.type).toBe(ISSUE_TYPES.POSSIBLE_UNUSED_EXPORT);
      expect(f.title).toContain("Possible unused export");
    });
  });

  test("severity of unused export findings is LOW", () => {
    const files = [
      { filePath: "src/lib.ts", content: "export const x = 1;" },
    ];
    const { findings } = run(files);
    expect(findings.length).toBeGreaterThan(0);
    findings.forEach(f => expect(f.severity).toBe(SEVERITY.LOW));
  });

  test("findings are sorted deterministically: by file then exportedName", () => {
    const files = [
      { filePath: "src/z.ts", content: "export const b = 2; export const a = 1;" },
      { filePath: "src/a.ts", content: "export const y = 2; export const x = 1;" },
    ];
    const { findings: res1 } = run(files);
    const { findings: res2 } = run([...files].reverse());
    expect(JSON.stringify(res1)).toBe(JSON.stringify(res2));
    expect(res1[0].file).toBe("src/a.ts");
  });

  test("malformed file (null content) is skipped, others still analyzed", () => {
    const files = [
      { filePath: "src/bad.ts", content: null },
      { filePath: "src/good.ts", content: "export const valid = 1;" },
    ];
    expect(() => run(files)).not.toThrow();
    const { findings } = run(files);
    expect(findings.some(f => f.file === "src/good.ts")).toBe(true);
    expect(findings.some(f => f.file === "src/bad.ts")).toBe(false);
  });

  test("unsupported file extension skipped without throwing", () => {
    const files = [
      { filePath: "README.md", content: "export const x = 1;" },
      { filePath: "src/valid.ts", content: "export const y = 1;" },
    ];
    expect(() => run(files)).not.toThrow();
    const { findings } = run(files);
    expect(findings.some(f => f.file === "src/valid.ts")).toBe(true);
    expect(findings.some(f => f.file === "README.md")).toBe(false);
  });

  test("empty files array returns zero findings and valid metadata", () => {
    const { findings, metadata } = run([]);
    expect(findings).toEqual([]);
    expect(metadata.exportsExamined).toBe(0);
    expect(metadata.possibleUnusedExportCount).toBe(0);
  });

  test("unresolved relative import increments unresolvedRelativeImports", () => {
    const files = [
      { filePath: "src/app.ts", content: "import { missing } from './does-not-exist'; export const x = 1;" },
    ];
    const { metadata } = run(files);
    expect(metadata.unresolvedRelativeImports).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// 3. Severity Priority Mapping
// ---------------------------------------------------------------------------
describe("Phase 7 Unit: Severity priority ordering", () => {
  const PRIORITY_ORDER = {
    [SEVERITY.CRITICAL]: 0,
    [SEVERITY.HIGH]: 1,
    [SEVERITY.MEDIUM]: 2,
    [SEVERITY.LOW]: 3,
  };
  const sortBySeverity = (issues) =>
    [...issues].sort((a, b) => (PRIORITY_ORDER[a.severity] ?? 99) - (PRIORITY_ORDER[b.severity] ?? 99));

  test("CRITICAL < HIGH < MEDIUM < LOW in sort order", () => {
    const issues = [
      { severity: SEVERITY.LOW },
      { severity: SEVERITY.CRITICAL },
      { severity: SEVERITY.MEDIUM },
      { severity: SEVERITY.HIGH },
    ];
    const sorted = sortBySeverity(issues);
    expect(sorted[0].severity).toBe(SEVERITY.CRITICAL);
    expect(sorted[1].severity).toBe(SEVERITY.HIGH);
    expect(sorted[2].severity).toBe(SEVERITY.MEDIUM);
    expect(sorted[3].severity).toBe(SEVERITY.LOW);
  });

  test("severity constant values are the correct lowercase strings", () => {
    expect(SEVERITY.LOW).toBe("low");
    expect(SEVERITY.MEDIUM).toBe("medium");
    expect(SEVERITY.HIGH).toBe("high");
    expect(SEVERITY.CRITICAL).toBe("critical");
  });

  test("duplicationAnalyzer assigns high severity for large block with many occurrences", () => {
    const block = Array.from({ length: 20 }, (_, i) => `LINE_${i}`).join("\n");
    const files = [
      { path: "a.js", content: block },
      { path: "b.js", content: block },
      { path: "c.js", content: block },
      { path: "d.js", content: block },
    ];
    const issues = analyzeDuplication(files);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].severity).toBe("high");
  });

  test("duplicationAnalyzer assigns low severity for small block with 2 occurrences", () => {
    const block = "L1\nL2\nL3\nL4\nL5";
    const files = [
      { path: "a.js", content: block },
      { path: "b.js", content: block },
    ];
    const issues = analyzeDuplication(files);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].severity).toBe("low");
  });
});

// ---------------------------------------------------------------------------
// 4. Template explanation fallback shape
// ---------------------------------------------------------------------------
describe("Phase 7 Unit: Template explanation fallback", () => {
  const buildTemplateExplanation = (issue) => ({
    explanation: `This ${issue.type} issue was detected by static analysis. AI explanation is currently unavailable.`,
    recommendation: issue.recommendation || "Review the flagged code and address as appropriate.",
    estimatedFixTime: "15-30 minutes",
    source: "template",
  });

  test("template has explanation, recommendation, estimatedFixTime, and source fields", () => {
    const result = buildTemplateExplanation({ type: ISSUE_TYPES.POSSIBLE_UNUSED_EXPORT, recommendation: "Check exports." });
    expect(result).toHaveProperty("explanation");
    expect(result).toHaveProperty("recommendation");
    expect(result).toHaveProperty("estimatedFixTime");
    expect(result).toHaveProperty("source", "template");
  });

  test("explanation contains the issue type string", () => {
    const result = buildTemplateExplanation({ type: "duplication", recommendation: "Refactor." });
    expect(result.explanation).toContain("duplication");
  });

  test("uses issue recommendation when available", () => {
    const rec = "Extract to shared utility.";
    const result = buildTemplateExplanation({ type: "duplication", recommendation: rec });
    expect(result.recommendation).toBe(rec);
  });

  test("falls back to generic recommendation when issue has none", () => {
    const result = buildTemplateExplanation({ type: "duplication" });
    expect(result.recommendation).toBeTruthy();
  });

  test("output does NOT contain secrets, tokens, or API keys", () => {
    const result = buildTemplateExplanation({ type: "duplication", recommendation: "Refactor." });
    const serialized = JSON.stringify(result);
    expect(serialized).not.toMatch(/gsk_|sk-|Bearer|api_key|apiKey/i);
  });

  test("does not mutate the original issue object", () => {
    const originalIssue = Object.freeze({
      type: ISSUE_TYPES.POSSIBLE_UNUSED_EXPORT,
      severity: SEVERITY.LOW,
      file: "src/utils.ts",
    });
    buildTemplateExplanation(originalIssue);
    expect(originalIssue.type).toBe(ISSUE_TYPES.POSSIBLE_UNUSED_EXPORT);
  });

  test("estimatedFixTime is a non-empty string", () => {
    const result = buildTemplateExplanation({ type: "duplication" });
    expect(typeof result.estimatedFixTime).toBe("string");
    expect(result.estimatedFixTime.length).toBeGreaterThan(0);
  });
});
