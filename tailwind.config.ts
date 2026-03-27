import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Nintendo DS design tokens (from Figma node 3:116)
        "ds-bg": "#f8f8f8",
        "ds-primary": "#111111",
        "ds-secondary": "#444444",
        "ds-muted": "#888888",
        "ds-icon": "#333333",
        "ds-link": "#1a6fd4",
      },
      fontFamily: {
        "arial-black": ['"Arial Black"', '"Arial"', "sans-serif"],
      },
      keyframes: {
        "ds-overlay": {
          "0%":   { backgroundColor: "#000000", opacity: "1" },
          "45%":  { backgroundColor: "#000000", opacity: "1" },
          "60%":  { backgroundColor: "#ffffff", opacity: "1" },
          "100%": { backgroundColor: "#ffffff", opacity: "0" },
        },
        "ds-content-in": {
          "0%, 55%": { opacity: "0" },
          "100%":    { opacity: "1" },
        },
        "ds-blink": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0" },
        },
      },
      animation: {
        "ds-overlay":    "ds-overlay 1.6s ease-in-out forwards",
        "ds-content-in": "ds-content-in 1.6s ease-out forwards",
        "ds-blink":      "ds-blink 1.2s step-end infinite",
      },
    },
  },
  plugins: [],
};
export default config;
