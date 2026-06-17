/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Séance instrument palette — near-monochrome ash so the vapour stays the star.
        void: "#08080a",
        ink: "#0d0d10",
        ash: "#ebe7df",
        smoke: "#9b948c",
        bone: "#c7bfb1",
        ember: "#b8763c",
        // shadcn-style semantic tokens (driven by CSS variables in index.css)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ['"Inter Tight"', "system-ui", "sans-serif"],
        mono: ['"Space Mono"', "ui-monospace", "monospace"],
      },
      letterSpacing: {
        ritual: "0.42em",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "veil-up": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "veil-blur": {
          from: { opacity: "0", filter: "blur(14px)", transform: "translateY(10px)" },
          to: { opacity: "1", filter: "blur(0)", transform: "translateY(0)" },
        },
        flicker: {
          "0%, 100%": { opacity: "0.85" },
          "45%": { opacity: "0.4" },
          "55%": { opacity: "0.95" },
          "70%": { opacity: "0.55" },
        },
        drift: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "veil-up": "veil-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
        "veil-blur": "veil-blur 1.1s cubic-bezier(0.22, 1, 0.36, 1) both",
        flicker: "flicker 5s ease-in-out infinite",
        drift: "drift 38s linear infinite",
      },
    },
  },
  plugins: [],
};
