import * as React from "react";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  firstName: string;
  lastName: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const colorPairs = [
  "bg-teal-100 text-teal-700",
  "bg-emerald-100 text-emerald-700",
  "bg-cyan-100 text-cyan-700",
  "bg-green-100 text-green-700",
  "bg-amber-100 text-amber-700",
  "bg-sky-100 text-sky-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
];

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorPairs[Math.abs(hash) % colorPairs.length];
}

export function Avatar({
  firstName,
  lastName,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
    xl: "h-20 w-20 text-2xl",
  };

  const colorClass = getColorFromName(firstName + lastName);

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-2xl font-bold",
        sizeClasses[size],
        colorClass,
        className
      )}
      {...props}
    >
      {getInitials(firstName, lastName)}
    </div>
  );
}
