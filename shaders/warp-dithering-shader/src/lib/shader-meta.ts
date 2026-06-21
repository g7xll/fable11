import type {
	DitheringShape,
	DitheringType,
} from "@/components/ui/dithering-shader";

/** The live, user-tunable uniform set fed into <DitheringShader />. */
export interface LiveParams {
	shape: DitheringShape;
	type: DitheringType;
	pxSize: number;
	speed: number;
	colorBack: string;
	colorFront: string;
}

export interface Size {
	width: number;
	height: number;
}

/** Canonical defaults — identical to the prompt's demo.tsx (DemoOne). */
export const DEMO_PARAMS: LiveParams = {
	shape: "warp",
	type: "4x4",
	colorBack: "#000033",
	colorFront: "#ff6600",
	pxSize: 4,
	speed: 0.8,
};

export interface ShapeInfo {
	id: DitheringShape;
	/** Numeric uniform value the component maps this shape to (u_shape). */
	uniform: number;
	label: string;
	blurb: string;
}

/** Ordered with `warp` first — it is the experiment's headline field. */
export const SHAPES: ShapeInfo[] = [
	{
		id: "warp",
		uniform: 2,
		label: "Warp",
		blurb:
			"Five folded cosine iterations bend the plane into flowing caustic bands.",
	},
	{
		id: "simplex",
		uniform: 1,
		label: "Simplex",
		blurb: "Two octaves of simplex noise drifting along the vertical axis.",
	},
	{
		id: "dots",
		uniform: 3,
		label: "Dots",
		blurb: "A per-stripe randomised lattice pulsing on a sine/cosine grid.",
	},
	{
		id: "wave",
		uniform: 4,
		label: "Wave",
		blurb: "A travelling sine horizon with a slowly breathing amplitude.",
	},
	{
		id: "ripple",
		uniform: 5,
		label: "Ripple",
		blurb: "Radial interference rings expanding from the centre point.",
	},
	{
		id: "swirl",
		uniform: 6,
		label: "Swirl",
		blurb: "A logarithmic spiral wound tight around the origin.",
	},
	{
		id: "sphere",
		uniform: 7,
		label: "Sphere",
		blurb: "A Lambert-shaded sphere lit by an orbiting point light.",
	},
];

export interface TypeInfo {
	id: DitheringType;
	/** Numeric uniform value (u_type). */
	uniform: number;
	label: string;
	blurb: string;
	/** The ordered-dither threshold matrix, or null for the random/noise mode. */
	matrix: number[][] | null;
	/** Matrix edge length (0 for the random mode). */
	size: number;
}

// Matrices below are the exact arrays compiled into the fragment shader.
const BAYER_2 = [
	[0, 2],
	[3, 1],
];
const BAYER_4 = [
	[0, 8, 2, 10],
	[12, 4, 14, 6],
	[3, 11, 1, 9],
	[15, 7, 13, 5],
];
const BAYER_8 = [
	[0, 32, 8, 40, 2, 34, 10, 42],
	[48, 16, 56, 24, 50, 18, 58, 26],
	[12, 44, 4, 36, 14, 46, 6, 38],
	[60, 28, 52, 20, 62, 30, 54, 22],
	[3, 35, 11, 43, 1, 33, 9, 41],
	[51, 19, 59, 27, 49, 17, 57, 25],
	[15, 47, 7, 39, 13, 45, 5, 37],
	[63, 31, 55, 23, 61, 29, 53, 21],
];

export const TYPES: TypeInfo[] = [
	{
		id: "random",
		uniform: 1,
		label: "Random",
		blurb:
			"White-noise threshold from a hash — grainy, film-like, never repeats.",
		matrix: null,
		size: 0,
	},
	{
		id: "2x2",
		uniform: 2,
		label: "Bayer 2×2",
		blurb: "Ordered dither, four tonal steps. The coarsest, most graphic grid.",
		matrix: BAYER_2,
		size: 2,
	},
	{
		id: "4x4",
		uniform: 3,
		label: "Bayer 4×4",
		blurb:
			"Sixteen-step ordered dither — the demo default. Crisp print-like texture.",
		matrix: BAYER_4,
		size: 4,
	},
	{
		id: "8x8",
		uniform: 4,
		label: "Bayer 8×8",
		blurb:
			"Sixty-four-step ordered dither — the smoothest, finest gradient ramp.",
		matrix: BAYER_8,
		size: 8,
	},
];

export interface PropSpec {
	name: string;
	type: string;
	fallback: string;
	uniform: string;
	note: string;
}

/** Documents the component's public props for the API section. */
export const PROP_SPECS: PropSpec[] = [
	{
		name: "shape",
		type: "DitheringShape",
		fallback: '"simplex"',
		uniform: "u_shape",
		note: "Which procedural field to render (7 options).",
	},
	{
		name: "type",
		type: "DitheringType",
		fallback: '"8x8"',
		uniform: "u_type",
		note: "Dithering kernel: random or Bayer 2×2 / 4×4 / 8×8.",
	},
	{
		name: "colorBack",
		type: "string (hex)",
		fallback: '"#000000"',
		uniform: "u_colorBack",
		note: "Background colour for the 0-bit.",
	},
	{
		name: "colorFront",
		type: "string (hex)",
		fallback: '"#ffffff"',
		uniform: "u_colorFront",
		note: "Foreground colour for the lit 1-bit.",
	},
	{
		name: "pxSize",
		type: "number",
		fallback: "4",
		uniform: "u_pxSize",
		note: "Pixelisation cell size — the chunkiness of the grid.",
	},
	{
		name: "speed",
		type: "number",
		fallback: "1",
		uniform: "(time scale)",
		note: "Animation rate. 0 renders a single static frame.",
	},
	{
		name: "width",
		type: "number",
		fallback: "800",
		uniform: "u_resolution.x",
		note: "Canvas width in pixels.",
	},
	{
		name: "height",
		type: "number",
		fallback: "800",
		uniform: "u_resolution.y",
		note: "Canvas height in pixels.",
	},
];
