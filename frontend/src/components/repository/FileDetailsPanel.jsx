import { FileCode2, Info } from 'lucide-react';
import IssueList from './IssueList';

export default function FileDetailsPanel({ selectedFile, issues }) {
  if (!selectedFile) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-32 text-center text-sage">
        <FileCode2 className="w-12 h-12 mb-4 opacity-50" />
        <h3 className="text-xl font-medium text-ivory mb-2">Choose a file to inspect its health</h3>
        <p className="max-w-md">Select a file from the explorer to see complexity, duplication, and maintainability scores.</p>
      </div>
    );
  }

  // issues come from DB with column name `filePath`; fall back to `file` for backwards compat
  const fileIssues = issues.filter(issue => (issue.filePath ?? issue.file) === selectedFile.path);

  const getHealthSummary = (score) => {
    if (score === undefined || score === null) return { color: 'bg-muted', text: 'No scan data available for this file.' };
    if (score >= 80) return { color: 'bg-primary', text: 'Healthy: This file has no significant detected maintainability concerns.' };
    if (score >= 70) return { color: 'bg-warning', text: 'Needs review: A few signals suggest this file may be harder to change safely.' };
    if (score >= 50) return { color: 'bg-high', text: 'High risk: This file contains high-impact maintainability concerns.' };
    return { color: 'bg-critical', text: 'Critical: This file needs focused review before further changes.' };
  };

  const health = getHealthSummary(selectedFile.healthScore);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      
      {/* File Header */}
      <div className="flex flex-col gap-4 bg-ink p-6 rounded-xl border border-border/50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full shrink-0 ${health.color}`} />
          <h2 className="text-xl font-mono font-medium text-ivory truncate">{selectedFile.path}</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-sage">
          {selectedFile.language && (
            <span className="bg-slate px-2 py-1 rounded border border-border/50 text-ivory">
              {selectedFile.language}
            </span>
          )}
          {selectedFile.healthScore !== undefined && (
            <span className="font-semibold text-ivory">
              Health score: {selectedFile.healthScore}
            </span>
          )}
          
          <div className="flex items-center gap-4 ml-auto font-mono text-xs text-muted">
            {selectedFile.lines !== undefined && <span>{selectedFile.lines} lines</span>}
            {selectedFile.functions !== undefined && <span>{selectedFile.functions} functions</span>}
            {selectedFile.classes !== undefined && <span>{selectedFile.classes} classes</span>}
          </div>
        </div>

        <div className="p-4 bg-slate rounded-lg border border-border/50 flex items-start gap-3 mt-2">
          <Info className="w-5 h-5 text-sage shrink-0 mt-0.5" />
          <p className="text-sm text-sage">{health.text}</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard label="Complexity" value={selectedFile.complexity ?? '-'} />
        <MetricCard label="Duplication" value={selectedFile.duplication !== undefined ? `${selectedFile.duplication}%` : '-'} />
        <MetricCard label="Dependencies" value={selectedFile.dependencies ?? '-'} />
        <MetricCard label="Churn" value={selectedFile.churn ?? '-'} />
      </div>

      {/* File Issues */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-ivory">Findings in this file</h3>
        {fileIssues.length > 0 ? (
          <IssueList issues={fileIssues} />
        ) : (
          <div className="p-8 text-center bg-slate/30 border border-dashed border-border/50 rounded-xl text-sage">
            No issues found in this file during the latest scan.
          </div>
        )}
      </div>

    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="flex flex-col bg-ink p-4 rounded-xl border border-border/50 shadow-sm">
      <span className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">{label}</span>
      <span className="text-2xl font-bold text-ivory">{value}</span>
    </div>
  );
}
