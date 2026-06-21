/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				// 1-bit plotter palette — orange phosphor on deep navy, matching the
				// canonical Warp demo (colorFront #ff6600 over colorBack #000033).
				ink: "#04050b",
				panel: "#0a0c18",
				navy: "#000033",
				amber: "#ff6600",
				amberlite: "#ffb066",
				bone: "#ece8df",
				ash: "#9aa0b4",
				graphite: "#1b1f33",
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
				mono: [
					"ui-monospace",
					'"SF Mono"',
					'"JetBrains Mono"',
					'"Cascadia Code"',
					"Menlo",
					"Consolas",
					"monospace",
				],
				display: [
					"system-ui",
					'"Segoe UI"',
					"Roboto",
					"Helvetica",
					"Arial",
					"sans-serif",
				],
			},
			letterSpacing: {
				widest2: "0.32em",
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			boxShadow: {
				phosphor:
					"0 0 0 1px rgba(255,102,0,0.25), 0 0 24px -4px rgba(255,102,0,0.35)",
			},
			keyframes: {
				scan: {
					from: { transform: "translateY(-100%)" },
					to: { transform: "translateY(100%)" },
				},
				blink: {
					"0%, 49%": { opacity: "1" },
					"50%, 100%": { opacity: "0.15" },
				},
				flicker: {
					"0%, 100%": { opacity: "1" },
					"47%": { opacity: "0.82" },
					"52%": { opacity: "1" },
					"71%": { opacity: "0.9" },
				},
				"rise-in": {
					from: { opacity: "0", transform: "translateY(14px)" },
					to: { opacity: "1", transform: "translateY(0)" },
				},
			},
			animation: {
				scan: "scan 6s linear infinite",
				blink: "blink 1.1s steps(1) infinite",
				flicker: "flicker 7s ease-in-out infinite",
				"rise-in": "rise-in 0.7s cubic-bezier(0.22,1,0.36,1) both",
			},
		},
	},
	plugins: [],
};
