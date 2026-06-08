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
        bg:           "#1C1A17",
        surface:      "#2A2720",
        "surface-alt":"#343028",
        border:       "#4A4540",
        sun:          "#F5A623",
        pine:         "#4CAF7D",
        sky:          "#5BA4CF",
        berry:        "#C9606A",
        "kid-yellow": "#FFD166",
        "kid-coral":  "#FF8C69",
        "kid-mint":   "#88DABA",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body:    ["var(--font-body)", "system-ui", "sans-serif"],
        mono:    ["var(--font-mono)", "monospace"],
        kid:     ["var(--font-kid)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
