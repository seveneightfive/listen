import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./context/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      // A subset of seveneightfive.com's custom type scale (from its
      // Tailwind v4 @theme block) reproduced here for Tailwind v3's
      // config-based syntax — only the sizes this project actually uses.
      fontSize: {
        "title-lg": ["48px", { lineHeight: "60px" }],
        "title-md": ["36px", { lineHeight: "44px" }],
        "theme-sm": ["16px", { lineHeight: "22px" }],
        "theme-xs": ["14px", { lineHeight: "20px" }],
      },
      boxShadow: {
        "theme-sm":
          "0px 1px 3px 0px rgba(16, 24, 40, 0.1), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)",
        "theme-md":
          "0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)",
      },
      // Pulled directly from seveneightfive.com's app/globals.css
      // (@theme block) so the homepage matches the main site exactly.
      colors: {
        brand: {
          25: "#fff5f8",
          50: "#ffecef",
          100: "#ffd9df",
          200: "#feb6c2",
          300: "#fe8ba1",
          400: "#fe5c83",
          500: "#f30963",
          600: "#c80650", // canonical 785 magenta
          700: "#98033b",
          800: "#6a0127",
          900: "#430116",
          950: "#2b000b",
        },
        accent: {
          50: "#fffbe6",
          100: "#fff5b8",
          200: "#ffea80",
          300: "#ffdc40",
          400: "#ffd11a",
          500: "#ffce03", // 785 yellow
          600: "#d6a800",
          700: "#a37f00",
          800: "#6e5500",
          900: "#3d2f00",
        },
      },
    },
  },
  plugins: [],
};

export default config;
