import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';
import GithubIcon from '../ui/GithubIcon';

/* ── Design tokens (light theme) ── */
const L = {
  bg: '#EBE8E3',
  text: '#1A1714',
  textSub: '#6B6459',
  textMuted: '#9E9587',
  border: 'rgba(30,24,14,0.12)',
  borderHover: 'rgba(30,24,14,0.22)',
  btnPrimary: '#1A1714',
  btnPrimaryText: '#F5F3EF',
  btnOutline: 'transparent',
  accent: '#2D6A48',
};

const navLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Analysis', href: '#analysis' },
  { label: 'Security', href: '#security' },
];

function scrollTo(id) {
  const el = document.getElementById(id.replace('#', ''));
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const handleNav = (e, href) => {
    e.preventDefault();
    setMenuOpen(false);
    scrollTo(href);
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          backgroundColor: scrolled ? 'rgba(235,232,227,0.92)' : 'rgba(235,232,227,0.12)',
          backdropFilter: scrolled ? 'blur(16px)' : 'blur(6px)',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'blur(6px)',
          borderBottom: scrolled ? `1px solid ${L.border}` : '1px solid rgba(30,24,14,0.06)',
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: scrolled ? 56 : 68, transition: 'height 0.4s ease' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: L.text, fontWeight: 600, fontSize: 15, letterSpacing: '-0.01em' }} aria-label="CodeHealth AI">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={L.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            CodeHealth AI
          </Link>

          {/* Desktop links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden md:flex">
            {navLinks.map(l => (
              <a key={l.label} href={l.href} onClick={e => handleNav(e, l.href)}
                style={{ padding: '6px 14px', fontSize: 13, fontWeight: 500, color: L.textSub, textDecoration: 'none', borderRadius: 6, transition: 'color 0.2s, background 0.2s', letterSpacing: '0.01em' }}
                onMouseEnter={e => { e.currentTarget.style.color = L.text; e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = L.textSub; e.currentTarget.style.background = 'transparent'; }}
              >{l.label}</a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="hidden md:flex">
            {isAuthenticated
              ? <Link to="/dashboard" style={{ fontSize: 13, fontWeight: 500, color: L.textSub, textDecoration: 'none', padding: '6px 12px', borderRadius: 6 }}>Dashboard</Link>
              : <button onClick={login} style={{ fontSize: 13, fontWeight: 500, color: L.textSub, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: 6 }}>Sign in</button>
            }
            <button id="nav-cta-github" onClick={login}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: L.btnPrimary, color: L.btnPrimaryText, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '8px 18px', borderRadius: 8, letterSpacing: '0.01em', transition: 'opacity 0.2s, transform 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <GithubIcon className="h-4 w-4" />
              Analyze a repository
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            style={{ display: 'none', padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: L.text, borderRadius: 6 }}
            className="flex md:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'fixed', top: 56, left: 0, right: 0, zIndex: 49, background: 'rgba(235,232,227,0.97)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${L.border}`, padding: '12px 16px 20px' }}
            className="md:hidden"
          >
            {navLinks.map(l => (
              <a key={l.label} href={l.href} onClick={e => handleNav(e, l.href)}
                style={{ display: 'block', padding: '12px 8px', fontSize: 15, fontWeight: 500, color: L.text, textDecoration: 'none', borderBottom: `1px solid ${L.border}` }}
              >{l.label}</a>
            ))}
            <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {isAuthenticated && <Link to="/dashboard" onClick={() => setMenuOpen(false)} style={{ fontSize: 14, color: L.textSub, textDecoration: 'none', padding: '8px 0' }}>View dashboard →</Link>}
              <button id="mobile-cta-github" onClick={() => { setMenuOpen(false); login(); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: L.btnPrimary, color: L.btnPrimaryText, border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600, padding: '13px 20px', borderRadius: 10 }}
              >
                <GithubIcon className="h-4 w-4" />
                Analyze a repository
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
