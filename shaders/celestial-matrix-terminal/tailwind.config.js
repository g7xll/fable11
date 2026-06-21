/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				// The shader's own palette, plus one warm caution accent that the
				// cool-only background never uses — keeps the terminal chrome legible
				// and distinct from the rain behind it.
				void: "#04060d",
				signal: "#1a4dde", // shader color1 (blue)
				aurora: "#19cc7f", // shader color2 (green)
				ion: "#7fe9ff", // cyan scanline / cursor reticle
				mist: "#9fb0cf", // muted UI text
				amber: "#ffb347", // single warm caution accent
			},
			fontFamily: {
				display: ['"Space Grotesk"', "system-ui", "sans-serif"],
				body: ['"Inter"', "system-ui", "sans-serif"],
				mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
			},
			keyframes: {
				"crt-flicker": {
					"0%, 100%": { opacity: "1" },
					"92%": { opacity: "1" },
					"93%": { opacity: "0.82" },
					"94%": { opacity: "1" },
					"97%": { opacity: "0.9" },
					"98%": { opacity: "1" },
				},
				"caret-blink": {
					"0%, 49%": { opacity: "1" },
					"50%, 100%": { opacity: "0" },
				},
				"scan-sweep": {
					"0%": { transform: "translateY(-100%)" },
					"100%": { transform: "translateY(100%)" },
				},
			},
			animation: {
				"crt-flicker": "crt-flicker 6s linear infinite",
				"caret-blink": "caret-blink 1s steps(1) infinite",
				"scan-sweep": "scan-sweep 6.5s linear infinite",
			},
		},
	},
	plugins: [],
};
