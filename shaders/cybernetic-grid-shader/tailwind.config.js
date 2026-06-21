/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				// Pulled straight from the shader's own GLSL palette so the chrome
				// and the canvas read as one machine.
				abyss: "#050912",
				"abyss-2": "#070d1c", // panel backing (hex so `/70` opacity composes)
				cobalt: "#1a80ff", // grid lines  → vec3(0.1, 0.5, 1.0)
				magenta: "#ff33cc", // energy pulse → vec3(1.0, 0.2, 0.8)
				cyan: "#7df9ff", // probe / ion accent
				steel: "#8aa0c8", // muted labels
				// Hairline tokens — kept in sync with the CSS custom properties in
				// index.css so `border-line` / `bg-line-soft` actually generate rules.
				line: "rgba(125, 249, 255, 0.16)",
				"line-soft": "rgba(138, 160, 200, 0.12)",
			},
			fontFamily: {
				display: ['"Chakra Petch"', "system-ui", "sans-serif"],
				body: ['"Inter"', "system-ui", "sans-serif"],
				mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
			},
		},
	},
	plugins: [],
};
