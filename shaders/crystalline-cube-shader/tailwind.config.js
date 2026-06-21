/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				// Cool laboratory palette — deliberately *not* the warm-cream or
				// acid-green AI defaults. The crystal itself supplies the warm,
				// shifting colour; the instrument chrome stays cool and analytical.
				void: "#080b11", // deep slate behind everything
				slate: "#0d121b", // panel graphite
				seam: "#1b2433", // hairline / divider blue-grey
				frost: "#eef2f8", // near-white headings
				steel: "#8a97ab", // muted body text
				dim: "#5a6679", // faint captions
				refraction: "#74efd6", // peridot / refraction teal accent
				amethyst: "#c4a2ff", // secondary violet accent
			},
			fontFamily: {
				display: ['"Fraunces"', "Georgia", "serif"],
				body: ['"Space Grotesk"', "system-ui", "sans-serif"],
				mono: ['"Space Mono"', "ui-monospace", "monospace"],
			},
			letterSpacing: {
				widest2: "0.34em",
			},
		},
	},
	plugins: [],
};
