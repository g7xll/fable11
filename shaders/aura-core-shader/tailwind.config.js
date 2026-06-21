/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				void: "#06080d",
				bay: "#0b0f17",
				amber: "#ffcc4d",
				plasma: "#5fd9ff",
				warn: "#ff5a3c",
				mist: "#8a97ad",
			},
			fontFamily: {
				display: ['"Chakra Petch"', "system-ui", "sans-serif"],
				body: ['"Inter"', "system-ui", "sans-serif"],
				mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
			},
		},
	},
	plugins: [],
};
