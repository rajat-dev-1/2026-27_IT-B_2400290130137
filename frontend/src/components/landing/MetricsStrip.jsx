import Reveal from './Reveal';

const L = {
  bg: '#1A1714',
  bgAlt: '#221F1A',
  text: '#F5F3EF',
  textSub: '#A8A198',
  textMuted: '#6A6259',
  border: 'rgba(245,243,239,0.08)',
  accent: '#4C9E6A',
  warning: '#DBA24A',
  info: '#68A4C4',
};

const metrics = [
  {
    id: 'complexity',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3h6v6H3zm12 0h6v6h-6zM3 15h6v6H3zm12 3h6M18 15v6"/>
      </svg>
    ),
    label: 'Complexity hotspots',
    desc: 'Functions exceeding cyclomatic complexity thresholds',
    color: L.accent,
  },
  {
    id: 'duplicate',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="12" height="12" rx="2"/>
        <rect x="9" y="9" width="12" height="12" rx="2"/>
      </svg>
    ),
    label: 'Duplicate patterns',
    desc: 'Repeated logic blocks that can be consolidated',
    color: L.accent,
  },
  {
    id: 'unused',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
    label: 'Unused exports',
    desc: 'Exports not referenced within scanned files',
    color: L.warning,
  },
  {
    id: 'deps',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>
        <path d="M12 7v5m-5.2 5.2 3.7-3.7M16.5 16.5l-3-3"/>
      </svg>
    ),
    label: 'Dependency signals',
    desc: 'Package versions and outdated dependency risks',
    color: L.info,
  },
  {
    id: 'score',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    label: 'Deterministic scores',
    desc: 'Transparent scoring with no unexplained AI judgment',
    color: L.accent,
  },
  {
    id: 'recs',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" strokeLinecap="round"/>
      </svg>
    ),
    label: 'Actionable recommendations',
    desc: 'Ordered improvement plan focused on highest impact',
    color: '#6B4A9E',
  },
];

export default function MetricsStrip() {
  return (
    <section
      id="metrics-strip"
      style={{ background: L.bgAlt, borderTop: `1px solid ${L.border}`, borderBottom: `1px solid ${L.border}`, padding: '64px 0' }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <Reveal>
          <p style={{
            textAlign: 'center', fontFamily: 'monospace', fontSize: 10.5, fontWeight: 500,
            color: L.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 48,
          }}>
            What CodeHealth AI detects
          </p>
        </Reveal>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 1, background: L.border, borderRadius: 16, overflow: 'hidden',
          border: `1px solid ${L.border}`,
        }}>
          {metrics.map((m, i) => (
            <Reveal key={m.id} delay={i * 0.06}>
              <div
                style={{
                  padding: '28px 24px', background: L.bgAlt,
                  transition: 'background 0.25s',
                  cursor: 'default',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = L.bg; }}
                onMouseLeave={e => { e.currentTarget.style.background = L.bgAlt; }}
              >
                <div style={{ color: m.color, marginBottom: 14 }}>{m.icon}</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: L.text, marginBottom: 6, letterSpacing: '-0.01em' }}>{m.label}</div>
                <div style={{ fontSize: 12, color: L.textMuted, lineHeight: 1.55 }}>{m.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
