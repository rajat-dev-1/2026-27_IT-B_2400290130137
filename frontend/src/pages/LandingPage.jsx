import LandingNav from '../components/landing/LandingNav';
import HeroSection from '../components/landing/HeroSection';
import MetricsStrip from '../components/landing/MetricsStrip';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import PrioritizationTransform from '../components/landing/PrioritizationTransform';
import AnalysisCapabilities from '../components/landing/AnalysisCapabilities';
import DashboardShowcase from '../components/landing/DashboardShowcase';
import SecuritySection from '../components/landing/SecuritySection';
import FinalCtaSection from '../components/landing/FinalCtaSection';
import LandingFooter from '../components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-[#EBE8E3]" style={{ background: '#EBE8E3' }}>
      {/* Sticky nav replaces the PublicLayout Navbar for the landing page */}
      <LandingNav />

      <main className="flex-1 w-full">
        {/* 1. Hero: Product promise + animated metaphor */}
        <HeroSection />

        {/* 2. Capability strip: Fast proof of scan coverage */}
        <MetricsStrip />

        {/* 3. Workflow: Concrete interaction sequence */}
        <HowItWorksSection />

        {/* 4. Core Differentiator: Raw warning noise to prioritized action plan */}
        <PrioritizationTransform />

        {/* 5. Analysis Modules: Technical credibility and deterministic depth */}
        <AnalysisCapabilities />

        {/* 6. Dashboard: Outcome product proof with in-view sequence */}
        <DashboardShowcase />

        {/* 7. Security: Asymmetric trust statement, 4 proof points, honest disclaimer */}
        <SecuritySection />

        {/* 8. Final CTA: Decisive return to primary product action */}
        <FinalCtaSection />
      </main>

      <LandingFooter />
    </div>
  );
}
