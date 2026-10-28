import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2,
  CheckCircle2,
  GitBranch,
  Lightbulb,
  FileSearch,
  Lock,
  Terminal,
  Activity,
  Check,
  RefreshCw,
} from 'lucide-react';
import GithubIcon from '../ui/GithubIcon';
import Reveal from './Reveal';

/* ── Section Design Tokens (Scoped strictly to HowItWorksSection) ── */
const L = {
  bg: '#141210',
  bgCard: '#1A1714',
  bgCardHover: '#211E1A',
  bgCardActive: '#26211C',
  bgSurface: '#110F0D',
  bgSurfaceSubtle: '#171411',
  text: '#F5F3EF',
  textSub: '#A8A198',
  textMuted: '#6E665D',
  border: 'rgba(245,243,239,0.08)',
  borderHover: 'rgba(245,243,239,0.18)',
  borderActive: 'rgba(76,158,106,0.45)',
  accent: '#4C9E6A',
  accentSoft: 'rgba(76,158,106,0.12)',
  accentGlow: 'rgba(76,158,106,0.22)',
  warning: '#DBA24A',
  warningSoft: 'rgba(219,162,74,0.12)',
  critical: '#E8705A',
  criticalSoft: 'rgba(232,112,90,0.12)',
  info: '#68A4C4',
  infoSoft: 'rgba(104,164,196,0.12)',
};

const stepsData = [
  {
    num: '01',
    badge: 'AUTH & SECURITY',
    title: 'Connect GitHub',
    desc: 'Authorize read-only repository access. OAuth tokens are encrypted server-side; write permissions are never requested.',
    chips: ['OAuth 2.0', 'Read-only access', 'Server-side encryption'],
  },
  {
    num: '02',
    badge: 'REPO DISCOVERY',
    title: 'Select a repository',
    desc: 'Choose any public or private JavaScript or TypeScript repository you maintain with automatic branch resolution.',
    chips: ['JS & TS', 'Private repos', 'Branch selection'],
  },
  {
    num: '03',
    badge: 'ASYNC ENGINE',
    title: 'Run a health scan',
    desc: 'The analysis runs in the background, so you can keep moving while your report is prepared without browser slowdown.',
    chips: ['Asynchronous scan', 'Zero browser slowdown', 'Deterministic AST'],
  },
  {
    num: '04',
    badge: 'ACTION PLAN',
    title: 'Prioritize fixes',
    desc: 'Review a 0–100 health score with AI explanations reserved strictly for high-impact bottlenecks.',
    chips: ['Deterministic scoring', 'Impact prioritization', '0–100 score'],
  },
];

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedRepo, setSelectedRepo] = useState('codehealth-demo');
  const [selectedIssue, setSelectedIssue] = useState(0);
  const [scanTicker, setScanTicker] = useState(0);
  const [isRescanning, setIsRescanning] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [scanProgress, setScanProgress] = useState(68);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Synchronize scan progress meter percentage and bar in real-time
  useEffect(() => {
    if (reducedMotion) {
      return;
    }
    const period = 5500;
    const initialPhase = Math.asin((68 - 52) / 34);
    const startTime = Date.now();

    const interval = setInterval(() => {
      if (isRescanning) {
        setScanProgress(18);
        return;
      }
      const elapsed = Date.now() - startTime;
      const normalized = (Math.sin((elapsed / period) * Math.PI * 2 + initialPhase) + 1) / 2;
      const val = Math.round(18 + normalized * (86 - 18));
      setScanProgress(val);
    }, 60);

    return () => clearInterval(interval);
  }, [reducedMotion, isRescanning]);

  // Cycle scan telemetry tickers every 3.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setScanTicker(prev => (prev + 1) % 3);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const scanTickerMessages = [
    'Parsing AST & cyclomatic complexity...',
    'Checking duplicate logic blocks...',
    'Evaluating dependency vulnerability graph...',
  ];

  const handleSimulateRescan = (e) => {
    e.stopPropagation();
    setActiveStep(2);
    setIsRescanning(true);
    setTimeout(() => {
      setIsRescanning(false);
    }, 1200);
  };

  return (
    <section
      id="how-it-works"
      style={{
        background: L.bg,
        padding: '104px 0',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid rgba(245,243,239,0.07)',
        borderBottom: '1px solid rgba(245,243,239,0.07)',
        scrollMarginTop: 80,
      }}
    >
      {/* Ambient background glow & technical dot matrix */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 1200,
          height: 420,
          background: 'radial-gradient(ellipse 65% 55% at 50% 0%, rgba(76,158,106,0.12), transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(245,243,239,0.035) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
          opacity: 0.6,
          zIndex: 0,
        }}
      />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>

        {/* Section Header */}
        <Reveal>
          <div style={{ marginBottom: 52, maxWidth: 680 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 12px',
                borderRadius: 9999,
                background: L.accentSoft,
                border: `1px solid ${L.accent}35`,
                marginBottom: 20,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: L.accent,
                  boxShadow: `0 0 8px ${L.accent}`,
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: L.accent,
                }}
              >
                The Four-Step Workflow
              </span>
            </div>

            <h2
              style={{
                fontSize: 'clamp(2.2rem, 4.2vw, 3.5rem)',
                fontWeight: 800,
                color: L.text,
                lineHeight: 1.05,
                letterSpacing: '-0.025em',
                textTransform: 'uppercase',
                margin: '0 0 16px',
              }}
            >
              From repository<br />to clear next steps.
            </h2>

            <p style={{ fontSize: 16.5, color: L.textSub, lineHeight: 1.65, margin: 0 }}>
              Connect your repository and get an actionable health assessment without disrupting your workflow.
            </p>
          </div>
        </Reveal>

        {/* Workflow Progression Track Indicator (Desktop) */}
        <div
          className="hidden lg:grid"
          style={{
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
            marginBottom: 26,
            padding: '0 4px',
          }}
          aria-hidden="true"
        >
          {stepsData.map((step, idx) => {
            const isCompleted = activeStep > idx;
            const isCurrent = activeStep === idx;
            return (
              <div
                key={step.num}
                onClick={() => setActiveStep(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  opacity: isCurrent ? 1 : 0.65,
                  transition: 'opacity 0.2s',
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'monospace',
                    fontSize: 10.5,
                    fontWeight: 700,
                    background: isCurrent ? L.accent : isCompleted ? L.accentSoft : 'transparent',
                    border: `1px solid ${isCurrent || isCompleted ? L.accent : L.border}`,
                    color: isCurrent ? '#0E0C0A' : isCompleted ? L.accent : L.textMuted,
                    transition: 'all 0.2s',
                  }}
                >
                  {isCompleted ? <Check size={11} strokeWidth={3} /> : step.num}
                </div>
                <div style={{ flex: 1, height: 2, background: isCompleted ? L.accent : isCurrent ? L.accentGlow : L.border, borderRadius: 1 }} />
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    color: isCurrent ? L.accent : L.textMuted,
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    fontWeight: isCurrent ? 700 : 500,
                  }}
                >
                  {step.badge}
                </span>
              </div>
            );
          })}
        </div>

        {/* Step Cards Grid */}
        <div
          role="tablist"
          aria-label="Workflow Steps"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 18,
          }}
        >
          {stepsData.map((step, idx) => {
            const isCurrent = activeStep === idx;

            return (
              <Reveal key={step.num} delay={idx * 0.08} style={{ height: '100%' }}>
                <motion.div
                  role="tab"
                  tabIndex={0}
                  aria-selected={isCurrent}
                  aria-controls={`step-panel-${idx}`}
                  id={`step-tab-${idx}`}
                  onClick={() => setActiveStep(idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveStep(idx);
                    }
                  }}
                  animate={reducedMotion ? {} : {
                    y: [0, -8, 0],
                  }}
                  transition={{
                    y: {
                      duration: 4.8 + (idx % 2) * 0.6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: idx * 0.75,
                    },
                  }}
                  whileHover={reducedMotion ? {} : {
                    y: -14,
                    transition: { duration: 0.22, ease: 'easeOut' },
                  }}
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '24px 20px',
                    borderRadius: 16,
                    cursor: 'pointer',
                    background: isCurrent ? L.bgCardActive : L.bgCard,
                    border: `1.5px solid ${isCurrent ? L.borderActive : L.border}`,
                    boxShadow: isCurrent
                      ? `0 16px 36px -8px ${L.accentGlow}, 0 6px 20px rgba(0,0,0,0.5)`
                      : '0 8px 24px -4px rgba(0,0,0,0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) {
                      e.currentTarget.style.borderColor = L.borderHover;
                      e.currentTarget.style.background = L.bgCardHover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) {
                      e.currentTarget.style.borderColor = L.border;
                      e.currentTarget.style.background = L.bgCard;
                    }
                  }}
                >
                  {/* Glowing active indicator bar on top edge */}
                  {isCurrent && (
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: `linear-gradient(90deg, ${L.accent}, #68A4C4)`,
                      }}
                    />
                  )}

                  {/* Top: Header with Step Number + Icon */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'monospace',
                            fontSize: 12,
                            fontWeight: 700,
                            background: isCurrent ? L.accentSoft : 'rgba(245,243,239,0.04)',
                            border: `1px solid ${isCurrent ? L.borderActive : L.border}`,
                            color: isCurrent ? L.accent : L.textMuted,
                            transition: 'all 0.2s',
                          }}
                        >
                          {step.num}
                        </span>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: 9.5,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: isCurrent ? L.accent : L.textMuted,
                            fontWeight: 600,
                          }}
                        >
                          {step.badge}
                        </span>
                      </div>

                      {/* Icon badge with strictly constrained dimensions to prevent distortion */}
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isCurrent ? L.accentSoft : 'rgba(245,243,239,0.03)',
                          border: `1px solid ${isCurrent ? L.borderActive : L.border}`,
                          color: isCurrent ? L.accent : L.textMuted,
                          flexShrink: 0,
                        }}
                      >
                        {idx === 0 && <GithubIcon className="w-4 h-4" style={{ width: 16, height: 16, color: 'inherit' }} />}
                        {idx === 1 && <FileSearch size={16} style={{ color: 'inherit' }} />}
                        {idx === 2 && <Activity size={16} style={{ color: 'inherit' }} />}
                        {idx === 3 && <Lightbulb size={16} style={{ color: 'inherit' }} />}
                      </div>
                    </div>

                    {/* Step Title & Description */}
                    <h3
                      style={{
                        fontSize: 17,
                        fontWeight: 700,
                        color: L.text,
                        margin: '0 0 8px',
                        letterSpacing: '-0.015em',
                      }}
                    >
                      {step.title}
                    </h3>
                    <p
                      style={{
                        fontSize: 13,
                        color: L.textSub,
                        lineHeight: 1.6,
                        margin: '0 0 18px',
                        minHeight: 58,
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>

                  {/* Micro Visual Interactive Demonstration */}
                  <div
                    id={`step-panel-${idx}`}
                    style={{
                      background: L.bgSurface,
                      border: `1px solid ${isCurrent ? 'rgba(76,158,106,0.30)' : L.border}`,
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 16,
                      minHeight: 168,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
                      transition: 'border-color 0.25s',
                    }}
                  >
                    {/* Step 1 Visual: GitHub Connection & OAuth Security */}
                    {idx === 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            background: L.bgSurfaceSubtle,
                            border: `1px solid ${L.border}`,
                            borderRadius: 8,
                            padding: '8px 12px',
                          }}
                        >
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 6,
                              background: '#24292e',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <GithubIcon className="w-4 h-4" style={{ width: 15, height: 15, color: '#F5F3EF' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: L.text, display: 'flex', alignItems: 'center', gap: 5 }}>
                              <span>Connected</span>
                              <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: L.accentSoft, color: L.accent, fontFamily: 'monospace' }}>Verified</span>
                            </div>
                            <div style={{ fontSize: 10.5, fontFamily: 'monospace', color: L.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              @developer-repo
                            </div>
                          </div>
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: L.accent,
                              boxShadow: `0 0 6px ${L.accent}`,
                              flexShrink: 0,
                            }}
                          />
                        </div>

                        {/* Scopes Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '5px 8px',
                              borderRadius: 6,
                              border: `1px solid ${L.borderActive}`,
                              fontSize: 9.5,
                              fontFamily: 'monospace',
                              color: L.accent,
                              background: L.accentSoft,
                            }}
                          >
                            <Check size={11} />
                            <span>read:repo</span>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '5px 8px',
                              borderRadius: 6,
                              border: `1px solid ${L.border}`,
                              fontSize: 9.5,
                              fontFamily: 'monospace',
                              color: L.textSub,
                              background: L.bgSurfaceSubtle,
                            }}
                          >
                            <Check size={11} />
                            <span>read:user</span>
                          </div>
                        </div>

                        {/* Security reassurance banner */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '4px 8px',
                            borderRadius: 6,
                            background: 'rgba(245,243,239,0.03)',
                            border: `1px solid ${L.border}`,
                            fontSize: 9.5,
                            fontFamily: 'monospace',
                            color: L.textMuted,
                          }}
                        >
                          <Lock size={10} style={{ color: L.accent, flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            Zero write permissions requested
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Step 2 Visual: Interactive Repository Selector */}
                    {idx === 1 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div
                          style={{
                            fontSize: 9.5,
                            fontFamily: 'monospace',
                            color: L.textMuted,
                            paddingBottom: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>Target repositories:</span>
                          <span style={{ color: L.accent }}>3 branches</span>
                        </div>
                        {[
                          { name: 'codehealth-demo', lang: 'TS', branch: 'main' },
                          { name: 'my-api-server', lang: 'JS', branch: 'main' },
                          { name: 'frontend-app', lang: 'TS', branch: 'dev' },
                        ].map((r) => {
                          const isRepoSelected = selectedRepo === r.name;
                          return (
                            <div
                              key={r.name}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveStep(1);
                                setSelectedRepo(r.name);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 7,
                                padding: '6px 9px',
                                borderRadius: 6,
                                border: `1px solid ${isRepoSelected ? L.borderActive : L.border}`,
                                background: isRepoSelected ? L.accentSoft : L.bgSurfaceSubtle,
                                fontSize: 10.5,
                                fontFamily: 'monospace',
                                color: isRepoSelected ? L.accent : L.textSub,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <GitBranch size={11} style={{ flexShrink: 0, opacity: isRepoSelected ? 1 : 0.6 }} />
                              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isRepoSelected ? 600 : 400 }}>
                                {r.name}
                              </span>
                              <span
                                style={{
                                  fontSize: 8.5,
                                  padding: '1px 4px',
                                  borderRadius: 3,
                                  background: isRepoSelected ? 'rgba(76,158,106,0.25)' : 'rgba(245,243,239,0.06)',
                                  color: isRepoSelected ? L.accent : L.textMuted,
                                }}
                              >
                                {r.branch}
                              </span>
                              {isRepoSelected && <CheckCircle2 size={12} style={{ color: L.accent, flexShrink: 0 }} />}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Step 3 Visual: Scan Telemetry Progress */}
                    {idx === 2 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {/* Status bar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: L.text }}>
                            <Loader2 size={12} className={isRescanning ? 'animate-spin text-amber-400' : 'animate-spin'} style={{ color: isRescanning ? L.warning : L.accent }} />
                            {isRescanning ? 'Re-analyzing…' : 'Analyzing…'}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontFamily: 'monospace', fontSize: 11, color: L.accent, fontWeight: 700, minWidth: 28, textAlign: 'right' }}>
                              {scanProgress}%
                            </span>
                            <button
                              onClick={handleSimulateRescan}
                              title="Simulate scan rerun"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 2,
                                color: L.textMuted,
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <RefreshCw size={10} />
                            </button>
                          </div>
                        </div>

                        {/* Animated progress track synchronized with percentage */}
                        <div style={{ height: 5, background: 'rgba(245,243,239,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${scanProgress}%`,
                              background: `linear-gradient(90deg, ${L.accent}, #68A4C4)`,
                              borderRadius: 3,
                              transition: 'width 0.08s linear',
                            }}
                          />
                        </div>

                        {/* Metric Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                          {[
                            { label: 'Files', val: '86' },
                            { label: 'AST Parsed', val: '58' },
                            { label: 'Hotspots', val: '3' },
                            { label: 'Queue', val: '0ms' },
                          ].map((item) => (
                            <div
                              key={item.label}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '4px 7px',
                                background: L.bgSurfaceSubtle,
                                border: `1px solid ${L.border}`,
                                borderRadius: 5,
                                fontSize: 9.5,
                                fontFamily: 'monospace',
                              }}
                            >
                              <span style={{ color: L.textMuted }}>{item.label}</span>
                              <span style={{ color: L.text, fontWeight: 600 }}>{item.val}</span>
                            </div>
                          ))}
                        </div>

                        {/* Dynamic terminal log line */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            fontSize: 9,
                            fontFamily: 'monospace',
                            color: L.textMuted,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Terminal size={9} style={{ color: L.accent, flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {scanTickerMessages[scanTicker]}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Step 4 Visual: Health Score & Prioritized Issues */}
                    {idx === 3 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                        {/* Score Header */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingBottom: 4,
                            borderBottom: `1px solid ${L.border}`,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 10, color: L.textMuted, fontFamily: 'monospace' }}>Health Score</span>
                            <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: L.accentSoft, color: L.accent, fontFamily: 'monospace' }}>
                              Good
                            </span>
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 800, color: L.accent, fontFamily: 'monospace' }}>
                            78 <span style={{ fontSize: 10, color: L.textMuted, fontWeight: 400 }}>/ 100</span>
                          </span>
                        </div>

                        {/* Ranked Issues */}
                        {[
                          { label: 'Simplify auth flow', priority: 'high', color: L.critical, tag: 'CC: 24' },
                          { label: 'Consolidate validators', priority: 'medium', color: L.warning, tag: '18 lines' },
                          { label: 'Remove unused export', priority: 'low', color: L.info, tag: 'Dead code' },
                        ].map((r, itemIdx) => {
                          const isIssueSelected = selectedIssue === itemIdx;
                          return (
                            <div
                              key={r.label}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveStep(3);
                                setSelectedIssue(itemIdx);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 6,
                                padding: '5px 8px',
                                background: isIssueSelected ? 'rgba(245,243,239,0.05)' : L.bgSurfaceSubtle,
                                border: `1px solid ${isIssueSelected ? `${r.color}50` : L.border}`,
                                borderRadius: 6,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
                                <CheckCircle2 size={11} style={{ color: r.color, flexShrink: 0 }} />
                                <span style={{ fontSize: 10, fontWeight: 600, color: L.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {r.label}
                                </span>
                              </div>
                              <span
                                style={{
                                  fontSize: 8.5,
                                  fontFamily: 'monospace',
                                  color: r.color,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em',
                                  background: `${r.color}15`,
                                  padding: '1px 4px',
                                  borderRadius: 3,
                                  flexShrink: 0,
                                }}
                              >
                                {r.priority}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Technical Chips */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 5,
                      paddingTop: 12,
                      borderTop: `1px solid ${L.border}`,
                    }}
                  >
                    {step.chips.map((chip) => (
                      <span
                        key={chip}
                        style={{
                          fontSize: 9.5,
                          fontFamily: 'monospace',
                          color: isCurrent ? L.textSub : L.textMuted,
                          background: 'rgba(245,243,239,0.03)',
                          border: `1px solid ${isCurrent ? 'rgba(76,158,106,0.20)' : L.border}`,
                          padding: '3px 7px',
                          borderRadius: 4,
                          letterSpacing: '0.02em',
                        }}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
