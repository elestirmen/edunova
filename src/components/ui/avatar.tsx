import * as React from "react";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  firstName: string;
  lastName: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  ring?: boolean;
}

/** Marka ailesinden türetilmiş degrade yüzeyler — isim bazlı deterministik seçim. */
const gradients = [
  "from-brand-400 to-brand-600",
  "from-ocean-400 to-ocean-600",
  "from-leaf-400 to-leaf-600",
  "from-brand-400 to-ocean-600",
  "from-leaf-400 to-brand-600",
  "from-ocean-400 to-leaf-600",
  "from-brand-500 to-leaf-500",
  "from-ocean-500 to-brand-700",
];

function gradientFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

export function Avatar({
  firstName,
  lastName,
  size = "md",
  ring = true,
  className,
  ...props
}: AvatarProps) {
  const sizeClasses = {
    xs: "h-7 w-7 rounded-lg text-[10px]",
    sm: "h-9 w-9 rounded-xl text-xs",
    md: "h-10 w-10 rounded-xl text-sm",
    lg: "h-14 w-14 rounded-2xl text-lg",
    xl: "h-20 w-20 rounded-3xl text-2xl",
  };

  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-gradient-to-br font-bold tracking-tight text-white shadow-sm",
        gradientFromName(firstName + lastName),
        sizeClasses[size],
        ring && "ring-2 ring-white/70 dark:ring-white/10",
        className
      )}
      {...props}
    >
      {getInitials(firstName, lastName)}
    </div>
  );
}
