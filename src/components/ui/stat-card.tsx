import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type StatTone = "brand" | "ocean" | "leaf" | "amber" | "rose" | "violet" | "neutral";

const toneStyles: Record<StatTone, { chip: string; glow: string; value: string }> = {
  brand: {
    chip: "bg-brand-500/12 text-brand-700 ring-brand-500/20 dark:bg-brand-400/15 dark:text-brand-300",
    glow: "from-brand-500/12",
    value: "text-foreground",
  },
  ocean: {
    chip: "bg-ocean-500/12 text-ocean-700 ring-ocean-500/20 dark:bg-ocean-400/15 dark:text-ocean-300",
    glow: "from-ocean-500/12",
    value: "text-foreground",
  },
  leaf: {
    chip: "bg-leaf-500/12 text-leaf-700 ring-leaf-500/20 dark:bg-leaf-400/15 dark:text-leaf-300",
    glow: "from-leaf-500/12",
    value: "text-foreground",
  },
  amber: {
    chip: "bg-amber-500/14 text-amber-700 ring-amber-500/20 dark:bg-amber-400/15 dark:text-amber-300",
    glow: "from-amber-500/12",
    value: "text-amber-600 dark:text-amber-400",
  },
  rose: {
    chip: "bg-rose-500/12 text-rose-700 ring-rose-500/20 dark:bg-rose-400/15 dark:text-rose-300",
    glow: "from-rose-500/12",
    value: "text-rose-600 dark:text-rose-400",
  },
  violet: {
    chip: "bg-violet-500/12 text-violet-700 ring-violet-500/20 dark:bg-violet-400/15 dark:text-violet-300",
    glow: "from-violet-500/12",
    value: "text-foreground",
  },
  neutral: {
    chip: "bg-muted text-muted-foreground ring-border",
    glow: "from-foreground/[0.04]",
    value: "text-foreground",
  },
};

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: StatTone;
  trend?: { value: string; direction: "up" | "down" | "flat" };
  href?: string;
  linkLabel?: string;
  className?: string;
  size?: "sm" | "md";
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "brand",
  trend,
  href,
  linkLabel,
  className,
  size = "md",
}: StatCardProps) {
  const styles = toneStyles[tone];

  const body = (
    <>
      {/* Yumuşak köşe ışığı */}
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-gradient-to-br to-transparent blur-2xl",
          styles.glow
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase leading-tight tracking-[0.08em] text-muted-foreground sm:text-[11px]">
            {label}
          </p>
          <p
            className={cn(
              "tabular mt-2 whitespace-nowrap font-bold leading-none tracking-tight",
              size === "md" ? "text-[21px] sm:text-[26px]" : "text-lg sm:text-xl",
              styles.value
            )}
          >
            {value}
          </p>
          {(hint || trend) && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {trend && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                    trend.direction === "up" &&
                      "bg-leaf-500/12 text-leaf-700 dark:text-leaf-300",
                    trend.direction === "down" &&
                      "bg-rose-500/12 text-rose-700 dark:text-rose-300",
                    trend.direction === "flat" && "bg-muted text-muted-foreground"
                  )}
                >
                  {trend.direction === "up" && <TrendingUp className="h-3 w-3" />}
                  {trend.direction === "down" && <TrendingDown className="h-3 w-3" />}
                  {trend.value}
                </span>
              )}
              {hint && (
                <span className="line-clamp-2 text-[11px] leading-tight text-muted-foreground">
                  {hint}
                </span>
              )}
            </div>
          )}
        </div>
        <span
          className={cn(
            "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset transition-transform duration-300 ease-premium group-hover:scale-105 sm:h-10 sm:w-10",
            styles.chip
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      {href && linkLabel && (
        <p className="relative mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
          {linkLabel}
          <ArrowUpRight className="h-3 w-3 transition-transform duration-300 ease-premium group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </p>
      )}
    </>
  );

  const shell = cn(
    "group relative overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-all duration-300 ease-premium sm:p-5",
    href && "hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg",
    className
  );

  if (href) {
    return (
      <Link href={href} className={shell}>
        {body}
      </Link>
    );
  }

  return <div className={shell}>{body}</div>;
}
