import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, GitBranch, AlertTriangle, Info, Lightbulb, Loader2 } from 'lucide-react';
import Reveal from './Reveal';

const L = {
  bg: '#EBE8E3',
  bgAlt: '#E3E0DA',
  bgCard: '#F0EDE8',
  bgInner: '#EBE8E3',
  bgSidebar: '#E3E0DA',
  text: '#1A1714',
  textSub: '#6B6459',
  textMuted: '#9E9587',
  border: 'rgba(30,24,14,0.10)',
  accent: '#2D6A48',
  accentSoft: 'rgba(45,106,72,0.10)',
  warning: '#B5762A',
  critical: '#B83A2A',
  info: '#2A6080',
  sidebarActive: 'rgba(45,106,72,0.12)',
};

const repos = [
  { name: 'codehealth-demo', branch: 'main', files: 86, score: 78, active: true },
  { name: 'my-api-server', branch: 'main', files: 142, score: 64, active: false },
  { name: 'frontend-app', branch: 'develop', files: 53, score: 91, active: false },
];

const issueItems = [
  { file: 'auth/permissions.ts', type: 'Complexity hotspot', detail: 'CC 24 — High', sev: 'critical', color: '#B83A2A', Icon: AlertTriangle, highlighted: true },
  { file: 'utils/validator.js', type: 'Possible duplicate block', detail: '18 lines · api/validate.js', sev: 'warning', color: '#B5762A', Icon: AlertTriangle },
  { file: 'helpers/format.ts', type: 'Possible unused export', detail: 'formatCurrency', sev: 'info', color: '#2A6080', Icon: Info },
  { file: 'package.json', type: 'Outdated dependency', detail: 'lodash 4.17.15', sev: 'warning', color: '#B5762A', Icon: AlertTriangle },
];

const recommendations = [
  { text: 'Split auth/permissions.ts authorization checks into focused, single-responsibility policy functions.', effort: '1–2h', priority: 'high', color: '#B83A2A' },
  { text: 'Extract shared validation logic into a single reusable module to consolidate duplicate blocks.', effort: '30m', priority: 'medium', color: '#B5762A' },
  { text: 'Review and remove or re-export formatCurrency if it serves no purpose in the current scope.', effort: '15m', priority: 'low', color: '#2A6080' },
];

const catScores = [
  { label: 'Complexity', score: 82, color: L.accent },
  { label: 'Duplication', score: 75, color: L.accent },
  { label: 'Dependencies', score: 60, color: L.warning },
  { label: 'Dead Code', score: 88, color: L.accent },
];

const tabs = ['Overview', 'Issues', 'Recommendations'];

export default function DashboardShowcase() {
  const [tab, setTab] = useState('Overview');
  const [scanState, setScanState] = useState('analyzing'); // 'analyzing' | 'complete'
  const containerRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setScanState('complete');
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setScanState('analyzing');
        const timer = setTimeout(() => {
          setScanState('complete');
        }, 1400);
        return () => clearTimeout(timer);
      }
    }, { threshold: 0.2 });

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="dashboard" ref={containerRef} style={{ background: L.bgAlt, padding: '96px 0', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <Reveal>
          <div style={{ marginBottom: 56, maxWidth: 640 }}>
            <p style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: L.accent, fontWeight: 700, marginBottom: 16 }}>
              Product Proof
            </p>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.4rem)', fontWeight: 800, color: L.text, lineHeight: 1.06, letterSpacing: '-0.025em', textTransform: 'uppercase', margin: '0 0 16px' }}>
              Your analysis,<br />visualized.
            </h2>
            <p style={{ fontSize: 16, color: L.textSub, lineHeight: 1.65, margin: 0 }}>
              A focused dashboard designed to give you an immediate understanding of your repository's state.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          {/* Browser chrome frame */}
          <div style={{ borderRadius: 16, border: `1.5px solid ${L.border}`, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.12)' }}>

            {/* Browser bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: L.bgCard, borderBottom: `1px solid ${L.border}` }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#E8705A', opacity: 0.8 }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#DBA24A', opacity: 0.8 }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#5BA564', opacity: 0.8 }} />
              </div>
              <div style={{ flex: 1, margin: '0 16px', height: 26, background: L.bgInner, border: `1px solid ${L.border}`, borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 10px', gap: 8 }}>
                <ShieldCheck size={11} style={{ color: L.accent, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: L.textMuted }}>codehealth.ai/dashboard</span>
              </div>
            </div>

            {/* App */}
            <div style={{ display: 'flex', maxHeight: 560, overflow: 'hidden', background: L.bgInner }}>
              {/* Sidebar */}
              <div style={{ width: 220, flexShrink: 0, background: L.bgCard, borderRight: `1px solid ${L.border}`, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '14px 16px', borderBottom: `1px solid ${L.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShieldCheck size={15} style={{ color: L.accent }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: L.text }}>CodeHealth AI</span>
                  </div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
                  <div style={{ fontSize: 9.5, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: L.textMuted, padding: '4px 8px 8px', fontWeight: 600 }}>Repositories</div>
                  {repos.map(r => (
                    <div key={r.name} style={{
                      padding: '8px 10px', borderRadius: 8, marginBottom: 2, cursor: 'default',
                      background: r.active ? L.sidebarActive : 'transparent',
                      border: `1px solid ${r.active ? L.accent + '40' : 'transparent'}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <GitBranch size={10} style={{ color: L.textMuted, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, fontWeight: r.active ? 600 : 400, color: r.active ? L.text : L.textSub, truncate: true }}>{r.name}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 16, marginTop: 2 }}>
                        <span style={{ fontSize: 9.5, fontFamily: 'monospace', color: L.textMuted }}>{r.branch} · {r.files} files</span>
                        <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, color: r.score >= 80 ? L.accent : r.score >= 65 ? L.warning : L.critical }}>{r.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Top bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: `1px solid ${L.border}`, background: L.bgCard, flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: L.text }}>codehealth-demo</span>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', color: L.textMuted, padding: '2px 8px', borderRadius: 5, border: `1px solid ${L.border}`, background: L.bgInner }}>main · 86 files</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {scanState === 'analyzing' ? (
                      <>
                        <Loader2 size={12} className="animate-spin" style={{ color: L.warning }} />
                        <span style={{ fontSize: 11, fontFamily: 'monospace', color: L.warning, fontWeight: 600 }}>Analyzing… (68%)</span>
                      </>
                    ) : (
                      <>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: L.accent }} />
                        <span style={{ fontSize: 11, fontFamily: 'monospace', color: L.accent, fontWeight: 600 }}>Scan complete</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 2, padding: '10px 20px 0', borderBottom: `1px solid ${L.border}`, flexShrink: 0, background: L.bgCard }}>
                  {tabs.map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                      padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      border: 'none', background: 'none', borderRadius: '6px 6px 0 0',
                      borderBottom: `2px solid ${tab === t ? L.accent : 'transparent'}`,
                      color: tab === t ? L.text : L.textMuted,
                      transition: 'all 0.2s',
                    }}>{t}</button>
                  ))}
                </div>

                {/* Tab content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                  <AnimatePresence mode="wait">
                    <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
                      {tab === 'Overview' && <OverviewTab scanState={scanState} />}
                      {tab === 'Issues' && <IssuesTab scanState={scanState} />}
                      {tab === 'Recommendations' && <RecsTab />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Narrative outcome caption */}
        <Reveal delay={0.18}>
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <p style={{ fontSize: 15, color: L.text, fontWeight: 600, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
              A report built for deciding what to improve next — not for collecting more warnings.
            </p>
            <p style={{ fontSize: 11, fontFamily: 'monospace', color: L.textMuted, margin: 0 }}>
              Interactive demo preview · Built from deterministic scan signals
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function OverviewTab({ scanState }) {
  const isDone = scanState === 'complete';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      {/* Score */}
      <div style={{ gridColumn: '1', display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: L.bgCard, border: `1px solid ${L.border}`, borderRadius: 12 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width="60" height="60" viewBox="0 0 60 60" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="30" cy="30" r="24" fill="none" stroke={L.border} strokeWidth="5" />
            <motion.circle
              cx="30" cy="30" r="24" fill="none" stroke={L.accent} strokeWidth="5" strokeLinecap="round"
              strokeDasharray="150.8"
              initial={{ strokeDashoffset: 150.8 }}
              animate={{ strokeDashoffset: isDone ? 150.8 * 0.22 : 150.8 * 0.65 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: L.text, transform: 'rotate(90deg)' }}>
              {isDone ? 78 : 42}
            </span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10.5, fontFamily: 'monospace', color: L.textMuted, marginBottom: 2 }}>Health Score</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: L.text }}>
            {isDone ? '78 / 100' : 'Analyzing…'}
          </div>
          <div style={{ fontSize: 10, color: isDone ? L.accent : L.warning, marginTop: 4, fontWeight: 500 }}>
            {isDone ? '+4 since last scan' : 'Evaluating debt signals…'}
          </div>
        </div>
      </div>

      {/* Issues breakdown */}
      <div style={{ padding: 16, background: L.bgCard, border: `1px solid ${L.border}`, borderRadius: 12 }}>
        <div style={{ fontSize: 10.5, fontFamily: 'monospace', color: L.textMuted, marginBottom: 10 }}>Issues by severity</div>
        {[{ label: 'Critical', count: 1, color: L.critical }, { label: 'Warning', count: 2, color: L.warning }, { label: 'Info', count: 1, color: L.info }].map(s => (
          <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${L.border}`, alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: L.textSub }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />
              {s.label}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.count}</span>
          </div>
        ))}
      </div>

      {/* Category scores */}
      <div style={{ gridColumn: '1 / -1', padding: 16, background: L.bgCard, border: `1px solid ${L.border}`, borderRadius: 12 }}>
        <div style={{ fontSize: 10.5, fontFamily: 'monospace', color: L.textMuted, marginBottom: 14 }}>Category scores</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {catScores.map(({ label, score, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 10.5, fontFamily: 'monospace', color: L.textMuted, width: 90, flexShrink: 0 }}>{label}</span>
              <div style={{ flex: 1, height: 5, background: L.bgInner, borderRadius: 3, overflow: 'hidden', border: `1px solid ${L.border}` }}>
                <motion.div
                  style={{ height: '100%', background: color, borderRadius: 3 }}
                  initial={{ width: 0 }}
                  animate={{ width: isDone ? `${score}%` : '0%' }}
                  transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
                />
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 700, fontFamily: 'monospace', color, width: 22, textAlign: 'right' }}>
                {isDone ? score : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IssuesTab({ scanState }) {
  const isDone = scanState === 'complete';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {issueItems.map((it, i) => (
        <motion.div key={it.file} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10,
            background: L.bgCard,
            border: it.highlighted && isDone ? `1.5px solid ${it.color}` : `1px solid ${it.color}25`,
            boxShadow: it.highlighted && isDone ? `0 0 16px ${it.color}20` : 'none',
            transition: 'all 0.4s ease',
          }}
        >
          <it.Icon size={14} style={{ color: it.color, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: L.textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.file}</span>
              <span style={{ fontSize: 9.5, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: it.color + '18', color: it.color, textTransform: 'uppercase', flexShrink: 0, letterSpacing: '0.06em' }}>{it.sev}</span>
            </div>
            <div style={{ fontSize: 10.5, color: L.textMuted, marginTop: 2 }}>{it.type} · {it.detail}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function RecsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {recommendations.map((r, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
          style={{ padding: '14px 16px', background: L.bgCard, border: `1px solid ${L.border}`, borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <Lightbulb size={13} style={{ color: r.color, flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontSize: 12.5, color: L.textSub, lineHeight: 1.65, margin: '0 0 8px' }}>{r.text}</p>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: r.color + '18', color: r.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{r.priority}</span>
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: L.textMuted }}>est. {r.effort}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
