import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export default function IssueSummary({ counts }) {
  const severities = [
    { label: 'Critical', count: counts.critical, colorClass: 'bg-critical', textClass: 'text-critical' },
    { label: 'High', count: counts.high, colorClass: 'bg-high', textClass: 'text-high' },
    { label: 'Medium', count: counts.medium, colorClass: 'bg-warning', textClass: 'text-warning' },
    { label: 'Low', count: counts.low, colorClass: 'bg-info', textClass: 'text-info' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-muted" />
          <h3 className="text-sm font-semibold text-ivory uppercase tracking-wider">Issue Severity</h3>
        </div>
        <Link 
          to="/repositories/codehealth-demo" 
          className="text-xs font-medium text-sage hover:text-ivory transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
        >
          View all issues <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {severities.map((sev) => {
          const isZero = sev.count === 0;
          return (
            <div key={sev.label} className="flex flex-col p-3 rounded-lg bg-moss-surface border border-border">
              <div className="flex items-center gap-1.5 mb-2">
                <div className={`w-2 h-2 rounded-full ${isZero ? 'bg-muted' : sev.colorClass}`} />
                <span className="text-xs font-medium text-sage">{sev.label}</span>
              </div>
              <div className={`text-2xl font-bold ${isZero ? 'text-muted' : 'text-ivory'}`}>
                {sev.count}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
