import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import GithubIcon from '../ui/GithubIcon';
import CanvasNeuralMesh from './CanvasNeuralMesh';
import Reveal from './Reveal';

const L = {
  bg: '#E3E0DA',
  text: '#1A1714',
  textSub: '#6B6459',
  textMuted: '#9E9587',
  border: 'rgba(30,24,14,0.12)',
  btnPrimary: '#1A1714',
  btnPrimaryText: '#F5F3EF',
  accent: '#2D6A48',
};

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function FinalCtaSection() {
  const { login } = useAuth();

  return (
    <section style={{ position: 'relative', background: L.bg, padding: '0 0', overflow: 'hidden', minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
      {/* Canvas mesh background (smaller, decorative) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.65 }}>
        <CanvasNeuralMesh bgColor={L.bg} />
      </div>

      {/* Left fade for text legibility */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: `linear-gradient(90deg, ${L.bg} 38%, ${L.bg}CC 56%, transparent 75%)`,
      }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto', padding: '96px 24px', width: '100%' }}>
        <Reveal>
          <div style={{ maxWidth: 520 }}>
            <p style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: L.textMuted, marginBottom: 24 }}>
              Start your first scan
            </p>
            <h2 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 4rem)', fontWeight: 800, color: L.text, lineHeight: 1.05, letterSpacing: '-0.025em', textTransform: 'uppercase', margin: '0 0 20px' }}>
              Turn codebase<br />uncertainty into a<br />clear next step.
            </h2>
            <p style={{ fontSize: 17, color: L.textSub, lineHeight: 1.65, margin: '0 0 40px', maxWidth: 440 }}>
              Connect GitHub, scan a repository, and see the most important improvements your codebase needs.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
              <button id="final-cta-github" onClick={login}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  background: L.btnPrimary, color: L.btnPrimaryText, border: 'none', cursor: 'pointer',
                  fontSize: 15, fontWeight: 700, letterSpacing: '0.01em',
                  padding: '14px 28px', borderRadius: 10,
                  transition: 'opacity 0.2s, transform 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.84'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <GithubIcon className="h-5 w-5" />
                Start your first scan
              </button>
              <button id="final-cta-workflow" onClick={() => scrollTo('how-it-works')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  background: 'transparent', color: L.text,
                  border: `1.5px solid ${L.border}`, cursor: 'pointer',
                  fontSize: 15, fontWeight: 600, letterSpacing: '0.01em',
                  padding: '14px 28px', borderRadius: 10,
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = 'rgba(30,24,14,0.24)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = L.border; }}
              >
                Explore the workflow →
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 16px' }}>
              {['Free to try', 'Read-only GitHub access', 'No credit card required', 'No code changes'].map((t, i) => (
                <span key={t} style={{ fontSize: 12, color: L.textMuted, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {i > 0 && <span style={{ width: 3, height: 3, borderRadius: '50%', background: L.textMuted, display: 'inline-block' }} />}
                  {t}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
