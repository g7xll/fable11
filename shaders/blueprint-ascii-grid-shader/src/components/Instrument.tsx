import { Activity, Box, Cpu, Layers } from "lucide-react";

import { Readout } from "@/components/Readout";
import { Reveal } from "@/components/Reveal";
import type { GridTelemetry } from "@/components/ui/grid-shader";

type InstrumentProps = {
	telemetry: GridTelemetry;
};

const fmt = (n: number, d = 0) =>
	Number.isFinite(n) ? n.toFixed(d) : (0).toFixed(d);

const SPECS = [
	{
		icon: Layers,
		label: "Render path",
		value: "1 draw call",
		note: "one fullscreen triangle",
	},
	{
		icon: Cpu,
		label: "Context",
		value: "WebGL2",
		note: "GLSL ES 3.00 fragment",
	},
	{
		icon: Box,
		label: "Runtime deps",
		value: "0",
		note: "just React + a canvas",
	},
	{
		icon: Activity,
		label: "Surface",
		value: "fixed bg",
		note: "drifts behind the page",
	},
];

/**
 * The "instrument" band — reframes the page's live background as a measured
 * specimen, with a scanline sweep, a short description, and a spec strip that
 * mirrors the brief's properties (single draw call, WebGL2, zero deps).
 */
export function Instrument({ telemetry }: InstrumentProps) {
	return (
		<section
			id="instrument"
			className="relative border-t border-[var(--line)] px-5 py-24 sm:px-8"
		>
			<div className="mx-auto max-w-6xl">
				<div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
					<Reveal>
						<span className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">
							01 / the instrument
						</span>
						<h2 className="mt-3 font-display text-[clamp(1.9rem,4.5vw,3.1rem)] font-bold leading-[0.98] tracking-[-0.02em] text-ink">
							Everything behind this page is one shader.
						</h2>
						<p className="mt-4 max-w-xl font-body text-ink-dim">
							No video, no images, no DOM grid — the deep-navy field drifting
							behind every section is a single GLSL fragment program painted
							onto one full-screen triangle. The mesh gradient, the blueprint
							lines, the ASCII stamps, the grain and the dithering are all
							computed per-pixel, per-frame, on the GPU. The numbers below are
							read straight off that running context.
						</p>
					</Reveal>

					<Reveal delay={80}>
						<div className="brackets reticle sweep relative overflow-hidden rounded-xl border border-[var(--line-strong)] bg-[var(--panel)] p-6 backdrop-blur sm:p-8">
							<div className="mb-6 flex items-center justify-between">
								<span className="font-mono text-[10px] uppercase tracking-[0.24em] text-cobalt-bright/80">
									⌖ live context
								</span>
								<span className="h-2 w-2 animate-pulse rounded-full bg-cyan shadow-[0_0_10px_var(--cyan)]" />
							</div>

							<div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--line)] sm:grid-cols-4">
								{SPECS.map((spec) => {
									const Icon = spec.icon;
									return (
										<div
											key={spec.label}
											className="flex flex-col gap-2 bg-[var(--panel-solid)] p-4"
										>
											<Icon className="h-4 w-4 text-cobalt-bright" />
											<Readout label={spec.label} value={spec.value} />
											<span className="font-mono text-[9px] leading-tight text-ink-faint">
												{spec.note}
											</span>
										</div>
									);
								})}
							</div>

							<div className="mt-px grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--line)]">
								<div className="bg-[var(--panel-solid)] p-4">
									<Readout
										label="Render"
										value={fmt(telemetry.fps)}
										unit="fps"
										accent
									/>
								</div>
								<div className="bg-[var(--panel-solid)] p-4">
									<Readout
										label="iTime"
										value={fmt(telemetry.time, 1)}
										unit="s"
										accent
									/>
								</div>
								<div className="bg-[var(--panel-solid)] p-4">
									<Readout
										label="iFrame"
										value={String(telemetry.frame)}
										accent
									/>
								</div>
							</div>
						</div>
					</Reveal>
				</div>
			</div>
		</section>
	);
}
