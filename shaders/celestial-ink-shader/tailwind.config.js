/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Palette derived from the shader's own colour ramp:
        // c1 #1a0033 → c2 #cc3366 → highlight #ffe6b8.
        void: "#0a0612",
        plum: "#2a0f3d",
        rose: "#e0497a",
        gold: "#ffe6b8",
        mist: "#b9a8d4",
        line: "#5a3f7a",
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      letterSpacing: {
        widest2: "0.42em",
      },
    },
  },
  plugins: [],
};
