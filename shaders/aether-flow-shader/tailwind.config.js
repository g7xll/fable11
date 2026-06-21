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
				// Aether instrument palette — ink console with violet signal + amber heat.
				ink: {
					900: "#070510",
					800: "#0a0712",
					700: "#0f0b1a",
					600: "#13101f",
					500: "#1a1528",
				},
				hairline: "#2a2238",
				signal: {
					50: "#f3effe",
					100: "#e4ddfc",
					200: "#cbbdf9",
					300: "#b3a0f5",
					400: "#a78bfa",
					500: "#8b6df0",
					600: "#6f4ce0",
				},
				aether: {
					amber: "#f0a868",
					ember: "#f07b54",
					mist: "#9fb4e8",
				},
				chalk: "#ece9f5",
				muted: "#8b85a0",
			},
			fontFamily: {
				display: ["'Space Grotesk'", "system-ui", "sans-serif"],
				sans: ["'Inter'", "system-ui", "sans-serif"],
				mono: ["'Space Mono'", "ui-monospace", "monospace"],
			},
			letterSpacing: {
				ultra: "0.42em",
				wider2: "0.18em",
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
				"reticle-spin": {
					to: { transform: "rotate(360deg)" },
				},
				blink: {
					"0%, 100%": { opacity: "1" },
					"50%": { opacity: "0.25" },
				},
				scan: {
					"0%": { transform: "translateY(-120%)" },
					"100%": { transform: "translateY(120%)" },
				},
			},
			animation: {
				rise: "rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
				"fade-in": "fade-in 1.4s ease-out both",
				"reticle-spin": "reticle-spin 32s linear infinite",
				blink: "blink 1.8s steps(1, end) infinite",
				scan: "scan 6s linear infinite",
			},
		},
	},
	plugins: [],
};
