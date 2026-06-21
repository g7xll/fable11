import { RotateCcw, SlidersHorizontal } from "lucide-react";

import { Fader } from "@/components/Fader";
import { Reveal } from "@/components/Reveal";
import GridShader, {
	DEFAULT_GRID_PARAMS,
	type GridParams,
	type GridTelemetry,
} from "@/components/ui/grid-shader";

type ControlDeckProps = {
	params: GridParams;
	onChange: (params: GridParams) => void;
	onReset: () => void;
};

const PRESETS: { name: string; note: string; params: GridParams }[] = [
	{
		name: "Blueprint",
		note: "the brief defaults",
		params: DEFAULT_GRID_PARAMS,
	},
	{
		name: "Schematic",
		note: "dense, glyph-heavy",
		params: {
			...DEFAULT_GRID_PARAMS,
			gridScale: 30,
			majorStep: 5,
			asciiAmt: 0.42,
			asciiScale: 34,
			scrollSpeed: 0.012,
		},
	},
	{
		name: "Drift",
		note: "wide, fast, clean",
		params: {
			...DEFAULT_GRID_PARAMS,
			gridScale: 11,
			majorStep: 3,
			asciiAmt: 0.1,
			meshAmt: 1,
			scrollSpeed: 0.06,
			vignetteAmt: 0.42,
		},
	},
	{
		name: "Static",
		note: "frozen plate",
		params: {
			...DEFAULT_GRID_PARAMS,
			scrollSpeed: 0,
			noiseAmt: 0.008,
			asciiAmt: 0.3,
		},
	},
];

export function ControlDeck({ params, onChange, onReset }: ControlDeckProps) {
	const set = (patch: Partial<GridParams>) => onChange({ ...params, ...patch });

	// The contained preview ignores telemetry — the hero owns the live HUD.
	const noop = (_t: GridTelemetry) => {};

	return (
		<section
			id="deck"
			className="relative border-t border-[var(--line)] px-5 py-24 sm:px-8"
		>
			<div className="mx-auto max-w-6xl">
				<Reveal className="mb-12 max-w-2xl">
					<span className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">
						02 / control deck
					</span>
					<h2 className="mt-3 font-display text-[clamp(1.9rem,4.5vw,3.1rem)] font-bold leading-[0.98] tracking-[-0.02em] text-ink">
						Every baked constant, now a live uniform.
					</h2>
					<p className="mt-4 font-body text-ink-dim">
						The brief's shader bakes its look into a wall of GLSL{" "}
						<code className="rounded bg-[var(--navy)] px-1.5 py-0.5 font-mono text-xs text-cobalt-bright">
							const
						</code>{" "}
						declarations. Here they're promoted to uniforms — drag a fader and
						the whole page background re-shapes in real time. One params object
						feeds both this preview and the hero.
					</p>
				</Reveal>

				<div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
					{/* Live contained preview */}
					<Reveal>
						<div className="brackets reticle relative aspect-[4/3] overflow-hidden rounded-xl border border-[var(--line-strong)] bg-[var(--abyss)] lg:aspect-auto lg:h-full">
							<GridShader params={params} onTelemetry={noop} fixed={false} />
							<div className="pointer-events-none absolute left-4 top-4 z-30 font-mono text-[10px] uppercase tracking-[0.2em] text-cobalt-bright/80">
								⌖ preview · @/components/ui/grid-shader
							</div>
							<div className="pointer-events-none absolute bottom-4 right-4 z-30 flex gap-3 font-mono text-[10px] tabular-nums text-ink-faint">
								<span>scale {params.gridScale.toFixed(0)}</span>
								<span>ascii {Math.round(params.asciiAmt * 100)}%</span>
							</div>
						</div>
					</Reveal>

					{/* Faders */}
					<Reveal delay={80}>
						<div className="panel flex h-full flex-col rounded-xl p-6 sm:p-7">
							<div className="mb-6 flex items-center justify-between">
								<span className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink">
									<SlidersHorizontal className="h-4 w-4 text-cobalt-bright" />
									Field parameters
								</span>
								<button
									type="button"
									onClick={onReset}
									className="flex items-center gap-1.5 rounded-md border border-[var(--line-strong)] px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-dim transition-colors hover:border-cobalt-bright hover:text-cobalt-bright"
								>
									<RotateCcw className="h-3 w-3" />
									Reset
								</button>
							</div>

							<div className="grid flex-1 grid-cols-1 gap-x-7 gap-y-6 sm:grid-cols-2">
								<Fader
									id="fader-gridScale"
									label="Grid scale"
									uniform="uGridScale"
									value={params.gridScale}
									min={6}
									max={36}
									step={1}
									format={(v) => v.toFixed(0)}
									onChange={(v) => set({ gridScale: v })}
								/>
								<Fader
									id="fader-majorStep"
									label="Major step"
									uniform="uMajorStep"
									value={params.majorStep}
									min={2}
									max={8}
									step={1}
									format={(v) => `÷${v.toFixed(0)}`}
									onChange={(v) => set({ majorStep: v })}
								/>
								<Fader
									id="fader-asciiAmt"
									label="ASCII stamp"
									uniform="uAsciiAmt"
									value={params.asciiAmt}
									min={0}
									max={0.6}
									step={0.01}
									format={(v) => `${Math.round(v * 100)}%`}
									onChange={(v) => set({ asciiAmt: v })}
								/>
								<Fader
									id="fader-asciiScale"
									label="Glyph density"
									uniform="uAsciiScale"
									value={params.asciiScale}
									min={14}
									max={44}
									step={1}
									format={(v) => v.toFixed(0)}
									onChange={(v) => set({ asciiScale: v })}
								/>
								<Fader
									id="fader-scrollSpeed"
									label="Scroll speed"
									uniform="uScrollSpeed"
									value={params.scrollSpeed}
									min={0}
									max={0.1}
									step={0.002}
									format={(v) => v.toFixed(3)}
									onChange={(v) => set({ scrollSpeed: v })}
								/>
								<Fader
									id="fader-meshAmt"
									label="Mesh blend"
									uniform="uMeshAmt"
									value={params.meshAmt}
									min={0}
									max={1}
									step={0.01}
									format={(v) => `${Math.round(v * 100)}%`}
									onChange={(v) => set({ meshAmt: v })}
								/>
								<Fader
									id="fader-vignetteAmt"
									label="Vignette"
									uniform="uVignetteAmt"
									value={params.vignetteAmt}
									min={0}
									max={0.7}
									step={0.01}
									format={(v) => v.toFixed(2)}
									onChange={(v) => set({ vignetteAmt: v })}
								/>
								<Fader
									id="fader-noiseAmt"
									label="Grain"
									uniform="uNoiseAmt"
									value={params.noiseAmt}
									min={0}
									max={0.1}
									step={0.002}
									format={(v) => v.toFixed(3)}
									onChange={(v) => set({ noiseAmt: v })}
								/>
							</div>

							{/* Presets */}
							<div className="mt-7 border-t border-[var(--line)] pt-5">
								<span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
									Presets
								</span>
								<div className="mt-3 flex flex-wrap gap-2">
									{PRESETS.map((preset) => (
										<button
											key={preset.name}
											type="button"
											onClick={() => onChange(preset.params)}
											className="group rounded-md border border-[var(--line-strong)] bg-[var(--navy)] px-3 py-2 text-left transition-colors hover:border-cobalt-bright"
										>
											<span className="block font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-ink group-hover:text-cobalt-bright">
												{preset.name}
											</span>
											<span className="block font-mono text-[9px] text-ink-faint">
												{preset.note}
											</span>
										</button>
									))}
								</div>
							</div>
						</div>
					</Reveal>
				</div>
			</div>
		</section>
	);
}
