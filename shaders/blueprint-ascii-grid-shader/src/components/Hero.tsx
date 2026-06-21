import { ArrowDownRight, Crosshair, Radio, Type } from "lucide-react";

import { Readout } from "@/components/Readout";
import type { GridTelemetry } from "@/components/ui/grid-shader";

type HeroProps = {
	telemetry: GridTelemetry;
};

const fmt = (n: number, d = 0) =>
	Number.isFinite(n) ? n.toFixed(d) : (0).toFixed(d);

export function Hero({ telemetry }: HeroProps) {
	const [mx, my] = telemetry.mouse;

	return (
		<section
			id="top"
			className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-5 pb-10 pt-28 sm:px-8 sm:pb-14"
		>
			{/* Reticle corner brackets framing the whole instrument viewport. */}
			<div
				aria-hidden="true"
				className="reticle pointer-events-none absolute inset-0"
			/>

			{/* Top-edge instrument label row */}
			<div className="pointer-events-none absolute inset-x-0 top-24 z-20 flex items-center justify-between px-5 sm:px-8">
				<span className="font-mono text-[10px] uppercase tracking-[0.28em] text-cobalt-bright/80">
					⌖ Specimen 01 · navy mesh grid
				</span>
				<span className="hidden font-mono text-[10px] uppercase tracking-[0.28em] text-ink-faint sm:inline">
					WebGL2 · single draw call
				</span>
			</div>

			<div className="relative z-20 mx-auto w-full max-w-6xl">
				{/* Eyebrow */}
				<div className="mb-6 flex items-center gap-3">
					<span className="flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-[var(--panel)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-cobalt-bright backdrop-blur">
						<Radio className="h-3 w-3 animate-pulse" />
						Live signal
					</span>
					<span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
						01 / blueprint grid
					</span>
				</div>

				{/* Headline */}
				<h1 className="max-w-4xl font-display text-[clamp(2.6rem,8vw,6rem)] font-bold leading-[0.92] tracking-[-0.03em] text-ink">
					A deep-navy grid
					<br />
					<span className="bg-gradient-to-r from-cobalt-bright via-blueprint to-cyan bg-clip-text text-transparent">
						with ASCII stamps.
					</span>
				</h1>

				<p className="mt-6 max-w-xl font-body text-base leading-relaxed text-ink-dim sm:text-lg">
					A drifting cobalt blueprint over a four-point mesh gradient — value
					glyphs punched into the major intersections, finished with vignette,
					value-noise grain, and Bayer ordered dithering. One WebGL2 file, one
					full-screen triangle, zero dependencies.
				</p>

				{/* CTA + glyph note */}
				<div className="mt-8 flex flex-wrap items-center gap-4">
					<a
						href="#integrate"
						className="group inline-flex items-center gap-2 rounded-md bg-cobalt px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.12em] text-white transition-all hover:bg-cobalt-bright"
					>
						Drop it in
						<ArrowDownRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
					</a>
					<a
						href="#deck"
						className="inline-flex items-center gap-2 rounded-md border border-[var(--line-strong)] bg-[var(--panel)] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.12em] text-ink backdrop-blur transition-colors hover:border-cobalt-bright hover:text-cobalt-bright"
					>
						<Type className="h-4 w-4" />
						Tune the field
					</a>
				</div>

				{/* Live telemetry HUD */}
				<div className="mt-10 inline-flex flex-wrap items-stretch gap-px overflow-hidden rounded-lg border border-[var(--line-strong)] bg-[var(--line)] backdrop-blur">
					<div className="flex items-center gap-2 bg-[var(--panel-solid)]/90 px-4 py-3">
						<Crosshair className="h-3.5 w-3.5 text-cyan" />
						<span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
							Telemetry
						</span>
					</div>
					<div
						className="bg-[var(--panel-solid)]/90 px-4 py-3"
						data-telemetry="fps"
					>
						<Readout
							label="Render"
							value={fmt(telemetry.fps)}
							unit="fps"
							accent
						/>
					</div>
					<div
						className="bg-[var(--panel-solid)]/90 px-4 py-3"
						data-telemetry="time"
					>
						<Readout
							label="iTime"
							value={fmt(telemetry.time, 2)}
							unit="s"
							accent
						/>
					</div>
					<div
						className="bg-[var(--panel-solid)]/90 px-4 py-3"
						data-telemetry="frame"
					>
						<Readout label="iFrame" value={String(telemetry.frame)} accent />
					</div>
					<div
						className="hidden bg-[var(--panel-solid)]/90 px-4 py-3 sm:block"
						data-telemetry="res"
					>
						<Readout
							label="iResolution"
							value={`${telemetry.width}×${telemetry.height}`}
						/>
					</div>
					<div
						className="hidden bg-[var(--panel-solid)]/90 px-4 py-3 lg:block"
						data-telemetry="mouse"
					>
						<Readout label="iMouse" value={`${fmt(mx)}, ${fmt(my)}`} />
					</div>
				</div>
			</div>

			{/* Bottom scroll hint */}
			<div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
				<span className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-faint">
					scroll to inspect
				</span>
			</div>
		</section>
	);
}
