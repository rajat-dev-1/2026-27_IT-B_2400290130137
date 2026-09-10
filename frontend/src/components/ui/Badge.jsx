import { cn } from '../../utils/cn';

export default function Badge({ className, variant = 'default', children, ...props }) {
  const variants = {
    default: "bg-moss-surface text-sage border border-border",
    success: "bg-primary-soft text-primary border border-primary/20",
    info: "bg-info/10 text-info border border-info/20",
    warning: "bg-warning/10 text-warning border border-warning/20",
    high: "bg-high/10 text-high border border-high/20",
    critical: "bg-critical/10 text-critical border border-critical/20",
    ai: "bg-ai/10 text-ai border border-ai/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
