import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Copy,
  FileX2,
  Boxes,
  BarChart3,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Terminal,
  Lock,
  Layers,
  Zap,
} from 'lucide-react';
import Reveal from './Reveal';

/* ─────────────────────────────────────────────────────────────────────────────
   Design Tokens
───────────────────────────────────────────────────────────────────────────── */
const L = {
  // Page container
  bg: '#EBE8E3',
  bgCard: '#F5F2EB',
  bgCardHover: '#FAF8F4',
  bgCardActive: '#FFFFFF',

  // Terminal / Studio Dark Theme for the Inspector Window
  consoleBg: '#0D120F',
  consoleBgSubtle: '#141A16',
  consoleBgCard: '#1A231D',
  consoleCardInner: '#121814',
  consoleBorder: 'rgba(255,255,255,0.08)',
  consoleBorderSubtle: 'rgba(255,255,255,0.05)',
  consoleText: '#F5F8F5',
  consoleTextSub: '#A2B4A7',
  consoleTextMuted: '#687D6F',

  // Section typography & borders
  text: '#171B18',
  textSub: '#5A635C',
  textMuted: '#8A958C',
  border: 'rgba(23,27,24,0.10)',
  borderLight: 'rgba(23,27,24,0.06)',

  // Signature lens accent colors
  emerald: '#2D6A48',
  emeraldBright: '#3CA56B',
  emeraldSoft: 'rgba(45,106,72,0.12)',
  emeraldGlow: 'rgba(60,165,107,0.22)',

  amber: '#C27A23',
  amberBright: '#E09228',
  amberSoft: 'rgba(194,122,35,0.12)',
  amberGlow: 'rgba(224,146,40,0.22)',

  cyan: '#2574A9',
  cyanBright: '#3A92CC',
  cyanSoft: 'rgba(37,116,169,0.12)',
  cyanGlow: 'rgba(58,146,204,0.22)',

  purple: '#7A45BD',
  purpleBright: '#9B5DE5',
  purpleSoft: 'rgba(122,69,189,0.12)',
  purpleGlow: 'rgba(155,93,229,0.25)',

  red: '#C43D2E',
  redBright: '#E05341',
  redSoft: 'rgba(196,61,46,0.12)',
  redGlow: 'rgba(224,83,65,0.22)',
};

/* ─────────────────────────────────────────────────────────────────────────────
   Micro-Visual Components for each Lens
───────────────────────────────────────────────────────────────────────────── */

function ComplexityVisual() {
  const items = [
    {
      file: 'auth/permissions.ts',
      fn: 'evaluateRoleAccess()',
      line: 'L42–88',
      cc: 24,
      severity: 'Critical Threshold',
      badgeColor: L.redBright,
      badgeBg: L.redSoft,
      barColor: 'linear-gradient(90deg, #C43D2E 0%, #E05341 100%)',
      pct: 86,
      branches: 14,
      nesting: 5,
    },
    {
      file: 'api/router.js',
      fn: 'dispatchMiddleware()',
      line: 'L118–154',
      cc: 15,
      severity: 'Elevated Warning',
      badgeColor: L.amberBright,
      badgeBg: L.amberSoft,
      barColor: 'linear-gradient(90deg, #C27A23 0%, #E09228 100%)',
      pct: 54,
      branches: 8,
      nesting: 3,
    },
    {
      file: 'utils/helpers.js',
      fn: 'sanitizePayload()',
      line: 'L29–45',
      cc: 6,
      severity: 'Healthy / Optimal',
      badgeColor: L.emeraldBright,
      badgeBg: L.emeraldSoft,
      barColor: 'linear-gradient(90deg, #2D6A48 0%, #3CA56B 100%)',
      pct: 22,
      branches: 3,
      nesting: 1,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Top summary strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          padding: '10px 14px',
          background: L.consoleCardInner,
          borderRadius: 8,
          border: `1px solid ${L.consoleBorderSubtle}`,
          fontSize: 11,
          fontFamily: 'monospace',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: L.consoleTextSub }}>
          <Activity size={13} style={{ color: L.emeraldBright }} />
          <span>Scanner: McCabe Cyclomatic AST</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: L.consoleTextMuted }}>Threshold: CC &gt; 10</span>
          <span
            style={{
              padding: '2px 7px',
              borderRadius: 4,
              background: 'rgba(224,83,65,0.15)',
              color: L.redBright,
              fontWeight: 700,
              fontSize: 10,
            }}
          >
            1 Flagged
          </span>
        </div>
      </div>

      {/* Function Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((item) => (
          <div
            key={item.file}
            style={{
              background: L.consoleBgCard,
              borderRadius: 10,
              border: `1px solid ${item.cc >= 20 ? 'rgba(224,83,65,0.3)' : L.consoleBorder}`,
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: item.badgeColor,
                    boxShadow: `0 0 8px ${item.badgeColor}`,
                  }}
                />
                <div>
                  <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 600, color: L.consoleText }}>
                    {item.file}
                  </span>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: L.consoleTextMuted, marginLeft: 8 }}>
                    {item.fn} · {item.line}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: 'monospace',
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: item.badgeBg,
                    color: item.badgeColor,
                    fontWeight: 600,
                  }}
                >
                  {item.severity}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    color: item.badgeColor,
                    letterSpacing: '0.04em',
                  }}
                >
                  CC {item.cc}
                </span>
              </div>
            </div>

            {/* Gauge bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  flex: 1,
                  height: 6,
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: 4,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${item.pct}%`,
                    background: item.barColor,
                    borderRadius: 4,
                  }}
                />
              </div>
              <span style={{ fontSize: 10, fontFamily: 'monospace', color: L.consoleTextMuted, width: 90, textAlign: 'right' }}>
                {item.branches} branches · D{item.nesting}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer stat */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 11,
          color: L.consoleTextMuted,
          padding: '2px 4px',
        }}
      >
        <span>Scanned 148 functions across 24 files</span>
        <span>Average Cyclomatic Complexity: <strong style={{ color: L.consoleTextSub }}>3.4</strong></span>
      </div>
    </div>
  );
}

function DuplicateVisual() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          padding: '10px 14px',
          background: 'rgba(224,146,40,0.08)',
          borderRadius: 8,
          border: '1px solid rgba(224,146,40,0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={14} style={{ color: L.amberBright }} />
          <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: L.amberBright }}>
            Pattern A Detected · 18 Lines Identical
          </span>
        </div>
        <span
          style={{
            fontSize: 10,
            fontFamily: 'monospace',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 4,
            background: 'rgba(224,146,40,0.18)',
            color: L.amberBright,
          }}
        >
          98.6% AST Token Match
        </span>
      </div>

      {/* Split comparison */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 12,
        }}
      >
        {/* File 1 */}
        <div
          style={{
            background: L.consoleBgCard,
            border: '1px solid rgba(224,146,40,0.25)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 12px',
              background: 'rgba(0,0,0,0.25)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              fontSize: 11,
              fontFamily: 'monospace',
            }}
          >
            <span style={{ color: L.consoleText }}>utils/validator.js</span>
            <span style={{ color: L.amberBright, fontSize: 10 }}>Lines 42–60</span>
          </div>
          <div
            style={{
              padding: '10px 12px',
              fontFamily: 'monospace',
              fontSize: 11,
              lineHeight: 1.6,
              color: L.consoleTextSub,
              background: L.consoleCardInner,
            }}
          >
            <div><span style={{ color: L.consoleTextMuted }}>42</span>  <span style={{ color: '#E09228' }}>if</span> (!payload?.sub || !payload?.exp) &#123;</div>
            <div><span style={{ color: L.consoleTextMuted }}>43</span>    <span style={{ color: '#E09228' }}>throw new</span> AuthError(<span style={{ color: '#88C0D0' }}>&apos;Invalid&apos;</span>);</div>
            <div><span style={{ color: L.consoleTextMuted }}>44</span>  &#125;</div>
            <div><span style={{ color: L.consoleTextMuted }}>45</span>  <span style={{ color: '#A3BE8C' }}>// Token expiration logic</span></div>
            <div><span style={{ color: L.consoleTextMuted }}>46</span>  <span style={{ color: '#E09228' }}>return</span> verifySignature(payload.raw);</div>
          </div>
        </div>

        {/* File 2 */}
        <div
          style={{
            background: L.consoleBgCard,
            border: '1px solid rgba(224,146,40,0.25)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 12px',
              background: 'rgba(0,0,0,0.25)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              fontSize: 11,
              fontFamily: 'monospace',
            }}
          >
            <span style={{ color: L.consoleText }}>api/validate.js</span>
            <span style={{ color: L.amberBright, fontSize: 10 }}>Lines 18–36</span>
          </div>
          <div
            style={{
              padding: '10px 12px',
              fontFamily: 'monospace',
              fontSize: 11,
              lineHeight: 1.6,
              color: L.consoleTextSub,
              background: L.consoleCardInner,
            }}
          >
            <div><span style={{ color: L.consoleTextMuted }}>18</span>  <span style={{ color: '#E09228' }}>if</span> (!payload?.sub || !payload?.exp) &#123;</div>
            <div><span style={{ color: L.consoleTextMuted }}>19</span>    <span style={{ color: '#E09228' }}>throw new</span> AuthError(<span style={{ color: '#88C0D0' }}>&apos;Invalid&apos;</span>);</div>
            <div><span style={{ color: L.consoleTextMuted }}>20</span>  &#125;</div>
            <div><span style={{ color: L.consoleTextMuted }}>21</span>  <span style={{ color: '#A3BE8C' }}>// Token expiration logic</span></div>
            <div><span style={{ color: L.consoleTextMuted }}>22</span>  <span style={{ color: '#E09228' }}>return</span> verifySignature(payload.raw);</div>
          </div>
        </div>
      </div>

      {/* Suggested Fix */}
      <div
        style={{
          padding: '10px 14px',
          background: L.consoleBgCard,
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 11,
        }}
      >
        <Zap size={14} style={{ color: L.amberBright, flexShrink: 0 }} />
        <span style={{ color: L.consoleTextSub }}>
          Consolidation Opportunity: Extract into <strong style={{ color: L.consoleText, fontFamily: 'monospace' }}>shared/authValidator.ts</strong> to eliminate 36 duplicated lines and guard against logic drift.
        </span>
      </div>
    </div>
  );
}

function UnusedVisual() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Target Symbol Card */}
      <div
        style={{
          background: L.consoleBgCard,
          borderRadius: 10,
          border: '1px solid rgba(58,146,204,0.3)',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileX2 size={16} style={{ color: L.cyanBright }} />
            <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: L.cyanBright }}>
              export const formatCurrency
            </span>
          </div>
          <span
            style={{
              fontSize: 10,
              fontFamily: 'monospace',
              padding: '2px 8px',
              borderRadius: 4,
              background: L.cyanSoft,
              color: L.cyanBright,
              fontWeight: 700,
            }}
          >
            0 In-Repo References
          </span>
        </div>

        <div
          style={{
            padding: '8px 12px',
            background: L.consoleCardInner,
            borderRadius: 6,
            fontFamily: 'monospace',
            fontSize: 11,
            color: L.consoleTextSub,
          }}
        >
          src/helpers/format.ts <span style={{ color: L.consoleTextMuted }}>· Line 14 · 28 lines of implementation</span>
        </div>
      </div>

      {/* Reference Graph Simulation */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: 12,
          padding: '14px',
          background: L.consoleCardInner,
          borderRadius: 8,
          border: `1px solid ${L.consoleBorderSubtle}`,
          textAlign: 'center',
          fontSize: 11,
          fontFamily: 'monospace',
        }}
      >
        <div style={{ padding: '8px', background: L.consoleBgCard, borderRadius: 6, border: `1px solid ${L.consoleBorder}` }}>
          <div style={{ color: L.cyanBright, fontWeight: 700 }}>helpers/format.ts</div>
          <div style={{ fontSize: 9.5, color: L.consoleTextMuted }}>Declaration File</div>
        </div>

        <div style={{ color: L.redBright, fontWeight: 700, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: 16 }}>✕</span>
          <span style={{ fontSize: 9 }}>No Imports</span>
        </div>

        <div style={{ padding: '8px', background: L.consoleBgCard, borderRadius: 6, border: `1px solid ${L.consoleBorder}` }}>
          <div style={{ color: L.consoleTextSub, fontWeight: 700 }}>42 Scanned Files</div>
          <div style={{ fontSize: 9.5, color: L.consoleTextMuted }}>Zero Consumers</div>
        </div>
      </div>

      {/* Scope Disclaimer */}
      <div
        style={{
          padding: '9px 12px',
          borderRadius: 6,
          background: 'rgba(58,146,204,0.06)',
          border: '1px solid rgba(58,146,204,0.18)',
          fontSize: 11,
          color: L.consoleTextSub,
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: L.cyanBright }}>Scope Note:</strong> Scoped strictly to scanned project files. Marked &quot;possible&quot; because if this repository is an npm package or library, external consumers cannot be observed.
      </div>
    </div>
  );
}

function DependenciesVisual() {
  const deps = [
    {
      name: 'lodash',
      ver: '4.17.15',
      latest: '4.17.21',
      status: 'SIGNAL: OUTDATED',
      statusColor: L.amberBright,
      statusBg: L.amberSoft,
      statusBorder: 'rgba(224,146,40,0.3)',
      detail: 'Known Prototype Pollution advisory in older minor; patch update available',
    },
    {
      name: 'react',
      ver: '18.3.1',
      latest: '18.3.1',
      status: 'VERIFIED STABLE',
      statusColor: L.emeraldBright,
      statusBg: L.emeraldSoft,
      statusBorder: 'rgba(60,165,107,0.3)',
      detail: 'Up to date · Zero security advisories · All peer dependencies satisfied',
    },
    {
      name: 'express',
      ver: '4.18.0',
      latest: '4.19.2',
      status: 'VERIFIED STABLE',
      statusColor: L.emeraldBright,
      statusBg: L.emeraldSoft,
      statusBorder: 'rgba(60,165,107,0.3)',
      detail: 'Active production LTS branch · Stable core runtime dependency',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {deps.map((d) => (
        <div
          key={d.name}
          style={{
            background: L.consoleBgCard,
            borderRadius: 10,
            border: `1px solid ${d.statusBorder}`,
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Boxes size={15} style={{ color: d.statusColor }} />
              <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: L.consoleText }}>
                {d.name}
              </span>
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: L.consoleTextMuted }}>
                v{d.ver}
              </span>
            </div>

            <span
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                fontFamily: 'monospace',
                padding: '2px 8px',
                borderRadius: 4,
                background: d.statusBg,
                color: d.statusColor,
                border: `1px solid ${d.statusColor}33`,
                letterSpacing: '0.05em',
              }}
            >
              {d.status}
            </span>
          </div>

          <div style={{ fontSize: 11, color: L.consoleTextSub }}>
            {d.detail}
          </div>
        </div>
      ))}

      <div
        style={{
          marginTop: 4,
          padding: '8px 12px',
          background: L.consoleCardInner,
          borderRadius: 6,
          fontSize: 10.5,
          fontFamily: 'monospace',
          color: L.consoleTextMuted,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Lock size={12} />
        <span>Reads package.json &amp; lockfile directly — zero network calls, zero npm audit bloat.</span>
      </div>
    </div>
  );
}

function ScoreVisual() {
  const metrics = [
    { label: 'Complexity', val: 82, weight: '35%', penalty: '-6 pts (auth/permissions.ts CC 24)', color: L.emeraldBright },
    { label: 'Duplication', val: 75, weight: '25%', penalty: '-8 pts (1 clone block detected)', color: L.emeraldBright },
    { label: 'Dependencies', val: 60, weight: '20%', penalty: '-12 pts (outdated lodash minor)', color: L.amberBright },
    { label: 'Dead Code', val: 88, weight: '20%', penalty: '-4 pts (1 unreferenced export)', color: L.emeraldBright },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Big Score Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: L.consoleCardInner,
          borderRadius: 10,
          border: `1px solid ${L.consoleBorderSubtle}`,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'rgba(60,165,107,0.15)',
              border: '1.5px solid rgba(60,165,107,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 800,
              fontFamily: 'monospace',
              color: L.emeraldBright,
            }}
          >
            78
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: L.consoleText }}>
              Composite Health Score: 78 / 100
            </div>
            <div style={{ fontSize: 10.5, fontFamily: 'monospace', color: L.emeraldBright }}>
              Grade: B+ · Mathematically Deterministic
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: 10,
            fontFamily: 'monospace',
            color: L.consoleTextMuted,
            padding: '4px 8px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 4,
          }}
        >
          Formula: ∑(CategoryScore × Weight)
        </div>
      </div>

      {/* Category breakdown bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {metrics.map((m) => (
          <div
            key={m.label}
            style={{
              background: L.consoleBgCard,
              borderRadius: 8,
              border: `1px solid ${L.consoleBorder}`,
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, fontFamily: 'monospace' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, color: L.consoleText }}>{m.label}</span>
                <span style={{ color: L.consoleTextMuted }}>Weight: {m.weight}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, color: L.consoleTextMuted }}>{m.penalty}</span>
                <span style={{ fontWeight: 800, color: m.color, fontSize: 12 }}>{m.val}%</span>
              </div>
            </div>

            <div
              style={{
                height: 5,
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 3,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${m.val}%`,
                  background: m.color,
                  borderRadius: 3,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 10.5, color: L.consoleTextMuted, fontFamily: 'monospace', textAlign: 'center' }}>
        ✓ 100% Traceable: Every point deduction is linked to specific file findings. Zero AI guesswork.
      </div>
    </div>
  );
}

function RecsVisual() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Priority Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(122,69,189,0.14) 0%, rgba(20,28,23,0.9) 100%)',
          borderRadius: 12,
          border: '1px solid rgba(155,93,229,0.35)',
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} style={{ color: L.purpleBright }} />
            <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 800, color: L.purpleBright, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              High-Priority AI Synthesis
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 10,
                fontFamily: 'monospace',
                padding: '2px 8px',
                borderRadius: 4,
                background: 'rgba(155,93,229,0.2)',
                color: L.purpleBright,
                fontWeight: 700,
              }}
            >
              Target: auth/permissions.ts
            </span>
            <span
              style={{
                fontSize: 10,
                fontFamily: 'monospace',
                padding: '2px 8px',
                borderRadius: 4,
                background: L.redSoft,
                color: L.redBright,
                fontWeight: 700,
              }}
            >
              CC 24
            </span>
          </div>
        </div>

        {/* AI Explanation Box */}
        <div
          style={{
            padding: '12px 14px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: 8,
            borderLeft: `3px solid ${L.purpleBright}`,
            fontSize: 12.5,
            color: L.consoleText,
            lineHeight: 1.65,
          }}
        >
          &quot;Multiple nested branching paths make this authorization flow difficult to test exhaustively, raising the risk of permission bypasses under edge-case conditions.&quot;
        </div>

        {/* Suggested Concrete Plan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 10.5, fontFamily: 'monospace', color: L.consoleTextMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Deterministic Improvement Plan
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: L.consoleTextSub }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <span style={{ color: L.purpleBright, fontWeight: 700 }}>1.</span>
              <span>Replace 5 nested switch-cases with a declarative role-permission matrix.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <span style={{ color: L.purpleBright, fontWeight: 700 }}>2.</span>
              <span>Extract token claims validation into an isolated pure function.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <span style={{ color: L.purpleBright, fontWeight: 700 }}>3.</span>
              <span>Est. time to refactor: <strong style={{ color: L.consoleText }}>1–2 hours</strong> · Risk reduction: High.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scoping notice */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: L.consoleCardInner,
          borderRadius: 6,
          fontSize: 10.5,
          fontFamily: 'monospace',
          color: L.consoleTextMuted,
        }}
      >
        <Lock size={12} style={{ color: L.purpleBright }} />
        <span>Context Isolation: AI receives only the flagged AST snippet (62 tokens). Full repo is never shared.</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Capabilities Registry
───────────────────────────────────────────────────────────────────────────── */
const caps = [
  {
    id: 'complexity',
    num: '01',
    tag: 'Core',
    tagColor: L.emeraldBright,
    tagBg: L.emeraldSoft,
    tagBorder: 'rgba(60,165,107,0.3)',
    icon: Activity,
    label: 'Complexity Analysis',
    summary: 'Branch depth & cyclomatic threshold scanner',
    desc: 'Detect functions that exceed cyclomatic complexity thresholds, making them difficult to understand, test, and maintain.',
    note: 'Deterministic cyclomatic complexity scoring. No AI in the score.',
    statBadge: 'Threshold: CC > 10',
    visual: <ComplexityVisual />,
  },
  {
    id: 'duplicate',
    num: '02',
    tag: 'Core',
    tagColor: L.amberBright,
    tagBg: L.amberSoft,
    tagBorder: 'rgba(224,146,40,0.3)',
    icon: Copy,
    label: 'Duplicate-Code Detection',
    summary: 'AST token similarity & clone clusters',
    desc: 'Surface repeated logic so it can be consolidated intentionally, reducing maintenance burden and inconsistency risk.',
    note: 'Token-based fingerprinting across all scanned JS/TS files.',
    statBadge: 'AST Token Hash',
    visual: <DuplicateVisual />,
  },
  {
    id: 'unused',
    num: '03',
    tag: 'Static',
    tagColor: L.cyanBright,
    tagBg: L.cyanSoft,
    tagBorder: 'rgba(58,146,204,0.3)',
    icon: FileX2,
    label: 'Possible Unused Exports',
    summary: 'Zero-reference symbol & dead code graph',
    desc: 'Highlight exports not referenced by any scanned file. Marked "possible" because external consumers are not analyzed.',
    note: 'Scoped to the selected repository — external consumers out of scope.',
    statBadge: 'Repo Reference Graph',
    visual: <UnusedVisual />,
  },
  {
    id: 'deps',
    num: '04',
    tag: 'Signals',
    tagColor: L.amberBright,
    tagBg: L.amberSoft,
    tagBorder: 'rgba(224,146,40,0.3)',
    icon: Boxes,
    label: 'Dependency Analysis',
    summary: 'Manifest versions, risk signals & drift',
    desc: 'Identify package versions and dependency signals. Understand which dependencies may warrant attention.',
    note: 'Reads package.json — no network requests, no npm audit.',
    statBadge: 'Manifest Local Parse',
    visual: <DependenciesVisual />,
  },
  {
    id: 'score',
    num: '05',
    tag: 'Deterministic',
    tagColor: L.emeraldBright,
    tagBg: L.emeraldSoft,
    tagBorder: 'rgba(60,165,107,0.3)',
    icon: BarChart3,
    label: 'Explainable Health Score',
    summary: 'Weighted mathematical metric calculation',
    desc: 'Show deterministic category scoring. Every number is traceable to specific file findings — no unexplained AI judgment.',
    note: 'Scores are computed from static analysis results — fully transparent.',
    statBadge: 'Formula: ∑(W × Score)',
    visual: <ScoreVisual />,
  },
  {
    id: 'recs',
    num: '06',
    tag: 'AI-explained',
    tagColor: L.purpleBright,
    tagBg: L.purpleSoft,
    tagBorder: 'rgba(155,93,229,0.3)',
    icon: Sparkles,
    label: 'Prioritized Recommendations',
    summary: 'Isolated LLM synthesis for top blockers',
    desc: 'Turn technical findings into an ordered improvement plan. AI explanations are generated only for the most important issues.',
    note: 'AI receives minimal context — specific issue data, not the full repository.',
    statBadge: 'Context-Isolated AI',
    visual: <RecsVisual />,
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────────────────────── */
export default function AnalysisCapabilities() {
  const [active, setActive] = useState('complexity');
  const item = caps.find((c) => c.id === active) || caps[0];

  return (
    <section id="analysis" style={{ background: L.bg, padding: '104px 0 112px', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        {/* Section Header */}
        <Reveal>
          <div style={{ marginBottom: 44, maxWidth: 680 }}>
            {/* Top pill with pulsing radar dot */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 20,
                background: 'rgba(45,106,72,0.08)',
                border: '1px solid rgba(45,106,72,0.22)',
                marginBottom: 16,
              }}
            >
              <span style={{ position: 'relative', display: 'flex', height: 8, width: 8 }}>
                <span
                  style={{
                    position: 'absolute',
                    display: 'inline-flex',
                    height: '100%',
                    width: '100%',
                    borderRadius: '50%',
                    background: L.emeraldBright,
                    opacity: 0.75,
                    animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                  }}
                />
                <span
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    borderRadius: '50%',
                    height: 8,
                    width: 8,
                    background: L.emerald,
                  }}
                />
              </span>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: 11,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: L.emerald,
                  fontWeight: 700,
                }}
              >
                Deterministic Code Intelligence
              </span>
            </div>

            {/* Main Title */}
            <h2
              style={{
                fontSize: 'clamp(2.2rem, 4.2vw, 3.6rem)',
                fontWeight: 800,
                color: L.text,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                margin: '0 0 16px',
              }}
            >
              Six lenses on<br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #171B18 0%, #2D6A48 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                your codebase.
              </span>
            </h2>

            {/* Subtitle */}
            <p style={{ fontSize: 16, color: L.textSub, lineHeight: 1.65, margin: '0 0 20px' }}>
              Each module surfaces specific code health indicators. Category scores are 100% deterministic—no AI hallucination in the metrics.
            </p>

            {/* Architecture Assurance Banner */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 16px',
                borderRadius: 10,
                background: '#E1DDD4',
                border: '1px solid rgba(23,27,24,0.12)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <ShieldCheck size={16} style={{ color: L.emerald }} />
              <span style={{ fontSize: 12, fontFamily: 'monospace', color: L.emerald, fontWeight: 700 }}>
                Scores come from deterministic analysis. AI explains selected high-priority findings only.
              </span>
            </div>
          </div>
        </Reveal>

        {/* 2-Column Command Workspace */}
        <Reveal delay={0.1}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 24,
              alignItems: 'start',
            }}
          >
            {/* Left Column: 6 Interactive Lens Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {caps.map((cap) => {
                const isSelected = active === cap.id;
                const IconComponent = cap.icon;

                return (
                  <button
                    key={cap.id}
                    onClick={() => setActive(cap.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 18px',
                      borderRadius: 12,
                      border: `1.5px solid ${isSelected ? cap.tagColor : 'rgba(23,27,24,0.08)'}`,
                      background: isSelected ? L.bgCardActive : L.bgCard,
                      boxShadow: isSelected
                        ? `0 10px 24px -6px rgba(0,0,0,0.08), 0 0 0 1px ${cap.tagColor}22`
                        : '0 2px 6px rgba(0,0,0,0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = L.bgCardHover;
                        e.currentTarget.style.borderColor = 'rgba(23,27,24,0.18)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = L.bgCard;
                        e.currentTarget.style.borderColor = 'rgba(23,27,24,0.08)';
                      }
                    }}
                    aria-pressed={isSelected}
                  >
                    {/* Active accent bar on left */}
                    {isSelected && (
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: 4,
                          background: cap.tagColor,
                        }}
                      />
                    )}

                    {/* Icon Badge */}
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: isSelected ? cap.tagBg : 'rgba(23,27,24,0.05)',
                        border: `1px solid ${isSelected ? cap.tagBorder : 'transparent'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isSelected ? cap.tagColor : L.textMuted,
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <IconComponent size={19} />
                    </div>

                    {/* Texts */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span
                          style={{
                            fontSize: 9.5,
                            fontWeight: 700,
                            padding: '1.5px 6px',
                            borderRadius: 4,
                            border: `1px solid ${cap.tagBorder}`,
                            background: cap.tagBg,
                            color: cap.tagColor,
                            textTransform: 'uppercase',
                            letterSpacing: '0.07em',
                            flexShrink: 0,
                          }}
                        >
                          {cap.tag}
                        </span>
                        <span style={{ fontSize: 10, fontFamily: 'monospace', color: L.textMuted }}>
                          Lens {cap.num}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: isSelected ? L.text : L.textSub,
                          letterSpacing: '-0.015em',
                          lineHeight: 1.3,
                        }}
                      >
                        {cap.label}
                      </div>

                      <div
                        style={{
                          fontSize: 11,
                          color: isSelected ? L.textSub : L.textMuted,
                          marginTop: 2,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {cap.summary}
                      </div>
                    </div>

                    {/* Chevron Indicator */}
                    <ChevronRight
                      size={16}
                      style={{
                        color: isSelected ? cap.tagColor : 'rgba(23,27,24,0.2)',
                        transform: isSelected ? 'translateX(2px)' : 'translateX(0)',
                        transition: 'all 0.2s ease',
                        flexShrink: 0,
                      }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Right Column: High-Precision Inspector Studio Window */}
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  background: L.consoleBg,
                  borderRadius: 18,
                  border: '1.5px solid rgba(255,255,255,0.10)',
                  boxShadow: '0 24px 50px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Console Titlebar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 18px',
                    background: L.consoleBgSubtle,
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    fontSize: 11,
                    fontFamily: 'monospace',
                  }}
                >
                  {/* Traffic lights */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F56' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27C93F' }} />
                  </div>

                  {/* Active lens path */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: L.consoleTextSub }}>
                    <Terminal size={12} style={{ color: item.tagColor }} />
                    <span>lens://engine/inspect/{item.id}.ast</span>
                  </div>

                  {/* Mode badge */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: 'rgba(255,255,255,0.05)',
                      color: L.consoleTextMuted,
                      fontSize: 10,
                    }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: item.tagColor }} />
                    <span>Deterministic</span>
                  </div>
                </div>

                {/* Animated Body */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                    style={{ padding: '28px 30px', display: 'flex', flexDirection: 'column', gap: 20 }}
                  >
                    {/* Header info */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: 6,
                            border: `1px solid ${item.tagBorder}`,
                            background: item.tagBg,
                            color: item.tagColor,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                          }}
                        >
                          {item.tag}
                        </span>

                        <h3 style={{ fontSize: 22, fontWeight: 700, color: L.consoleText, margin: 0, letterSpacing: '-0.02em' }}>
                          {item.label}
                        </h3>

                        <span
                          style={{
                            marginLeft: 'auto',
                            fontSize: 11,
                            fontFamily: 'monospace',
                            color: L.consoleTextMuted,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: 'rgba(255,255,255,0.05)',
                          }}
                        >
                          {item.statBadge}
                        </span>
                      </div>

                      <p style={{ fontSize: 14.5, color: L.consoleTextSub, lineHeight: 1.65, margin: 0 }}>
                        {item.desc}
                      </p>
                    </div>

                    {/* Visual Sandbox Container */}
                    <div
                      style={{
                        background: L.consoleBgSubtle,
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 14,
                        padding: 18,
                      }}
                    >
                      {item.visual}
                    </div>

                    {/* Bottom Architectural Guarantee */}
                    <div
                      style={{
                        paddingTop: 16,
                        borderTop: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ShieldCheck size={14} style={{ color: item.tagColor, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, fontFamily: 'monospace', color: L.consoleTextMuted }}>
                          {item.note}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 10, fontFamily: 'monospace', color: L.consoleTextMuted }}>
                          Lens {item.num} of 06
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
