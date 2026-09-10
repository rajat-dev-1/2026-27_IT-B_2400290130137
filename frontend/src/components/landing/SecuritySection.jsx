import { Lock, Server, Eye, Shield, KeyRound, GitBranch } from 'lucide-react';
import Reveal from './Reveal';

const L = {
  bg: '#EBE8E3',
  bgCard: '#F0EDE8',
  text: '#1A1714',
  textSub: '#6B6459',
  textMuted: '#9E9587',
  border: 'rgba(30,24,14,0.10)',
  accent: '#2D6A48',
  accentSoft: 'rgba(45,106,72,0.10)',
  warning: '#B5762A',
  info: '#2A6080',
  ai: '#6B4A9E',
};

const principles = [
  { id: 'tokens', Icon: KeyRound, title: 'Tokens stay server-side', body: 'GitHub tokens are stored encrypted at rest and used only from the backend. Your OAuth credentials are never exposed to the browser.', color: L.accent, bg: L.accentSoft },
  { id: 'private', Icon: Lock, title: 'Private repository content is not proxied', body: 'File content fetched during a scan is processed server-side. Raw repository content does not pass through the browser.', color: L.info, bg: 'rgba(42,96,128,0.09)' },
  { id: 'scope', Icon: GitBranch, title: 'Scoped to your access', body: 'Repository access is scoped to the authenticated GitHub user. You can only scan repositories your own account can read.', color: L.accent, bg: L.accentSoft },
  { id: 'ai-minimal', Icon: Eye, title: 'Minimal AI context', body: 'When AI explanations are generated, the model receives specific issue data — not full repository source code.', color: L.ai, bg: 'rgba(107,74,158,0.09)' },
  { id: 'separation', Icon: Server, title: 'API and worker are separate', body: 'The scan worker runs in isolation. It does not serve responses to the browser during analysis.', color: L.warning, bg: 'rgba(181,118,42,0.09)' },
  { id: 'control', Icon: Shield, title: 'You stay in control', body: 'Revoke access at any time from GitHub. Signing out clears your session and removes access from CodeHealth AI immediately.', color: L.accent, bg: L.accentSoft },
];

export default function SecuritySection() {
  return (
    <section id="security" style={{ background: L.bg, padding: '96px 0', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>

        <Reveal>
          <div style={{ marginBottom: 64, maxWidth: 600 }}>
            <p style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: L.textMuted, marginBottom: 20 }}>
              004 / 004 &nbsp;&nbsp; Security
            </p>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.4rem)', fontWeight: 800, color: L.text, lineHeight: 1.06, letterSpacing: '-0.025em', textTransform: 'uppercase', margin: '0 0 16px' }}>
              Your repository<br />access stays<br />under your control.
            </h2>
            <p style={{ fontSize: 16, color: L.textSub, lineHeight: 1.65, margin: 0, maxWidth: 520 }}>
              CodeHealth AI uses authenticated repository access, keeps sensitive credentials server-side,
              and presents analysis results through your own dashboard.
            </p>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {principles.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.06}>
              <div
                style={{
                  display: 'flex', flexDirection: 'column', gap: 16,
                  padding: '24px 24px', background: L.bgCard, border: `1.5px solid ${L.border}`,
                  borderRadius: 14, height: '100%',
                  transition: 'border-color 0.25s, box-shadow 0.25s, transform 0.25s',
                  cursor: 'default',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = p.color + '50'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.07)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = L.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, background: p.bg, border: `1px solid ${p.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p.Icon size={17} style={{ color: p.color }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: L.text, margin: '0 0 8px', lineHeight: 1.3, letterSpacing: '-0.01em' }}>{p.title}</h3>
                  <p style={{ fontSize: 13, color: L.textSub, lineHeight: 1.65, margin: 0 }}>{p.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.4}>
          <div style={{ marginTop: 48, paddingTop: 32, borderTop: `1px solid ${L.border}` }}>
            <p style={{ fontSize: 11, fontFamily: 'monospace', color: L.textMuted, maxWidth: 640, lineHeight: 1.7 }}>
              CodeHealth AI does not claim SOC 2 compliance, end-to-end encryption, or zero-knowledge architecture.
              These are the implemented security properties as of the current release.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
