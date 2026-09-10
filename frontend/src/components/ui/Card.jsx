import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Card = forwardRef(({ className, padding = 'md', hoverable = false, children, ...props }, ref) => {
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-8",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "bg-slate border border-border rounded-[10px]",
        hoverable && "transition-colors hover:bg-moss-surface",
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';
export default Card;
