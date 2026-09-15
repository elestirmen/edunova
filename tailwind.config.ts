import type { Config } from "tailwindcss";

/**
 * Edunova tasarım sistemi.
 * Marka paleti logodan türetildi: mürekkep mavisi → turkuaz → yaprak yeşili.
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        /* Logodan alınan marka skalaları */
        brand: {
          50: "hsl(176 52% 96%)",
          100: "hsl(176 50% 91%)",
          200: "hsl(176 45% 82%)",
          300: "hsl(176 41% 69%)",
          400: "hsl(177 40% 55%)",
          500: "hsl(178 46% 43%)",
          600: "hsl(179 53% 35%)",
          700: "hsl(181 50% 28%)",
          800: "hsl(183 45% 23%)",
          900: "hsl(186 41% 18%)",
          950: "hsl(188 46% 11%)",
        },
        ocean: {
          50: "hsl(196 58% 96%)",
          100: "hsl(196 55% 91%)",
          200: "hsl(196 50% 82%)",
          300: "hsl(196 45% 69%)",
          400: "hsl(196 44% 56%)",
          500: "hsl(196 48% 45%)",
          600: "hsl(198 52% 37%)",
          700: "hsl(200 50% 30%)",
          800: "hsl(202 45% 24%)",
          900: "hsl(204 42% 19%)",
          950: "hsl(206 46% 12%)",
        },
        leaf: {
          50: "hsl(145 52% 96%)",
          100: "hsl(145 50% 90%)",
          200: "hsl(145 45% 80%)",
          300: "hsl(146 42% 67%)",
          400: "hsl(147 40% 54%)",
          500: "hsl(148 45% 42%)",
          600: "hsl(150 50% 34%)",
          700: "hsl(152 48% 27%)",
          800: "hsl(154 43% 22%)",
          900: "hsl(156 40% 17%)",
          950: "hsl(158 45% 10%)",
        },
      },
      borderRadius: {
        sm: "calc(var(--radius) - 6px)",
        md: "calc(var(--radius) - 3px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 10px)",
        "3xl": "calc(var(--radius) + 18px)",
      },
      boxShadow: {
        xs: "0 1px 2px -1px hsl(var(--shadow-color) / 0.10)",
        sm: "0 1px 2px -1px hsl(var(--shadow-color) / 0.10), 0 2px 6px -2px hsl(var(--shadow-color) / 0.08)",
        DEFAULT:
          "0 1px 2px -1px hsl(var(--shadow-color) / 0.10), 0 4px 12px -4px hsl(var(--shadow-color) / 0.10)",
        md: "0 2px 4px -2px hsl(var(--shadow-color) / 0.10), 0 8px 20px -6px hsl(var(--shadow-color) / 0.12)",
        lg: "0 4px 8px -4px hsl(var(--shadow-color) / 0.10), 0 16px 32px -12px hsl(var(--shadow-color) / 0.16)",
        xl: "0 8px 16px -8px hsl(var(--shadow-color) / 0.12), 0 28px 56px -20px hsl(var(--shadow-color) / 0.20)",
        glow: "0 6px 18px -6px hsl(var(--primary) / 0.45)",
        "glow-lg": "0 14px 40px -12px hsl(var(--primary) / 0.55)",
        "inner-top": "inset 0 1px 0 0 hsl(0 0% 100% / 0.14)",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)",
        snap: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.85)", opacity: "0.7" },
          "70%, 100%": { transform: "scale(1.9)", opacity: "0" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-6px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.4s ease-out both",
        "scale-in": "scale-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 1.8s infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "gradient-pan": "gradient-pan 12s ease infinite",
        "slide-down": "slide-down 0.18s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, hsl(198 52% 40%) 0%, hsl(178 48% 40%) 52%, hsl(148 45% 47%) 100%)",
        "brand-gradient-soft":
          "linear-gradient(135deg, hsl(196 55% 95%) 0%, hsl(176 50% 95%) 50%, hsl(146 50% 95%) 100%)",
        "grid-faint":
          "linear-gradient(to right, hsl(var(--border) / 0.5) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border) / 0.5) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "32px 32px",
      },
    },
  },
  plugins: [],
};
export default config;
