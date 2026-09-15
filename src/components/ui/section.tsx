import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  href?: string;
  hrefLabel?: string;
  className?: string;
}

/** Kart başlıklarında tekrar eden ikon + başlık + aksiyon düzeni. */
export function SectionHeader({
  title,
  description,
  icon: Icon,
  action,
  href,
  hrefLabel = "Tümü",
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="flex min-w-0 items-center gap-2.5">
        {Icon && (
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold tracking-tight">{title}</h3>
          {description && (
            <p className="truncate text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {action}
        {href && (
          <Link
            href={href}
            className="group inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            {hrefLabel}
            <ArrowRight className="h-3 w-3 transition-transform duration-300 ease-premium group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

/** Satır listelerinde kullanılan yumuşak zeminli öğe. */
export function ListRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-transparent bg-muted/40 px-3 py-2.5 transition-all duration-200 ease-premium hover:border-border hover:bg-muted/70",
        className
      )}
      {...props}
    />
  );
}
