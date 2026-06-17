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
        // Synth-module chassis palette — cool brushed graphite, silkscreen ink,
        // a single warm amber "signal" LED. Kept deliberately neutral so the
        // shader's own coloured field reads as the live signal, not the chassis.
        chassis: {
          950: "#070809",
          900: "#0b0c0e",
          800: "#14161a",
          700: "#1c1f25",
          600: "#262a31",
        },
        alu: {
          700: "#20242b",
          600: "#2b3038",
          500: "#3a4049",
          400: "#4d5560",
        },
        ink: {
          50: "#eef1f5",
          100: "#d7dce3",
          300: "#9aa3af",
          400: "#7c8694",
          500: "#5d6573",
        },
        // Panel indicator amber (warm LED) + a cool patch-cable cyan that
        // echoes the component's own `accent-cyan-400` slider colour.
        amber: {
          DEFAULT: "#f4b740",
          dim: "#a9802d",
        },
        patch: {
          DEFAULT: "#34d6e8",
          dim: "#1c6f78",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        ultra: "0.42em",
        wide2: "0.28em",
      },
      keyframes: {
        rise: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "panel-in": {
          from: { opacity: "0", transform: "translateY(28px) scale(0.985)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "led-warm": {
          "0%": { opacity: "0.15" },
          "60%": { opacity: "1" },
          "78%": { opacity: "0.45" },
          "100%": { opacity: "0.9" },
        },
        "led-flicker": {
          "0%, 100%": { opacity: "0.9" },
          "47%": { opacity: "0.55" },
          "52%": { opacity: "1" },
        },
        "reticle-spin": {
          to: { transform: "rotate(360deg)" },
        },
        "needle-sweep": {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(2px)" },
        },
      },
      animation: {
        rise: "rise 0.85s cubic-bezier(0.22, 1, 0.36, 1) both",
        "panel-in": "panel-in 1s cubic-bezier(0.16, 1, 0.3, 1) both",
        "led-warm": "led-warm 1.6s ease-out both",
        "led-flicker": "led-flicker 3.2s ease-in-out infinite",
        "reticle-spin": "reticle-spin 30s linear infinite",
        "needle-sweep": "needle-sweep 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
