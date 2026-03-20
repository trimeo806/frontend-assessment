import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class" as const,
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      // Colors are now handled via @theme in globals.css
      // @theme { --color-primary, --color-secondary, etc. } auto-generates
      // bg-primary, text-primary, border-primary utilities in Tailwind v4
      borderRadius: {
        lg:   "var(--radius)",
        md:   "calc(var(--radius) - 2px)",
        sm:   "calc(var(--radius) - 4px)",
        pill: "9999px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "monospace"],
      },
      fontSize: {
        "price":       ["24px", { fontWeight: "700", letterSpacing: "-0.02em" }],
        "time":        ["24px", { fontWeight: "700", letterSpacing: "-0.02em" }],
        "booking-ref": ["24px", { fontWeight: "700", letterSpacing: "0.2em" }],
      },
      width: {
        "filter-sidebar":  "320px",
        "booking-sidebar": "360px",
        "search-card":     "880px",
      },
      height: {
        "search-input":  "56px",
        "search-btn":    "56px",
        "filter-row":    "48px",
        "sort-tab":      "48px",
        "airline-logo":  "40px",
        "prog-dot":      "32px",
      },
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
      },
      animation: {
        shimmer:           "shimmer 1.5s infinite linear",
        "accordion-down":  "accordion-down 200ms ease-out",
        "accordion-up":    "accordion-up 200ms ease-out",
      },
    },
  },
  plugins: [],
}

export default config
