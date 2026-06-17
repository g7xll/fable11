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
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				border: "hsl(var(--border))",
				// Iridescent channels sampled from the shader's own chromatic split
				iris: {
					cyan: "hsl(var(--iris-cyan))",
					magenta: "hsl(var(--iris-magenta))",
					amber: "hsl(var(--iris-amber))",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			keyframes: {
				"reveal-up": {
					from: { opacity: "0", transform: "translateY(20px)" },
					to: { opacity: "1", transform: "translateY(0)" },
				},
				"reveal-blur": {
					from: { opacity: "0", filter: "blur(10px)" },
					to: { opacity: "1", filter: "blur(0)" },
				},
				"gauge-in": {
					from: { opacity: "0", transform: "translateX(-12px)" },
					to: { opacity: "1", transform: "translateX(0)" },
				},
				"hud-in": {
					from: { opacity: "0", transform: "translateY(-8px)" },
					to: { opacity: "1", transform: "translateY(0)" },
				},
				"aperture-pulse": {
					"0%, 100%": { opacity: "0.55", transform: "scale(1)" },
					"50%": { opacity: "1", transform: "scale(1.05)" },
				},
				"signal-flicker": {
					"0%, 100%": { opacity: "1" },
					"47%": { opacity: "1" },
					"50%": { opacity: "0.62" },
					"53%": { opacity: "1" },
				},
			},
		},
	},
	plugins: [animate],
} satisfies Config;
