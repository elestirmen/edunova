import * as React from "react";
import { cn } from "@/lib/utils";
import { inputBaseClass } from "./input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            inputBaseClass,
            "h-auto min-h-[104px] resize-y py-2.5 leading-relaxed",
            error &&
              "border-destructive/60 focus-visible:border-destructive focus-visible:ring-destructive/15",
            className
          )}
          aria-invalid={error ? true : undefined}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
