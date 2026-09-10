import { Compass, Lightbulb, Clock } from 'lucide-react';
import Badge from '../ui/Badge';

export default function RecommendationPanel({ recommendations }) {
  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border/50 rounded-xl bg-slate/20">
        <div className="h-12 w-12 rounded-full bg-moss-surface flex items-center justify-center mb-4">
           <Lightbulb className="h-6 w-6 text-sage" />
        </div>
        <h3 className="text-lg font-medium text-ivory mb-2">No prioritized recommendations yet</h3>
        <p className="text-sm text-sage max-w-sm">Recommendations appear when the latest scan identifies high-impact issues.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex flex-col mb-4">
        <h2 className="text-lg font-semibold text-ivory">Recommended next steps</h2>
        <span className="text-sm text-sage">Fixing these areas is likely to improve maintainability first.</span>
      </div>

      <div className="flex flex-col gap-4">
        {recommendations.map(rec => (
          <div 
            key={rec.id} 
            className={`flex flex-col bg-ink border border-border/50 rounded-xl p-6 shadow-sm relative overflow-hidden ${rec.aiGenerated ? 'border-l-2 border-l-ai' : ''}`}
          >
            {/* AI Background Glow */}
            {rec.aiGenerated && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-ai/5 rounded-full blur-3xl pointer-events-none" />
            )}

            <div className="flex flex-col md:flex-row md:items-start gap-4">
              
              <div className="flex-1 flex flex-col min-w-0 z-10">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <Badge variant="secondary" className={rec.priority === 'P1' ? 'bg-high/10 text-high border-high/20' : ''}>
                    {rec.priority}
                  </Badge>
                  {rec.aiGenerated && (
                    <div className="flex items-center gap-1.5 text-ai bg-ai/10 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
                      <Compass className="w-3.5 h-3.5" />
                      Architect Insight
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-ivory mb-2">{rec.title}</h3>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-sage mb-4 font-mono text-xs">
                  <span className="truncate">{rec.file}</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="font-sans text-sm">{rec.impact}</span>
                  {rec.effort && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="font-sans text-sm flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {rec.effort}</span>
                    </>
                  )}
                </div>

                <p className="text-sage leading-relaxed mb-4">{rec.description}</p>
                
                <div className="bg-moss-surface/30 border border-primary/20 rounded-lg p-4 text-ivory leading-relaxed text-sm">
                  <span className="font-semibold text-primary block mb-1">Recommended action:</span>
                  {rec.recommendation}
                </div>
              </div>
              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
