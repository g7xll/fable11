import type { ShaderProps } from "@/components/ui/aether-flow";

/**
 * Named atmospheric states. Each preset is a full set of the five shader
 * uniforms plus a short caption describing the mood it produces, used by the
 * preset bank in the console. The `code` doubles as a stable id and the chip
 * label so the bank reads like a patch library.
 */
export interface AetherPreset {
	code: string;
	name: string;
	caption: string;
	swatch: string; // approximate dominant colour for the chip dot
	values: ShaderProps;
}

export const PRESETS: AetherPreset[] = [
	{
		code: "AE-01",
		name: "Nebula",
		caption: "Violet bloom, slow drift",
		swatch: "#a78bfa",
		values: {
			hue: 260,
			speed: 0.15,
			intensity: 0.7,
			complexity: 6.0,
			warp: 0.4,
		},
	},
	{
		code: "AE-02",
		name: "Ember",
		caption: "Hot core, tight turbulence",
		swatch: "#f0834f",
		values: {
			hue: 22,
			speed: 0.32,
			intensity: 1.25,
			complexity: 7.0,
			warp: 0.55,
		},
	},
	{
		code: "AE-03",
		name: "Abyss",
		caption: "Deep teal, near-still",
		swatch: "#2fb6b0",
		values: {
			hue: 188,
			speed: 0.07,
			intensity: 0.55,
			complexity: 5.0,
			warp: 0.2,
		},
	},
	{
		code: "AE-04",
		name: "Drift",
		caption: "Pale mist, lazy roll",
		swatch: "#9fb4e8",
		values: {
			hue: 214,
			speed: 0.11,
			intensity: 0.45,
			complexity: 4.0,
			warp: 0.3,
		},
	},
	{
		code: "AE-05",
		name: "Solar",
		caption: "Gold flare, high energy",
		swatch: "#f4c95d",
		values: {
			hue: 44,
			speed: 0.45,
			intensity: 1.6,
			complexity: 8.0,
			warp: 0.7,
		},
	},
	{
		code: "AE-06",
		name: "Bloom",
		caption: "Magenta haze, wide warp",
		swatch: "#e879c9",
		values: {
			hue: 312,
			speed: 0.2,
			intensity: 0.95,
			complexity: 6.0,
			warp: 0.85,
		},
	},
];

/** The five tunable channels, with the exact ranges from the integration brief. */
export interface ChannelSpec {
	key: keyof ShaderProps;
	label: string;
	unit: string;
	min: number;
	max: number;
	step: number;
	blurb: string;
}

export const CHANNELS: ChannelSpec[] = [
	{
		key: "hue",
		label: "Hue",
		unit: "°",
		min: 0,
		max: 360,
		step: 1,
		blurb: "Base colour rotation of the field",
	},
	{
		key: "speed",
		label: "Speed",
		unit: "×",
		min: 0.0,
		max: 1.0,
		step: 0.01,
		blurb: "Rate the noise advects over time",
	},
	{
		key: "intensity",
		label: "Intensity",
		unit: "lum",
		min: 0.1,
		max: 2.0,
		step: 0.01,
		blurb: "Brightness of the bloom highlights",
	},
	{
		key: "complexity",
		label: "Complexity",
		unit: "oct",
		min: 1.0,
		max: 8.0,
		step: 0.1,
		blurb: "Octaves summed in the fBm",
	},
	{
		key: "warp",
		label: "Warp",
		unit: "amt",
		min: 0.0,
		max: 1.0,
		step: 0.01,
		blurb: "How hard the cursor bends the gas",
	},
];
