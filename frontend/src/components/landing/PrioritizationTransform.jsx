import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Filter,
  ListOrdered,
  ShieldAlert,
  Terminal,
  Zap,
  Clock,
  Flame,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import Reveal from './Reveal';

/* ─────────────────────────────────────────────────────────────────────────────
   Design Tokens
───────────────────────────────────────────────────────────────────────────── */
const L = {
  bg: '#EBE8E3',
  bgCard: '#F5F2EB',
  bgCardHover: '#FAF8F4',
  bgCardActive: '#FFFFFF',

  // Raw noise dark terminal
  bgTerminal: '#13110E',
  bgTerminalCard: '#1C1914',
  bgTerminalInner: '#100E0C',
  terminalBorder: 'rgba(255,255,255,0.08)',
  terminalBorderSubtle: 'rgba(255,255,255,0.04)',
  terminalText: '#F5F2EB',
  terminalTextSub: '#A49D92',
  terminalTextMuted: '#6E675D',

  // Section typography & borders
  text: '#171B18',
  textSub: '#58615A',
  textMuted: '#88938A',
  border: 'rgba(23,27,24,0.10)',
  borderLight: 'rgba(23,27,24,0.06)',
  borderActive: 'rgba(45,106,72,0.35)',

  // Signature accents
  accent: '#2D6A48',
  accentBright: '#3CA56B',
  accentSoft: 'rgba(45,106,72,0.10)',
  accentGlow: 'rgba(60,165,107,0.22)',

  warning: '#C27A23',
  warningBright: '#E09228',
  warningSoft: 'rgba(194,122,35,0.12)',

  critical: '#C43D2E',
  criticalBright: '#E05341',
  criticalSoft: 'rgba(196,61,46,0.12)',

  info: '#2574A9',
  infoBright: '#3A92CC',
  infoSoft: 'rgba(37,116,169,0.12)',

  ai: '#7A45BD',
  aiBright: '#9B5DE5',
  aiSoft: 'rgba(122,69,189,0.12)',
  aiGlow: 'rgba(155,93,229,0.25)',
};

const rawWarnings = [
  {
    file: 'src/auth/permissions.ts:42',
    rule: 'complexity/cyclomatic',
    text: 'Cyclomatic complexity exceeds threshold (CC: 24)',
    type: 'error',
    color: L.criticalBright,
    bg: L.criticalSoft,
  },
  {
    file: 'src/api/routes.ts:118',
    rule: 'sonar/duplicate-block',
    text: 'Duplicate block (18 lines match utils/validator.js)',
    type: 'warn',
    color: L.warningBright,
    bg: L.warningSoft,
  },
  {
    file: 'src/utils/format.ts:14',
    rule: 'unused/exports',
    text: 'Export formatCurrency is never imported in scanned files',
    type: 'info',
    color: L.infoBright,
    bg: L.infoSoft,
  },
  {
    file: 'package.json:28',
    rule: 'npm/security-signal',
    text: 'Outdated dependency: lodash@4.17.15 (minor update available)',
    type: 'warn',
    color: L.warningBright,
    bg: L.warningSoft,
  },
  {
    file: 'src/handlers/user.ts:89',
    rule: 'max-lines/function',
    text: 'Function length exceeds 60 lines',
    type: 'warn',
    color: L.warningBright,
    bg: L.warningSoft,
  },
  {
    file: 'src/services/billing.ts:15',
    rule: 'no-unused-vars',
    text: 'Unused parameter options in processCheckout',
    type: 'info',
    color: L.infoBright,
    bg: L.infoSoft,
  },
];

export default function PrioritizationTransform() {
  return (
    <section
      id="differentiator"
      style={{
        background: L.bg,
        padding: '104px 0 112px',
        borderTop: `1px solid ${L.border}`,
        borderBottom: `1px solid ${L.border}`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        
        {/* Section Header */}
        <Reveal>
          <div style={{ marginBottom: 52, maxWidth: 700 }}>
            {/* Top pill with pulsing radar beacon */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 20,
                background: 'rgba(45,106,72,0.08)',
                border: '1px solid rgba(45,106,72,0.22)',
                marginBottom: 16,
              }}
            >
              <Filter size={13} style={{ color: L.accent }} />
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: 11,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: L.accent,
                  fontWeight: 700,
                }}
              >
                The Core Differentiator
              </span>
            </div>

            {/* Main Title */}
            <h2
              style={{
                fontSize: 'clamp(2.2rem, 4.2vw, 3.6rem)',
                fontWeight: 800,
                color: L.text,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                margin: '0 0 16px',
              }}
            >
              Stop chasing warnings.<br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #171B18 0%, #2D6A48 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Fix what matters first.
              </span>
            </h2>

            {/* Subtitle */}
            <p style={{ fontSize: 16.5, color: L.textSub, lineHeight: 1.65, margin: '0 0 20px' }}>
              Traditional linters leave developers with an overwhelming dump of raw alerts.
              CodeHealth AI filters the noise, isolates true structural debt, and delivers a ranked
              3-step action plan with AI explanation for the #1 priority.
            </p>

            {/* Stat Pill Strip */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: '#E1DDD4',
                  border: '1px solid rgba(23,27,24,0.12)',
                  fontSize: 11.5,
                  fontFamily: 'monospace',
                  color: L.textSub,
                }}
              >
                <Flame size={14} style={{ color: L.criticalBright }} />
                <span>47 Raw Alerts Filtered</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 12px',
                  borderRadius: 8,
                  background: 'rgba(45,106,72,0.10)',
                  border: '1px solid rgba(45,106,72,0.25)',
                  fontSize: 11.5,
                  fontFamily: 'monospace',
                  color: L.accent,
                  fontWeight: 700,
                }}
              >
                <Zap size={14} style={{ color: L.accentBright }} />
                <span>94% Noise Eliminated · Top 3 Ranked Actions</span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Transformation Pipeline Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(330px, 1fr) auto minmax(380px, 1.25fr)',
            gap: 22,
            alignItems: 'stretch',
          }}
          className="transform-grid"
        >
          {/* ── Left State: The Raw Warning Noise Terminal ── */}
          <Reveal delay={0.08}>
            <div
              style={{
                background: L.bgTerminal,
                borderRadius: 18,
                border: '1.5px solid rgba(255,255,255,0.09)',
                boxShadow: '0 20px 48px -10px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Terminal Titlebar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  background: 'rgba(255,255,255,0.03)',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  fontSize: 11,
                  fontFamily: 'monospace',
                }}
              >
                {/* Traffic lights */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F56' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27C93F' }} />
                </div>

                {/* Command path */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: L.terminalTextSub }}>
                  <Terminal size={12} style={{ color: L.criticalBright }} />
                  <span>terminal://linter-dump.log</span>
                </div>

                <span
                  style={{
                    fontSize: 10,
                    fontFamily: 'monospace',
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: 'rgba(224,83,65,0.18)',
                    color: L.criticalBright,
                    border: '1px solid rgba(224,83,65,0.3)',
                    fontWeight: 700,
                  }}
                >
                  Unprioritized
                </span>
              </div>

              {/* Sub-header info */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  background: L.bgTerminalInner,
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  fontSize: 11,
                  fontFamily: 'monospace',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <ShieldAlert size={15} style={{ color: L.criticalBright }} />
                  <span style={{ fontWeight: 700, color: L.terminalText }}>Raw Tooling Output</span>
                </div>
                <span style={{ color: L.terminalTextMuted }}>47 warnings across 19 files</span>
              </div>

              {/* Warning List Stream */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 18px', flex: 1 }}>
                {rawWarnings.map((w, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: L.bgTerminalCard,
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 9,
                      padding: '10px 12px',
                      fontSize: 11,
                      fontFamily: 'monospace',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      transition: 'border-color 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: L.terminalTextSub, fontSize: 10.5, fontWeight: 600 }}>{w.file}</span>
                      </div>
                      <span
                        style={{
                          color: w.color,
                          background: w.bg,
                          border: `1px solid ${w.color}33`,
                          fontSize: 9,
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 4,
                          letterSpacing: '0.05em',
                        }}
                      >
                        {w.type}
                      </span>
                    </div>

                    <div style={{ color: L.terminalText, fontSize: 11, lineHeight: 1.45 }}>
                      {w.text}
                    </div>

                    <div style={{ fontSize: 9.5, color: L.terminalTextMuted }}>
                      Rule: {w.rule}
                    </div>
                  </div>
                ))}
              </div>

              {/* Overflow Fatigue Bar */}
              <div
                style={{
                  margin: '0 18px 18px',
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'rgba(224,83,65,0.08)',
                  border: '1px dashed rgba(224,83,65,0.25)',
                  textAlign: 'center',
                  fontSize: 11,
                  fontFamily: 'monospace',
                  color: '#E8A395',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Flame size={14} style={{ color: L.criticalBright }} />
                <span>+ 41 more warnings hidden · High cognitive fatigue</span>
              </div>
            </div>
          </Reveal>

          {/* ── Center Pipeline: The Filtering & Priority Bridge ── */}
          <Reveal delay={0.16}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 16,
                padding: '16px 8px',
                height: '100%',
              }}
              className="pipeline-bridge"
            >
              {/* Shimmer top connector line */}
              <div
                style={{
                  width: 2,
                  height: 48,
                  background: `linear-gradient(180deg, transparent, ${L.accentBright})`,
                  borderRadius: 1,
                }}
                className="bridge-line-top"
              />

              {/* The 3 Pipeline Filter Stages */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                {/* Stage 1 */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 14px',
                    borderRadius: 20,
                    background: L.bgCardActive,
                    border: `1.5px solid ${L.border}`,
                    fontSize: 10.5,
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    color: L.textSub,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Filter size={12} style={{ color: L.warningBright }} />
                  <span>Signal Extraction</span>
                </div>

                {/* Stage 2 */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 14px',
                    borderRadius: 20,
                    background: L.bgCardActive,
                    border: `1.5px solid ${L.accent}66`,
                    fontSize: 10.5,
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    color: L.accent,
                    boxShadow: '0 4px 14px rgba(45,106,72,0.12)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <ListOrdered size={12} style={{ color: L.accentBright }} />
                  <span>Priority Ranking</span>
                </div>

                {/* Stage 3 */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 14px',
                    borderRadius: 20,
                    background: L.aiSoft,
                    border: `1.5px solid ${L.ai}55`,
                    fontSize: 10.5,
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    color: L.ai,
                    boxShadow: '0 4px 14px rgba(122,69,189,0.12)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Sparkles size={12} style={{ color: L.aiBright }} />
                  <span>Selective AI Rationale</span>
                </div>
              </div>

              {/* Center Transformation Conduit Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: L.accent,
                  color: '#FFFFFF',
                  boxShadow: '0 6px 18px rgba(45,106,72,0.35)',
                  border: '2px solid rgba(255,255,255,0.4)',
                }}
              >
                <ArrowRight size={17} className="bridge-arrow" />
              </div>

              {/* Shimmer bottom connector line */}
              <div
                style={{
                  width: 2,
                  height: 48,
                  background: `linear-gradient(180deg, ${L.accentBright}, transparent)`,
                  borderRadius: 1,
                }}
                className="bridge-line-bottom"
              />
            </div>
          </Reveal>

          {/* ── Right State: The Ordered Action Plan ── */}
          <Reveal delay={0.24}>
            <div
              style={{
                background: L.bgCardActive,
                borderRadius: 18,
                border: '1.5px solid rgba(45,106,72,0.35)',
                padding: '24px 24px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 18px 44px -8px rgba(45,106,72,0.12), 0 0 0 1px rgba(45,106,72,0.10)',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                  borderBottom: `1px solid ${L.border}`,
                  paddingBottom: 14,
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: L.accentSoft,
                      border: `1px solid ${L.accent}33`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: L.accent,
                    }}
                  >
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: L.text, letterSpacing: '-0.015em' }}>
                      Top 3 Fixes to Address First
                    </div>
                    <div style={{ fontSize: 11, color: L.textMuted, fontFamily: 'monospace' }}>
                      Ordered by impact &amp; effort · Explainable rationale
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: 10,
                    fontFamily: 'monospace',
                    padding: '3px 10px',
                    borderRadius: 6,
                    background: L.accentSoft,
                    color: L.accent,
                    border: `1px solid ${L.accent}40`,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Actionable (3/3)
                </span>
              </div>

              {/* 3 Ranked Action Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                {/* Item 1: High Priority (AI Explained) */}
                <div
                  style={{
                    background: '#FAF8F4',
                    border: `1.5px solid ${L.criticalBright}50`,
                    borderRadius: 14,
                    padding: '16px 18px',
                    position: 'relative',
                    boxShadow: '0 4px 14px rgba(196,61,46,0.06)',
                  }}
                >
                  {/* Top tags */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          color: L.criticalBright,
                          background: L.criticalSoft,
                          border: `1px solid ${L.criticalBright}33`,
                          padding: '2px 7px',
                          borderRadius: 4,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}
                      >
                        #1 · High Impact
                      </span>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontFamily: 'monospace',
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: 'rgba(23,27,24,0.06)',
                          color: L.textSub,
                          fontWeight: 700,
                        }}
                      >
                        Complexity 24
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontFamily: 'monospace', color: L.textMuted }}>
                      <Clock size={11} />
                      <span>Est. 30–60m</span>
                    </div>
                  </div>

                  <div style={{ fontSize: 14.5, fontWeight: 700, color: L.text, marginBottom: 3, letterSpacing: '-0.01em' }}>
                    Simplify authenticateUser()
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'monospace', color: L.textMuted, marginBottom: 12 }}>
                    src/auth/permissions.ts
                  </div>

                  {/* AI explanation highlight box */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(122,69,189,0.09) 0%, rgba(122,69,189,0.04) 100%)',
                      borderLeft: `3.5px solid ${L.aiBright}`,
                      padding: '10px 14px',
                      borderRadius: '0 8px 8px 0',
                      borderTop: `1px solid ${L.ai}22`,
                      borderRight: `1px solid ${L.ai}22`,
                      borderBottom: `1px solid ${L.ai}22`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                      <Sparkles size={12} style={{ color: L.aiBright }} />
                      <span style={{ fontSize: 10, fontWeight: 800, color: L.ai, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        AI Explanation
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: L.text, margin: 0, lineHeight: 1.6 }}>
                      Deeply nested branching in the primary token verifier increases vulnerability risk during auth updates.
                      Splitting into focused policy checks isolates permissions cleanly.
                    </p>
                  </div>
                </div>

                {/* Item 2: Medium Priority (Consolidate Duplication) */}
                <div
                  style={{
                    background: '#FAF8F4',
                    border: `1px solid ${L.warningBright}50`,
                    borderRadius: 14,
                    padding: '14px 18px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                    <span
                      style={{
                        fontSize: 9.5,
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        color: L.warningBright,
                        background: L.warningSoft,
                        border: `1px solid ${L.warningBright}33`,
                        padding: '2px 7px',
                        borderRadius: 4,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      #2 · Medium Impact
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontFamily: 'monospace', color: L.textMuted }}>
                      <Clock size={11} />
                      <span>Found in 2 files · Est. 20m</span>
                    </div>
                  </div>

                  <div style={{ fontSize: 14, fontWeight: 700, color: L.text, marginBottom: 3 }}>
                    Consolidate repeated input validation logic
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'monospace', color: L.textMuted, marginBottom: 6 }}>
                    src/api/routes.ts · src/utils/validator.js
                  </div>
                  <p style={{ fontSize: 11.5, color: L.textSub, margin: 0, lineHeight: 1.5 }}>
                    Deterministic check: 18 lines of identical token sanitation can be extracted into a shared validator helper.
                  </p>
                </div>

                {/* Item 3: Low Priority (Unused Export) */}
                <div
                  style={{
                    background: '#FAF8F4',
                    border: `1px solid ${L.border}`,
                    borderRadius: 14,
                    padding: '14px 18px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                    <span
                      style={{
                        fontSize: 9.5,
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        color: L.infoBright,
                        background: L.infoSoft,
                        border: `1px solid ${L.infoBright}33`,
                        padding: '2px 7px',
                        borderRadius: 4,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      #3 · Low Impact · Quick Win
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontFamily: 'monospace', color: L.textMuted }}>
                      <Clock size={11} />
                      <span>Dead code · Est. 5m</span>
                    </div>
                  </div>

                  <div style={{ fontSize: 14, fontWeight: 700, color: L.text, marginBottom: 3 }}>
                    Review unused formatCurrency export
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'monospace', color: L.textMuted, marginBottom: 6 }}>
                    src/utils/format.ts
                  </div>
                  <p style={{ fontSize: 11.5, color: L.textSub, margin: 0, lineHeight: 1.5 }}>
                    Zero imports found across scanned files. Safe to prune if not consumed by external packages.
                  </p>
                </div>
              </div>

              {/* Bottom Result Statement */}
              <div
                style={{
                  marginTop: 16,
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: L.accentSoft,
                  border: `1px solid ${L.accent}33`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={16} style={{ color: L.accent }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: L.accent }}>
                    Clear, ordered developer actions
                  </span>
                </div>
                <span style={{ fontSize: 10.5, fontFamily: 'monospace', color: L.textMuted }}>
                  Zero raw alert dumps
                </span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Architecture Note — inline, contextual */}
        <Reveal delay={0.3}>
          <div
            style={{
              marginTop: 40,
              padding: '20px 28px',
              borderRadius: 14,
              background: '#E1DDD4',
              border: `1px solid ${L.border}`,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 260 }}>
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
                  flexShrink: 0,
                  color: L.accent,
                }}
              >
                <Cpu size={16} />
              </div>
              <div>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: L.accent,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  Architecture Note
                </span>
                <p style={{ fontSize: 13, color: L.textSub, margin: '4px 0 0', lineHeight: 1.5 }}>
                  Scans run in an isolated background worker — AST parse trees and dependency signals computed server-side, zero browser slowdown.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['Async worker', 'In-memory AST', 'Zero client compute'].map((spec) => (
                <span
                  key={spec}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 6,
                    background: L.accentSoft,
                    border: `1px solid ${L.accent}25`,
                    fontSize: 11,
                    fontFamily: 'monospace',
                    color: L.accent,
                    fontWeight: 700,
                  }}
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .transform-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .pipeline-bridge {
            flex-direction: row !important;
            padding: 16px 0 !important;
          }
          .bridge-line-top, .bridge-line-bottom {
            display: none !important;
          }
          .bridge-arrow {
            transform: rotate(90deg);
          }
        }
      `}</style>
    </section>
  );
}
