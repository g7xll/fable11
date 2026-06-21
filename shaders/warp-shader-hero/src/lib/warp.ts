/**
 * Typed model for the @paper-design/shaders-react `Warp` shader, plus the exact
 * defaults the prompt's component ships with, a small bank of presets, and the
 * fader metadata the control deck uses to promote each baked-in prop to a live,
 * adjustable uniform. Centralising it here keeps the stage, the deck and the
 * verifier reading from a single source of truth.
 */

export type WarpShape = "checks" | "stripes" | "edge";

export interface WarpConfig {
	proportion: number;
	softness: number;
	distortion: number;
	swirl: number;
	swirlIterations: number;
	shapeScale: number;
	scale: number;
	rotation: number;
	speed: number;
	shape: WarpShape;
	colors: [string, string, string, string];
}

/**
 * The Warp parameters exactly as written in the prompt's `wrap-shader.tsx`.
 * The control deck starts here and any "Reset" returns to it, so the lab always
 * boots showing the literal component the brief asked us to integrate.
 */
export const PROMPT_WARP: WarpConfig = {
	proportion: 0.45,
	softness: 1,
	distortion: 0.25,
	swirl: 0.8,
	swirlIterations: 10,
	shapeScale: 0.1,
	scale: 1,
	rotation: 0,
	speed: 1,
	shape: "checks",
	colors: [
		"hsl(200, 100%, 20%)",
		"hsl(160, 100%, 75%)",
		"hsl(180, 90%, 30%)",
		"hsl(170, 100%, 80%)",
	],
};

export const WARP_SHAPES: WarpShape[] = ["checks", "stripes", "edge"];

/** A continuous, drivable fader exposed by the control deck. */
export interface WarpControl {
	key: keyof Pick<
		WarpConfig,
		| "proportion"
		| "softness"
		| "distortion"
		| "swirl"
		| "swirlIterations"
		| "shapeScale"
		| "scale"
		| "rotation"
		| "speed"
	>;
	label: string;
	min: number;
	max: number;
	step: number;
	/** Short note describing what the prop does to the field. */
	hint: string;
}

export const WARP_CONTROLS: WarpControl[] = [
	{
		key: "speed",
		label: "Speed",
		min: 0,
		max: 3,
		step: 0.01,
		hint: "Clock rate of the warp animation",
	},
	{
		key: "swirl",
		label: "Swirl",
		min: 0,
		max: 1.5,
		step: 0.01,
		hint: "Strength of the rotational push",
	},
	{
		key: "swirlIterations",
		label: "Swirl Iter",
		min: 1,
		max: 20,
		step: 1,
		hint: "How many times the swirl folds back",
	},
	{
		key: "distortion",
		label: "Distortion",
		min: 0,
		max: 1,
		step: 0.01,
		hint: "Domain warp applied to the pattern",
	},
	{
		key: "proportion",
		label: "Proportion",
		min: 0,
		max: 1,
		step: 0.01,
		hint: "Balance between the colour bands",
	},
	{
		key: "softness",
		label: "Softness",
		min: 0,
		max: 1,
		step: 0.01,
		hint: "Edge feathering of the shape",
	},
	{
		key: "shapeScale",
		label: "Shape Scale",
		min: 0.02,
		max: 0.6,
		step: 0.01,
		hint: "Size of the repeating motif",
	},
	{
		key: "scale",
		label: "Scale",
		min: 0.3,
		max: 2.5,
		step: 0.01,
		hint: "Overall zoom of the field",
	},
	{
		key: "rotation",
		label: "Rotation",
		min: 0,
		max: 360,
		step: 1,
		hint: "Static rotation of the whole field (deg)",
	},
];

export interface WarpPreset {
	id: string;
	name: string;
	blurb: string;
	config: WarpConfig;
}

/**
 * A handful of moods built on the same Warp shader. "Lagoon" is the prompt's
 * exact configuration; the rest re-tint and re-shape it to show the same
 * component covering very different ground.
 */
export const WARP_PRESETS: WarpPreset[] = [
	{
		id: "lagoon",
		name: "Lagoon",
		blurb: "The prompt's verbatim teal/aqua checks",
		config: PROMPT_WARP,
	},
	{
		id: "ember",
		name: "Ember",
		blurb: "Warm stripes, slow molten drift",
		config: {
			...PROMPT_WARP,
			shape: "stripes",
			shapeScale: 0.14,
			swirl: 1.0,
			swirlIterations: 8,
			distortion: 0.32,
			speed: 0.7,
			scale: 1.1,
			colors: [
				"hsl(14, 95%, 12%)",
				"hsl(28, 100%, 60%)",
				"hsl(8, 90%, 30%)",
				"hsl(45, 100%, 72%)",
			],
		},
	},
	{
		id: "violet",
		name: "Ultraviolet",
		blurb: "Deep indigo edges, tight swirl",
		config: {
			...PROMPT_WARP,
			shape: "edge",
			shapeScale: 0.08,
			swirl: 1.2,
			swirlIterations: 14,
			distortion: 0.2,
			proportion: 0.5,
			speed: 1.2,
			colors: [
				"hsl(255, 80%, 10%)",
				"hsl(280, 100%, 72%)",
				"hsl(220, 90%, 30%)",
				"hsl(300, 100%, 80%)",
			],
		},
	},
	{
		id: "mono",
		name: "Graphite",
		blurb: "Monochrome checks, near-still",
		config: {
			...PROMPT_WARP,
			shape: "checks",
			shapeScale: 0.12,
			swirl: 0.5,
			swirlIterations: 6,
			distortion: 0.15,
			speed: 0.45,
			colors: [
				"hsl(220, 14%, 8%)",
				"hsl(220, 10%, 70%)",
				"hsl(220, 12%, 22%)",
				"hsl(220, 8%, 92%)",
			],
		},
	},
];

/** Build the exact prop object the verbatim `<Warp>` element receives. */
export function warpProps(config: WarpConfig) {
	return {
		proportion: config.proportion,
		softness: config.softness,
		distortion: config.distortion,
		swirl: config.swirl,
		swirlIterations: config.swirlIterations,
		shape: config.shape,
		shapeScale: config.shapeScale,
		scale: config.scale,
		rotation: config.rotation,
		speed: config.speed,
		colors: config.colors,
	};
}
