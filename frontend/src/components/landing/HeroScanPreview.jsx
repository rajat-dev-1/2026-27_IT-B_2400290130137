import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const SCAN_STAGES = [
  { id: 'repo', label: 'Repository selected', detail: 'codehealth-demo / main', done: true, ms: 0 },
  { id: 'queue', label: 'Scan queued', detail: 'Worker picked up job', done: false, ms: 800 },
  { id: 'tree', label: 'Repository tree discovered', detail: '86 files · 12 dirs', done: false, ms: 1800 },
  { id: 'analyze', label: 'Files analyzed', detail: '82 / 86 supported files', done: false, ms: 3000 },
  { id: 'complexity', label: 'Complexity hotspot found', detail: 'auth/permissions.ts · CC 24', done: false, ms: 4200 },
  { id: 'duplicate', label: 'Duplicate pattern detected', detail: 'utils/validator.js ↔ api/validate.js', done: false, ms: 5200 },
  { id: 'unused', label: 'Possible unused export', detail: 'helpers/format.ts · formatCurrency', done: false, ms: 6100 },
  { id: 'score', label: 'Health score calculated', detail: 'Overall: 78 / 100', done: false, ms: 7200 },
  { id: 'recs', label: 'Recommendations ready', detail: '9 prioritized · 3 high priority', done: false, ms: 8200 },
];

const LOOP_DELAY = 11000;

export default function HeroScanPreview() {
  const [activeStages, setActiveStages] = useState([SCAN_STAGES[0]]);
  const [scoreVisible, setScoreVisible] = useState(false);
  const [scoreVal, setScoreVal] = useState(0);
  const [progress, setProgress] = useState(8);
  const timerRefs = useRef([]);
  const loopRef = useRef(null);

  const runAnimation = () => {
    // Clear previous
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
    setActiveStages([SCAN_STAGES[0]]);
    setScoreVisible(false);
    setScoreVal(0);
    setProgress(8);

    SCAN_STAGES.forEach((stage, i) => {
      if (i === 0) return;
      const t = setTimeout(() => {
        setActiveStages(prev => [...prev, stage]);
        setProgress(Math.round(((i + 1) / SCAN_STAGES.length) * 100));
        if (stage.id === 'score') {
          setScoreVisible(true);
          // Animate score from 0 to 78
          let val = 0;
          const scoreTimer = setInterval(() => {
            val += 3;
            if (val >= 78) { val = 78; clearInterval(scoreTimer); }
            setScoreVal(val);
          }, 30);
        }
      }, stage.ms);
      timerRefs.current.push(t);
    });
  };

  useEffect(() => {
    runAnimation();
    loopRef.current = setInterval(runAnimation, LOOP_DELAY);
    return () => {
      timerRefs.current.forEach(clearTimeout);
      clearInterval(loopRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDone = activeStages.length >= SCAN_STAGES.length;

  return (
    <div className="relative w-full max-w-lg mx-auto select-none">
      {/* Label */}
      <div className="text-[10px] font-mono text-muted/70 uppercase tracking-widest mb-3 text-center">
        Sample analysis preview
      </div>

      {/* Main panel */}
      <div className="bg-slate/80 border border-border/80 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-pine/60 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-critical/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-warning/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-primary/70" />
            </div>
            <span className="text-xs font-mono text-muted ml-2">CodeHealth AI — Scan</span>
          </div>
          <div className={cn(
            'text-[10px] font-mono px-2 py-0.5 rounded-full border transition-all duration-500',
            isDone
              ? 'text-primary border-primary/40 bg-primary/10'
              : 'text-warning border-warning/40 bg-warning/10'
          )}>
            {isDone ? '✓ Complete' : '● Running'}
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-muted font-mono">Analysis progress</span>
            <span className="text-[10px] text-sage font-mono">{progress}%</span>
          </div>
          <div className="h-1 bg-pine rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: '8%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Scan log */}
        <div className="px-4 py-3 space-y-1.5 min-h-[200px]">
          {activeStages.map((stage, i) => (
            <motion.div
              key={`${stage.id}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex items-start gap-2.5"
            >
              <div className={cn(
                'mt-0.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 text-[8px]',
                i === activeStages.length - 1 && !isDone
                  ? 'border-warning/60 bg-warning/10 text-warning animate-pulse'
                  : 'border-primary/50 bg-primary/10 text-primary'
              )}>
                {i === activeStages.length - 1 && !isDone ? '●' : '✓'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-ivory leading-tight">{stage.label}</div>
                <div className="text-[10px] text-muted font-mono mt-0.5 truncate">{stage.detail}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Score panel - appears after score stage */}
        <AnimatedScorePanel visible={scoreVisible} score={scoreVal} />

        {/* Issue cards - appear after recs */}
        <AnimatedIssueCards visible={activeStages.some(s => s.id === 'recs')} />
      </div>
    </div>
  );
}

function AnimatedScorePanel({ visible, score }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: visible ? 1 : 0, height: visible ? 'auto' : 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="overflow-hidden border-t border-border/50"
    >
      <div className="px-4 py-3 flex items-center gap-4">
        {/* Score ring mini */}
        <div className="relative flex-shrink-0">
          <svg width="52" height="52" viewBox="0 0 52 52" className="-rotate-90">
            <circle cx="26" cy="26" r="21" fill="none" stroke="#23342B" strokeWidth="4" />
            <motion.circle
              cx="26" cy="26" r="21" fill="none" stroke="#68B984" strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="131.9"
              initial={{ strokeDashoffset: 131.9 }}
              animate={{ strokeDashoffset: visible ? 131.9 * (1 - score / 100) : 131.9 }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-ivory rotate-90">{score}</span>
          </div>
        </div>

        <div className="flex-1">
          <div className="text-xs font-semibold text-ivory mb-1.5">Health Score</div>
          <div className="space-y-1">
            {[
              { label: 'Complexity', pct: 82, color: 'bg-primary' },
              { label: 'Duplication', pct: 75, color: 'bg-primary' },
              { label: 'Dependencies', pct: 60, color: 'bg-warning' },
            ].map(({ label, pct, color }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-[9px] text-muted w-20 font-mono">{label}</span>
                <div className="flex-1 h-1 bg-pine rounded-full overflow-hidden">
                  <motion.div
                    className={cn('h-full rounded-full', color)}
                    initial={{ width: 0 }}
                    animate={{ width: visible ? `${pct}%` : 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
                  />
                </div>
                <span className="text-[9px] text-sage font-mono w-6">{pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AnimatedIssueCards({ visible }) {
  const issues = [
    { type: 'complexity', label: 'auth/permissions.ts', desc: 'Cyclomatic complexity 24', color: 'text-critical', dot: 'bg-critical' },
    { type: 'duplicate', label: 'utils/validator.js', desc: 'Possible duplicate block', color: 'text-warning', dot: 'bg-warning' },
    { type: 'unused', label: 'helpers/format.ts', desc: 'Possible unused export', color: 'text-info', dot: 'bg-info' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: visible ? 1 : 0, height: visible ? 'auto' : 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
      className="overflow-hidden border-t border-border/50"
    >
      <div className="px-4 py-3">
        <div className="text-[10px] text-muted font-mono mb-2 uppercase tracking-wider">Prioritized issues</div>
        <div className="space-y-1.5">
          {issues.map((issue, i) => (
            <motion.div
              key={issue.type}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -6 }}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-2 py-1.5 px-2 rounded-md bg-pine/50 border border-border/30"
            >
              <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', issue.dot)} />
              <span className="text-[10px] font-mono text-sage flex-1 truncate">{issue.label}</span>
              <span className={cn('text-[9px] font-medium', issue.color)}>{issue.desc}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
