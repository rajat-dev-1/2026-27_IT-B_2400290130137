import { KeyRound, ShieldCheck, Eye, Server, AlertCircle } from 'lucide-react';
import Reveal from './Reveal';

const L = {
  bg: '#EBE8E3',
  bgCard: '#F0EDE8',
  text: '#1A1714',
  textSub: '#5C5449',
  textMuted: '#8C8275',
  border: 'rgba(30,24,14,0.12)',
  accent: '#2D6A48',
  accentSoft: 'rgba(45,106,72,0.09)',
  info: '#2A6080',
  infoSoft: 'rgba(42,96,128,0.09)',
  ai: '#6B4A9E',
  aiSoft: 'rgba(107,74,158,0.09)',
};

const proofPoints = [
  {
    id: 'tokens',
    Icon: KeyRound,
    title: 'Server-side token encryption',
    detail: 'GitHub OAuth tokens are encrypted at rest on the backend and used only from server services. Credentials are never exposed or transmitted to the browser.',
    badge: 'OAuth 2.0',
    color: L.accent,
    bg: L.accentSoft,
  },
  {
    id: 'scope',
    Icon: ShieldCheck,
    title: 'Strict read-only repository scope',
    detail: 'We never request write permissions. Access is scoped strictly to repositories your authenticated account can already read, and you can revoke access anytime via GitHub.',
    badge: 'Read-Only',
    color: L.accent,
    bg: L.accentSoft,
  },
  {
    id: 'ai-context',
    Icon: Eye,
    title: 'Minimal context for AI explanations',
    detail: 'Full repository source code is never sent to LLMs. Only minimal, isolated issue metadata (the specific function name, AST complexity metric) is passed for high-priority insights.',
    badge: 'Isolated Context',
    color: L.ai,
    bg: L.aiSoft,
  },
  {
    id: 'isolation',
    Icon: Server,
    title: 'API & worker process separation',
    detail: 'File fetching and static parsing run in an isolated worker queue. The client-facing web service does not perform intensive repository extraction.',
    badge: 'Process Isolation',
    color: L.info,
    bg: L.infoSoft,
  },
];

export default function SecuritySection() {
  return (
    <section id="security" style={{ background: L.bg, padding: '96px 0', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.4fr)',
            gap: 48,
            alignItems: 'start',
          }}
          className="security-layout"
        >
          {/* Left: Strong Trust Statement */}
          <Reveal>
            <div style={{ maxWidth: 520, position: 'sticky', top: 120 }}>
              <p
                style={{
                  fontFamily: 'monospace',
                  fontSize: 11,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: L.accent,
                  fontWeight: 700,
                  marginBottom: 16,
                }}
              >
                Security & Access Boundaries
              </p>

              <h2
                style={{
                  fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
                  fontWeight: 800,
                  color: L.text,
                  lineHeight: 1.06,
                  letterSpacing: '-0.025em',
                  textTransform: 'uppercase',
                  margin: '0 0 20px',
                }}
              >
                Your repository access stays under your control.
              </h2>

              <p style={{ fontSize: 16, color: L.textSub, lineHeight: 1.65, margin: '0 0 28px' }}>
                CodeHealth AI only requests read-only permissions, keeps sensitive credentials server-side,
                and processes code in isolated worker containers. You can revoke access at any time from your GitHub settings.
              </p>

              {/* Honest Technical Disclaimer */}
              <div
                style={{
                  padding: '16px 18px',
                  borderRadius: 12,
                  background: L.bgCard,
                  border: `1.5px solid ${L.border}`,
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                }}
              >
                <AlertCircle size={16} style={{ color: L.textMuted, flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 11.5, fontFamily: 'monospace', color: L.textSub, margin: 0, lineHeight: 1.6 }}>
                  <strong style={{ color: L.text }}>Honest Boundary Note:</strong> CodeHealth AI does not claim SOC 2 compliance,
                  end-to-end encryption, or zero-knowledge architecture. These are the actual implemented technical boundaries as of the current release.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Right: 4 Architectural Proof Points */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {proofPoints.map((point, i) => (
              <Reveal key={point.id} delay={i * 0.08}>
                <div
                  style={{
                    background: L.bgCard,
                    border: `1.5px solid ${L.border}`,
                    borderRadius: 14,
                    padding: '20px 24px',
                    display: 'flex',
                    gap: 16,
                    alignItems: 'flex-start',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = point.color + '60';
                    e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.04)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = L.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: point.bg,
                      border: `1px solid ${point.color}30`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <point.Icon size={18} style={{ color: point.color }} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                      <h3 style={{ fontSize: 14.5, fontWeight: 700, color: L.text, margin: 0, letterSpacing: '-0.01em' }}>
                        {point.title}
                      </h3>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontFamily: 'monospace',
                          padding: '2px 7px',
                          borderRadius: 5,
                          border: `1px solid ${point.color}35`,
                          background: point.bg,
                          color: point.color,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          flexShrink: 0,
                        }}
                      >
                        {point.badge}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: L.textSub, lineHeight: 1.6, margin: 0 }}>
                      {point.detail}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .security-layout {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
        }
      `}</style>
    </section>
  );
}
