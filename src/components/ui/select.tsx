import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Yerleşik <select> için ortak premium stil.
 * Ok işareti CSS ile çizilir; tarayıcı varsayılanı gizlenir.
 */
export const selectClassName = [
  "flex h-11 w-full appearance-none rounded-xl border border-input bg-card py-2 pl-3.5 pr-9 text-sm",
  "shadow-xs transition-all duration-200 ease-premium",
  "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke-width=%222%22 stroke=%22%2364748b%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22m6 9 6 6 6-6%22/%3E%3C/svg%3E')]",
  "bg-[length:1rem_1rem] bg-[right_0.75rem_center] bg-no-repeat",
  "hover:border-primary/30",
  "focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/12 focus-visible:ring-offset-0",
  "disabled:cursor-not-allowed disabled:opacity-60",
].join(" ");

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(selectClassName, className)} {...props}>
      {children}
    </select>
  )
);
Select.displayName = "Select";

export { Select };
