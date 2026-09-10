import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const Button = forwardRef(({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  disabled,
  children,
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary text-ink hover:bg-primary-hover",
    secondary: "bg-slate border border-border text-ivory hover:bg-moss-surface",
    ghost: "bg-transparent text-sage hover:bg-moss-surface hover:text-ivory",
    danger: "bg-critical text-ink hover:opacity-90",
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!loading && LeftIcon && <LeftIcon className={cn("mr-2 h-4 w-4", size === 'lg' && "h-5 w-5")} />}
      {children}
      {!loading && RightIcon && <RightIcon className={cn("ml-2 h-4 w-4", size === 'lg' && "h-5 w-5")} />}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
