/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				void: "var(--void)",
				ink: {
					DEFAULT: "var(--ink)",
					dim: "var(--ink-dim)",
					faint: "var(--ink-faint)",
				},
				violet: {
					DEFAULT: "var(--violet)",
					deep: "var(--violet-deep)",
				},
				phosphor: "var(--phosphor)",
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
