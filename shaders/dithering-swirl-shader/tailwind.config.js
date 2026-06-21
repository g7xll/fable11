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
				// Phosphor palette — pulled straight from the demo's shader colours.
				// Front (#00ffff) is the cyan beam; back (#220011) is the bezel void.
				cyan: {
					50: "#e8ffff",
					100: "#b8ffff",
					200: "#7afcff",
					300: "#3df7ff",
					400: "#00ffff",
					500: "#00d6e0",
					600: "#00a3ad",
					700: "#04767e",
					800: "#0a4d52",
					900: "#0b2d30",
				},
				// The deep magenta the swirl is bedded onto.
				void: {
					DEFAULT: "#0a0006",
					900: "#0a0006",
					800: "#160009",
					700: "#220011",
					600: "#33051c",
					500: "#4a0e2c",
				},
				ink: "#06030a",
			},
			fontFamily: {
				display: ["'Space Grotesk'", "system-ui", "sans-serif"],
				mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
				sans: ["'Space Grotesk'", "system-ui", "sans-serif"],
			},
			letterSpacing: {
				ultra: "0.5em",
			},
			keyframes: {
				rise: {
					from: { opacity: "0", transform: "translateY(16px)" },
					to: { opacity: "1", transform: "translateY(0)" },
				},
				"fade-in": {
					from: { opacity: "0" },
					to: { opacity: "1" },
				},
				"scan-sweep": {
					"0%": { transform: "translateY(-110%)" },
					"100%": { transform: "translateY(110%)" },
				},
				"pulse-dot": {
					"0%, 100%": { opacity: "1" },
					"50%": { opacity: "0.25" },
				},
				flicker: {
					"0%, 100%": { opacity: "1" },
					"8%": { opacity: "0.86" },
					"10%": { opacity: "1" },
					"62%": { opacity: "0.94" },
					"64%": { opacity: "1" },
				},
			},
			animation: {
				rise: "rise 0.85s cubic-bezier(0.22, 1, 0.36, 1) both",
				"fade-in": "fade-in 1.1s ease-out both",
				"scan-sweep": "scan-sweep 6s linear infinite",
				"pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
				flicker: "flicker 7s linear infinite",
			},
		},
	},
	plugins: [],
};
