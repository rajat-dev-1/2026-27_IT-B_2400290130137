import { useEffect, useRef } from 'react';
import { Compass, FileCode2, Clock, X } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function IssueDetailModal({ isOpen, onClose, issue }) {
  const closeButtonRef = useRef(null);
  const triggerRef = useRef(null);

  // Store trigger element on open so we can return focus on close
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
      // Focus the close button after mounting
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    } else if (triggerRef.current) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [isOpen, onClose]);

  if (!isOpen || !issue) return null;

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
    /* Overlay */
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-ink/80 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      aria-modal="true"
      role="dialog"
      aria-label={issue.title}
    >
      {/* Sheet / Modal */}
      <div className="relative w-full sm:max-w-3xl bg-slate border border-border/50 shadow-2xl rounded-t-2xl sm:rounded-xl flex flex-col max-h-[95dvh] sm:max-h-[85vh] motion-safe:animate-in motion-safe:slide-in-from-bottom-4 motion-safe:sm:zoom-in-95 duration-200">

        {/* Sticky header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 pt-5 pb-4 border-b border-border/50 bg-slate rounded-t-2xl sm:rounded-t-xl">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <Badge
              variant="secondary"
              className={issue.priority === 'P1' ? 'bg-high/10 text-high border-high/20' : ''}
            >
              {issue.priority}
            </Badge>
            <span className={`text-xs font-semibold uppercase tracking-wider ${getSeverityColor(issue.severity)}`}>
              {issue.severity}
            </span>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1.5 text-sage hover:text-ivory bg-moss-surface border border-border rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors shrink-0"
            aria-label="Close issue details"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-8">

          {/* Title + location */}
          <div className="flex flex-col gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-ivory tracking-tight leading-tight">
              {issue.title}
            </h2>
            <div className="flex items-center gap-2 text-sm text-sage font-mono bg-ink px-3 py-2 rounded-md border border-border/50 w-fit max-w-full overflow-x-auto">
              <FileCode2 className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
              <span className="truncate">{issue.filePath ?? issue.file}</span>
              {issue.line && <span className="text-muted shrink-0">:{issue.line}</span>}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <span className="capitalize">{issue.type}</span>
              {issue.estimatedFixTime && (
                <>
                  <span aria-hidden="true">·</span>
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Est. {issue.estimatedFixTime}</span>
                </>
              )}
            </div>
          </div>

          {/* Why this matters */}
          {(issue.description || issue.explanation) && (
            <section aria-label="Why this matters">
              <h3 className="text-sm font-semibold text-ivory uppercase tracking-wider mb-3">Why this matters</h3>
              <p className="text-sage leading-relaxed">
                {issue.explanation || issue.description}
              </p>
            </section>
          )}

          {/* Detected Context metrics */}
          {issue.metrics && Object.keys(issue.metrics).some(k => issue.metrics[k] !== null) && (
            <section aria-label="Detected context">
              <h3 className="text-sm font-semibold text-ivory uppercase tracking-wider mb-3">Detected Context</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(issue.metrics).map(([key, value]) =>
                  value !== null ? (
                    <div key={key} className="flex items-center gap-2 bg-ink px-3 py-1.5 rounded border border-border/50 text-sm">
                      <span className="text-muted capitalize">{key}:</span>
                      <span className="font-mono text-ivory">{value}</span>
                    </div>
                  ) : null
                )}
              </div>
            </section>
          )}

          {/* Code Snippet — plain text, never dangerouslySetInnerHTML */}
          {issue.codeSnippet && (
            <section aria-label="Code snippet">
              <h3 className="text-sm font-semibold text-ivory uppercase tracking-wider mb-3">Snippet</h3>
              <div className="bg-[#0D1117] border border-border/50 rounded-lg overflow-x-auto">
                <pre className="p-4 text-sm font-mono text-sage whitespace-pre leading-relaxed">
                  <code>{issue.codeSnippet}</code>
                </pre>
              </div>
            </section>
          )}

          {/* Recommended next step */}
          {issue.recommendation && (
            <section aria-label="Recommended next step">
              <h3 className="text-sm font-semibold text-ivory uppercase tracking-wider mb-3">Recommended Next Step</h3>
              <div className="bg-moss-surface/30 border border-primary/20 rounded-lg p-4 text-sage leading-relaxed">
                <p>{issue.recommendation}</p>
                {issue.estimatedFixTime && (
                  <div className="flex items-center gap-1.5 mt-3 text-sm text-ivory font-medium">
                    <Clock className="w-4 h-4 text-primary" aria-hidden="true" />
                    <span>Estimated effort: {issue.estimatedFixTime}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* AI Insight — Soft Orchid only when aiGenerated */}
          {issue.aiGenerated && (
            <section
              aria-label="AI-assisted Architect Insight"
              className="flex flex-col bg-[#1E2520] border-l-2 border-ai rounded-r-lg p-4 relative overflow-hidden"
            >
              <div className="relative z-10 flex flex-col">
                <div className="flex items-center gap-2 mb-2 text-ai">
                  <Compass className="h-4 w-4" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Architect Insight</span>
                </div>
                <p className="text-sm text-sage leading-relaxed">
                  This explanation and recommendation were generated with AI assistance based on the detected metrics and code structure.
                </p>
              </div>
            </section>
          )}

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-border/50 bg-slate rounded-b-2xl sm:rounded-b-xl">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>

      </div>
    </div>
  );
}
