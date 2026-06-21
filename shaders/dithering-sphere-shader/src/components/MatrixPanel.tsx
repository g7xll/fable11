import { useEffect, useRef } from "react";

import { Reveal } from "@/components/Reveal";
import { TYPE_BY_KEY, type Params } from "@/lib/dithering";

type MatrixPanelProps = {
	params: Params;
};

/** Mirrors the shader's stochastic branch: a cheap deterministic per-pixel hash. */
function hash21(x: number, y: number) {
	let px = (x * 0.3183099) % 1;
	let py = (y * 0.3678794) % 1;
	px = (px + 0.1) % 1;
	py = (py + 0.1) % 1;
	const d = px * px + py * py + 19.19;
	px = (px + d) % 1;
	py = (py + d) % 1;
	const v = (px * py) % 1;
	return v < 0 ? v + 1 : v;
}

/**
 * Draws a left→right tonal ramp resolved to two colours with the *currently
 * selected* dithering algorithm — the same threshold logic the GPU runs, in 2D
 * canvas, so you can watch the matrix turn grey into pattern.
 */
function DitherRamp({ params }: { params: Params }) {
	const ref = useRef<HTMLCanvasElement>(null);
	const meta = TYPE_BY_KEY[params.type];

	useEffect(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const W = (canvas.width = 480);
		const H = (canvas.height = 120);
		const px = Math.max(1, params.pxSize + 1);
		const matrix = meta.matrix;
		const N = matrix ? matrix.length : 0;

		const fg = params.colorFront;
		const bg = params.colorBack;
		const img = ctx.createImageData(W, H);

		const hexToRgb = (hex: string) => {
			const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return m
				? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
				: [0, 0, 0];
		};
		const [fr, fgc, fb] = hexToRgb(fg);
		const [br, bgc, bb] = hexToRgb(bg);

		for (let y = 0; y < H; y++) {
			for (let x = 0; x < W; x++) {
				const bx = Math.floor(x / px);
				const by = Math.floor(y / px);
				const shade = (x / W) * 0.92 + 0.04; // 0..1 ramp
				let threshold: number;
				if (matrix) {
					threshold = matrix[by % N][bx % N] / (N * N);
				} else {
					threshold = hash21(bx + 1, by + 1);
				}
				const on = shade > threshold ? 1 : 0;
				const i = (y * W + x) * 4;
				img.data[i] = on ? fr : br;
				img.data[i + 1] = on ? fgc : bgc;
				img.data[i + 2] = on ? fb : bb;
				img.data[i + 3] = 255;
			}
		}
		ctx.putImageData(img, 0, 0);
	}, [params, meta]);

	return (
		<canvas
			ref={ref}
			data-testid="dither-ramp"
			className="h-[120px] w-full rounded-md"
			style={{ imageRendering: "pixelated" }}
		/>
	);
}

function MatrixGrid({ params }: { params: Params }) {
	const meta = TYPE_BY_KEY[params.type];
	const matrix = meta.matrix;

	if (!matrix) {
		// Stochastic — render the hash field itself instead of a fixed grid.
		const cells = Array.from({ length: 64 }, (_, i) =>
			hash21((i % 8) + 1, Math.floor(i / 8) + 1),
		);
		return (
			<div
				className="grid aspect-square w-full gap-px"
				style={{ gridTemplateColumns: "repeat(8, 1fr)" }}
			>
				{cells.map((v, i) => (
					<div
						key={i}
						className="rounded-[1px]"
						style={{ background: `rgba(244,63,94,${0.12 + v * 0.78})` }}
					/>
				))}
			</div>
		);
	}

	const N = matrix.length;
	const max = N * N;
	return (
		<div
			className="grid aspect-square w-full gap-px"
			style={{ gridTemplateColumns: `repeat(${N}, 1fr)` }}
		>
			{matrix.flat().map((v, i) => {
				const t = v / max;
				return (
					<div
						key={i}
						className="grid place-items-center rounded-[1px] font-mono text-paper"
						style={{
							background: `rgba(244,63,94,${0.1 + t * 0.8})`,
							fontSize: N <= 4 ? "0.7rem" : "0.5rem",
						}}
					>
						{N <= 4 ? v : ""}
					</div>
				);
			})}
		</div>
	);
}

export function MatrixPanel({ params }: MatrixPanelProps) {
	const meta = TYPE_BY_KEY[params.type];
	const N = meta.matrix ? meta.matrix.length : 0;

	return (
		<section
			id="matrix"
			className="relative border-t border-[var(--line)] px-5 py-24 sm:px-8"
		>
			<div className="mx-auto max-w-6xl">
				<Reveal className="mb-12 max-w-2xl">
					<span className="font-mono text-xs uppercase tracking-[0.2em] text-rose">
						02 / threshold matrix
					</span>
					<h2 className="mt-3 font-display text-[clamp(1.9rem,4.5vw,3.1rem)] font-bold leading-[0.98] tracking-[-0.02em] text-paper">
						How a field becomes a bit.
					</h2>
					<p className="mt-4 font-body text-paper-dim">
						Each shape gives every pixel a brightness from 0 to 1. Dithering
						decides <em>on or off</em> by comparing that brightness to a
						threshold that varies with screen position — so flat tones break
						into stable patterns instead of banding. This panel shows the exact
						threshold source the shader is using{" "}
						<span className="text-paper">right now</span>.
					</p>
				</Reveal>

				<div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
					<Reveal className="brackets">
						<div className="panel flex h-full flex-col gap-4 rounded-xl p-6">
							<div className="flex items-center justify-between">
								<span className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper-dim">
									{meta.label}
								</span>
								<span
									data-testid="matrix-caption"
									className="font-mono text-[11px] uppercase tracking-[0.16em] text-rose"
								>
									{meta.matrix ? `${N}×${N} · ${N * N} levels` : "stochastic"}
								</span>
							</div>
							<div className="mx-auto w-full max-w-[260px]">
								<MatrixGrid params={params} />
							</div>
							<p className="font-mono text-[11px] leading-relaxed text-paper-faint">
								{meta.blurb}
							</p>
						</div>
					</Reveal>

					<Reveal delay={80}>
						<div className="panel flex h-full flex-col gap-5 rounded-xl p-6">
							<div>
								<span className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper-dim">
									Tonal ramp · dithered live
								</span>
								<p className="mt-1 font-mono text-[11px] text-paper-faint">
									A smooth 0→1 gradient, thresholded by the matrix at the
									current <code className="text-paper">pxSize</code> and
									colours.
								</p>
							</div>
							<DitherRamp params={params} />

							<div className="mt-auto grid gap-3 border-t border-[var(--line)] pt-5 font-mono text-[12px] text-paper-dim sm:grid-cols-2">
								<div>
									<span className="text-paper-faint">// shape</span>
									<br />
									<span className="text-paper">value</span> = field(uv, t);{" "}
									<span className="text-paper-faint">// 0..1</span>
								</div>
								<div>
									<span className="text-paper-faint">// dither</span>
									<br />
									res = <span className="text-rose">step</span>(.5, value + d -
									.5);
								</div>
							</div>
						</div>
					</Reveal>
				</div>
			</div>
		</section>
	);
}
