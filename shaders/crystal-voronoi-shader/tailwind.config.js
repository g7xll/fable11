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
        // Cryo palette — sampled straight off the shader's
        // `cos(t*0.5 + vec3(0,0.2,0.4))` cyan→blue→violet ramp.
        obsidian: {
          900: "#06070b",
          800: "#0a0c12",
          700: "#10131c",
          600: "#171b27",
          500: "#1f2433",
        },
        frost: {
          50: "#f3f8fc",
          100: "#dceaf4",
          200: "#bcd6e8",
          300: "#90bcd8",
          400: "#5e9ac4",
        },
        // The two ends of the specimen's spectral cast.
        cryo: {
          teal: "#52e0cf",
          ice: "#67c8f0",
          violet: "#9a7bf0",
          amethyst: "#7c5cd4",
        },
        steel: "#3a4150",
      },
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        mono: ["'Space Mono'", "ui-monospace", "monospace"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        ultra: "0.46em",
      },
      keyframes: {
        "goniometer-spin": {
          to: { transform: "rotate(360deg)" },
        },
        "goniometer-spin-rev": {
          to: { transform: "rotate(-360deg)" },
        },
        "ice-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        "rise": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "facet": {
          from: { opacity: "0", transform: "scale(0.96)", filter: "blur(6px)" },
          to: { opacity: "1", transform: "scale(1)", filter: "blur(0)" },
        },
        "scan-x": {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" },
        },
      },
      animation: {
        "goniometer-spin": "goniometer-spin 48s linear infinite",
        "goniometer-spin-rev": "goniometer-spin-rev 64s linear infinite",
        "ice-pulse": "ice-pulse 2.6s ease-in-out infinite",
        "rise": "rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
        "facet": "facet 1.1s cubic-bezier(0.22, 1, 0.36, 1) both",
        "scan-x": "scan-x 9s linear infinite",
      },
    },
  },
  plugins: [],
};
