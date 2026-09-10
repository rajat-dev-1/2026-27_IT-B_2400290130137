import { Compass } from 'lucide-react';
import Card from '../ui/Card';

export default function ArchitectInsight() {
  return (
    <section className="w-full max-w-5xl mx-auto py-24 px-4 border-t border-border/50">
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
        
        <div className="flex-1 text-center lg:text-left">
          <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-ai">
            <Compass className="h-4 w-4" />
            Architect Insight
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-ivory mb-6 tracking-tight">
            Less warning noise. <br className="hidden lg:block" /> More useful next steps.
          </h2>
          <p className="text-lg text-sage leading-relaxed max-w-xl mx-auto lg:mx-0">
            CodeHealth AI does not overwhelm you with every signal. It prioritizes the issues with the highest architectural impact and explains why they matter.
          </p>
        </div>

        <div className="flex-1 w-full max-w-md lg:max-w-none">
          <Card 
            className="bg-[#1E2520] border-l-4 border-y-border border-r-border border-l-ai shadow-xl overflow-hidden" 
            padding="lg"
          >
            <div className="flex items-center gap-2 mb-6 bg-ink/50 py-2 px-3 rounded border border-border/50 w-fit">
              <div className="w-2 h-2 rounded-full bg-warning" />
              <span className="font-mono text-sm text-ivory">auth/permissions.ts</span>
            </div>
            
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-semibold text-ivory mb-1">Issue</h4>
                <p className="text-sm text-sage">High complexity detected in primary authorization flow.</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-ivory mb-1">Why it matters</h4>
                <p className="text-sm text-sage">Multiple branching paths make this flow harder to test safely and increase the risk of permission bypasses.</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-ivory mb-1">Recommended next step</h4>
                <p className="text-sm text-sage">Split authorization checks into focused, single-responsibility policy functions.</p>
              </div>
              <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                <span className="text-sm font-medium text-ivory">Estimated effort</span>
                <span className="text-sm text-sage bg-ink px-2 py-1 rounded border border-border/50">1–2 hours</span>
              </div>
            </div>
          </Card>
        </div>
        
      </div>
    </section>
  );
}
