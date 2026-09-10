import { useState } from 'react';
import { ChevronRight, FileCode2, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../utils/cn';

export default function TopIssues({ issues }) {
  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'high': return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-high/10 text-high border border-high/20">High</span>;
      case 'medium': return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-warning/10 text-warning border border-warning/20">Medium</span>;
      case 'low': return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-info/10 text-info border border-info/20">Low</span>;
      default: return null;
    }
  };

  const handleIssueClick = (id) => {
    toast(`Detailed issue review for ${id} will be built in Phase 5.`);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4 px-2">
        <div>
          <h3 className="text-lg font-semibold text-ivory">Priority areas</h3>
          <p className="text-sm text-sage">Focus on the changes with the highest maintainability impact.</p>
        </div>
      </div>

      <div className="flex flex-col border border-border rounded-xl bg-slate overflow-hidden">
        {issues.map((issue, i) => (
          <button 
            key={issue.id}
            onClick={() => handleIssueClick(issue.id)}
            className={cn(
              "flex flex-col sm:flex-row sm:items-center gap-4 p-4 text-left transition-colors hover:bg-moss-surface group focus-visible:outline-none focus-visible:bg-moss-surface",
              i !== issues.length - 1 ? "border-b border-border" : "",
              issue.priority === 'P1' ? "border-l-2 border-l-high pl-[14px]" : ""
            )}
          >
            {/* Priority & Severity */}
            <div className="flex items-center gap-3 sm:w-32 shrink-0">
              <span className={cn(
                "text-xs font-bold font-mono",
                issue.priority === 'P1' ? "text-high" : "text-muted"
              )}>
                {issue.priority}
              </span>
              {getSeverityBadge(issue.severity)}
            </div>

            {/* Title & File */}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium text-ivory truncate group-hover:text-primary transition-colors">
                {issue.title}
              </span>
              <div className="flex items-center gap-2 mt-1 text-xs text-sage font-mono truncate">
                <FileCode2 className="h-3 w-3 shrink-0" />
                <span className="truncate">{issue.filePath ?? issue.file}{issue.line ? `:${issue.line}` : ''}</span>
              </div>
            </div>

            {/* Context & Effort */}
            <div className="flex items-center gap-4 sm:w-48 shrink-0 sm:justify-end text-xs">
              <span className="hidden md:inline-flex items-center px-2 py-1 bg-ink rounded border border-border text-sage truncate">
                {issue.metric}
              </span>
              <span className="flex items-center gap-1.5 text-sage whitespace-nowrap">
                <Clock className="h-3 w-3" />
                {issue.estimatedFix}
              </span>
              <ChevronRight className="h-4 w-4 text-muted group-hover:text-ivory transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
