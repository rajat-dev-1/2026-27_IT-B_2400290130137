import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Reveal from './Reveal';

const L = {
  bg: '#E3E0DA',
  bgPanel: '#EBE8E3',
  bgInner: '#F0EDE8',
  text: '#1A1714',
  textSub: '#6B6459',
  textMuted: '#9E9587',
  border: 'rgba(30,24,14,0.10)',
  accent: '#2D6A48',
  accentSoft: 'rgba(45,106,72,0.10)',
  accentBorder: 'rgba(45,106,72,0.3)',
  warning: '#B5762A',
  warningBg: 'rgba(181,118,42,0.08)',
  info: '#2A6080',
  infoBg: 'rgba(42,96,128,0.08)',
  ai: '#6B4A9E',
  aiBg: 'rgba(107,74,158,0.08)',
};

const caps = [
  {
    id: 'complexity',
    tag: 'Core', tagColor: L.accent, tagBg: L.accentSoft,
    label: 'Complexity Analysis',
    desc: 'Detect functions that exceed cyclomatic complexity thresholds, making them difficult to understand, test, and maintain.',
    note: 'Deterministic cyclomatic complexity scoring. No AI in the score.',
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { file: 'auth/permissions.ts', cc: 24, color: '#B83A2A', dot: '#B83A2A' },
          { file: 'api/router.js', cc: 15, color: L.warning, dot: L.warning },
          { file: 'utils/helpers.js', cc: 6, color: L.accent, dot: L.accent },
        ].map(r => (
          <div key={r.file} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: L.bg, border: `1px solid ${L.border}`, borderRadius: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: r.dot, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: L.textSub, flex: 1 }}>{r.file}</span>
            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', color: r.color }}>CC {r.cc}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'duplicate',
    tag: 'Core', tagColor: L.accent, tagBg: L.accentSoft,
    label: 'Duplicate-Code Detection',
    desc: 'Surface repeated logic so it can be consolidated intentionally, reducing maintenance burden and inconsistency risk.',
    note: 'Token-based fingerprinting across all scanned JS/TS files.',
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ padding: 10, background: L.bg, border: `1px solid rgba(181,118,42,0.3)`, borderRadius: 8 }}>
            <div style={{ fontSize: 9.5, fontFamily: 'monospace', color: L.textMuted, marginBottom: 4 }}>utils/validator.js</div>
            <div style={{ fontSize: 10.5, fontFamily: 'monospace', color: L.warning, fontWeight: 600 }}>Pattern A · 18 lines</div>
          </div>
          <div style={{ padding: 10, background: L.bg, border: `1px solid rgba(181,118,42,0.3)`, borderRadius: 8 }}>
            <div style={{ fontSize: 9.5, fontFamily: 'monospace', color: L.textMuted, marginBottom: 4 }}>api/validate.js</div>
            <div style={{ fontSize: 10.5, fontFamily: 'monospace', color: L.warning, fontWeight: 600 }}>Pattern A · 18 lines</div>
          </div>
        </div>
        <div style={{ padding: '8px 12px', background: L.warningBg, border: `1px solid rgba(181,118,42,0.2)`, borderRadius: 8, textAlign: 'center', fontSize: 11, fontFamily: 'monospace', color: L.warning }}>
          ↑ Possible duplicate block detected
        </div>
      </div>
    ),
  },
  {
    id: 'unused',
    tag: 'Static', tagColor: L.info, tagBg: L.infoBg,
    label: 'Possible Unused Exports',
    desc: 'Highlight exports not referenced by any scanned file. Marked "possible" because external consumers are not analyzed.',
    note: 'Scoped to the selected repository — external consumers out of scope.',
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ padding: '10px 12px', background: L.infoBg, border: `1px solid rgba(42,96,128,0.25)`, borderRadius: 8 }}>
          <div style={{ fontSize: 11, fontFamily: 'monospace', color: L.info, fontWeight: 600, marginBottom: 4 }}>formatCurrency</div>
          <div style={{ fontSize: 10, color: L.textMuted }}>0 references found within scanned files</div>
        </div>
        <div style={{ fontSize: 10.5, color: L.textMuted, fontFamily: 'monospace', padding: '0 2px', lineHeight: 1.5 }}>
          helpers/format.ts · exported but not imported within scanned files
        </div>
      </div>
    ),
  },
  {
    id: 'deps',
    tag: 'Signals', tagColor: L.warning, tagBg: L.warningBg,
    label: 'Dependency Analysis',
    desc: 'Identify package versions and dependency signals. Understand which dependencies may warrant attention.',
    note: 'Reads package.json — no network requests, no npm audit.',
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { name: 'lodash', ver: '4.17.15', status: 'signal', statusColor: L.warning, statusBg: L.warningBg },
          { name: 'react', ver: '18.3.1', status: 'ok', statusColor: L.accent, statusBg: L.accentSoft },
          { name: 'express', ver: '4.18.0', status: 'ok', statusColor: L.accent, statusBg: L.accentSoft },
        ].map(d => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', background: L.bg, border: `1px solid ${L.border}`, borderRadius: 8 }}>
            <span style={{ flex: 1, fontSize: 11, fontFamily: 'monospace', color: L.textSub }}>{d.name}</span>
            <span style={{ fontSize: 10, color: L.textMuted, marginRight: 10, fontFamily: 'monospace' }}>{d.ver}</span>
            <span style={{ fontSize: 9.5, fontWeight: 600, padding: '2px 7px', borderRadius: 5, border: `1px solid ${d.statusColor}40`, background: d.statusBg, color: d.statusColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d.status}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'score',
    tag: 'Deterministic', tagColor: L.accent, tagBg: L.accentSoft,
    label: 'Explainable Health Score',
    desc: 'Show deterministic category scoring. Every number is traceable to specific file findings — no unexplained AI judgment.',
    note: 'Scores are computed from static analysis results — fully transparent.',
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: 'Complexity', val: 82, color: L.accent },
          { label: 'Duplication', val: 75, color: L.accent },
          { label: 'Dependencies', val: 60, color: L.warning },
          { label: 'Dead code', val: 88, color: L.accent },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 10, fontFamily: 'monospace', color: L.textMuted, width: 90, flexShrink: 0 }}>{label}</span>
            <div style={{ flex: 1, height: 5, background: L.bg, borderRadius: 3, overflow: 'hidden', border: `1px solid ${L.border}` }}>
              <div style={{ height: '100%', width: `${val}%`, background: color, borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 10.5, fontFamily: 'monospace', color, fontWeight: 700, width: 22, textAlign: 'right' }}>{val}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'recs',
    tag: 'AI-explained', tagColor: L.ai, tagBg: L.aiBg,
    label: 'Prioritized Recommendations',
    desc: 'Turn technical findings into an ordered improvement plan. AI explanations are generated only for the most important issues.',
    note: 'AI receives minimal context — specific issue data, not the full repository.',
    visual: (
      <div style={{ borderLeft: `3px solid ${L.ai}`, paddingLeft: 14, paddingTop: 2, paddingBottom: 2 }}>
        <div style={{ fontSize: 10.5, color: L.ai, fontWeight: 700, marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>AI Explanation</div>
        <div style={{ fontSize: 12, color: L.textSub, lineHeight: 1.65 }}>
          Multiple branching paths make this authorization flow harder to test safely and increase the risk of permission bypasses.
        </div>
        <div style={{ fontSize: 10, fontFamily: 'monospace', color: L.textMuted, marginTop: 10 }}>auth/permissions.ts · CC 24 · est. 1–2h</div>
      </div>
    ),
  },
];

export default function AnalysisCapabilities() {
  const [active, setActive] = useState('complexity');
  const item = caps.find(c => c.id === active);

  return (
    <section id="analysis" style={{ background: L.bg, padding: '96px 0', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>

        <Reveal>
          <div style={{ marginBottom: 64, maxWidth: 560 }}>
            <p style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: L.textMuted, marginBottom: 20 }}>
              003 / 004 &nbsp;&nbsp; Analysis modules
            </p>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.4rem)', fontWeight: 800, color: L.text, lineHeight: 1.06, letterSpacing: '-0.025em', textTransform: 'uppercase', margin: '0 0 16px' }}>
              Six lenses on<br />your codebase.
            </h2>
            <p style={{ fontSize: 16, color: L.textSub, lineHeight: 1.65, margin: 0 }}>
              Each module produces deterministic findings. AI explanations are selective, not automatic.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20 }} className="analysis-grid">
            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {caps.map(cap => (
                <button key={cap.id} onClick={() => setActive(cap.id)}
                  style={{
                    width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${active === cap.id ? cap.tagColor + '55' : 'transparent'}`,
                    background: active === cap.id ? L.bgPanel : 'transparent',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { if (active !== cap.id) e.currentTarget.style.background = L.bgPanel; }}
                  onMouseLeave={e => { if (active !== cap.id) e.currentTarget.style.background = 'transparent'; }}
                  aria-pressed={active === cap.id}
                >
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 5,
                    border: `1px solid ${cap.tagColor}55`, background: cap.tagBg,
                    color: cap.tagColor, textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0,
                  }}>{cap.tag}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: active === cap.id ? L.text : L.textSub, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{cap.label}</span>
                </button>
              ))}
            </div>

            {/* Content panel */}
            <AnimatePresence mode="wait">
              {item && (
                <motion.div key={active}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.28 }}
                  style={{
                    background: L.bgPanel, border: `1.5px solid ${L.border}`,
                    borderRadius: 16, padding: '32px 36px',
                    display: 'flex', flexDirection: 'column', minHeight: 360,
                    boxShadow: '0 4px 32px rgba(0,0,0,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                      border: `1px solid ${item.tagColor}55`, background: item.tagBg,
                      color: item.tagColor, textTransform: 'uppercase', letterSpacing: '0.1em',
                    }}>{item.tag}</span>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: L.text, margin: 0, letterSpacing: '-0.02em' }}>{item.label}</h3>
                  </div>
                  <p style={{ fontSize: 15, color: L.textSub, lineHeight: 1.7, margin: '0 0 24px' }}>{item.desc}</p>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ background: L.bgInner, border: `1px solid ${L.border}`, borderRadius: 12, padding: 20 }}>
                      {item.visual}
                    </div>
                  </div>
                  <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${L.border}` }}>
                    <p style={{ fontSize: 11, fontFamily: 'monospace', color: L.textMuted, margin: 0 }}>{item.note}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
