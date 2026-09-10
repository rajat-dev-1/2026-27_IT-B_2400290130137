import { ISSUE_TYPES } from '../../../shared/constants/issueTypes.js';
import { SEVERITY } from '../../../shared/constants/severity.js';

/**
 * Calculates a health score (0-100) based on issues and file count.
 */
function calculateCategoryScore(issues, totalFiles, categoryBaseValue = 100) {
  if (totalFiles === 0) return 100;

  let deduction = 0;
  for (const issue of issues) {
    if (issue.severity === SEVERITY.CRITICAL) deduction += 15;
    else if (issue.severity === SEVERITY.HIGH) deduction += 8;
    else if (issue.severity === SEVERITY.MEDIUM) deduction += 4;
    else deduction += 1;
  }

  // Normalize deduction by file count to avoid penalizing large repos just for being large
  const normalizedDeduction = deduction / Math.max(1, (totalFiles / 50)); 
  
  const score = Math.max(0, Math.round(categoryBaseValue - normalizedDeduction));
  return score;
}

export function calculateScores(allIssues, totalFiles) {
  const complexityIssues = allIssues.filter(i => i.type === ISSUE_TYPES.HIGH_COMPLEXITY);
  const duplicationIssues = allIssues.filter(i => i.type === ISSUE_TYPES.DUPLICATED_CODE);
  const deadCodeIssues = allIssues.filter(i => i.type === ISSUE_TYPES.POSSIBLE_UNUSED_EXPORT);
  const dependencyIssues = allIssues.filter(i => i.type === ISSUE_TYPES.OUTDATED_DEPENDENCY);
  const architectureIssues = allIssues.filter(i => i.type === ISSUE_TYPES.ARCHITECTURE_VIOLATION); // Not implemented yet, but keeping structure

  const complexityScore = calculateCategoryScore(complexityIssues, totalFiles);
  const duplicationScore = calculateCategoryScore(duplicationIssues, totalFiles);
  const deadCodeScore = calculateCategoryScore(deadCodeIssues, totalFiles);
  const dependencyScore = calculateCategoryScore(dependencyIssues, totalFiles);
  const architectureScore = calculateCategoryScore(architectureIssues, totalFiles);

  // Overall score is an average of the categories
  const overallScore = Math.round(
    (complexityScore + duplicationScore + deadCodeScore + dependencyScore + architectureScore) / 5
  );

  return {
    overallScore,
    complexityScore,
    duplicationScore,
    deadCodeScore,
    dependencyScore,
    architectureScore
  };
}
