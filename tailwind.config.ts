import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FCE4DE",
        surface: "#FFFAF7",
        "surface-alt": "#F8E8E2",
        border: "#F0D7CE",
        botanical: {
          DEFAULT: "#2D5016",
          light: "#4A7C2E",
        },
        terracotta: "#C4652E",
        charcoal: "#2D2926",
        "warm-gray": "#8A8480",
        "warm-gray-light": "#AAA5A0",
        status: {
          peak: "#00B894",
          starting: "#E17055",
          upcoming: "#6C5CE7",
          ending: "#FDCB6E",
        },
        danger: "#B33A1A",
      },
      fontFamily: {
        serif: ['"Playfair Display"', "Georgia", "serif"],
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        bloom: "0 8px 32px rgba(45, 41, 38, 0.08), 0 2px 8px rgba(45, 41, 38, 0.04)",
        "bloom-lg": "0 20px 60px rgba(45, 41, 38, 0.12), 0 4px 16px rgba(45, 41, 38, 0.06)",
      },
      animation: {
        "bloom-pulse": "bloom-pulse 2s ease-in-out infinite",
        "fade-up": "fade-up 400ms cubic-bezier(0.23, 1, 0.32, 1) both",
        "fade-in": "fade-in 400ms ease both",
        "sheet-up": "sheet-up 400ms cubic-bezier(0.23, 1, 0.32, 1) both",
      },
      keyframes: {
        "bloom-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(0, 184, 148, 0.55), 0 0 0 0 rgba(0, 184, 148, 0.35)" },
          "50%": { boxShadow: "0 0 0 8px rgba(0, 184, 148, 0.18), 0 0 0 16px rgba(0, 184, 148, 0.08)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translate3d(0, 16px, 0)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "sheet-up": {
          "0%": { transform: "translate3d(0, 100%, 0)" },
          "100%": { transform: "translate3d(0, 0, 0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
