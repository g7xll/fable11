import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				mono: "var(--font-mono)",
				display: "var(--font-display)",
			},
			colors: {
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			keyframes: {
				flicker: {
					"0%, 100%": { opacity: "1" },
					"41%": { opacity: "1" },
					"42%": { opacity: "0.35" },
					"43%": { opacity: "1" },
					"77%": { opacity: "1" },
					"78%": { opacity: "0.6" },
					"79%": { opacity: "1" },
				},
				"track-jump": {
					"0%, 92%, 100%": { transform: "translateY(0)" },
					"93%": { transform: "translateY(-3px)" },
					"96%": { transform: "translateY(2px)" },
				},
			},
			animation: {
				flicker: "flicker 6s linear infinite",
				"track-jump": "track-jump 5s steps(1) infinite",
			},
		},
	},
	plugins: [animate],
} satisfies Config;
