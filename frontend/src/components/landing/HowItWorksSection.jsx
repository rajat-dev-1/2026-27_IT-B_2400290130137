import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, GitBranch, Lightbulb, FileSearch } from 'lucide-react';
import { cn } from '../../utils/cn';
import GithubIcon from '../ui/GithubIcon';
import Reveal from './Reveal';

const L = {
  bg: '#141210',
  bgCard: '#1E1B17',
  bgCardActive: '#272320',
  text: '#F5F3EF',
  textSub: '#B0A99F',
  textMuted: '#6A6259',
  border: 'rgba(245,243,239,0.08)',
  borderActive: 'rgba(76,158,106,0.40)',
  accent: '#4C9E6A',
  accentSoft: 'rgba(76,158,106,0.12)',
  warning: '#DBA24A',
  critical: '#E8705A',
  info: '#68A4C4',
};

const steps = [
  {
    num: '01',
    icon: GithubIcon,
    title: 'Connect GitHub',
    desc: 'Authorize read-only repository access. OAuth tokens are encrypted server-side; write permissions are never requested.',
    sub: 'OAuth 2.0 · Read-only access · Server-side encryption',
    visual: (
      <div style={{ width: '100%', maxWidth: 220, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: L.bg, border: `1px solid ${L.border}`, borderRadius: 10, padding: '10px 14px' }}>
          <GithubIcon className="h-5 w-5" style={{ color: L.text, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: L.text }}>Connected</div>
            <div style={{ fontSize: 10.5, fontFamily: 'monospace', color: L.textMuted }}>@your-username</div>
          </div>
          <div style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', background: L.accent, flexShrink: 0 }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, textAlign: 'center', padding: '5px 8px', borderRadius: 6, border: `1px solid ${L.border}`, fontSize: 10, fontFamily: 'monospace', color: L.textMuted, background: L.bg }}>repo</div>
          <div style={{ flex: 1, textAlign: 'center', padding: '5px 8px', borderRadius: 6, border: `1px solid ${L.borderActive}`, fontSize: 10, fontFamily: 'monospace', color: L.accent, background: L.accentSoft }}>read:user</div>
        </div>
      </div>
    ),
  },
  {
    num: '02',
    icon: FileSearch,
    title: 'Select a repository',
    desc: 'Choose any public or private JavaScript or TypeScript repository you maintain.',
    sub: 'JS & TS · Private repos · Branch selection',
    visual: (
      <div style={{ width: '100%', maxWidth: 220, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          { name: 'codehealth-demo', active: true },
          { name: 'my-api-server', active: false },
          { name: 'frontend-app', active: false },
        ].map(r => (
          <div key={r.name} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', borderRadius: 8,
            border: `1px solid ${r.active ? L.borderActive : L.border}`,
            background: r.active ? L.accentSoft : 'transparent',
            fontSize: 11, fontFamily: 'monospace',
            color: r.active ? L.accent : L.textMuted,
          }}>
            <GitBranch size={11} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, truncate: true }}>{r.name}</span>
            {r.active && <CheckCircle2 size={12} style={{ color: L.accent, flexShrink: 0 }} />}
          </div>
        ))}
      </div>
    ),
  },
  {
    num: '03',
    icon: Loader2,
    title: 'Run a health scan',
    desc: 'The analysis runs in the background, so you can keep moving while your report is prepared.',
    sub: 'Asynchronous scan · Zero browser slowdown',
    visual: (
      <div style={{ width: '100%', maxWidth: 220, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 500, color: L.textSub }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Loader2 size={11} style={{ animation: 'spin 1s linear infinite', color: L.accent }} />
            Analyzing…
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: 11 }}>68%</span>
        </div>
        <div style={{ height: 4, background: L.border, borderRadius: 2, overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', background: L.accent, borderRadius: 2 }}
            animate={{ width: ['8%', '68%', '8%'] }}
            transition={{ duration: 4.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.8 }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {['Files: 86', 'Analyzed: 58', 'Hotspots: 3', 'Queue: 0'].map(s => (
            <div key={s} style={{ padding: '5px 9px', background: L.bg, border: `1px solid ${L.border}`, borderRadius: 6, fontSize: 10, fontFamily: 'monospace', color: L.textMuted }}>{s}</div>
          ))}
        </div>
      </div>
    ),
  },
  {
    num: '04',
    icon: Lightbulb,
    title: 'Prioritize fixes',
    desc: 'Review a 0–100 health score with AI explanations reserved strictly for high-impact bottlenecks.',
    sub: 'Deterministic scoring · Impact prioritization',
    visual: (
      <div style={{ width: '100%', maxWidth: 220, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: L.textMuted, fontFamily: 'monospace' }}>Health score</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: L.accent }}>78 / 100</span>
        </div>
        {[
          { label: 'Simplify auth flow', priority: 'high', color: L.critical },
          { label: 'Consolidate validators', priority: 'medium', color: L.warning },
          { label: 'Remove unused export', priority: 'low', color: L.info },
        ].map(r => (
          <div key={r.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 10px', background: L.bg, border: `1px solid ${L.border}`, borderRadius: 8 }}>
            <CheckCircle2 size={12} style={{ color: r.color, flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: L.text }}>{r.label}</div>
              <div style={{ fontSize: 9.5, fontFamily: 'monospace', color: r.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{r.priority}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

export default function HowItWorksSection() {
  const [active, setActive] = useState(0);

  return (
    <section id="how-it-works" style={{ background: L.bg, padding: '96px 0', overflow: 'hidden', borderTop: '1px solid rgba(245,243,239,0.06)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>

        {/* Heading */}
        <Reveal>
          <div style={{ marginBottom: 64, maxWidth: 640 }}>
            <p style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: L.accent, fontWeight: 700, marginBottom: 20 }}>
              The Four-Step Workflow
            </p>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.4rem)', fontWeight: 800, color: L.text, lineHeight: 1.06, letterSpacing: '-0.025em', textTransform: 'uppercase', margin: '0 0 16px' }}>
              From repository<br />to clear next steps.
            </h2>
            <p style={{ fontSize: 16, color: L.textSub, lineHeight: 1.65, margin: 0 }}>
              Connect your repository and get an actionable health assessment without disrupting your workflow.
            </p>
          </div>
        </Reveal>

        {/* Step cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {steps.map((step, i) => (
            <Reveal key={step.num} delay={i * 0.09}>
              <button
                onClick={() => setActive(i)}
                style={{
                  width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column',
                  padding: 24, borderRadius: 16, cursor: 'pointer',
                  border: `1.5px solid ${active === i ? L.borderActive : L.border}`,
                  background: active === i ? L.bgCardActive : L.bgCard,
                  boxShadow: active === i ? '0 4px 24px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.25s ease',
                }}
                aria-pressed={active === i}
              >
                {/* Number + Icon */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    border: `1.5px solid ${active === i ? L.accent : L.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'monospace', fontSize: 13, fontWeight: 700,
                    color: active === i ? L.accent : L.textMuted,
                    background: active === i ? L.accentSoft : 'transparent',
                    transition: 'all 0.25s ease',
                  }}>
                    {step.num}
                  </div>
                  <step.icon size={16} style={{ color: active === i ? L.accent : L.textMuted, transition: 'color 0.25s' }} />
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 700, color: L.text, margin: '0 0 10px', letterSpacing: '-0.01em' }}>{step.title}</h3>
                <p style={{ fontSize: 13, color: L.textSub, lineHeight: 1.6, margin: '0 0 20px', flex: 1 }}>{step.desc}</p>

                {/* Mini visual */}
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 16, borderTop: `1px solid ${L.border}`, opacity: active === i ? 1 : 0.6, transition: 'opacity 0.25s' }}>
                  {step.visual}
                </div>

                <div style={{ marginTop: 12, fontSize: 10, fontFamily: 'monospace', color: L.textMuted, letterSpacing: '0.03em' }}>{step.sub}</div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
