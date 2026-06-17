import { RotateCcw, SlidersHorizontal } from "lucide-react";

import { Reveal } from "@/components/Reveal";
import ShaderBackgroundPro, {
	DEFAULT_PARAMS,
	type ShaderParams,
} from "@/components/ui/shader-background-pro";

type ControlDeckProps = {
	params: ShaderParams;
	onChange: (next: ShaderParams) => void;
	onReset: () => void;
};

type Knob = {
	key: keyof ShaderParams;
	label: string;
	uniform: string;
	min: number;
	max: number;
	step: number;
	format: (v: number) => string;
};

const KNOBS: Knob[] = [
	{ key: "speed", label: "Tempo", uniform: "uSpeed", min: 0, max: 3, step: 0.05, format: (v) => `${v.toFixed(2)}×` },
	{ key: "scale", label: "Field scale", uniform: "uScale", min: 2, max: 12, step: 0.1, format: (v) => v.toFixed(1) },
	{ key: "amplitude", label: "Amplitude", uniform: "uAmplitude", min: 0.2, max: 2.4, step: 0.05, format: (v) => v.toFixed(2) },
	{ key: "warp", label: "Warp", uniform: "uWarp", min: 0, max: 2.5, step: 0.05, format: (v) => v.toFixed(2) },
	{ key: "lineCount", label: "Lines / group", uniform: "uLineCount", min: 2, max: 16, step: 1, format: (v) => `${Math.round(v)}` },
	{ key: "hue", label: "Hue shift", uniform: "uHue", min: -180, max: 180, step: 2, format: (v) => `${v > 0 ? "+" : ""}${Math.round(v)}°` },
];

const PRESETS: { name: string; tag: string; params: Partial<ShaderParams> }[] = [
	{ name: "Default", tag: "the brief", params: DEFAULT_PARAMS },
	{ name: "Aurora", tag: "calm, wide", params: { speed: 0.55, scale: 8, amplitude: 1.4, warp: 1.6, hue: -38, lineCount: 16 } },
	{ name: "Reactor", tag: "fast, tight", params: { speed: 2.2, scale: 3.4, amplitude: 1.1, warp: 0.6, hue: 24, lineCount: 16 } },
	{ name: "Acid", tag: "green burn", params: { speed: 1.3, scale: 5, amplitude: 1.6, warp: 1.2, hue: 120, lineCount: 12 } },
	{ name: "Hairline", tag: "minimal", params: { speed: 0.7, scale: 6.5, amplitude: 0.7, warp: 0.4, hue: 0, lineCount: 5 } },
];

export function ControlDeck({ params, onChange, onReset }: ControlDeckProps) {
	const set = (key: keyof ShaderParams, value: number) =>
		onChange({ ...params, [key]: value });

	const applyPreset = (preset: Partial<ShaderParams>) =>
		onChange({ ...DEFAULT_PARAMS, ...preset });

	return (
		<section
			id="deck"
			className="relative border-t border-[var(--line)] px-5 py-24 sm:px-8"
		>
			<div className="mx-auto max-w-6xl">
				<Reveal className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
					<div>
						<span className="font-mono text-xs uppercase tracking-[0.2em] text-phosphor">
							01 / control deck
						</span>
						<h2 className="mt-3 max-w-xl font-display text-[clamp(1.9rem,4.5vw,3.1rem)] font-bold leading-[0.98] tracking-[-0.02em] text-ink">
							Every constant is a knob.
						</h2>
						<p className="mt-4 max-w-md font-body text-ink-dim">
							The shipped component bakes its look into constants. This deck promotes
							them to live uniforms — drag a fader and the field below repaints on the
							next frame. Find a look you like, then copy the numbers.
						</p>
					</div>
					<button
						type="button"
						onClick={onReset}
						className="inline-flex w-fit items-center gap-2 rounded-md border border-[var(--line-strong)] bg-[var(--panel)] px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.12em] text-ink-dim backdrop-blur transition-colors hover:text-ink"
					>
						<RotateCcw className="h-3.5 w-3.5" />
						Reset to brief
					</button>
				</Reveal>

				<div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
					{/* live preview */}
					<Reveal className="brackets">
						<div className="panel relative overflow-hidden rounded-xl">
							<div className="aspect-[16/11] w-full sm:aspect-[16/10]">
								<ShaderBackgroundPro params={params} fixed={false} />
							</div>
							<div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3">
								<span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#d9d6ff]/80 mix-blend-screen">
									preview · same shader
								</span>
								<span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#d9d6ff]/80 mix-blend-screen">
									gl.drawArrays()
								</span>
							</div>
						</div>
					</Reveal>

					{/* faders + presets */}
					<Reveal delay={80}>
						<div className="panel flex h-full flex-col gap-6 rounded-xl p-5 sm:p-6">
							<div className="flex items-center gap-2 border-b border-[var(--line)] pb-4">
								<SlidersHorizontal className="h-4 w-4 text-violet" />
								<span className="font-mono text-xs uppercase tracking-[0.18em] text-ink">
									uniforms
								</span>
							</div>

							<div className="flex flex-col gap-5">
								{KNOBS.map((knob) => (
									<div key={knob.key}>
										<div className="mb-2 flex items-baseline justify-between">
											<label
												htmlFor={`fader-${knob.key}`}
												className="font-body text-sm text-ink"
											>
												{knob.label}
												<span className="ml-2 font-mono text-[10px] text-ink-faint">
													{knob.uniform}
												</span>
											</label>
											<span className="font-mono text-sm tabular-nums text-phosphor">
												{knob.format(params[knob.key])}
											</span>
										</div>
										<input
											id={`fader-${knob.key}`}
											className="fader"
											type="range"
											min={knob.min}
											max={knob.max}
											step={knob.step}
											value={params[knob.key]}
											onChange={(e) => set(knob.key, Number(e.target.value))}
										/>
									</div>
								))}
							</div>

							<div className="mt-auto border-t border-[var(--line)] pt-5">
								<span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
									presets
								</span>
								<div className="mt-3 flex flex-wrap gap-2">
									{PRESETS.map((preset) => (
										<button
											key={preset.name}
											type="button"
											onClick={() => applyPreset(preset.params)}
											className="group flex flex-col items-start rounded-md border border-[var(--line-strong)] bg-black/30 px-3 py-2 text-left transition-colors hover:border-violet hover:bg-violet-deep/15"
										>
											<span className="font-mono text-xs font-bold uppercase tracking-[0.08em] text-ink">
												{preset.name}
											</span>
											<span className="font-mono text-[10px] text-ink-faint">
												{preset.tag}
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
