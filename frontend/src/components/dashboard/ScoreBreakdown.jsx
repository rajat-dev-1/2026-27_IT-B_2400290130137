import { Network, Copy, Trash2, Package, GitBranch } from 'lucide-react';

export default function ScoreBreakdown({ categories }) {
  const getCategoryDetails = (id) => {
    switch(id) {
      case 'complexity': return { icon: Network };
      case 'duplication': return { icon: Copy };
      case 'dead-code': return { icon: Trash2 };
      case 'dependencies': return { icon: Package };
      case 'architecture': return { icon: GitBranch };
      default: return { icon: Network };
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'good': return 'Healthy';
      case 'moderate': return 'Watch';
      case 'attention': return 'Needs attention';
      case 'critical': return 'Critical';
      default: return 'Unknown';
    }
  };

  const getStatusColorClass = (status) => {
    switch(status) {
      case 'good': return 'bg-primary';
      case 'moderate': return 'bg-warning';
      case 'attention': return 'bg-high';
      case 'critical': return 'bg-critical';
      default: return 'bg-muted';
    }
  };

  const getStatusTextColorClass = (status) => {
    switch(status) {
      case 'good': return 'text-primary';
      case 'moderate': return 'text-warning';
      case 'attention': return 'text-high';
      case 'critical': return 'text-critical';
      default: return 'text-muted';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-4">
        {categories.map((cat) => {
          const { icon: Icon } = getCategoryDetails(cat.id);
          const statusLabel = getStatusLabel(cat.status);
          const colorClass = getStatusColorClass(cat.status);
          const textColorClass = getStatusTextColorClass(cat.status);

          return (
            <div key={cat.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-ivory">
                  <Icon className="h-4 w-4 text-muted" />
                  <span className="font-medium">{cat.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-medium">{cat.score}</span>
                  <span className={`text-xs ${textColorClass} w-[90px] text-right`}>{statusLabel}</span>
                </div>
              </div>
              <div className="h-1 w-full bg-ink rounded-full overflow-hidden border border-border/50">
                <div className={`h-full ${colorClass} rounded-full`} style={{ width: `${cat.score}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-border/50">
        <p className="text-xs text-muted">Scores reflect the latest completed scan.</p>
      </div>
    </div>
  );
}
