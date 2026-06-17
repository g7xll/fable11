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
        // Containment palette — anchored to the shader's sky-cyan fresnel glow.
        sky: {
          300: "hsl(var(--sky-300))",
        },
        gray: {
          300: "hsl(var(--gray-300))",
        },
        // Deep-lab voids the WebGL field is keyed against.
        void: {
          black: "#020308",
          ink: "#05070f",
          slate: "#0a0e1a",
          steel: "#5b6577",
        },
        glow: {
          50: "#eefaff",
          100: "#d4f1ff",
          200: "#a6e3ff",
          300: "#6fd0fb",
          400: "#34b6f1",
          500: "#149ad8",
          600: "#0a78ae",
          700: "#0a5d86",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        ultra: "0.42em",
      },
      keyframes: {
        // The prompt ships these `fadeIn` keyframes — wire them to the
        // `animate-fade-in-long` class the hero markup references.
        fadeIn: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        rise: {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "reticle-spin": {
          to: { transform: "rotate(360deg)" },
        },
        "reticle-spin-reverse": {
          to: { transform: "rotate(-360deg)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        "scan-sweep": {
          "0%": { transform: "translateY(-120%)" },
          "100%": { transform: "translateY(120%)" },
        },
        "trace-drift": {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(6px)" },
        },
      },
      animation: {
        // 1.6s long fade used by the hero copy stack.
        "fade-in-long": "fadeIn 1.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        rise: "rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
        "reticle-spin": "reticle-spin 36s linear infinite",
        "reticle-spin-reverse": "reticle-spin-reverse 28s linear infinite",
        "pulse-soft": "pulse-soft 2.6s ease-in-out infinite",
        "scan-sweep": "scan-sweep 8s linear infinite",
        "trace-drift": "trace-drift 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
