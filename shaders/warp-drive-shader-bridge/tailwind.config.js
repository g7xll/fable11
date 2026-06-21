/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				// Cold-cockpit palette. The accents are lifted straight off the shader's
				// own RGB chromatic-aberration: its red/green/blue tunnel filaments
				// become the console's helm (cyan), warp (amber), and alert (magenta).
				void: {
					DEFAULT: "#04060d",
					900: "#060912",
					800: "#0a0f1c",
					700: "#101728",
					600: "#1a2336",
				},
				helm: "#38e1ff", // cyan — scan lines, helm coords, primary instrument
				warp: "#ffc24b", // amber — warp factor, warnings
				alert: "#ff3d8b", // magenta — the shader's red/blue split, used as alert
				frost: "#d7e3f4", // primary text
				haze: "#6f7e98", // muted captions / data labels
			},
			fontFamily: {
				display: ['"Orbitron"', "ui-sans-serif", "system-ui", "sans-serif"],
				sans: ['"Inter"', "system-ui", "sans-serif"],
				mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
			},
			letterSpacing: {
				widest: "0.35em",
			},
			keyframes: {
				"scan-sweep": {
					"0%": { transform: "translateY(-100%)" },
					"100%": { transform: "translateY(2400%)" },
				},
				"reticle-spin": {
					to: { transform: "rotate(360deg)" },
				},
				"reticle-spin-rev": {
					to: { transform: "rotate(-360deg)" },
				},
				"fade-up": {
					"0%": { opacity: "0", transform: "translateY(14px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
				blink: {
					"0%, 60%": { opacity: "1" },
					"61%, 100%": { opacity: "0.25" },
				},
			},
			animation: {
				"scan-sweep": "scan-sweep 5.5s linear infinite",
				"reticle-spin": "reticle-spin 32s linear infinite",
				"reticle-spin-rev": "reticle-spin-rev 22s linear infinite",
				"fade-up": "fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both",
				blink: "blink 1.4s steps(1) infinite",
			},
		},
	},
	plugins: [],
};
