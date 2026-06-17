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
        // Forge palette — derived from the shader's lava ramp.
        ember: {
          50: "#fff6e8",
          100: "#ffe6bf",
          200: "#ffcf80",
          300: "#ffb347",
          400: "#ff8a1f",
          500: "#ff5e00",
          600: "#e23c00",
          700: "#b32600",
          800: "#7a1900",
          900: "#3d0d00",
        },
        forge: {
          black: "#080503",
          char: "#120a06",
          ash: "#1c1410",
          smoke: "#2a201a",
          steel: "#9a8f86",
        },
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "Georgia", "serif"],
        mono: ["'Space Mono'", "ui-monospace", "monospace"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        ultra: "0.45em",
      },
      keyframes: {
        "reticle-spin": {
          to: { transform: "rotate(360deg)" },
        },
        "ember-flicker": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        "rise": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scan-sweep": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
      animation: {
        "reticle-spin": "reticle-spin 24s linear infinite",
        "ember-flicker": "ember-flicker 2.4s ease-in-out infinite",
        "rise": "rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
        "scan-sweep": "scan-sweep 7s linear infinite",
      },
    },
  },
  plugins: [],
};
