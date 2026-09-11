import { useAuth } from '../../hooks/useAuth';
import GithubIcon from '../ui/GithubIcon';
import CanvasNeuralMesh from './CanvasNeuralMesh';
import Reveal from './Reveal';

const L = {
  bg: '#0E0C0A',
  text: '#F5F3EF',
  textSub: '#9E9890',
  textMuted: '#5E5952',
  border: 'rgba(245,243,239,0.08)',
  accent: '#4C9E6A',
  accentHover: '#3D8A59',
  btnSecondary: 'rgba(245,243,239,0.06)',
};

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function FinalCtaSection() {
  const { login } = useAuth();
  return (
    <section style={{
      position: 'relative', background: L.bg, overflow: 'hidden',
      minHeight: '72vh', display: 'flex', alignItems: 'center',
      borderTop: '1px solid rgba(245,243,239,0.06)',
    }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.30 }}>
        <CanvasNeuralMesh bgColor={L.bg} />
      </div>
      <div aria-hidden={true} style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'radial-gradient(ellipse 80% 80% at 60% 50%, transparent 20%, #0E0C0A 78%)',
      }} />
      <div style={{
        position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto',
        padding: '96px 24px', width: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      }}>
        <Reveal>
          <p style={{
            fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: L.accent, fontWeight: 700, margin: '0 0 28px',
          }}>Start your first scan</p>
          <h2 style={{
            fontSize: 'clamp(2.6rem, 6vw, 5.2rem)', fontWeight: 800, color: L.text,
            lineHeight: 1.04, letterSpacing: '-0.03em', textTransform: 'uppercase',
            margin: '0 0 24px', maxWidth: 820,
          }}>Turn codebase uncertainty into a clear next step.</h2>
          <p style={{
            fontSize: 18, color: L.textSub, lineHeight: 1.65, margin: '0 0 48px', maxWidth: 520,
          }}>Connect your repo and get an ordered improvement plan. Ranked by impact, explained in plain language.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginBottom: 36 }}>
            <button id="final-cta-github" onClick={login} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: L.accent, color: '#fff', border: 'none', cursor: 'pointer',
              fontSize: 15, fontWeight: 700, padding: '15px 32px', borderRadius: 10,
              transition: 'background 0.2s, transform 0.2s',
              boxShadow: '0 4px 20px rgba(76,158,106,0.28)',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = L.accentHover; e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = L.accent; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <GithubIcon className="h-5 w-5" />
              Analyze a repository
            </button>
            <button id="final-cta-workflow" onClick={() => scrollTo('how-it-works')} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: L.btnSecondary, color: L.text,
              border: '1.5px solid rgba(245,243,239,0.08)',
              cursor: 'pointer', fontSize: 15, fontWeight: 600, padding: '15px 32px', borderRadius: 10,
              transition: 'border-color 0.2s, background 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,243,239,0.10)'; e.currentTarget.style.borderColor = 'rgba(245,243,239,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = L.btnSecondary; e.currentTarget.style.borderColor = 'rgba(245,243,239,0.08)'; }}
            >See how it works</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 20px', justifyContent: 'center' }}>
            {['Read-only access', 'Deterministic scoring', 'No write permissions', 'Private repos'].map((t, i) => (
              <span key={t} style={{ fontSize: 12, color: L.textMuted, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                {i > 0 && <span style={{ width: 3, height: 3, borderRadius: '50%', background: L.textMuted, display: 'inline-block' }} />}
                {t}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
