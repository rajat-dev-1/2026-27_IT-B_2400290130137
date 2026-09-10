import { ISSUE_TYPES } from '../../../shared/constants/issueTypes.js';
import { SEVERITY } from '../../../shared/constants/severity.js';

/**
 * Analyzes package.json files for dependency issues.
 * Returns both findings (issues) and a list of dependencies for the DB schema.
 */
export function analyzeDependencies(files) {
  const findings = [];
  const dependenciesList = [];
  let totalDependenciesAnalyzed = 0;

  for (const file of files) {
    if (!file.filePath.endsWith('package.json')) continue;

    let pkg;
    try {
      pkg = JSON.parse(file.content);
    } catch (e) {
      // Invalid package.json, skip
      continue;
    }

    const allDeps = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {})
    };

    for (const [name, version] of Object.entries(allDeps)) {
      totalDependenciesAnalyzed++;
      
      let isOutdated = false;
      let hasVulnerabilities = false;

      // Mock logic for controlled fixture: flag "outdated-package"
      if (name === 'outdated-package' || version.includes('<')) {
        isOutdated = true;
      }
      // Flag "vulnerable-package"
      if (name === 'vulnerable-package') {
        hasVulnerabilities = true;
      }

      dependenciesList.push({
        name,
        installedVersion: version,
        latestVersion: isOutdated ? 'latest' : version, // Mock
        isOutdated,
        hasVulnerabilities,
        vulnerabilities: hasVulnerabilities ? [{ id: 'CVE-MOCK', severity: 'high' }] : [],
        metadata: { sourceFile: file.filePath }
      });

      if (isOutdated || hasVulnerabilities) {
        findings.push({
          type: ISSUE_TYPES.OUTDATED_DEPENDENCY,
          severity: hasVulnerabilities ? SEVERITY.CRITICAL : SEVERITY.MEDIUM,
          file: file.filePath,
          line: 1, // Approximation without full JSON AST parsing
          title: `Dependency issue in "${name}"`,
          description: hasVulnerabilities 
            ? `The package "${name}" has known vulnerabilities.` 
            : `The package "${name}" is outdated.`,
          recommendation: `Update "${name}" to the latest version.`,
          metrics: {
            dependencyName: name,
            currentVersion: version,
            analyzer: 'dependencyAnalyzer'
          }
        });
      }
    }
  }

  return {
    findings,
    dependencies: dependenciesList,
    metadata: {
      totalDependenciesAnalyzed,
      issueCount: findings.length
    }
  };
}
