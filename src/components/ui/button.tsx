import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl",
    "text-sm font-semibold tracking-tight",
    "transition-[transform,background-color,box-shadow,color,border-color] duration-200 ease-premium",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "brand-surface text-primary-foreground shadow-glow shadow-inner-top hover:shadow-glow-lg hover:brightness-[1.06]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md",
        success:
          "bg-success text-success-foreground shadow-sm hover:bg-success/90 hover:shadow-md",
        outline:
          "border border-border bg-card text-foreground shadow-xs hover:border-primary/40 hover:bg-accent/60 hover:text-accent-foreground hover:shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/70",
        subtle:
          "bg-primary/10 text-primary hover:bg-primary/15",
        ghost:
          "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        glass:
          "glass border text-foreground shadow-sm hover:bg-background/85",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-8 rounded-lg px-2.5 text-xs [&_svg]:size-3.5",
        sm: "h-9 rounded-lg px-3.5 text-[13px] [&_svg]:size-4",
        default: "h-10 px-4 [&_svg]:size-4",
        lg: "h-12 rounded-2xl px-7 text-base [&_svg]:size-[18px]",
        icon: "h-10 w-10 [&_svg]:size-[18px]",
        "icon-sm": "h-9 w-9 rounded-lg [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
