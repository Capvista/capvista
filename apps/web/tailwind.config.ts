import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Institutional Palette
        primary: {
          50: "#F0F4F8",
          100: "#D9E2EC",
          200: "#BCCCDC",
          300: "#9FB3C8",
          400: "#829AB1",
          500: "#627D98",
          600: "#486581",
          700: "#334E68",
          800: "#243B53",
          900: "#142B4F",
          950: "#0B1C2D",
        },
        slate: {
          DEFAULT: "#2F3B4A",
          light: "#6B7C93",
        },
        gold: {
          DEFAULT: "#C8A24D",
          light: "#D4B66A",
          dark: "#B38F3A",
        },
        emerald: {
          DEFAULT: "#1C8C5E",
          light: "#2DAA7A",
          dark: "#156B47",
        },
        verified: "#1C8C5E",
        watch: "#C8A24D",
        intervention: "#DC2626",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
