/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				abyss: "var(--abyss)",
				void: "var(--void)",
				navy: "var(--navy)",
				ink: {
					DEFAULT: "var(--ink)",
					dim: "var(--ink-dim)",
					faint: "var(--ink-faint)",
				},
				cobalt: {
					DEFAULT: "var(--cobalt)",
					bright: "var(--cobalt-bright)",
				},
				cyan: "var(--cyan)",
				blueprint: "var(--blueprint)",
				amber: "var(--amber)",
			},
			fontFamily: {
				display: "var(--font-display)",
				mono: "var(--font-mono)",
				body: "var(--font-body)",
			},
		},
	},
	plugins: [],
};
