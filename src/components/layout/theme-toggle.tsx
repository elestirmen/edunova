"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      className="group relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-muted-foreground transition-all duration-200 ease-premium hover:border-border hover:bg-accent hover:text-foreground"
      aria-label={isDark ? "Aydınlık temaya geç" : "Karanlık temaya geç"}
      title={isDark ? "Aydınlık tema" : "Karanlık tema"}
    >
      <Sun
        className={`absolute h-[18px] w-[18px] transition-all duration-300 ease-premium ${
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"
        }`}
      />
      <Moon
        className={`absolute h-[18px] w-[18px] transition-all duration-300 ease-premium ${
          isDark ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      />
    </button>
  );
}
