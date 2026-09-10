import LandingNav from '../components/landing/LandingNav';
import HeroSection from '../components/landing/HeroSection';
import MetricsStrip from '../components/landing/MetricsStrip';
import HowItWorksSection from '../components/landing/HowItWorksSection';
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
        {/* A. Hero */}
        <HeroSection />

        {/* B. Metrics strip */}
        <MetricsStrip />

        {/* C. How it works */}
        <HowItWorksSection />

        {/* D. Analysis capabilities */}
        <AnalysisCapabilities />

        {/* E. Dashboard showcase */}
        <DashboardShowcase />

        {/* F. Security / trust */}
        <SecuritySection />

        {/* G. Final CTA */}
        <FinalCtaSection />
      </main>

      <LandingFooter />
    </div>
  );
}
