/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Frame ink — a deep aubergine-black, the herbarium board.
        ink: "#120a14",
        "ink-2": "#1b0f1f",
        // The two pigments the shader itself mixes between.
        petal: "#d61f7a",
        iris: "#3f6bf0",
        // Pressed-gold label ink + parchment text on the dark board.
        pollen: "#e9c879",
        parchment: "#ece3d6",
        sepia: "#a9967f",
        // hairlines
        rule: "rgba(233,200,121,0.18)",
        "rule-soft": "rgba(233,200,121,0.09)",
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
