import { useMemo } from "react";
import type { DitheringType } from "@/components/ui/dithering-shader";
import { cn } from "@/lib/utils";

/**
 * The exact ordered-dithering threshold matrices the fragment shader reads from
 * (`bayer2x2/4x4/8x8`). Rendering them here is not decoration — it is the
 * literal lookup table the GPU uses to decide which pixels light up, so the
 * panel always shows the math driving the field above it.
 */
const BAYER: Record<Exclude<DitheringType, "random">, number[]> = {
	"2x2": [0, 2, 3, 1],
	"4x4": [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5],
	"8x8": [
		0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36,
		14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41,
		51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55,
		23, 61, 29, 53, 21,
	],
};

interface BayerMatrixProps {
	type: DitheringType;
	className?: string;
}

export function BayerMatrix({ type, className }: BayerMatrixProps) {
	const { size, cells, max } = useMemo(() => {
		if (type === "random") {
			// The random mode uses a per-pixel hash instead of a fixed matrix; show a
			// representative noise field so the panel still reflects the active mode.
			const n = 8;
			const arr = Array.from({ length: n * n }, (_, i) => {
				const v = Math.sin(i * 12.9898) * 43758.5453;
				return Math.floor((v - Math.floor(v)) * (n * n));
			});
			return { size: n, cells: arr, max: n * n - 1 };
		}
		const m = BAYER[type];
		const s = Math.sqrt(m.length);
		return { size: s, cells: m, max: m.length - 1 };
	}, [type]);

	return (
		<div className={cn("select-none", className)}>
			<div
				className="grid gap-[2px]"
				style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
			>
				{cells.map((v, i) => {
					const intensity = v / max; // 0 → first to light, 1 → last
					return (
						<div
							key={i}
							className="relative aspect-square overflow-hidden rounded-[1px]"
							style={{
								backgroundColor: `rgba(0, 255, 255, ${0.08 + intensity * 0.82})`,
								boxShadow: "inset 0 0 0 1px rgba(0,255,255,0.10)",
							}}
							title={
								type === "random" ? `hash ${v}` : `threshold ${v}/${max + 1}`
							}
						>
							{size <= 4 && (
								<span
									className="absolute inset-0 grid place-items-center font-mono text-[9px] leading-none"
									style={{
										color: intensity > 0.5 ? "#0a0006" : "rgba(0,255,255,0.9)",
									}}
								>
									{v}
								</span>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
