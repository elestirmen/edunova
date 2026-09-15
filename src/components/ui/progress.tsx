import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Progress({
  value,
  max = 100,
  color,
  showLabel,
  size = "md",
  className,
  ...props
}: ProgressProps) {
  const safeMax = max > 0 ? max : 100;
  const percentage = Math.min(Math.max((value / safeMax) * 100, 0), 100);

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-3.5",
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-muted ring-1 ring-inset ring-border/60",
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full shadow-[0_0_12px_-2px_hsl(var(--primary)/0.6)] transition-all duration-700 ease-premium",
            color ||
              "bg-[linear-gradient(90deg,hsl(198_52%_44%),hsl(176_50%_42%)_55%,hsl(148_48%_46%))]"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="tabular mt-1.5 text-right text-xs font-semibold text-muted-foreground">
          {Math.round(percentage)}%
        </p>
      )}
    </div>
  );
}
