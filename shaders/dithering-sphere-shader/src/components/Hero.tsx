import { ArrowDownRight, Copy } from "lucide-react";

import { DitheringStage } from "@/components/DitheringStage";
import type { FrameClock } from "@/hooks/useFrameClock";
import { SHAPE_BY_KEY, TYPE_BY_KEY, type Params } from "@/lib/dithering";

type HeroProps = {
	params: Params;
	telemetry: FrameClock;
};

function Readout({
	label,
	value,
	testid,
}: {
	label: string;
	value: string;
	testid?: string;
}) {
	return (
		<div className="flex min-w-0 flex-col gap-1 px-4 py-3">
			<span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-faint">
				{label}
			</span>
			<span
				data-testid={testid}
				className="truncate font-mono text-sm font-bold tracking-tight text-paper"
			>
				{value}
			</span>
		</div>
	);
}

export function Hero({ params, telemetry }: HeroProps) {
	const shape = SHAPE_BY_KEY[params.shape];
	const type = TYPE_BY_KEY[params.type];

	return (
		<section
			id="top"
			className="relative min-h-[100svh] w-full overflow-hidden"
		>
			{/* The brief's component, live and full-bleed. */}
			<DitheringStage params={params} className="absolute inset-0 -z-10" />

			{/* Legibility veil so text stays readable over the bright field. */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(8,7,9,0.74)_0%,rgba(8,7,9,0.32)_38%,rgba(8,7,9,0.5)_70%,rgba(8,7,9,0.94)_100%)]"
			/>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_15%_30%,rgba(8,7,9,0.7),transparent_60%)]"
			/>

			<div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-10 pt-28 sm:px-8 sm:pb-14">
				<div className="max-w-3xl">
					<span className="inline-flex items-center gap-2 rounded-full border border-[var(--rose-line)] bg-[var(--panel)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-paper-dim backdrop-blur">
						<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose" />
						WebGL2 · 1-bit · drop-in components/ui
					</span>

					<h1 className="mt-6 font-display text-[clamp(3rem,11vw,8.5rem)] font-bold leading-[0.86] tracking-[-0.04em] text-paper">
						Resolve
						<br />
						<span className="text-rose">anything</span> to 1&nbsp;bit.
					</h1>

					<p className="mt-6 max-w-xl text-balance font-body text-base leading-relaxed text-paper-dim sm:text-lg">
						<span className="font-semibold text-paper">DITHER LAB</span> is a
						single WebGL2 fragment shader that paints seven procedural fields
						and crushes them to two colours through ordered Bayer or stochastic
						dithering — the whole look of newsprint, CRTs and 1-bit art, in one
						drop-in component.
					</p>

					<div className="mt-8 flex flex-wrap items-center gap-3">
						<a
							href="#deck"
							className="group inline-flex items-center gap-2 rounded-md bg-rose px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_0_24px_rgba(244,63,94,0.45)] transition-transform hover:-translate-y-0.5"
						>
							Open the deck
							<ArrowDownRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
						</a>
						<a
							href="#install"
							className="inline-flex items-center gap-2 rounded-md border border-[var(--line-strong)] bg-[var(--panel)] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-paper backdrop-blur transition-colors hover:border-[var(--rose-line)] hover:text-rose"
						>
							<Copy className="h-3.5 w-3.5" />
							Copy component
						</a>
					</div>
				</div>

				{/* Live telemetry HUD reading the real render loop + current params. */}
				<div className="brackets mt-10 w-full overflow-hidden rounded-xl">
					<div className="scanlines grid grid-cols-2 divide-x divide-[var(--line)] border border-[var(--line-strong)] bg-[var(--panel)] backdrop-blur sm:grid-cols-5">
						<Readout
							label="Render"
							value={`${telemetry.fps} fps`}
							testid="hud-fps"
						/>
						<Readout
							label="Frame"
							value={String(telemetry.frames)}
							testid="hud-frame"
						/>
						<Readout label="Shape" value={shape.label} testid="hud-shape" />
						<Readout label="Dither" value={type.label} testid="hud-type" />
						<Readout
							label="Pixel · Speed"
							value={`${params.pxSize}px · ${params.speed.toFixed(1)}×`}
							testid="hud-px"
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
