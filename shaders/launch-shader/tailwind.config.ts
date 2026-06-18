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
				// Ignition channels — sampled from the shader's hot red/amber plume
				flare: {
					core: "hsl(var(--flare-core))",
					ember: "hsl(var(--flare-ember))",
					plasma: "hsl(var(--flare-plasma))",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			keyframes: {
				"reveal-up": {
					from: { opacity: "0", transform: "translateY(22px)" },
					to: { opacity: "1", transform: "translateY(0)" },
				},
				"reveal-blur": {
					from: { opacity: "0", filter: "blur(14px)", transform: "translateY(10px)" },
					to: { opacity: "1", filter: "blur(0)", transform: "translateY(0)" },
				},
				"rail-in": {
					from: { opacity: "0", transform: "translateX(-14px)" },
					to: { opacity: "1", transform: "translateX(0)" },
				},
				"hud-in": {
					from: { opacity: "0", transform: "translateY(-10px)" },
					to: { opacity: "1", transform: "translateY(0)" },
				},
				"ignite-pulse": {
					"0%, 100%": { opacity: "0.45", transform: "scale(1)" },
					"50%": { opacity: "1", transform: "scale(1.12)" },
				},
				"flicker": {
					"0%, 100%": { opacity: "1" },
					"43%": { opacity: "1" },
					"47%": { opacity: "0.55" },
					"50%": { opacity: "1" },
					"82%": { opacity: "0.78" },
					"85%": { opacity: "1" },
				},
			},
		},
	},
	plugins: [animate],
} satisfies Config;
