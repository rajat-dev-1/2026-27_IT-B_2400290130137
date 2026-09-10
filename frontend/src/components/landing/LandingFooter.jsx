import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import GithubIcon from '../ui/GithubIcon';

const L = {
  bg: '#1A1714',
  bgAlt: '#221F1B',
  text: '#F5F3EF',
  textSub: '#8A857D',
  textMuted: '#5E5952',
  border: 'rgba(245,243,239,0.10)',
  accent: '#4C9E6A',
};

const footerCols = [
  {
    heading: 'Product',
    links: [
      { label: 'How it works', href: '#how-it-works', anchor: true },
      { label: 'Analysis modules', href: '#analysis', anchor: true },
      { label: 'Security', href: '#security', anchor: true },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Sign in with GitHub', href: null, action: 'login' },
      { label: 'Dashboard', href: '/dashboard' },
    ],
  },
];

function scrollTo(id) {
  const el = document.getElementById(id.replace('#', ''));
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function LandingFooter() {
  const { login } = useAuth();

  return (
    <footer style={{ background: L.bg, borderTop: `1px solid ${L.border}`, padding: '64px 24px 40px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '40px 80px', marginBottom: 48, flexWrap: 'wrap' }}>

          {/* Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 320 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', color: L.text, fontWeight: 700, fontSize: 15 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={L.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              CodeHealth AI
            </Link>
            <p style={{ fontSize: 13, color: L.textSub, lineHeight: 1.65, margin: 0 }}>
              Explainable, repository-aware codebase health for JavaScript and TypeScript teams.
            </p>
            <button onClick={login}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: 'fit-content',
                padding: '8px 16px', borderRadius: 8, border: `1px solid ${L.border}`,
                background: 'transparent', color: L.textSub, cursor: 'pointer',
                fontSize: 13, fontWeight: 600, transition: 'color 0.2s, border-color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = L.text; e.currentTarget.style.borderColor = 'rgba(245,243,239,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = L.textSub; e.currentTarget.style.borderColor = L.border; }}
            >
              <GithubIcon className="h-4 w-4" />
              Connect GitHub
            </button>
          </div>

          {/* Link columns */}
          {footerCols.map(col => (
            <div key={col.heading}>
              <div style={{ fontSize: 10.5, fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: L.textMuted, marginBottom: 20, fontWeight: 600 }}>
                {col.heading}
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {col.links.map(link => (
                  <li key={link.label}>
                    {link.action === 'login' ? (
                      <button onClick={login} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: L.textSub, padding: 0, transition: 'color 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = L.text; }}
                        onMouseLeave={e => { e.currentTarget.style.color = L.textSub; }}
                      >{link.label}</button>
                    ) : link.anchor ? (
                      <a href={link.href} onClick={e => { e.preventDefault(); scrollTo(link.href); }}
                        style={{ fontSize: 13, color: L.textSub, textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = L.text; }}
                        onMouseLeave={e => { e.currentTarget.style.color = L.textSub; }}
                      >{link.label}</a>
                    ) : (
                      <Link to={link.href} style={{ fontSize: 13, color: L.textSub, textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = L.text; }}
                        onMouseLeave={e => { e.currentTarget.style.color = L.textSub; }}
                      >{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ paddingTop: 32, borderTop: `1px solid ${L.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <p style={{ fontSize: 12, color: L.textMuted, margin: 0 }}>© {new Date().getFullYear()} CodeHealth AI. All rights reserved.</p>
          <p style={{ fontSize: 11.5, fontFamily: 'monospace', color: L.textMuted, margin: 0 }}>Read-only analysis · No code changes · GitHub OAuth</p>
        </div>
      </div>
    </footer>
  );
}
