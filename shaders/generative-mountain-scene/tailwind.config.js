/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Deep slate ink — the brief's #0f172a stage, extended into a ramp.
        ink: {
          950: "#070B14",
          900: "#0B1120",
          850: "#0E1626",
          800: "#111B2E",
          700: "#162236",
          600: "#1D2C42",
        },
        // Brushed instrument metal for chrome / brackets / rails.
        slate: {
          line: "#22304A",
        },
        // The massif's own colours — glacier sky-cyan (the #7dd3fc uniform).
        glacier: {
          DEFAULT: "#7DD3FC",
          bright: "#BAE6FD",
          deep: "#38BDF8",
        },
        // Contour / survey ink — topographic line green and altitude amber.
        contour: "#5EEAD4",
        altitude: "#FBBF24",
        ridge: "#A5B4FC",
        haze: "#C9D8EE",
      },
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.045em",
      },
      keyframes: {
        "scan-sweep": {
          "0%": { transform: "translateY(-120%)" },
          "100%": { transform: "translateY(120%)" },
        },
        "sweep-x": {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" },
        },
        flicker: {
          "0%, 100%": { opacity: "0.92" },
          "50%": { opacity: "1" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.35", transform: "scale(0.7)" },
        },
        "contour-drift": {
          "0%": { backgroundPosition: "0px 0px" },
          "100%": { backgroundPosition: "0px -64px" },
        },
      },
      animation: {
        "scan-sweep": "scan-sweep 7s linear infinite",
        "sweep-x": "sweep-x 9s linear infinite",
        flicker: "flicker 4s ease-in-out infinite",
        "fade-up": "fade-up 0.8s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 1s ease both",
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
        "contour-drift": "contour-drift 18s linear infinite",
      },
    },
  },
  plugins: [],
};
