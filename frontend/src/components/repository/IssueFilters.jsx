import { Filter, X } from 'lucide-react';
import Button from '../ui/Button';

export default function IssueFilters({ filters, setFilters }) {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const hasActiveFilters = filters.severity !== 'all' || filters.type !== 'all' || filters.priority !== 'all';

  const clearFilters = () => {
    setFilters({ severity: 'all', type: 'all', priority: 'all' });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 px-2 py-1 bg-ink border border-border/50 rounded text-sm text-sage">
        <Filter className="w-3.5 h-3.5 opacity-70" />
        <select 
          className="bg-transparent text-ivory outline-none cursor-pointer pr-1"
          value={filters.priority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
        >
          <option value="all">All priorities</option>
          <option value="P1">P1</option>
          <option value="P2">P2</option>
          <option value="P3">P3</option>
        </select>
      </div>

      <div className="flex items-center gap-2 px-2 py-1 bg-ink border border-border/50 rounded text-sm text-sage">
        <select 
          className="bg-transparent text-ivory outline-none cursor-pointer pr-1"
          value={filters.severity}
          onChange={(e) => handleFilterChange('severity', e.target.value)}
        >
          <option value="all">All severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="flex items-center gap-2 px-2 py-1 bg-ink border border-border/50 rounded text-sm text-sage">
        <select 
          className="bg-transparent text-ivory outline-none cursor-pointer pr-1"
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
        >
          <option value="all">All types</option>
          <option value="high_complexity">Complexity</option>
          <option value="duplicated_code">Duplication</option>
          <option value="possible-unused-export">Dead code</option>
          <option value="outdated_dependency">Dependency</option>
          <option value="architecture_violation">Architecture</option>
        </select>
      </div>

      {hasActiveFilters && (
        <Button variant="secondary" size="sm" onClick={clearFilters} className="h-8 py-0 px-2" leftIcon={X}>
          Clear
        </Button>
      )}
    </div>
  );
}
