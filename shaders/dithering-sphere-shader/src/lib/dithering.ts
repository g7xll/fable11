import type {
	DitheringShape,
	DitheringType,
} from "@/components/ui/dithering-shader";

/**
 * Shared catalog + tunables for the showcase. The shape/type keys are exactly
 * the ones the brief's `DitheringShader` accepts; everything here is metadata
 * the page renders around the component (labels, copy, and the actual Bayer
 * threshold matrices the GLSL uses — mirrored so the Matrix panel can draw the
 * same numbers the shader samples).
 */

export type Params = {
	shape: DitheringShape;
	type: DitheringType;
	colorBack: string;
	colorFront: string;
	pxSize: number;
	speed: number;
};

/** The brief's `demo.tsx` settings, verbatim, as the lab's home state. */
export const DEFAULT_PARAMS: Params = {
	shape: "sphere",
	type: "random",
	colorBack: "#000000",
	colorFront: "#f43f5e",
	pxSize: 2,
	speed: 1.5,
};

export const PX_RANGE = { min: 1, max: 10, step: 1 } as const;
export const SPEED_RANGE = { min: 0, max: 4, step: 0.1 } as const;

export type ShapeMeta = {
	key: DitheringShape;
	uniform: number;
	label: string;
	blurb: string;
};

/** Ordered to match the `u_shape` branches in the fragment shader. */
export const SHAPES: ShapeMeta[] = [
	{ key: "simplex", uniform: 1, label: "Simplex", blurb: "Drifting 2-octave value noise — soft organic clouds." },
	{ key: "warp", uniform: 2, label: "Warp", blurb: "Domain-warped interference, folded into liquid ribbons." },
	{ key: "dots", uniform: 3, label: "Dots", blurb: "Per-stripe randomised sine·cosine lattice of pulsing dots." },
	{ key: "wave", uniform: 4, label: "Wave", blurb: "A travelling crest sweeping a hard horizon line." },
	{ key: "ripple", uniform: 5, label: "Ripple", blurb: "Concentric shockwave radiating from the centre." },
	{ key: "swirl", uniform: 6, label: "Swirl", blurb: "Logarithmic spiral winding around the origin." },
	{ key: "sphere", uniform: 7, label: "Sphere", blurb: "A lit 3-D ball with an orbiting key light. The brief's hero." },
];

export type TypeMeta = {
	key: DitheringType;
	uniform: number;
	label: string;
	blurb: string;
	/** Bayer threshold matrix (null = stochastic / blue-noise hash). */
	matrix: number[][] | null;
};

/**
 * The exact ordered-dither matrices declared in the shader, mirrored here so
 * the Matrix panel renders the same thresholds the GPU compares against. Values
 * are normalised by N² (the shader divides by 4 / 16 / 64).
 */
export const BAYER_2x2 = [
	[0, 2],
	[3, 1],
];

export const BAYER_4x4 = [
	[0, 8, 2, 10],
	[12, 4, 14, 6],
	[3, 11, 1, 9],
	[15, 7, 13, 5],
];

export const BAYER_8x8 = [
	[0, 32, 8, 40, 2, 34, 10, 42],
	[48, 16, 56, 24, 50, 18, 58, 26],
	[12, 44, 4, 36, 14, 46, 6, 38],
	[60, 28, 52, 20, 62, 30, 54, 22],
	[3, 35, 11, 43, 1, 33, 9, 41],
	[51, 19, 59, 27, 49, 17, 57, 25],
	[15, 47, 7, 39, 13, 45, 5, 37],
	[63, 31, 55, 23, 61, 29, 53, 21],
];

/** Ordered to match the `u_type` switch in the fragment shader. */
export const TYPES: TypeMeta[] = [
	{
		key: "random",
		uniform: 1,
		label: "Random",
		blurb: "Stochastic — a per-pixel hash, no repeating grid. Grainy, filmic.",
		matrix: null,
	},
	{
		key: "2x2",
		uniform: 2,
		label: "Bayer 2×2",
		blurb: "Coarsest ordered matrix — 4 levels, chunky crosshatch.",
		matrix: BAYER_2x2,
	},
	{
		key: "4x4",
		uniform: 3,
		label: "Bayer 4×4",
		blurb: "16 thresholds — the classic newsprint halftone weave.",
		matrix: BAYER_4x4,
	},
	{
		key: "8x8",
		uniform: 4,
		label: "Bayer 8×8",
		blurb: "64 thresholds — finest gradient, smoothest tonal ramp.",
		matrix: BAYER_8x8,
	},
];

export const SHAPE_BY_KEY: Record<DitheringShape, ShapeMeta> = Object.fromEntries(
	SHAPES.map((s) => [s.key, s]),
) as Record<DitheringShape, ShapeMeta>;

export const TYPE_BY_KEY: Record<DitheringType, TypeMeta> = Object.fromEntries(
	TYPES.map((t) => [t.key, t]),
) as Record<DitheringType, TypeMeta>;

/** A handful of curated looks that exercise different corners of the component. */
export const PRESETS: { name: string; tag: string; params: Params }[] = [
	{ name: "Sphere", tag: "the brief", params: { ...DEFAULT_PARAMS } },
	{
		name: "Newsprint",
		tag: "ink on paper",
		params: { shape: "ripple", type: "4x4", colorBack: "#f4f1ea", colorFront: "#0a0a0b", pxSize: 3, speed: 1 },
	},
	{
		name: "Phosphor",
		tag: "crt swirl",
		params: { shape: "swirl", type: "8x8", colorBack: "#03120a", colorFront: "#39ff5a", pxSize: 2, speed: 1.2 },
	},
	{
		name: "Static",
		tag: "warp grain",
		params: { shape: "warp", type: "random", colorBack: "#05060a", colorFront: "#7dd3fc", pxSize: 2, speed: 1.6 },
	},
	{
		name: "Letterpress",
		tag: "blocky dots",
		params: { shape: "dots", type: "2x2", colorBack: "#0b0b0c", colorFront: "#fbbf24", pxSize: 5, speed: 0.8 },
	},
];
