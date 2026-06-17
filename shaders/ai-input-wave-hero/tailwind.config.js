/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Tokens sampled from the wave shader's own emitted palette: a near-black
        // void the additive bars bloom out of, plus the cobalt → electric-blue
        // filament colours (`#1f3dbc` emissive over an hsl(220,100%,50%) base).
        ink: {
          DEFAULT: "#05060a",
          900: "#070810",
          800: "#0b0d18",
          700: "#11142400",
        },
        cobalt: {
          DEFAULT: "#1f3dbc",
          400: "#3a5bff",
          300: "#7d93ff",
        },
        haze: "#f0f2ff",
        mist: "#aab1c9",
      },
      fontFamily: {
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      keyframes: {
        "rise-in": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "rise-in": "rise-in 0.7s cubic-bezier(0.22,1,0.36,1) forwards",
      },
    },
  },
  plugins: [],
};
