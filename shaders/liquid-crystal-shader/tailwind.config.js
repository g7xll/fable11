/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // Optical-bench palette — a polarized-light microscopy instrument.
        bench: {
          void: "#070809",
          black: "#0a0c10",
          slate: "#14181f",
          panel: "#1a1f29",
          line: "#262d3a",
          steel: "#5a6470",
          bone: "#e8eef0",
        },
        // Birefringence accents — the interference colours of crossed polarizers.
        prism: {
          cyan: "#5fe9d0",
          violet: "#a78bfa",
          amber: "#f4c06a",
          rose: "#f0789e",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'Space Mono'", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        ultra: "0.42em",
        wider2: "0.28em",
      },
      keyframes: {
        "reticle-spin": {
          to: { transform: "rotate(360deg)" },
        },
        rise: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "rise-slow": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        "scan-sweep": {
          "0%": { transform: "translateY(-110%)" },
          "100%": { transform: "translateY(110%)" },
        },
      },
      animation: {
        "reticle-spin": "reticle-spin 60s linear infinite",
        rise: "rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
        "rise-slow": "rise-slow 1.1s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 1.4s ease both",
        "pulse-dot": "pulse-dot 2.2s ease-in-out infinite",
        "scan-sweep": "scan-sweep 9s linear infinite",
      },
    },
  },
  plugins: [],
};
