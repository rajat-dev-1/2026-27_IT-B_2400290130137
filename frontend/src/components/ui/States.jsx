import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export function LoadingScreen({ title = "Loading...", description, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[400px] w-full text-center p-8", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <h3 className="text-lg font-medium text-ivory">{title}</h3>
      {description && <p className="mt-2 text-sm text-sage max-w-sm">{description}</p>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-8 rounded-[10px] border border-border border-dashed bg-slate/50", className)}>
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-moss-surface mb-4">
          <Icon className="h-6 w-6 text-sage" />
        </div>
      )}
      <h3 className="text-lg font-medium text-ivory">{title}</h3>
      {description && <p className="mt-2 text-sm text-sage max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", description, action, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-8 rounded-[10px] border border-critical/20 bg-critical/5", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-critical/10 mb-4">
        <AlertCircle className="h-6 w-6 text-critical" />
      </div>
      <h3 className="text-lg font-medium text-ivory">{title}</h3>
      {description && <p className="mt-2 text-sm text-sage max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
