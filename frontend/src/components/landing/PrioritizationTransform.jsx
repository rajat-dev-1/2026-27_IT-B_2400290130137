import { CheckCircle2, ArrowRight, Sparkles, Filter, ListOrdered, ShieldAlert } from 'lucide-react';
import Reveal from './Reveal';

const L = {
  bg: '#EBE8E3',
  bgCard: '#F0EDE8',
  bgLog: '#1E1B18',
  text: '#1A1714',
  textSub: '#5C5449',
  textMuted: '#8C8275',
  border: 'rgba(30,24,14,0.12)',
  borderActive: 'rgba(45,106,72,0.35)',
  accent: '#2D6A48',
  accentSoft: 'rgba(45,106,72,0.10)',
  warning: '#B5762A',
  warningSoft: 'rgba(181,118,42,0.10)',
  critical: '#B83A2A',
  criticalSoft: 'rgba(184,58,42,0.10)',
  info: '#2A6080',
  infoSoft: 'rgba(42,96,128,0.10)',
  ai: '#6B4A9E',
  aiSoft: 'rgba(107,74,158,0.10)',
};

const rawWarnings = [
  { file: 'src/auth/permissions.ts:42', text: 'Cyclomatic complexity exceeds threshold (CC: 24)', type: 'error' },
  { file: 'src/api/routes.ts:118', text: 'Duplicate block (18 lines match utils/validator.js)', type: 'warn' },
  { file: 'src/utils/format.ts:14', text: 'Export formatCurrency is never imported in scanned files', type: 'info' },
  { file: 'package.json:28', text: 'Outdated dependency: lodash@4.17.15 (minor update available)', type: 'warn' },
  { file: 'src/handlers/user.ts:89', text: 'Function length exceeds 60 lines', type: 'warn' },
  { file: 'src/services/billing.ts:15', text: 'Unused parameter options in processCheckout', type: 'info' },
];

export default function PrioritizationTransform() {
  return (
    <section
      id="differentiator"
      style={{
        background: L.bg,
        padding: '96px 0',
        borderTop: `1px solid ${L.border}`,
        borderBottom: `1px solid ${L.border}`,
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>

        {/* Section Header */}
        <Reveal>
          <div style={{ marginBottom: 56, maxWidth: 680 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '4px 10px',
                borderRadius: 6,
                background: L.accentSoft,
                border: `1px solid ${L.accent}30`,
                marginBottom: 16,
              }}
            >
              <Filter size={12} style={{ color: L.accent }} />
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
                The Core Differentiator
              </span>
            </div>

            <h2
              style={{
                fontSize: 'clamp(2.2rem, 4.2vw, 3.6rem)',
                fontWeight: 800,
                color: L.text,
                lineHeight: 1.05,
                letterSpacing: '-0.025em',
                textTransform: 'uppercase',
                margin: '0 0 16px',
              }}
            >
              Stop chasing warnings.<br />Fix what matters first.
            </h2>

            <p style={{ fontSize: 16.5, color: L.textSub, lineHeight: 1.65, margin: 0 }}>
              Traditional linters leave developers with an overwhelming dump of raw alerts.
              CodeHealth AI filters the noise, isolates true structural debt, and delivers a ranked
              3-step action plan with AI explanation for the #1 priority.
            </p>
          </div>
        </Reveal>

        {/* Transformation Pipeline Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1fr) auto minmax(360px, 1.25fr)',
            gap: 20,
            alignItems: 'stretch',
          }}
          className="transform-grid"
        >
          {/* ── Left State: The Raw Warning Noise ── */}
          <Reveal delay={0.08}>
            <div
              style={{
                background: '#1D1A16',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '24px 20px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <ShieldAlert size={16} style={{ color: '#E8705A' }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#F5F3EF', fontFamily: 'monospace' }}>Raw Tooling Output</div>
                    <div style={{ fontSize: 10, color: '#8A847B', fontFamily: 'monospace' }}>47 warnings across 19 files</div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 9.5,
                    fontFamily: 'monospace',
                    padding: '3px 8px',
                    borderRadius: 5,
                    background: 'rgba(232,112,90,0.15)',
                    color: '#E8705A',
                    border: '1px solid rgba(232,112,90,0.3)',
                    fontWeight: 600,
                  }}
                >
                  Unprioritized
                </span>
              </div>

              {/* Warning List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {rawWarnings.map((w, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 8,
                      padding: '8px 10px',
                      fontSize: 11,
                      fontFamily: 'monospace',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ color: '#A69E92', fontSize: 10 }}>{w.file}</span>
                      <span style={{
                        color: w.type === 'error' ? '#E8705A' : w.type === 'warn' ? '#DBA24A' : '#68A4C4',
                        fontSize: 9.5,
                        textTransform: 'uppercase',
                        fontWeight: 600,
                      }}>
                        {w.type}
                      </span>
                    </div>
                    <div style={{ color: '#DDD7CE', fontSize: 10.5, lineHeight: 1.4 }}>{w.text}</div>
                  </div>
                ))}
              </div>

              {/* Overflow Notice */}
              <div
                style={{
                  marginTop: 12,
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px dashed rgba(255,255,255,0.10)',
                  textAlign: 'center',
                  fontSize: 10.5,
                  fontFamily: 'monospace',
                  color: '#8A847B',
                }}
              >
                + 41 more warnings hidden · High cognitive fatigue
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
                padding: '12px 6px',
              }}
              className="pipeline-bridge"
            >
              <div
                style={{
                  width: 1,
                  height: 32,
                  background: `linear-gradient(180deg, transparent, ${L.accent})`,
                }}
                className="bridge-line-top"
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 20,
                    background: L.bgCard,
                    border: `1px solid ${L.border}`,
                    fontSize: 10,
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    color: L.textSub,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Filter size={11} style={{ color: L.accent }} />
                  Signal Extraction
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 20,
                    background: L.bgCard,
                    border: `1px solid ${L.accent}40`,
                    fontSize: 10,
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    color: L.accent,
                    boxShadow: '0 2px 8px rgba(45,106,72,0.08)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <ListOrdered size={11} style={{ color: L.accent }} />
                  Priority Ranking
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 20,
                    background: L.aiSoft,
                    border: `1px solid ${L.ai}35`,
                    fontSize: 10,
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    color: L.ai,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Sparkles size={11} style={{ color: L.ai }} />
                  Selective AI Rationale
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: L.accent,
                  color: '#F5F3EF',
                  boxShadow: '0 4px 12px rgba(45,106,72,0.25)',
                }}
              >
                <ArrowRight size={15} className="bridge-arrow" />
              </div>

              <div
                style={{
                  width: 1,
                  height: 32,
                  background: `linear-gradient(180deg, ${L.accent}, transparent)`,
                }}
                className="bridge-line-bottom"
              />
            </div>
          </Reveal>

          {/* ── Right State: The Ordered Action Plan ── */}
          <Reveal delay={0.24}>
            <div
              style={{
                background: L.bgCard,
                borderRadius: 16,
                border: `1.5px solid ${L.borderActive}`,
                padding: '24px 22px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 12px 40px rgba(45,106,72,0.08)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: `1px solid ${L.border}`, paddingBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <CheckCircle2 size={18} style={{ color: L.accent }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: L.text, letterSpacing: '-0.01em' }}>Top 3 Fixes to Address First</div>
                    <div style={{ fontSize: 10.5, color: L.textMuted, fontFamily: 'monospace' }}>Ordered by impact & effort · Explainable rationale</div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: 'monospace',
                    padding: '3px 9px',
                    borderRadius: 5,
                    background: L.accentSoft,
                    color: L.accent,
                    border: `1px solid ${L.accent}40`,
                    fontWeight: 700,
                  }}
                >
                  Actionable
                </span>
              </div>

              {/* 3 Ranked Action Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                {/* Item 1: High Priority (AI Explained) */}
                <div
                  style={{
                    background: L.bg,
                    border: `1.5px solid ${L.critical}40`,
                    borderRadius: 12,
                    padding: '14px 16px',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 800, color: L.critical, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      #1 · High Impact
                    </span>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', color: L.textMuted }}>
                      Complexity 24 · Est. 30–60m
                    </span>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: L.text, marginBottom: 4 }}>
                    Simplify authenticateUser()
                  </div>
                  <div style={{ fontSize: 10.5, fontFamily: 'monospace', color: L.textMuted, marginBottom: 10 }}>
                    src/auth/permissions.ts
                  </div>
                  {/* AI explanation highlight box */}
                  <div
                    style={{
                      background: L.aiSoft,
                      borderLeft: `3px solid ${L.ai}`,
                      padding: '8px 10px',
                      borderRadius: '0 6px 6px 0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                      <Sparkles size={10} style={{ color: L.ai }} />
                      <span style={{ fontSize: 9.5, fontWeight: 700, color: L.ai, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        AI Explanation
                      </span>
                    </div>
                    <p style={{ fontSize: 11.5, color: L.textSub, margin: 0, lineHeight: 1.5 }}>
                      Deeply nested branching in the primary token verifier increases vulnerability risk during auth updates.
                      Splitting into focused policy checks isolates permissions cleanly.
                    </p>
                  </div>
                </div>

                {/* Item 2: Medium Priority (Consolidate Duplication) */}
                <div
                  style={{
                    background: L.bg,
                    border: `1px solid ${L.warning}35`,
                    borderRadius: 12,
                    padding: '12px 16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 800, color: L.warning, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      #2 · Medium Impact
                    </span>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', color: L.textMuted }}>
                      Found in 2 files · Est. 20m
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: L.text, marginBottom: 3 }}>
                    Consolidate repeated input validation logic
                  </div>
                  <div style={{ fontSize: 10.5, fontFamily: 'monospace', color: L.textMuted, marginBottom: 4 }}>
                    src/api/routes.ts · src/utils/validator.js
                  </div>
                  <p style={{ fontSize: 11, color: L.textSub, margin: 0, lineHeight: 1.45 }}>
                    Deterministic check: 18 lines of identical token sanitation can be extracted into a shared validator helper.
                  </p>
                </div>

                {/* Item 3: Low Priority (Unused Export) */}
                <div
                  style={{
                    background: L.bg,
                    border: `1px solid ${L.border}`,
                    borderRadius: 12,
                    padding: '12px 16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, color: L.info, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      #3 · Low Impact · Quick Win
                    </span>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', color: L.textMuted }}>
                      Dead code · Est. 5m
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: L.text, marginBottom: 3 }}>
                    Review unused formatCurrency export
                  </div>
                  <div style={{ fontSize: 10.5, fontFamily: 'monospace', color: L.textMuted, marginBottom: 4 }}>
                    src/utils/format.ts
                  </div>
                  <p style={{ fontSize: 11, color: L.textSub, margin: 0, lineHeight: 1.45 }}>
                    Zero imports found across scanned files. Safe to prune if not consumed by external packages.
                  </p>
                </div>
              </div>

              {/* Bottom Result Statement */}
              <div
                style={{
                  marginTop: 14,
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: L.accentSoft,
                  border: `1px solid ${L.accent}25`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: 11.5, fontWeight: 600, color: L.accent }}>
                  Clear, ordered developer actions
                </span>
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: L.textMuted }}>
                  Zero raw alert dumps
                </span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Architecture Note — inline, contextual */}
        <div style={{
          marginTop: 40,
          padding: '20px 28px',
          borderRadius: 12,
          background: 'rgba(30,24,14,0.04)',
          border: `1px solid ${L.border}`,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 260 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={L.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>
            </svg>
            <div>
              <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: L.accent, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Architecture Note</span>
              <p style={{ fontSize: 13, color: L.textSub, margin: '4px 0 0', lineHeight: 1.5 }}>
                Scans run in an isolated background worker — AST parse trees and dependency signals computed server-side, zero browser slowdown.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Async worker', 'In-memory AST', 'Zero client compute'].map(spec => (
              <span key={spec} style={{
                padding: '4px 10px', borderRadius: 6,
                background: L.accentSoft, border: `1px solid ${L.accent}25`,
                fontSize: 10.5, fontFamily: 'monospace', color: L.accent, fontWeight: 600,
              }}>{spec}</span>
            ))}
          </div>
        </div>
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
