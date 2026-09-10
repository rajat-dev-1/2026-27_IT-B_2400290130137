import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Compass, GitBranch, ArrowRight } from 'lucide-react';
import GithubIcon from '../components/ui/GithubIcon';
import { toast } from 'sonner';

import Button from '../components/ui/Button';
import HealthRingPreview from '../components/landing/HealthRingPreview';
import CapabilityCards from '../components/landing/CapabilityCards';
import HowItWorks from '../components/landing/HowItWorks';
import ArchitectInsight from '../components/landing/ArchitectInsight';
import Footer from '../components/landing/Footer';
import { useAuth } from '../hooks/useAuth';

export default function LandingPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleConnect = () => {
    login();
  };

  return (
    <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
      
      {/* Hero Section */}
      <section className="w-full max-w-6xl mx-auto px-4 pt-12 md:pt-24 pb-16 flex flex-col md:flex-row items-center gap-12 md:gap-8">
        
        <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start z-10">
          <div className="mb-6 px-3 py-1 rounded-full border border-border bg-moss-surface inline-flex items-center text-xs font-medium text-primary">
            Repository-aware code health
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-ivory tracking-tight mb-6 leading-tight">
            Understand what your <br className="hidden lg:block" /> codebase needs next.
          </h1>
          
          <p className="text-lg text-sage mb-8 max-w-xl leading-relaxed">
            CodeHealth AI turns repository signals into a focused, explainable health report—so you can fix tech debt before it slows you down.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-6">
            <Button variant="primary" size="lg"             leftIcon={GithubIcon} className="w-full sm:w-auto" onClick={handleConnect}>
              Connect GitHub
            </Button>
            <Button variant="secondary" size="lg" rightIcon={ArrowRight} className="w-full sm:w-auto" onClick={() => navigate('/dashboard')}>
              Explore the workspace
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted font-medium mt-2">
            <span>Read-only analysis</span>
            <span className="w-1 h-1 rounded-full bg-muted/50" />
            <span>JavaScript & TypeScript</span>
            <span className="w-1 h-1 rounded-full bg-muted/50" />
            <span>No code changes</span>
          </div>
        </div>

        <div className="flex-1 w-full max-w-md md:max-w-none md:pl-8">
          <HealthRingPreview />
        </div>
      </section>

      {/* Trust / Clarity Strip */}
      <section className="w-full max-w-5xl mx-auto px-4 py-8 mb-12 border-y border-border/50 bg-moss-surface/30">
        <div className="flex flex-col sm:flex-row justify-center sm:justify-around gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-sage" />
            <span className="text-sm font-medium text-ivory">Deterministic analysis</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Compass className="h-5 w-5 text-sage" />
            <span className="text-sm font-medium text-ivory">AI explanations for top issues</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <GitBranch className="h-5 w-5 text-sage" />
            <span className="text-sm font-medium text-ivory">GitHub stays your source of truth</span>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <CapabilityCards />

      {/* How It Works */}
      <HowItWorks />

      {/* Architect Insight Callout */}
      <ArchitectInsight />

      {/* Final CTA */}
      <section className="w-full max-w-4xl mx-auto py-24 px-4 text-center mt-12 border-t border-border/50">
        <h2 className="text-3xl font-bold text-ivory mb-4">Start with the codebase you already have.</h2>
        <p className="text-lg text-sage mb-10 max-w-xl mx-auto">
          Connect GitHub and turn your next repository scan into a clearer plan for improvement.
        </p>
        <Button variant="primary" size="lg"             leftIcon={GithubIcon} onClick={handleConnect}>
          Connect GitHub
        </Button>
      </section>

      <Footer />

    </div>
  );
}
