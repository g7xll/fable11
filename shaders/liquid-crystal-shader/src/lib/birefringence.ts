/**
 * Maps the shader's `hue` uniform to the vocabulary of optical mineralogy.
 *
 * Under crossed polarizers a birefringent specimen shows "interference
 * colours" that climb through orders as retardation increases. We borrow that
 * naming so the live readout describes the band colour the way a petrographer
 * would, rather than just printing a number.
 */

export interface InterferenceReading {
	/** The colour name a petrographer would assign this band. */
	colour: string;
	/** Newton's-scale order, I–IV. */
	order: string;
	/** A representative swatch hex for the dot in the readout. */
	swatch: string;
}

const SCALE: { max: number; colour: string; order: string; swatch: string }[] =
	[
		{ max: 30, colour: "First-order red", order: "I", swatch: "#f0789e" },
		{ max: 65, colour: "Second-order orange", order: "II", swatch: "#f4a05a" },
		{ max: 95, colour: "Second-order yellow", order: "II", swatch: "#f4c06a" },
		{ max: 165, colour: "Third-order green", order: "III", swatch: "#7fe2a8" },
		{ max: 205, colour: "Third-order cyan", order: "III", swatch: "#5fe9d0" },
		{ max: 255, colour: "Fourth-order blue", order: "IV", swatch: "#6aa8f4" },
		{ max: 300, colour: "Fourth-order indigo", order: "IV", swatch: "#7c7cf0" },
		{ max: 345, colour: "High-order violet", order: "IV", swatch: "#a78bfa" },
		{ max: 361, colour: "First-order red", order: "I", swatch: "#f0789e" },
	];

export function readInterference(hue: number): InterferenceReading {
	const h = ((hue % 360) + 360) % 360;
	const band = SCALE.find((b) => h < b.max) ?? SCALE[SCALE.length - 1];
	return { colour: band.colour, order: band.order, swatch: band.swatch };
}
