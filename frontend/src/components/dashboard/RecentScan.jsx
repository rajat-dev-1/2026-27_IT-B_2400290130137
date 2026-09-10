import { Clock, CheckCircle2, GitBranch, GitCommit, Hash, FileCode2 } from 'lucide-react';
import Card from '../ui/Card';

export default function RecentScan({ scan }) {
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-semibold text-ivory mb-4 px-2">Recent scan</h3>
      
      <Card className="flex-1 bg-slate border-border">
        <div className="flex items-center gap-2 mb-6">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-ivory">Latest completed scan</span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-sage flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> Started</span>
            <span className="text-ivory font-medium">{scan.started}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-sage flex items-center gap-2"><GitBranch className="h-3.5 w-3.5" /> Target</span>
            <span className="text-ivory font-mono text-xs">{scan.branch} · {scan.commit}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-sage flex items-center gap-2"><FileCode2 className="h-3.5 w-3.5" /> Scope</span>
            <span className="text-ivory font-medium">{scan.files} files <span className="text-muted text-xs font-mono ml-1">({scan.lines} lines)</span></span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-sage flex items-center gap-2"><Hash className="h-3.5 w-3.5" /> Findings</span>
            <span className="text-ivory font-medium">{scan.issuesFound} issues found</span>
          </div>

          <div className="flex items-center justify-between text-sm pt-4 border-t border-border/50">
            <span className="text-sage">Duration</span>
            <span className="text-ivory font-medium">{scan.duration}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
