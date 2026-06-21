import { cn } from "@/lib/utils";
import type { DitheringType } from "@/components/ui/dithering-shader";

/**
 * The page's signature: the ordered-dither threshold matrices, drawn straight
 * from the same integer arrays the fragment shader indexes into. Each cell
 * shows its threshold; cell brightness traces the Bayer ramp so you can read
 * the matrix that's quantizing the field on screen. "random" has no matrix —
 * it dithers from per-pixel hash noise, so we say so plainly.
 */

// These mirror the `bayer2x2`/`bayer4x4`/`bayer8x8` constants in the shader.
const BAYER: Record<
	Exclude<DitheringType, "random">,
	{ size: number; data: number[] }
> = {
	"2x2": { size: 2, data: [0, 2, 3, 1] },
	"4x4": {
		size: 4,
		data: [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5],
	},
	"8x8": {
		size: 8,
		data: [
			0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4,
			36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33,
			9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63,
			31, 55, 23, 61, 29, 53, 21,
		],
	},
};

export default function ThresholdMatrix({ type }: { type: DitheringType }) {
	if (type === "random") {
		return (
			<div className="flex flex-col gap-3">
				<Header type={type} denom="hash" />
				<div className="grid aspect-square w-full place-items-center rounded-md border border-line bg-oxblood-2/60 p-4">
					<p className="text-center font-mono text-[10px] leading-relaxed text-ash">
						no fixed matrix
						<br />
						<span className="text-amber/80">step(hash21(uv), shape)</span>
						<br />
						per-pixel white-noise threshold
					</p>
				</div>
			</div>
		);
	}

	const { size, data } = BAYER[type];
	const denom = size * size;
	// Cell brightness follows the threshold's position in the ramp.
	return (
		<div className="flex flex-col gap-3">
			<Header type={type} denom={`${denom}`} />
			<div
				className="grid aspect-square w-full gap-px rounded-md border border-line bg-line p-px"
				style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
				role="img"
				aria-label={`Bayer ${type} threshold matrix, values 0 to ${denom - 1}`}
			>
				{data.map((v, i) => {
					const a = v / (denom - 1); // 0..1 ramp
					return (
						<div
							key={i}
							className="relative grid place-items-center"
							style={{
								backgroundColor: `rgba(255, 212, 0, ${0.06 + a * 0.9})`,
							}}
						>
							<span
								className={cn(
									"font-mono tabular-nums",
									size === 8
										? "text-[7px]"
										: size === 4
											? "text-[10px]"
											: "text-base",
									a > 0.55 ? "text-oxblood" : "text-bone/80",
								)}
							>
								{v}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function Header({ type, denom }: { type: DitheringType; denom: string }) {
	return (
		<div className="flex items-baseline justify-between">
			<p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
				Threshold matrix
			</p>
			<p className="font-mono text-[10px] tabular-nums text-amber">
				{type === "random" ? "random" : `÷${denom}`}
			</p>
		</div>
	);
}
