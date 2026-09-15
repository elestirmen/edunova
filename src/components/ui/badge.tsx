import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-5 ring-1 ring-inset transition-colors [&_svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "bg-primary/12 text-primary ring-primary/20 dark:bg-primary/15",
        solid:
          "brand-surface text-primary-foreground ring-transparent shadow-xs",
        secondary:
          "bg-secondary text-secondary-foreground ring-border/70",
        outline: "bg-transparent text-foreground ring-border",
        muted: "bg-muted text-muted-foreground ring-transparent",
        destructive:
          "bg-destructive/12 text-destructive ring-destructive/25 dark:text-red-300",
        success:
          "bg-leaf-500/12 text-leaf-700 ring-leaf-500/25 dark:bg-leaf-400/15 dark:text-leaf-300",
        warning:
          "bg-amber-500/14 text-amber-700 ring-amber-500/25 dark:bg-amber-400/15 dark:text-amber-300",
        info:
          "bg-ocean-500/12 text-ocean-700 ring-ocean-500/25 dark:bg-ocean-400/15 dark:text-ocean-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
