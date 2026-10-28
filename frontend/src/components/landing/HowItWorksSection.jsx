import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  CheckCircle2,
  GitBranch,
  FileSearch,
  Lock,
  Terminal,
  Check,
  RefreshCw,
  Shield,
  Cpu,
  Zap,
} from 'lucide-react';
import GithubIcon from '../ui/GithubIcon';
import Reveal from './Reveal';

/* ─────────────────────────────────────────────────────────────────────────────
   Design Tokens — strictly scoped to HowItWorksSection
───────────────────────────────────────────────────────────────────────────── */
const L = {
  bg: '#0E0C0A',
  bgCard: '#161311',
  bgCardActive: '#1D1A16',
  bgSurface: '#0B0906',
  bgSurfaceSubtle: '#111009',
  text: '#F5F3EF',
  textSub: '#B0A89F',
  textMuted: '#6B6259',
  border: 'rgba(245,243,239,0.07)',
  borderHover: 'rgba(245,243,239,0.14)',
  borderActive: 'rgba(76,158,106,0.50)',
  accent: '#4C9E6A',
  accentBright: '#5BB87C',
  accentSoft: 'rgba(76,158,106,0.10)',
  accentGlow: 'rgba(76,158,106,0.20)',
  accentGlowStrong: 'rgba(76,158,106,0.35)',
  warning: '#DBA24A',
  warningSoft: 'rgba(219,162,74,0.12)',
  critical: '#E06B55',
  criticalSoft: 'rgba(224,107,85,0.12)',
  info: '#5B9DC2',
  infoSoft: 'rgba(91,157,194,0.12)',
};

const stepsData = [
  {
    num: '01',
    badge: 'AUTH & SECURITY',
    icon: Shield,
    title: 'Connect GitHub',
    desc: 'Authorize read-only repository access. OAuth tokens are encrypted server-side; write permissions are never requested.',
    chips: ['OAuth 2.0', 'Read-only access', 'Server-side encryption'],
    gradientFrom: '#4C9E6A',
    gradientTo: '#3E8A5C',
  },
  {
    num: '02',
    badge: 'REPO DISCOVERY',
    icon: FileSearch,
    title: 'Select a repository',
    desc: 'Choose any public or private JavaScript or TypeScript repository you maintain with automatic branch resolution.',
    chips: ['JS & TS', 'Private repos', 'Branch selection'],
    gradientFrom: '#5B9DC2',
    gradientTo: '#4A7FA0',
  },
  {
    num: '03',
    badge: 'ASYNC ENGINE',
    icon: Cpu,
    title: 'Run a health scan',
    desc: 'The analysis runs in the background, so you can keep moving while your report is prepared without browser slowdown.',
    chips: ['Asynchronous scan', 'Zero browser slowdown', 'Deterministic AST'],
    gradientFrom: '#DBA24A',
    gradientTo: '#C08A34',
  },
  {
    num: '04',
    badge: 'ACTION PLAN',
    icon: Zap,
    title: 'Prioritize fixes',
    desc: 'Review a 0–100 health score with AI explanations reserved strictly for high-impact bottlenecks.',
    chips: ['Deterministic scoring', 'Impact prioritization', '0–100 score'],
    gradientFrom: '#A074D4',
    gradientTo: '#8A5CB8',
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Micro-visual sub-components
───────────────────────────────────────────────────────────────────────────── */
function Step1Visual() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(36,41,46,0.7)',
          border: `1px solid ${L.borderActive}`,
          borderRadius: 10,
          padding: '9px 12px',
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: '#24292e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <GithubIcon style={{ width: 16, height: 16, color: '#F5F3EF' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: L.text, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span>Connected</span>
            <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: L.accentSoft, color: L.accent, fontFamily: 'monospace', letterSpacing: '0.06em', border: `1px solid ${L.accent}30` }}>✓ Verified</span>
          </div>
          <div style={{ fontSize: 10.5, fontFamily: 'monospace', color: L.textMuted }}>@your-github-account</div>
        </div>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: L.accent, boxShadow: `0 0 10px ${L.accent}`, flexShrink: 0 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {[
          { scope: 'read:repo', granted: true },
          { scope: 'read:user', granted: true },
          { scope: 'write:repo', granted: false },
          { scope: 'admin', granted: false },
        ].map((s) => (
          <div
            key={s.scope}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 9px',
              borderRadius: 7,
              border: `1px solid ${s.granted ? L.borderActive : 'rgba(224,107,85,0.25)'}`,
              background: s.granted ? L.accentSoft : 'rgba(224,107,85,0.06)',
              fontSize: 9.5,
              fontFamily: 'monospace',
              color: s.granted ? L.accent : L.critical,
            }}
          >
            {s.granted ? <Check size={10} strokeWidth={3} /> : <span style={{ fontSize: 10, lineHeight: 1 }}>✕</span>}
            <span>{s.scope}</span>
          </div>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px',
          borderRadius: 7,
          background: 'rgba(245,243,239,0.025)',
          border: `1px solid ${L.border}`,
          fontSize: 9.5,
          fontFamily: 'monospace',
          color: L.textMuted,
        }}
      >
        <Lock size={10} style={{ color: L.accent, flexShrink: 0 }} />
        <span>Zero write permissions — ever</span>
      </div>
    </div>
  );
}

function Step2Visual({ selectedRepo, setSelectedRepo }) {
  const repos = [
    { name: 'codehealth-demo', lang: 'TS', branch: 'main' },
    { name: 'my-api-server', lang: 'JS', branch: 'main' },
    { name: 'frontend-app', lang: 'TS', branch: 'dev' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, fontFamily: 'monospace', color: L.textMuted, marginBottom: 3 }}>
        <span>Your repositories</span>
        <span style={{ color: L.info }}>3 found</span>
      </div>
      {repos.map((r) => {
        const sel = selectedRepo === r.name;
        return (
          <div
            key={r.name}
            onClick={(e) => { e.stopPropagation(); setSelectedRepo(r.name); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 10px',
              borderRadius: 8,
              border: `1px solid ${sel ? L.borderActive : L.border}`,
              background: sel ? L.accentSoft : L.bgSurfaceSubtle,
              fontSize: 11,
              fontFamily: 'monospace',
              color: sel ? L.accent : L.textSub,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <GitBranch size={11} style={{ flexShrink: 0, opacity: sel ? 1 : 0.55 }} />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: sel ? 700 : 400 }}>
              {r.name}
            </span>
            <span style={{ fontSize: 8.5, padding: '1px 5px', borderRadius: 4, background: r.lang === 'TS' ? 'rgba(91,157,194,0.15)' : 'rgba(219,162,74,0.12)', color: r.lang === 'TS' ? L.info : L.warning }}>
              {r.lang}
            </span>
            <span style={{ fontSize: 8.5, color: sel ? L.accent : L.textMuted, padding: '1px 5px', borderRadius: 4, background: sel ? 'rgba(76,158,106,0.15)' : 'rgba(245,243,239,0.04)' }}>
              {r.branch}
            </span>
            {sel && <CheckCircle2 size={12} style={{ color: L.accent, flexShrink: 0 }} />}
          </div>
        );
      })}
    </div>
  );
}

function Step3Visual({ scanProgress, isRescanning, scanTicker, handleSimulateRescan }) {
  const msgs = [
    'Parsing AST & cyclomatic complexity…',
    'Checking duplicate logic blocks…',
    'Evaluating dependency vulnerability graph…',
  ];
  const metrics = [
    { label: 'Files', val: '86', color: L.text },
    { label: 'AST Parsed', val: '58', color: L.accent },
    { label: 'Hotspots', val: '3', color: L.warning },
    { label: 'Queue', val: '0ms', color: L.info },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Loader2 size={13} className="animate-spin" style={{ color: isRescanning ? L.warning : L.accent }} />
          <span style={{ fontSize: 11.5, fontWeight: 700, color: L.text, letterSpacing: '-0.01em' }}>
            {isRescanning ? 'Re-analyzing…' : 'Analyzing…'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 12.5, color: L.accent, fontWeight: 800, minWidth: 32, textAlign: 'right' }}>
            {scanProgress}%
          </span>
          <button
            onClick={handleSimulateRescan}
            title="Simulate scan rerun"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 3, color: L.textMuted, display: 'flex', alignItems: 'center', borderRadius: 4 }}
          >
            <RefreshCw size={10} />
          </button>
        </div>
      </div>
      <div style={{ height: 6, background: 'rgba(245,243,239,0.05)', borderRadius: 99, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${scanProgress}%`,
            background: `linear-gradient(90deg, ${L.accent}, #68A4C4)`,
            borderRadius: 99,
            transition: 'width 0.08s linear',
            boxShadow: `0 0 8px ${L.accent}60`,
          }}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
        {metrics.map((m) => (
          <div
            key={m.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '5px 8px',
              background: L.bgSurfaceSubtle,
              border: `1px solid ${L.border}`,
              borderRadius: 7,
              fontSize: 9.5,
              fontFamily: 'monospace',
            }}
          >
            <span style={{ color: L.textMuted }}>{m.label}</span>
            <span style={{ color: m.color, fontWeight: 700 }}>{m.val}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, fontFamily: 'monospace', color: L.textMuted, overflow: 'hidden' }}>
        <Terminal size={9} style={{ color: L.accent, flexShrink: 0 }} />
        <AnimatePresence mode="wait">
          <motion.span
            key={scanTicker}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {msgs[scanTicker]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Step4Visual({ selectedIssue, setSelectedIssue }) {
  const issues = [
    { label: 'Simplify auth flow', color: L.critical, tag: 'HIGH', metric: 'CC: 24', bg: L.criticalSoft },
    { label: 'Consolidate validators', color: L.warning, tag: 'MEDIUM', metric: '18 lines', bg: L.warningSoft },
    { label: 'Remove unused export', color: L.info, tag: 'LOW', metric: 'Dead code', bg: L.infoSoft },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 11px',
          background: L.accentSoft,
          border: `1px solid ${L.borderActive}`,
          borderRadius: 10,
          marginBottom: 2,
        }}
      >
        <div>
          <div style={{ fontSize: 9.5, fontFamily: 'monospace', color: L.textMuted, marginBottom: 1 }}>HEALTH SCORE</div>
          <div style={{ fontSize: 9, color: L.accent, fontFamily: 'monospace' }}>↑ 4 pts since last scan</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: L.accent, fontFamily: 'monospace', lineHeight: 1 }}>78</div>
          <div style={{ fontSize: 9, color: L.textMuted, fontFamily: 'monospace' }}>/ 100 · Good</div>
        </div>
      </div>
      {issues.map((r, i) => {
        const sel = selectedIssue === i;
        return (
          <div
            key={r.label}
            onClick={(e) => { e.stopPropagation(); setSelectedIssue(i); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 7,
              padding: '6px 9px',
              background: sel ? r.bg : L.bgSurfaceSubtle,
              border: `1px solid ${sel ? `${r.color}45` : L.border}`,
              borderRadius: 7,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0, flex: 1 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
              <span style={{ fontSize: 10.5, fontWeight: sel ? 700 : 500, color: sel ? L.text : L.textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {r.label}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
              <span style={{ fontSize: 8.5, fontFamily: 'monospace', color: L.textMuted }}>{r.metric}</span>
              <span style={{ fontSize: 8.5, fontFamily: 'monospace', color: r.color, background: `${r.color}18`, padding: '1px 5px', borderRadius: 3, letterSpacing: '0.05em' }}>
                {r.tag}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main Section Component
───────────────────────────────────────────────────────────────────────────── */
export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedRepo, setSelectedRepo] = useState('codehealth-demo');
  const [selectedIssue, setSelectedIssue] = useState(0);
  const [scanTicker, setScanTicker] = useState(0);
  const [isRescanning, setIsRescanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(52);
  const [reducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (reducedMotion) return;
    const period = 5500;
    const startTime = Date.now();
    const id = setInterval(() => {
      if (isRescanning) { setScanProgress(18); return; }
      const elapsed = Date.now() - startTime;
      const normalized = (Math.sin((elapsed / period) * Math.PI * 2) + 1) / 2;
      setScanProgress(Math.round(18 + normalized * 68));
    }, 60);
    return () => clearInterval(id);
  }, [reducedMotion, isRescanning]);

  useEffect(() => {
    const id = setInterval(() => setScanTicker((p) => (p + 1) % 3), 3500);
    return () => clearInterval(id);
  }, []);

  const handleSimulateRescan = (e) => {
    e.stopPropagation();
    setActiveStep(2);
    setIsRescanning(true);
    setTimeout(() => setIsRescanning(false), 1200);
  };

  const floatConfigs = [
    { duration: 5.2, delay: 0 },
    { duration: 6.0, delay: 0.9 },
    { duration: 4.8, delay: 1.7 },
    { duration: 5.6, delay: 2.4 },
  ];

  return (
    <section
      id="how-it-works"
      style={{
        background: L.bg,
        padding: '112px 0 96px',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid rgba(245,243,239,0.06)',
        borderBottom: '1px solid rgba(245,243,239,0.06)',
        scrollMarginTop: 80,
      }}
    >
      {/* Ambient radial glow */}
      <div aria-hidden="true" style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 900, height: 600, background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(76,158,106,0.16) 0%, rgba(76,158,106,0.04) 50%, transparent 75%)', pointerEvents: 'none', zIndex: 0 }} />
      <div aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: 0, width: 400, height: 400, background: 'radial-gradient(ellipse 60% 60% at 0% 100%, rgba(91,157,194,0.09), transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div aria-hidden="true" style={{ position: 'absolute', bottom: 0, right: 0, width: 400, height: 400, background: 'radial-gradient(ellipse 60% 60% at 100% 100%, rgba(160,116,212,0.07), transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(245,243,239,0.028) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 28px', position: 'relative', zIndex: 1 }}>

        {/* Section Header */}
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 9999, background: L.accentSoft, border: '1px solid rgba(76,158,106,0.25)', marginBottom: 22 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: L.accent, boxShadow: `0 0 10px ${L.accent}`, display: 'inline-block' }} />
              <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: L.accent }}>
                Four-Step Workflow
              </span>
            </div>
            <h2
              style={{
                fontSize: 'clamp(2.4rem, 4.5vw, 3.75rem)',
                fontWeight: 900,
                color: L.text,
                lineHeight: 1.04,
                letterSpacing: '-0.03em',
                margin: '0 0 18px',
              }}
            >
              From repository
              <span style={{ display: 'block', background: `linear-gradient(135deg, ${L.accentBright} 0%, #68A4C4 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                to clear next steps.
              </span>
            </h2>
            <p style={{ fontSize: 17, color: L.textSub, lineHeight: 1.65, margin: '0 auto', maxWidth: 560 }}>
              Connect your repository and get an actionable health assessment without disrupting your workflow.
            </p>
          </div>
        </Reveal>

        {/* Step Navigation Track (Desktop) */}
        <div
          className="hidden lg:flex"
          style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 40, gap: 0 }}
          aria-hidden="true"
        >
          {stepsData.map((step, idx) => {
            const isCompleted = activeStep > idx;
            const isCurrent = activeStep === idx;
            return (
              <div key={step.num} style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  onClick={() => setActiveStep(idx)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, background: 'transparent', border: 'none', cursor: 'pointer', padding: '0 4px' }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isCurrent
                        ? `linear-gradient(135deg, ${step.gradientFrom}, ${step.gradientTo})`
                        : isCompleted ? L.accentSoft : 'rgba(245,243,239,0.04)',
                      border: `2px solid ${isCurrent ? step.gradientFrom : isCompleted ? L.accent : L.border}`,
                      boxShadow: isCurrent ? `0 0 20px ${step.gradientFrom}50` : 'none',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {isCompleted ? (
                      <Check size={14} strokeWidth={3} style={{ color: L.accent }} />
                    ) : (
                      <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 800, color: isCurrent ? '#fff' : L.textMuted }}>
                        {step.num}
                      </span>
                    )}
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: isCurrent ? step.gradientFrom : L.textMuted, whiteSpace: 'nowrap', transition: 'color 0.3s' }}>
                    {step.badge}
                  </span>
                </button>
                {idx < stepsData.length - 1 && (
                  <div style={{ width: 88, height: 2, margin: '0 4px', marginBottom: 24, borderRadius: 1, background: activeStep > idx ? `linear-gradient(90deg, ${step.gradientFrom}, ${stepsData[idx + 1].gradientFrom})` : L.border, transition: 'background 0.4s ease', position: 'relative', overflow: 'hidden' }}>
                    {activeStep === idx && (
                      <motion.div
                        style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, transparent, ${step.gradientFrom}80, transparent)` }}
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Step Cards Grid */}
        <div
          role="tablist"
          aria-label="Workflow steps"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 20, alignItems: 'stretch' }}
        >
          {stepsData.map((step, idx) => {
            const isCurrent = activeStep === idx;
            const fc = floatConfigs[idx];
            const Icon = step.icon;
            return (
              <Reveal key={step.num} delay={idx * 0.07} style={{ height: '100%' }}>
                <motion.div
                  role="tab"
                  tabIndex={0}
                  aria-selected={isCurrent}
                  aria-controls={`step-panel-${idx}`}
                  id={`step-tab-${idx}`}
                  onClick={() => setActiveStep(idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveStep(idx); }
                  }}
                  animate={reducedMotion ? {} : { y: [0, -9, 0] }}
                  transition={{ y: { duration: fc.duration, repeat: Infinity, ease: 'easeInOut', delay: fc.delay } }}
                  whileHover={reducedMotion ? {} : { y: -16, transition: { duration: 0.2, ease: 'easeOut' } }}
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '22px 20px 18px',
                    borderRadius: 18,
                    cursor: 'pointer',
                    background: isCurrent ? `linear-gradient(160deg, ${L.bgCardActive} 0%, rgba(76,158,106,0.04) 100%)` : L.bgCard,
                    border: `1.5px solid ${isCurrent ? L.borderActive : L.border}`,
                    boxShadow: isCurrent
                      ? `0 20px 48px -10px ${L.accentGlowStrong}, 0 8px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(76,158,106,0.12)`
                      : '0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(245,243,239,0.03)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s',
                  }}
                  onMouseEnter={(e) => { if (!isCurrent) { e.currentTarget.style.borderColor = L.borderHover; e.currentTarget.style.background = '#1A1714'; } }}
                  onMouseLeave={(e) => { if (!isCurrent) { e.currentTarget.style.borderColor = L.border; e.currentTarget.style.background = L.bgCard; } }}
                >
                  {isCurrent && (
                    <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${step.gradientFrom}, ${step.gradientTo})`, boxShadow: `0 0 12px ${step.gradientFrom}60`, borderRadius: '18px 18px 0 0' }} />
                  )}
                  {isCurrent && (
                    <div aria-hidden="true" style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, background: `radial-gradient(circle at 100% 0%, ${step.gradientFrom}12, transparent 70%)`, pointerEvents: 'none' }} />
                  )}

                  {/* Card header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: 13, fontWeight: 800, background: isCurrent ? `linear-gradient(135deg, ${step.gradientFrom}28, ${step.gradientTo}18)` : 'rgba(245,243,239,0.04)', border: `1.5px solid ${isCurrent ? `${step.gradientFrom}55` : L.border}`, color: isCurrent ? step.gradientFrom : L.textMuted, transition: 'all 0.25s' }}>
                        {step.num}
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: isCurrent ? step.gradientFrom : L.textMuted, fontWeight: 700 }}>
                        {step.badge}
                      </div>
                    </div>
                    <div style={{ width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isCurrent ? `linear-gradient(135deg, ${step.gradientFrom}22, ${step.gradientTo}14)` : 'rgba(245,243,239,0.03)', border: `1.5px solid ${isCurrent ? `${step.gradientFrom}45` : L.border}`, color: isCurrent ? step.gradientFrom : L.textMuted, flexShrink: 0, transition: 'all 0.25s' }}>
                      {idx === 0 ? <GithubIcon style={{ width: 16, height: 16, color: 'inherit' }} /> : <Icon size={16} style={{ color: 'inherit' }} />}
                    </div>
                  </div>

                  <h3 style={{ fontSize: 17.5, fontWeight: 800, color: L.text, margin: '0 0 7px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: 13, color: L.textSub, lineHeight: 1.65, margin: '0 0 18px', minHeight: 56 }}>
                    {step.desc}
                  </p>

                  {/* Micro-visual panel */}
                  <div
                    id={`step-panel-${idx}`}
                    style={{ flex: 1, background: L.bgSurface, border: `1px solid ${isCurrent ? `${step.gradientFrom}30` : L.border}`, borderRadius: 12, padding: '12px 13px', marginBottom: 16, boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.45)', transition: 'border-color 0.3s' }}
                  >
                    {idx === 0 && <Step1Visual />}
                    {idx === 1 && <Step2Visual selectedRepo={selectedRepo} setSelectedRepo={(r) => { setActiveStep(1); setSelectedRepo(r); }} />}
                    {idx === 2 && <Step3Visual scanProgress={scanProgress} isRescanning={isRescanning} scanTicker={scanTicker} handleSimulateRescan={handleSimulateRescan} />}
                    {idx === 3 && <Step4Visual selectedIssue={selectedIssue} setSelectedIssue={(i) => { setActiveStep(3); setSelectedIssue(i); }} />}
                  </div>

                  {/* Chips footer */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, paddingTop: 12, borderTop: `1px solid ${isCurrent ? `${step.gradientFrom}22` : L.border}`, marginTop: 'auto' }}>
                    {step.chips.map((chip) => (
                      <span key={chip} style={{ fontSize: 9.5, fontFamily: 'monospace', color: isCurrent ? L.textSub : L.textMuted, background: isCurrent ? `${step.gradientFrom}0F` : 'rgba(245,243,239,0.03)', border: `1px solid ${isCurrent ? `${step.gradientFrom}25` : L.border}`, padding: '3px 8px', borderRadius: 5, letterSpacing: '0.02em', transition: 'all 0.2s' }}>
                        {chip}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </div>

        {/* Architecture Note Strip */}
        <Reveal delay={0.35}>
          <div style={{ marginTop: 52, padding: '14px 24px', borderRadius: 14, background: 'rgba(245,243,239,0.025)', border: `1px solid ${L.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: L.accentSoft, border: '1px solid rgba(76,158,106,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Cpu size={14} style={{ color: L.accent }} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontFamily: 'monospace', color: L.accent, letterSpacing: '0.1em', fontWeight: 700, marginBottom: 2 }}>ARCHITECTURE NOTE</div>
                <p style={{ fontSize: 12.5, color: L.textSub, margin: 0, lineHeight: 1.5 }}>
                  Scans run in an isolated background worker — AST parse trees and dependency signals computed server-side, zero browser slowdown.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {['Async worker', 'No memory hit', 'Zero client compute'].map((tag) => (
                <span key={tag} style={{ fontSize: 10, fontFamily: 'monospace', color: L.textMuted, background: 'rgba(245,243,239,0.03)', border: `1px solid ${L.border}`, padding: '4px 10px', borderRadius: 6, whiteSpace: 'nowrap' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
