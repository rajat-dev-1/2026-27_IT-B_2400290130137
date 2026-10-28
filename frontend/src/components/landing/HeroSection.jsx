import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ArrowRight,
  Lock,
  Activity,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import GithubIcon from '../ui/GithubIcon';
import CanvasNeuralMesh from './CanvasNeuralMesh';

/* ─────────────────────────────────────────────────────────────────────────────
   Design Tokens
───────────────────────────────────────────────────────────────────────────── */
const L = {
  bg: '#EBE8E3',
  text: '#171B18',
  textSub: '#4E5750',
  textMuted: '#788279',
  border: 'rgba(23,27,24,0.12)',
  borderHover: 'rgba(23,27,24,0.26)',
  btnPrimary: '#171B18',
  btnPrimaryText: '#F5F8F5',
  accent: '#2D6A48',
  accentBright: '#3CA56B',
  accentSoft: 'rgba(45,106,72,0.10)',
  accentGlow: 'rgba(60,165,107,0.22)',
  warning: '#C27A23',
  warningSoft: 'rgba(194,122,35,0.12)',
  critical: '#C43D2E',
  criticalSoft: 'rgba(196,61,46,0.12)',
  cardGlass: 'rgba(255, 255, 255, 0.72)',
  cardGlassBorder: 'rgba(255, 255, 255, 0.85)',
};

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* Stagger variants */
const containerV = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};
const itemV = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
};

export default function HeroSection() {
  const { login } = useAuth();
  const [reduced, setReduced] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ));

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const h = (e) => setReduced(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  return (
    <section
      id="product"
      className="hero"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        background: L.bg,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{`
        .hero-scrim {
          background: linear-gradient(
            90deg,
            rgba(235, 232, 227, 0.88) 0%,
            rgba(235, 232, 227, 0.72) 28%,
            rgba(235, 232, 227, 0.28) 48%,
            transparent 65%
          );
        }
        @media (max-width: 900px) {
          .hero-scrim {
            background: linear-gradient(
              180deg,
              rgba(235, 232, 227, 0.94) 0%,
              rgba(235, 232, 227, 0.75) 40%,
              rgba(235, 232, 227, 0.35) 70%,
              transparent 100%
            );
          }
          .hero-telemetry-card {
            display: none !important;
          }
        }
      `}</style>

      {/* ── Layer 0: Full-Bleed Animated Background ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <CanvasNeuralMesh bgColor={L.bg} />
      </div>

      {/* ── Layer 1: Readability Scrim ── */}
      <div
        className="hero-scrim"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />

      {/* ── Layer 2: Main Hero Content (2-Column Grid on Desktop) ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          maxWidth: 1320,
          margin: '0 auto',
          padding: '0 32px',
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1.25fr) minmax(280px, 0.9fr)',
          gap: 40,
          alignItems: 'center',
          minHeight: '100vh',
          width: '100%',
        }}
      >
        {/* Left Column: Authoritative Message & CTAs */}
        <motion.div
          variants={reduced ? {} : containerV}
          initial={reduced ? false : 'hidden'}
          animate={reduced ? false : 'visible'}
          style={{
            maxWidth: 640,
            paddingTop: 110,
            paddingBottom: 80,
          }}
        >
          {/* Eyebrow & Live Radar Beacon */}
          <motion.div variants={reduced ? {} : itemV} style={{ marginBottom: 20 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 9,
                padding: '6px 14px',
                borderRadius: 20,
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(45, 106, 72, 0.25)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              {/* Radar pulse dot */}
              <span style={{ position: 'relative', display: 'flex', height: 8, width: 8 }}>
                <span
                  style={{
                    position: 'absolute',
                    display: 'inline-flex',
                    height: '100%',
                    width: '100%',
                    borderRadius: '50%',
                    background: L.accentBright,
                    opacity: 0.75,
                    animation: 'ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite',
                  }}
                />
                <span
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    borderRadius: '50%',
                    height: 8,
                    width: 8,
                    background: L.accent,
                  }}
                />
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: L.accent,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                Repository-Aware Code Health
              </span>
              <span style={{ color: L.border, fontSize: 10 }}>•</span>
              <span
                style={{
                  fontSize: 10.5,
                  fontFamily: 'monospace',
                  color: L.textMuted,
                  letterSpacing: '0.06em',
                }}
              >
                Deterministic AST
              </span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={reduced ? {} : itemV}
            style={{
              fontSize: 'clamp(2.7rem, 5.2vw, 4.6rem)',
              fontWeight: 800,
              lineHeight: 1.03,
              color: L.text,
              margin: '0 0 24px',
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
            }}
          >
            Find the fixes<br />
            <span
              style={{
                background: 'linear-gradient(135deg, #171B18 0%, #2D6A48 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              that matter most.
            </span>
          </motion.h1>

          {/* Supporting Paragraph */}
          <motion.p
            variants={reduced ? {} : itemV}
            style={{
              fontSize: 17,
              lineHeight: 1.7,
              color: L.textSub,
              maxWidth: 520,
              margin: '0 0 36px',
            }}
          >
            You already know your codebase has technical debt.
            The hard part is knowing what to fix first.
            CodeHealth AI turns a noisy repository scan into a ranked,
            explainable action plan&mdash;so you always know your next move.
          </motion.p>

          {/* CTA Button Group */}
          <motion.div
            variants={reduced ? {} : itemV}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 38 }}
          >
            {/* Primary GitHub CTA */}
            <button
              id="hero-cta-github"
              onClick={login}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: L.btnPrimary,
                color: L.btnPrimaryText,
                border: '1px solid rgba(255,255,255,0.15)',
                cursor: 'pointer',
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: '0.01em',
                padding: '15px 28px',
                borderRadius: 12,
                boxShadow: '0 8px 24px -4px rgba(23, 27, 24, 0.35), 0 0 0 1px rgba(0,0,0,0.1)',
                transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 30px -4px rgba(45, 106, 72, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(23, 27, 24, 0.35)';
              }}
            >
              <GithubIcon className="h-5 w-5" />
              <span>Analyze a repository</span>
              <ArrowRight size={15} style={{ opacity: 0.8 }} />
            </button>

            {/* Secondary CTA */}
            <button
              id="hero-cta-how"
              onClick={() => scrollTo('how-it-works')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 9,
                background: 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(10px)',
                color: L.text,
                border: `1.5px solid ${L.border}`,
                cursor: 'pointer',
                fontSize: 14.5,
                fontWeight: 600,
                letterSpacing: '0.01em',
                padding: '15px 26px',
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(23,27,24,0.28)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = L.border;
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.65)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>See how it works</span>
            </button>
          </motion.div>

          {/* Trust Marker Pills */}
          <motion.div
            variants={reduced ? {} : itemV}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}
          >
            {[
              { text: 'Read-only GitHub access', icon: Lock },
              { text: 'JS / TS analysis', icon: Zap },
              { text: 'Deterministic scoring', icon: CheckCircle2 },
              { text: 'No code changes', icon: ShieldCheck },
            ].map(({ text, icon: Icon }) => (
              <div
                key={text}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 11px',
                  borderRadius: 6,
                  background: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(23,27,24,0.08)',
                  fontSize: 11.5,
                  fontFamily: 'monospace',
                  color: L.textSub,
                  fontWeight: 600,
                }}
              >
                <Icon size={12} style={{ color: L.accent }} />
                <span>{text}</span>
              </div>
            ))}
          </motion.div>

          {/* Microcopy footnote */}
          <motion.p
            variants={reduced ? {} : itemV}
            style={{
              fontSize: 12,
              color: L.textMuted,
              fontStyle: 'italic',
              margin: 0,
              letterSpacing: '0.01em',
            }}
          >
            From raw findings to a clear first move.
          </motion.p>
        </motion.div>

        {/* Right Column: Floating Telemetry HUD Card (Overlays the 3D Torus) */}
        <motion.div
          className="hero-telemetry-card"
          initial={reduced ? false : { opacity: 0, scale: 0.96, y: 24 }}
          animate={reduced ? false : { opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            maxWidth: 390,
            marginLeft: 'auto',
            pointerEvents: 'auto',
          }}
        >
          {/* Main Floating Glassmorphic Telemetry Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.82)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 20,
              border: '1.5px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 24px 48px -12px rgba(23, 27, 24, 0.12), 0 0 0 1px rgba(23, 27, 24, 0.05)',
              padding: '22px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {/* Telemetry Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(23,27,24,0.08)', paddingBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: L.accentSoft,
                    border: `1px solid ${L.accent}33`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: L.accent,
                  }}
                >
                  <Activity size={17} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: L.text, letterSpacing: '-0.01em' }}>
                    CodeHealth Engine
                  </div>
                  <div style={{ fontSize: 10, fontFamily: 'monospace', color: L.textMuted }}>
                    v2.4 AST Analyzer Active
                  </div>
                </div>
              </div>

              <span
                style={{
                  fontSize: 10,
                  fontFamily: 'monospace',
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: 'rgba(45,106,72,0.12)',
                  color: L.accent,
                  fontWeight: 700,
                }}
              >
                100% Deterministic
              </span>
            </div>

            {/* Score Preview Dial */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: 12,
                background: '#FAF8F4',
                border: '1px solid rgba(23,27,24,0.06)',
              }}
            >
              <div>
                <div style={{ fontSize: 10.5, fontFamily: 'monospace', color: L.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Target Repository Health
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: L.text, marginTop: 2 }}>
                  Grade B+ · 3 High-Impact Fixes
                </div>
              </div>

              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: L.accentSoft,
                  border: `1.5px solid ${L.accent}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  color: L.accent,
                }}
              >
                78
              </div>
            </div>

            {/* Quick Live Telemetry Signals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Signal 1 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'rgba(196,61,46,0.06)',
                  border: '1px solid rgba(196,61,46,0.18)',
                  fontSize: 11,
                  fontFamily: 'monospace',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: L.critical }} />
                  <span style={{ color: L.text, fontWeight: 600 }}>auth/permissions.ts</span>
                </div>
                <span style={{ color: L.critical, fontWeight: 700 }}>CC 24 (High)</span>
              </div>

              {/* Signal 2 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'rgba(194,122,35,0.06)',
                  border: '1px solid rgba(194,122,35,0.18)',
                  fontSize: 11,
                  fontFamily: 'monospace',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: L.warning }} />
                  <span style={{ color: L.text, fontWeight: 600 }}>18-line AST Clone</span>
                </div>
                <span style={{ color: L.warning, fontWeight: 700 }}>98.6% Match</span>
              </div>
            </div>

            {/* AI Explanation Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 12px',
                borderRadius: 8,
                background: 'rgba(122,69,189,0.08)',
                border: '1px solid rgba(122,69,189,0.25)',
                fontSize: 11,
                color: L.text,
              }}
            >
              <Sparkles size={14} style={{ color: L.accentBright, flexShrink: 0 }} />
              <span style={{ lineHeight: 1.4 }}>
                Ranked Action Plan ready · <strong style={{ color: L.accent }}>0 Hallucinations</strong>
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Scroll Cue (Layer 2) ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        style={{
          position: 'absolute',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          zIndex: 20,
          cursor: 'pointer',
        }}
        onClick={() => scrollTo('metrics-strip')}
        role="button"
        aria-label="Scroll to next section"
      >
        <span
          style={{
            fontSize: 10,
            color: L.textMuted,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            fontFamily: 'monospace',
            fontWeight: 700,
          }}
        >
          Scroll
        </span>
        <div
          style={{
            width: 22,
            height: 34,
            border: `1.5px solid ${L.border}`,
            borderRadius: 12,
            display: 'flex',
            justifyContent: 'center',
            paddingTop: 5,
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <motion.div
            style={{ width: 3, height: 7, background: L.accent, borderRadius: 2 }}
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
