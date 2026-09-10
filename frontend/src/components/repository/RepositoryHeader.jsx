import { Play, ShieldCheck, GitBranch, RotateCw } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatDateTime } from '../../utils/formatters';

export default function RepositoryHeader({ repository, latestScan, isScanActive, isStartingScan, onRunScan, onForceRescan }) {
  if (!repository) return null;

  const score = latestScan?.scores?.overall;
  const isHealthy = score >= 75;

  return (
    <div className="flex flex-col gap-4 mb-8">
      
      {/* Breadcrumb row */}
      <div className="flex items-center gap-2 text-xs font-medium text-sage">
        <span>Repositories</span>
        <span>/</span>
        <span className="text-ivory">{repository.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        
        {/* Left Info */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-ivory tracking-tight">{repository.name}</h1>
            <Badge variant="secondary">{repository.primaryLanguage || 'JavaScript'}</Badge>
            {repository.isPrivate && <Badge variant="secondary">Private</Badge>}
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-sage">
            <div className="flex items-center gap-1.5">
              <span className="text-muted">Repository:</span>
              <span className="font-medium text-ivory">{repository.fullName || repository.name}</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <GitBranch className="h-4 w-4 text-muted" />
              <span>{repository.branch || 'main'}</span>
              <span className="text-muted">@</span>
              <span className="font-mono text-xs">{latestScan?.commitSHA || repository.commit || 'unknown'}</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <span className="text-muted">Last scanned:</span>
              <span>{latestScan?.completedAt ? formatDateTime(latestScan.completedAt) : (repository.lastScannedAt ? formatDateTime(repository.lastScannedAt) : 'Never')}</span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {score !== undefined && (
             <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${isHealthy ? 'bg-primary-soft/30 border-primary/20 text-primary' : 'bg-[#1E1919] border-high/20 text-high'}`}>
               <ShieldCheck className="h-5 w-5" />
               <div className="flex flex-col">
                 <span className="text-[10px] uppercase tracking-wider font-bold opacity-80 leading-none mb-0.5">Health</span>
                 <span className="text-sm font-bold leading-none">{score} / 100</span>
               </div>
             </div>
          )}
          
          {latestScan?.status === 'completed' && (
            <Button 
              variant="secondary" 
              onClick={() => {
                if (window.confirm("Run a new analysis for this same commit? The previous report will remain available in scan history.")) {
                  onForceRescan && onForceRescan();
                }
              }} 
              disabled={isStartingScan || isScanActive}
              leftIcon={RotateCw}
              title="Rescan this commit"
            >
              Rescan commit
            </Button>
          )}
          
          <Button 
            variant="primary" 
            onClick={onRunScan} 
            disabled={isStartingScan || isScanActive}
            leftIcon={Play}
            title={isScanActive ? "A scan is currently running" : "Run a new scan"}
          >
            {isScanActive ? 'Scan in progress' : 'Run scan'}
          </Button>
        </div>
        
      </div>
    </div>
  );
}
