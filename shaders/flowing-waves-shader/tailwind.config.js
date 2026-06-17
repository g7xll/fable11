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
        // Tidal palette — derived from the shader's own state colors:
        // neutral grey field, blue "active" swell, green "upcoming" forecast.
        abyss: {
          900: "#03070d",
          800: "#060d17",
          700: "#0a1422",
          600: "#0f1d30",
          500: "#16293f",
          400: "#22384f",
        },
        tide: {
          50: "#e8f6ff",
          100: "#c3e7ff",
          200: "#8fd1ff",
          300: "#54b6ff",
          400: "#2898f2",
          500: "#1478d6",
          600: "#0f5cab",
          700: "#0d4682",
        },
        kelp: {
          50: "#e6fbf0",
          100: "#bdf3d6",
          200: "#83e6b2",
          300: "#46d189",
          400: "#22b56a",
          500: "#159255",
          600: "#107245",
        },
        foam: {
          50: "#f4fbff",
          100: "#dcebf5",
          200: "#b7cedd",
          300: "#8aa6bb",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
        sans: ["'Space Grotesk'", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        ultra: "0.45em",
      },
      keyframes: {
        "reticle-spin": {
          to: { transform: "rotate(360deg)" },
        },
        "buoy-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
        rise: {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scan-sweep": {
          "0%": { transform: "translateY(-120%)" },
          "100%": { transform: "translateY(120%)" },
        },
        "tick-drift": {
          to: { transform: "translateX(-40px)" },
        },
      },
      animation: {
        "reticle-spin": "reticle-spin 30s linear infinite",
        "buoy-pulse": "buoy-pulse 2.6s ease-in-out infinite",
        rise: "rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
        "scan-sweep": "scan-sweep 8s linear infinite",
        "tick-drift": "tick-drift 3s linear infinite",
      },
    },
  },
  plugins: [],
};
