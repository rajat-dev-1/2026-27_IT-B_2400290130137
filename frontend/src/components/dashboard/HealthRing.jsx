import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function HealthRing({ health }) {
  const [mounted, setMounted] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'good': return '#68B984';
      case 'moderate': return '#D6A75C';
      case 'attention': return '#D97757';
      case 'critical': return '#D75757';
      default: return '#385044';
    }
  };

  const circumference = 283; // 2 * pi * 45
  const outerOffset = circumference - (health.overall / 100) * circumference;

  // Distribute 5 categories around the circle
  const categoryCircumference = 239; // 2 * pi * 38
  const segmentLength = categoryCircumference / 5 - 10; // leave gap
  const dasharray = `${segmentLength} ${categoryCircumference}`;

  return (
    <div className="relative w-full max-w-sm mx-auto aspect-square flex flex-col items-center justify-center">
      {/* Visually hidden summary for screen readers */}
      <div className="sr-only">
        Repository health score is {health.overall} out of 100. {health.label}.
        {health.categories.map(c => `${c.label} is ${c.score}.`).join(' ')}
      </div>

      <div className="relative w-full h-full flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {/* Outer track */}
          <circle cx="50" cy="50" r="45" fill="none" stroke="#385044" strokeWidth="2" opacity="0.4" />
          
          {/* Outer health ring */}
          <circle 
            cx="50" cy="50" r="45" fill="none" stroke="#68B984" strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={!reducedMotion && !mounted ? circumference : outerOffset}
            className={cn("transition-all ease-out", !reducedMotion && "duration-[1000ms]")}
            strokeLinecap="round"
          />

          {/* Inner category segments */}
          {health.categories.map((cat, i) => {
            const rotationOffset = (i * (categoryCircumference / 5));
            return (
              <circle
                key={cat.id}
                cx="50" cy="50" r="38" fill="none"
                stroke={getStatusColor(cat.status)} strokeWidth="4"
                strokeDasharray={dasharray}
                strokeDashoffset={!reducedMotion && !mounted ? categoryCircumference : -rotationOffset}
                className={cn("transition-all ease-out", !reducedMotion && `duration-[800ms] delay-[${300 + i * 100}ms]`)}
                strokeLinecap="round"
                opacity={mounted ? (hoveredCategory && hoveredCategory !== cat.id ? 0.3 : 1) : 0}
                onMouseEnter={() => setHoveredCategory(cat.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                onFocus={() => setHoveredCategory(cat.id)}
                onBlur={() => setHoveredCategory(null)}
                tabIndex={0}
                aria-label={`${cat.label}: ${cat.score}`}
                style={{ cursor: 'pointer' }}
              />
            );
          })}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none scale-90 sm:scale-100">
          <div className="text-5xl font-bold text-ivory tracking-tight mb-1">{health.overall}</div>
          <div className="text-sm font-medium text-sage max-w-[120px] leading-tight mb-3">
            {health.label}
          </div>
          
          {health.change !== 0 && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border",
              health.change > 0 ? "bg-primary-soft/50 text-primary border-primary/20" : "bg-critical/10 text-critical border-critical/20"
            )}>
              {health.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(health.change)} points
            </div>
          )}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredCategory && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          {health.categories.filter(c => c.id === hoveredCategory).map(cat => (
            <div key={cat.id} className="bg-ink border border-border text-ivory text-xs px-3 py-2 rounded-lg shadow-2xl min-w-[120px] text-center">
              <div className="font-semibold mb-1">{cat.label}</div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sage">Score:</span>
                <span className="font-mono text-sm" style={{ color: getStatusColor(cat.status) }}>{cat.score}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
