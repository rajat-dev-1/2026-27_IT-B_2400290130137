import { Loader2, CheckCircle2 } from 'lucide-react';
import GithubIcon from '../ui/GithubIcon';
import { cn } from '../../utils/cn';

export default function HowItWorks() {
  const steps = [
    {
      title: "1. Connect GitHub",
      description: "Sign in securely and select a repository you want to understand better.",
      visual: (
        <div className="flex items-center gap-3 bg-ink border border-border rounded-lg p-3 w-full max-w-[200px] shadow-sm">
          <GithubIcon className="h-5 w-5 text-ivory" />
          <div className="text-sm font-medium text-ivory">Connected</div>
        </div>
      )
    },
    {
      title: "2. Run a Scan",
      description: "CodeHealth analyzes supported files in the background, without blocking your work.",
      visual: (
        <div className="flex flex-col gap-2 w-full max-w-[200px]">
          <div className="flex items-center justify-between text-xs font-medium text-sage">
            <span className="flex items-center gap-1.5"><Loader2 className="h-3 w-3 animate-spin" /> Analyzing...</span>
            <span>68%</span>
          </div>
          <div className="h-1.5 w-full bg-ink rounded-full overflow-hidden border border-border/50">
            <div className="h-full bg-primary rounded-full w-[68%]" />
          </div>
        </div>
      )
    },
    {
      title: "3. Fix What Matters",
      description: "Review the health score, inspect top risks, and act on clear recommendations.",
      visual: (
        <div className="flex items-start gap-2 bg-ink border border-critical/30 rounded-lg p-3 w-full max-w-[200px] shadow-sm">
          <CheckCircle2 className="h-4 w-4 text-critical shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-ivory">Simplify auth flow</span>
            <span className="text-[10px] text-sage mt-0.5">High priority</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <section id="how-it-works" className="w-full max-w-5xl mx-auto py-24 px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-ivory mb-4">How it works</h2>
        <p className="text-sage text-lg max-w-2xl mx-auto">From repository connection to actionable insights in minutes.</p>
      </div>

      <div className="relative">
        {/* Connector line */}
        <div className="absolute top-[88px] left-0 right-0 hidden md:block h-[1px] bg-border/50 z-0" />
        <div className="absolute top-0 bottom-0 left-[39px] md:hidden w-[1px] bg-border/50 z-0" />

        <div className="flex flex-col md:flex-row gap-12 md:gap-6 relative z-10">
          {steps.map((step, index) => (
            <div key={index} className="flex-1 flex flex-col md:items-center text-left md:text-center group">
              <div className="h-44 w-full md:w-44 bg-moss-surface border border-border rounded-xl flex items-center justify-center mb-6 relative overflow-hidden transition-colors group-hover:border-primary/30">
                {/* Number indicator for mobile */}
                <div className="absolute top-3 left-3 md:hidden flex items-center justify-center w-6 h-6 rounded-full bg-slate border border-border text-xs font-bold text-ivory">
                  {index + 1}
                </div>
                {step.visual}
              </div>
              <h3 className="text-xl font-semibold text-ivory mb-3">{step.title}</h3>
              <p className="text-sm text-sage leading-relaxed max-w-xs md:mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
