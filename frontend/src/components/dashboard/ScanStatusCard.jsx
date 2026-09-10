import { Loader2, CheckCircle2, AlertCircle, Clock, RotateCw } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

export default function ScanStatusCard({ status, progress, progressMessage, error, apiCode, onRetry }) {
  if (!status) return null;

  if (status === 'completed') {
    return (
      <Card className="flex items-center gap-3 bg-slate border-primary/30 py-3" padding="md">
        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
        <div className="flex flex-col" aria-live="polite">
          <span className="text-sm font-medium text-ivory">Health report ready</span>
          <span className="text-xs text-sage">Your latest scan completed successfully.</span>
        </div>
      </Card>
    );
  }

  if (status === 'failed') {
    const isUnsupported = apiCode === 'NO_SUPPORTED_FILES';
    
    return (
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1E1919] border-critical/30" padding="md">
        <div className="flex items-start gap-3" aria-live="assertive">
          <AlertCircle className="w-5 h-5 text-critical shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-ivory">
              {isUnsupported ? 'Unsupported Repository' : 'This scan needs another try'}
            </span>
            <span className="text-xs text-sage max-w-lg mt-1">
              {isUnsupported 
                ? 'This repository does not contain supported code languages (JavaScript, TypeScript). We cannot analyze it at this time.'
                : (error || 'The analysis could not complete. You can safely queue a retry.')}
            </span>
          </div>
        </div>
        {!isUnsupported && onRetry && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetry}
            leftIcon={RotateCw}
            className="shrink-0 sm:self-center w-full sm:w-auto"
            aria-label="Retry scan"
          >
            Retry scan
          </Button>
        )}
      </Card>
    );
  }

  const isRunning = status === 'running';
  const progressValue = progress ?? 0;

  return (
    <Card className="flex flex-col bg-slate border-border" padding="md">
      <div className="flex items-center gap-3 mb-4" aria-live="polite">
        {isRunning ? (
          <Loader2 className="w-5 h-5 text-info motion-safe:animate-spin shrink-0" aria-hidden="true" />
        ) : (
          <Clock className="w-5 h-5 text-warning shrink-0" aria-hidden="true" />
        )}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm font-medium text-ivory">
              {isRunning ? 'Analyzing repository' : 'Scan queued'}
            </span>
            {isRunning && progress !== undefined && (
              <span className="text-xs font-medium text-info">{progress}% complete</span>
            )}
          </div>
          <span className="text-xs text-sage truncate mt-1">
            {progressMessage || (isRunning
              ? 'You can continue exploring while analysis runs.'
              : 'Your repository is waiting for an available worker.')}
          </span>
        </div>
      </div>

      <div
        className="w-full h-1.5 bg-ink rounded-full overflow-hidden border border-border/50 relative"
        role="progressbar"
        aria-valuenow={progressValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={isRunning ? 'Scan progress' : 'Waiting for scan to start'}
      >
        {isRunning ? (
          <div
            className="h-full bg-info rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.max(progressValue, 2)}%` }}
          />
        ) : (
          <div className="h-full bg-warning w-1/3 rounded-full motion-safe:animate-pulse" />
        )}
      </div>
    </Card>
  );
}
