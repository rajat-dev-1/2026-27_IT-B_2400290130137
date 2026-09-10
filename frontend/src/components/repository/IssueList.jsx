import { useState } from 'react';
import { ChevronRight, FileCode2, Clock } from 'lucide-react';
import Badge from '../ui/Badge';
import IssueDetailModal from './IssueDetailModal';

export default function IssueList({ issues, totalIssuesCount = issues.length }) {
  const [selectedIssue, setSelectedIssue] = useState(null);

  if (totalIssuesCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border/50 rounded-xl bg-slate/20">
        <div className="h-12 w-12 rounded-full bg-moss-surface flex items-center justify-center mb-4">
           <FileCode2 className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-medium text-ivory mb-2">No issues were detected</h3>
        <p className="text-sm text-sage max-w-sm">This repository looks healthy.</p>
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border/50 rounded-xl bg-slate/20">
        <div className="h-12 w-12 rounded-full bg-moss-surface flex items-center justify-center mb-4">
           <FileCode2 className="h-6 w-6 text-sage" />
        </div>
        <h3 className="text-lg font-medium text-ivory mb-2">No findings match these filters</h3>
        <p className="text-sm text-sage max-w-sm">Try clearing one or more filters.</p>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-critical';
      case 'high': return 'text-high';
      case 'medium': return 'text-warning';
      case 'low': return 'text-primary';
      default: return 'text-muted';
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        {issues.map(issue => (
          <button
            key={issue.id}
            onClick={() => setSelectedIssue(issue)}
            className="flex flex-col sm:flex-row sm:items-start text-left gap-4 p-4 bg-ink border border-border/50 hover:border-border rounded-lg transition-colors group relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {/* Subtle left border accent for P1 */}
            {issue.priority === 'P1' && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-high opacity-50" />
            )}

            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="secondary" className={issue.priority === 'P1' ? 'bg-high/10 text-high border-high/20' : ''}>
                  {issue.priority}
                </Badge>
                <span className={`text-xs font-semibold uppercase tracking-wider ${getSeverityColor(issue.severity)}`}>
                  {issue.severity}
                </span>
                <span className="text-base font-medium text-ivory line-clamp-1 flex-1 min-w-[200px]">
                  {issue.title}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-sage">
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <FileCode2 className="w-3.5 h-3.5 opacity-70" />
                  <span className="truncate max-w-[200px] sm:max-w-[300px]">{issue.filePath ?? issue.file}</span>
                  {issue.line && <span className="opacity-70">:{issue.line}</span>}
                </div>
                
                <span className="w-1 h-1 rounded-full bg-border" />
                
                <span className="capitalize">{issue.type}</span>
                
                {issue.metric && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span>{issue.metric}</span>
                  </>
                )}
                
                {issue.estimatedFixTime && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 opacity-70" />
                      <span>{issue.estimatedFixTime}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end shrink-0 sm:self-center mt-2 sm:mt-0 text-sage group-hover:text-ivory transition-colors">
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        ))}
      </div>

      <IssueDetailModal 
        isOpen={!!selectedIssue}
        onClose={() => setSelectedIssue(null)}
        issue={selectedIssue}
      />
    </>
  );
}
