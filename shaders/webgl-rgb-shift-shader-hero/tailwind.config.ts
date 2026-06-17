import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				display: "var(--font-display)",
				body: "var(--font-body)",
				mono: "var(--font-mono)",
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
				"scan-down": {
					"0%": { transform: "translateY(-100%)" },
					"100%": { transform: "translateY(2400%)" },
				},
				"signal-flicker": {
					"0%, 100%": { opacity: "1" },
					"45%": { opacity: "1" },
					"50%": { opacity: "0.78" },
					"55%": { opacity: "1" },
				},
				"reveal-up": {
					from: { opacity: "0", transform: "translateY(22px)" },
					to: { opacity: "1", transform: "translateY(0)" },
				},
				"bracket-in": {
					from: { opacity: "0", transform: "scale(1.06)" },
					to: { opacity: "1", transform: "scale(1)" },
				},
			},
		},
	},
	plugins: [animate],
} satisfies Config;
