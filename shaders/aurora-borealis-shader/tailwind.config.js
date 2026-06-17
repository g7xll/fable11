/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Cold polar-night palette — the aurora-watch instrument lives at a
        // high-latitude field station, not in the usual neon-on-black space.
        night: "#060b14", // base sky
        glacier: "#0a1424", // panel fills
        aurora: "#3ff0a8", // verdant aurora green (shader c1)
        violet: "#b06bff", // aurora violet curtain (shader c2)
        ice: "#bfe3ff", // primary cold light
        frost: "#8294b4", // muted instrument labels
      },
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
