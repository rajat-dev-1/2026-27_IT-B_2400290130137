import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Input = forwardRef(({
  className,
  label,
  error,
  helper,
  id,
  disabled,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-ivory mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full rounded-lg border bg-ink px-3 py-2 text-sm text-ivory",
          "placeholder:text-muted",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-critical focus-visible:ring-critical" : "border-border",
          className
        )}
        {...props}
      />
      {(error || helper) && (
        <p className={cn("mt-1.5 text-sm", error ? "text-critical" : "text-sage")}>
          {error || helper}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
