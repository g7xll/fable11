/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				ink: "var(--ink)",
				paper: {
					DEFAULT: "var(--paper)",
					dim: "var(--paper-dim)",
					faint: "var(--paper-faint)",
				},
				rose: {
					DEFAULT: "var(--rose)",
					deep: "var(--rose-deep)",
				},
				lime: "var(--lime)",
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
