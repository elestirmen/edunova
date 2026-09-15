"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}>({ theme: "light", toggle: () => {}, setTheme: () => {} });

const STORAGE_KEY = "edunova-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // layout.tsx içindeki inline script temayı zaten <html>'e uyguladı;
  // burada yalnızca mevcut durumu okuyup senkron tutuyoruz.
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setThemeState(isDark ? "dark" : "light");
  }, []);

  function applyTheme(next: Theme) {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* özel sekmede localStorage kapalı olabilir */
    }
    document.documentElement.classList.toggle("dark", next === "dark");
    setThemeState(next);
  }

  function toggle() {
    applyTheme(document.documentElement.classList.contains("dark") ? "light" : "dark");
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme: applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
