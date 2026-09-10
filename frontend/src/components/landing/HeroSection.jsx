import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import GithubIcon from '../ui/GithubIcon';
import CanvasNeuralMesh from './CanvasNeuralMesh';

const L = {
  bg: '#EBE8E3',
  text: '#1A1714',
  textSub: '#4C453C',
  textMuted: '#7A7265',
  border: 'rgba(30,24,14,0.14)',
  borderHover: 'rgba(30,24,14,0.28)',
  btnPrimary: '#1A1714',
  btnPrimaryText: '#F5F3EF',
  accent: '#245C3E',
};

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* Stagger variants */
const containerV = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.2 } },
};
const itemV = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
};

export default function HeroSection() {
  const { login } = useAuth();
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const h = e => setReduced(e.matches);
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
          background: radial-gradient(ellipse 75% 85% at 28% 50%, rgba(235, 232, 227, 0.88) 0%, rgba(235, 232, 227, 0.52) 48%, rgba(235, 232, 227, 0.08) 75%, transparent 100%);
        }
        @media (max-width: 768px) {
          .hero-scrim {
            background: radial-gradient(ellipse 95% 90% at 50% 45%, rgba(235, 232, 227, 0.94) 0%, rgba(235, 232, 227, 0.68) 55%, transparent 100%);
          }
        }
      `}</style>

      {/* ── Layer 0: Full-Bleed Animated Background (spans 100vw × 100vh) ── */}
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
        <CanvasNeuralMesh
          bgColor={L.bg}
          centerX={0.52}
          centerY={0.50}
          radiusScale={0.74}
        />
      </div>

      {/* ── Layer 1: Readability Scrim (soft radial fade near text only — no box, no card, no seams) ── */}
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

      {/* ── Layer 2: HeroContent (relative, z-20, Option A: left-aligned, vertically centered) ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          maxWidth: 1320,
          margin: '0 auto',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          minHeight: '100vh',
          width: '100%',
        }}
      >
        <motion.div
          variants={reduced ? {} : containerV}
          initial={reduced ? false : 'hidden'}
          animate={reduced ? false : 'visible'}
          style={{
            maxWidth: 600,
            paddingTop: 100,
            paddingBottom: 80,
          }}
        >
          {/* Section counter */}
          <motion.div variants={reduced ? {} : itemV}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 11,
                fontWeight: 600,
                color: L.textMuted,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 32,
              }}
            >
              001 / 004 &nbsp;&nbsp; Repository intelligence
            </span>
          </motion.div>

          {/* Eyebrow */}
          <motion.div variants={reduced ? {} : itemV}>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: L.accent,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginBottom: 18,
              }}
            >
              Repository-aware code health
            </p>
          </motion.div>

          {/* Main headline — bold, authoritative, uppercase */}
          <motion.h1
            variants={reduced ? {} : itemV}
            style={{
              fontSize: 'clamp(2.6rem, 5.2vw, 4.5rem)',
              fontWeight: 800,
              lineHeight: 1.04,
              color: L.text,
              margin: '0 0 24px',
              letterSpacing: '-0.025em',
              textTransform: 'uppercase',
              textShadow: '0 1px 16px rgba(235, 232, 227, 0.85)',
            }}
          >
            Know what<br />your codebase<br />needs next.
          </motion.h1>

          {/* Supporting paragraph */}
          <motion.p
            variants={reduced ? {} : itemV}
            style={{
              fontSize: 16.5,
              lineHeight: 1.7,
              color: L.textSub,
              maxWidth: 460,
              margin: '0 0 36px',
              textShadow: '0 1px 12px rgba(235, 232, 227, 0.9)',
            }}
          >
            CodeHealth AI scans your JavaScript and TypeScript repositories,
            turns static analysis into an explainable health report, and helps
            your team focus on the fixes that matter most.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={reduced ? {} : itemV}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 40 }}
          >
            <button
              id="hero-cta-github"
              onClick={login}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                background: L.btnPrimary,
                color: L.btnPrimaryText,
                border: 'none',
                cursor: 'pointer',
                fontSize: 14.5,
                fontWeight: 700,
                letterSpacing: '0.01em',
                padding: '14px 28px',
                borderRadius: 10,
                boxShadow: '0 4px 16px rgba(26, 23, 20, 0.14)',
                transition: 'opacity 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.opacity = '0.88';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <GithubIcon className="h-5 w-5" />
              Analyze a repository
            </button>

            <button
              id="hero-cta-how"
              onClick={() => scrollTo('how-it-works')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                background: 'rgba(235, 232, 227, 0.6)',
                backdropFilter: 'blur(8px)',
                color: L.text,
                border: `1.5px solid ${L.border}`,
                cursor: 'pointer',
                fontSize: 14.5,
                fontWeight: 600,
                letterSpacing: '0.01em',
                padding: '14px 28px',
                borderRadius: 10,
                transition: 'border-color 0.2s, background 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = L.borderHover;
                e.currentTarget.style.background = 'rgba(235, 232, 227, 0.9)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = L.border;
                e.currentTarget.style.background = 'rgba(235, 232, 227, 0.6)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              See how it works →
            </button>
          </motion.div>

          {/* Trust markers */}
          <motion.div
            variants={reduced ? {} : itemV}
            style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px' }}
          >
            {['GitHub-connected', 'JS / TS analysis', 'Deterministic scoring', 'Private repos'].map((t, i) => (
              <span
                key={t}
                style={{
                  fontSize: 12,
                  color: L.textMuted,
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                {i > 0 && (
                  <span
                    style={{
                      width: 3.5,
                      height: 3.5,
                      borderRadius: '50%',
                      background: L.textMuted,
                      display: 'inline-block',
                      opacity: 0.6,
                    }}
                  />
                )}
                {t}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* ── Scroll cue (Layer 2) ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.0, duration: 0.8 }}
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
            fontWeight: 600,
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
            background: 'rgba(235, 232, 227, 0.4)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <motion.div
            style={{ width: 3, height: 7, background: L.textMuted, borderRadius: 2 }}
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
