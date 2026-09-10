import { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function HealthRingPreview() {
  const [mounted, setMounted] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleMouseMove = (e) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseEnter = () => !reducedMotion && setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePos({ x: 0, y: 0 });
  };

  const segments = [
    { id: 'complexity', label: 'Complexity', score: 82, color: '#68B984', offset: 0, dasharray: '40 100' },
    { id: 'duplication', label: 'Duplication', score: 75, color: '#68B984', offset: -42, dasharray: '25 100' },
    { id: 'dependencies', label: 'Dependencies', score: 60, color: '#D6A75C', offset: -69, dasharray: '15 100' },
    { id: 'deadcode', label: 'Dead Code', score: 88, color: '#68B984', offset: -86, dasharray: '30 100' },
    { id: 'architecture', label: 'Architecture', score: 45, color: '#D97757', offset: -118, dasharray: '20 100' },
  ];

  return (
    <div 
      className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center perspective-[1000px]"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className={cn(
          "absolute inset-0 transition-transform duration-200 ease-out flex items-center justify-center",
          mounted ? "opacity-100" : "opacity-0"
        )}
        style={{
          transform: isHovering 
            ? `rotateY(${mousePos.x * 5}deg) rotateX(${-mousePos.y * 5}deg)` 
            : 'rotateY(0deg) rotateX(0deg)'
        }}
      >
        {/* Decorative ambient ring */}
        <div className={cn(
          "absolute inset-2 rounded-full border border-border/30",
          !reducedMotion && mounted && "animate-[spin_40s_linear_infinite]"
        )} />
        <div className={cn(
          "absolute inset-8 rounded-full border border-border/20",
          !reducedMotion && mounted && "animate-[spin_30s_linear_infinite_reverse]"
        )} />

        {/* Base Panel */}
        <div className="absolute inset-12 rounded-full bg-slate border border-border shadow-2xl flex items-center justify-center">
          
          {/* SVG Rings */}
          <svg viewBox="0 0 100 100" className="absolute inset-[-10%] w-[120%] h-[120%] -rotate-90">
            {/* Outer track */}
            <circle cx="50" cy="50" r="45" fill="none" stroke="#385044" strokeWidth="1.5" opacity="0.3" />
            
            {/* Outer health ring */}
            <circle 
              cx="50" cy="50" r="45" fill="none" stroke="#68B984" strokeWidth="2"
              strokeDasharray="283"
              strokeDashoffset={mounted ? "62" : "283"} // 78% of 283
              className="transition-all duration-[1200ms] ease-out"
              strokeLinecap="round"
            />

            {/* Inner segments */}
            {segments.map((seg, i) => (
              <circle
                key={seg.id}
                cx="50" cy="50" r="38" fill="none"
                stroke={seg.color} strokeWidth="3"
                strokeDasharray="239"
                strokeDashoffset={mounted ? "0" : "239"} // We can animate this similarly but let's keep it simple with stroke-dasharray percentages
                style={{
                  strokeDasharray: `${Number(seg.dasharray.split(' ')[0]) * 2.39} 239`,
                  strokeDashoffset: `${seg.offset * 2.39}`,
                  transition: `all 800ms ease-out ${300 + i * 100}ms`,
                  opacity: mounted ? (hoveredSegment && hoveredSegment !== seg.id ? 0.3 : 1) : 0,
                  cursor: 'pointer'
                }}
                strokeLinecap="round"
                onMouseEnter={() => setHoveredSegment(seg.id)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            ))}
          </svg>

          {/* Center Info */}
          <div className="relative flex flex-col items-center justify-center text-center z-10 scale-90 sm:scale-100">
            <div className="text-sm font-medium text-sage mb-1 flex items-center gap-1">
              Healthy foundation
            </div>
            <div className="text-5xl font-bold text-ivory tracking-tight mb-2">78</div>
            <div className="flex items-center gap-1 text-xs font-medium text-primary bg-primary-soft/50 px-2 py-0.5 rounded-full border border-primary/20">
              <TrendingUp className="h-3 w-3" />
              +4 since last scan
            </div>
          </div>
        </div>

        {/* Floating elements to break symmetry */}
        <div className="absolute top-4 -right-4 sm:-right-8 bg-moss-surface border border-border rounded-lg p-3 shadow-lg max-w-[160px] text-left transition-all duration-700 delay-500 translate-y-0 opacity-100" 
             style={{ transform: mounted ? 'translateY(0)' : 'translateY(10px)', opacity: mounted ? 1 : 0 }}>
          <div className="text-[10px] uppercase font-bold text-muted mb-1 font-mono tracking-wider">Repository</div>
          <div className="text-sm font-medium text-ivory truncate">codehealth-demo</div>
          <div className="text-xs text-sage mt-1">main • 86 files</div>
        </div>

        <div className="absolute bottom-12 -left-4 sm:-left-8 bg-moss-surface border border-border rounded-lg p-3 shadow-lg transition-all duration-700 delay-700 translate-y-0 opacity-100"
             style={{ transform: mounted ? 'translateY(0)' : 'translateY(10px)', opacity: mounted ? 1 : 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-high" />
            <span className="text-xs font-medium text-ivory">2 high-priority areas</span>
          </div>
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-info" />
            <span className="text-xs font-medium text-sage">7 opportunities to simplify</span>
          </div>
        </div>

        {/* Tooltip for segments */}
        {hoveredSegment && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            {segments.filter(s => s.id === hoveredSegment).map(seg => (
              <div key={seg.id} className="bg-ink border border-border text-ivory text-xs px-3 py-1.5 rounded-md shadow-xl -mt-32">
                <span className="font-medium">{seg.label}</span>
                <span className="text-sage ml-2">Score: {seg.score}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
