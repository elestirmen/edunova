import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const inputBaseClass = [
  "flex h-11 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-sm",
  "shadow-xs transition-all duration-200 ease-premium",
  "placeholder:text-muted-foreground/70",
  "file:border-0 file:bg-transparent file:text-sm file:font-medium",
  "hover:border-primary/30",
  "focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/12 focus-visible:ring-offset-0",
  "disabled:cursor-not-allowed disabled:opacity-60",
].join(" ");

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            inputBaseClass,
            error &&
              "border-destructive/60 focus-visible:border-destructive focus-visible:ring-destructive/15",
            className
          )}
          aria-invalid={error ? true : undefined}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input, inputBaseClass };
