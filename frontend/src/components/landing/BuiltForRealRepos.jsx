import { Server, Cpu, CheckCircle } from 'lucide-react';
import Reveal from './Reveal';

const L = {
  bg: '#E3E0DA',
  bgCard: '#EBE8E3',
  text: '#1A1714',
  textSub: '#5C5449',
  textMuted: '#8C8275',
  border: 'rgba(30,24,14,0.12)',
  accent: '#2D6A48',
  accentSoft: 'rgba(45,106,72,0.09)',
};

export default function BuiltForRealRepos() {
  return (
    <section
      style={{
        background: L.bg,
        padding: '56px 0',
        borderBottom: `1px solid ${L.border}`,
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <Reveal>
          <div
            style={{
              background: L.bgCard,
              borderRadius: 16,
              border: `1.5px solid ${L.border}`,
              padding: '32px 36px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 28,
            }}
          >
            {/* Left: Message */}
            <div style={{ maxWidth: 680 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Server size={15} style={{ color: L.accent }} />
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: L.accent,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                  }}
                >
                  Architecture Note
                </span>
              </div>

              <h3
                style={{
                  fontSize: 'clamp(1.25rem, 2.2vw, 1.65rem)',
                  fontWeight: 800,
                  color: L.text,
                  lineHeight: 1.25,
                  letterSpacing: '-0.02em',
                  margin: '0 0 10px',
                }}
              >
                Built for repositories that cannot be analyzed in one browser request.
              </h3>

              <p style={{ fontSize: 14.5, color: L.textSub, lineHeight: 1.6, margin: 0 }}>
                CodeHealth AI queues scans in an isolated background worker, keeping the dashboard responsive
                and preventing browser timeouts while AST parse trees and dependency signals are computed.
              </p>
            </div>

            {/* Right: Technical Specs Badges */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                minWidth: 260,
              }}
            >
              {[
                'Asynchronous background worker',
                'In-memory AST parsing & indexing',
                'Zero client-side compute load',
              ].map((spec) => (
                <div
                  key={spec}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: L.bg,
                    border: `1px solid ${L.border}`,
                    fontSize: 11,
                    fontFamily: 'monospace',
                    color: L.textSub,
                    fontWeight: 500,
                  }}
                >
                  <CheckCircle size={13} style={{ color: L.accent, flexShrink: 0 }} />
                  <span>{spec}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
