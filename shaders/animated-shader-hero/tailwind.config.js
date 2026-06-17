/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Tokens sampled from the shader's own emitted palette (deep warm void
        // + ember filaments), used across the page so the chrome and the canvas
        // read as one material.
        void: {
          DEFAULT: "#05060a",
          900: "#080a11",
          800: "#0d1019",
          700: "#141826",
        },
        ember: "#ff7a18",
        gold: "#ffd166",
        paper: "#f5e6d3",
        ash: "#8a8f9c",
      },
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
    },
  },
  // The original Hero component builds badge-icon colors dynamically
  // (`text-${...}-300`). Tailwind can't see those at build time, so safelist the
  // exact classes it generates to keep the verbatim component rendering faithfully.
  safelist: [
    "text-yellow-300",
    "text-orange-300",
    "text-amber-300",
  ],
  plugins: [],
};
