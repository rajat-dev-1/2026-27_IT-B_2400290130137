import { Compass, FileCode2 } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

export default function ArchitectInsight({ insight }) {
  const handleActionClick = () => {
    import('sonner').then(({ toast }) => {
      toast("Detailed issue review will be built in Phase 5.");
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-sm font-semibold text-ivory uppercase tracking-wider">Architect Insight</h3>
        <Badge variant="ai">AI Generated</Badge>
      </div>

      <Card 
        className="flex-1 flex flex-col bg-[#1E2520] border-l-4 border-y-border border-r-border border-l-ai relative overflow-hidden" 
        padding="lg"
      >
        {/* Subtle decorative background gradient to make it feel special but calm */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-ai/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4 text-ai">
            <Compass className="h-5 w-5" />
            <span className="font-semibold text-ivory text-base">{insight.title}</span>
          </div>

          <div className="flex items-center gap-2 mb-4 bg-ink/50 py-1.5 px-3 rounded w-fit border border-border/50">
            <FileCode2 className="h-3 w-3 text-sage shrink-0" />
            <span className="font-mono text-xs text-ivory">{insight.file}</span>
          </div>

          <p className="text-sm text-sage leading-relaxed mb-6 flex-1">
            {insight.description}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/30">
            <span className="text-xs font-medium text-muted bg-ink/50 px-2 py-1 rounded border border-border/30">
              {insight.estimatedImpact}
            </span>
            <button 
              onClick={handleActionClick}
              className="text-xs font-medium text-ai hover:text-ivory transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ai rounded px-1"
            >
              {insight.action} →
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
