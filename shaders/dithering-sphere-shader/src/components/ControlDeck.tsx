import { ArrowLeftRight, RotateCcw, SlidersHorizontal } from "lucide-react";

import { DitheringStage } from "@/components/DitheringStage";
import { Reveal } from "@/components/Reveal";
import {
	DEFAULT_PARAMS,
	PRESETS,
	PX_RANGE,
	SHAPES,
	SPEED_RANGE,
	TYPES,
	type Params,
} from "@/lib/dithering";

type ControlDeckProps = {
	params: Params;
	onChange: (next: Params) => void;
};

const FRONT_SWATCHES = ["#f43f5e", "#f3efe7", "#c6f55a", "#7dd3fc", "#fbbf24", "#ffffff"];
const BACK_SWATCHES = ["#000000", "#0a0a0b", "#05060a", "#1a0b1f", "#03120a", "#f4f1ea"];

function Segmented<T extends string>({
	options,
	value,
	onSelect,
	testidPrefix,
}: {
	options: { key: T; label: string }[];
	value: T;
	onSelect: (key: T) => void;
	testidPrefix: string;
}) {
	return (
		<div className="flex flex-wrap gap-1.5">
			{options.map((o) => {
				const active = o.key === value;
				return (
					<button
						key={o.key}
						type="button"
						data-testid={`${testidPrefix}-${o.key}`}
						aria-pressed={active}
						onClick={() => onSelect(o.key)}
						className={[
							"rounded-md border px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] transition-colors",
							active
								? "border-[var(--rose-line)] bg-rose/15 text-rose"
								: "border-[var(--line-strong)] bg-[var(--ink-2)] text-paper-dim hover:text-paper",
						].join(" ")}
					>
						{o.label}
					</button>
				);
			})}
		</div>
	);
}

function Fader({
	id,
	label,
	value,
	display,
	min,
	max,
	step,
	onInput,
}: {
	id: string;
	label: string;
	value: number;
	display: string;
	min: number;
	max: number;
	step: number;
	onInput: (v: number) => void;
}) {
	return (
		<div>
			<div className="mb-2 flex items-baseline justify-between">
				<label
					htmlFor={id}
					className="font-mono text-[11px] uppercase tracking-[0.14em] text-paper-dim"
				>
					{label}
				</label>
				<span data-testid={`${id}-value`} className="font-mono text-xs font-bold text-paper">
					{display}
				</span>
			</div>
			<input
				id={id}
				type="range"
				className="fader"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(e) => onInput(Number(e.target.value))}
			/>
		</div>
	);
}

function SwatchRow({
	label,
	swatches,
	value,
	onPick,
}: {
	label: string;
	swatches: string[];
	value: string;
	onPick: (hex: string) => void;
}) {
	return (
		<div>
			<span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-paper-dim">
				{label}
			</span>
			<div className="flex items-center gap-2">
				{swatches.map((hex) => {
					const active = hex.toLowerCase() === value.toLowerCase();
					return (
						<button
							key={hex}
							type="button"
							onClick={() => onPick(hex)}
							aria-label={`${label}: ${hex}`}
							aria-pressed={active}
							className={[
								"h-7 w-7 rounded-md border transition-transform hover:scale-110",
								active
									? "border-rose ring-2 ring-rose/50"
									: "border-[var(--line-strong)]",
							].join(" ")}
							style={{ background: hex }}
						/>
					);
				})}
			</div>
		</div>
	);
}

export function ControlDeck({ params, onChange }: ControlDeckProps) {
	const set = <K extends keyof Params>(key: K, value: Params[K]) =>
		onChange({ ...params, [key]: value });

	return (
		<section id="deck" className="relative border-t border-[var(--line)] px-5 py-24 sm:px-8">
			<div className="mx-auto max-w-6xl">
				<Reveal className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
					<div>
						<span className="font-mono text-xs uppercase tracking-[0.2em] text-rose">
							01 / control deck
						</span>
						<h2 className="mt-3 flex items-center gap-3 font-display text-[clamp(1.9rem,4.5vw,3.1rem)] font-bold leading-[0.98] tracking-[-0.02em] text-paper">
							<SlidersHorizontal className="h-7 w-7 text-paper-faint" />
							Every prop is a knob.
						</h2>
						<p className="mt-4 max-w-md font-body text-paper-dim">
							These controls map one-to-one to the component's props —{" "}
							<code className="font-mono text-paper">shape</code>,{" "}
							<code className="font-mono text-paper">type</code>,{" "}
							<code className="font-mono text-paper">pxSize</code>,{" "}
							<code className="font-mono text-paper">speed</code>,{" "}
							<code className="font-mono text-paper">colorFront/Back</code>. Drag a fader
							and the hero above repaints on the next frame, because both share one
							params object.
						</p>
					</div>
					<button
						type="button"
						onClick={() => onChange({ ...DEFAULT_PARAMS })}
						className="inline-flex w-fit items-center gap-2 rounded-md border border-[var(--line-strong)] bg-[var(--panel)] px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.12em] text-paper-dim backdrop-blur transition-colors hover:text-paper"
					>
						<RotateCcw className="h-3.5 w-3.5" />
						Reset to brief
					</button>
				</Reveal>

				<div className="grid gap-5 lg:grid-cols-[1.05fr_1fr]">
					{/* live preview — same component, same params as the hero */}
					<Reveal className="brackets">
						<div className="panel relative overflow-hidden rounded-xl">
							<div className="aspect-[16/12] w-full sm:aspect-[16/10]">
								<DitheringStage params={params} className="h-full w-full" />
							</div>
							<div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3">
								<span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/70">
									preview · same shader
								</span>
								<span className="font-mono text-[10px] uppercase tracking-[0.2em] text-rose">
									● live
								</span>
							</div>
						</div>
					</Reveal>

					{/* controls */}
					<Reveal delay={80} className="panel rounded-xl p-5 sm:p-6">
						<div className="flex flex-col gap-6">
							<div>
								<span className="mb-2.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-paper-dim">
									Shape <span className="text-paper-faint">· u_shape</span>
								</span>
								<Segmented
									testidPrefix="shape"
									options={SHAPES.map((s) => ({ key: s.key, label: s.label }))}
									value={params.shape}
									onSelect={(key) => set("shape", key)}
								/>
							</div>

							<div>
								<span className="mb-2.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-paper-dim">
									Dither <span className="text-paper-faint">· u_type</span>
								</span>
								<Segmented
									testidPrefix="type"
									options={TYPES.map((t) => ({ key: t.key, label: t.label }))}
									value={params.type}
									onSelect={(key) => set("type", key)}
								/>
							</div>

							<div className="grid gap-5 sm:grid-cols-2">
								<Fader
									id="fader-px"
									label="Pixel size"
									value={params.pxSize}
									display={`${params.pxSize}px`}
									min={PX_RANGE.min}
									max={PX_RANGE.max}
									step={PX_RANGE.step}
									onInput={(v) => set("pxSize", v)}
								/>
								<Fader
									id="fader-speed"
									label="Speed"
									value={params.speed}
									display={`${params.speed.toFixed(1)}×`}
									min={SPEED_RANGE.min}
									max={SPEED_RANGE.max}
									step={SPEED_RANGE.step}
									onInput={(v) => set("speed", v)}
								/>
							</div>

							<div className="grid gap-5 sm:grid-cols-2">
								<SwatchRow
									label="Front · colorFront"
									swatches={FRONT_SWATCHES}
									value={params.colorFront}
									onPick={(hex) => set("colorFront", hex)}
								/>
								<SwatchRow
									label="Back · colorBack"
									swatches={BACK_SWATCHES}
									value={params.colorBack}
									onPick={(hex) => set("colorBack", hex)}
								/>
							</div>

							<button
								type="button"
								onClick={() =>
									onChange({ ...params, colorFront: params.colorBack, colorBack: params.colorFront })
								}
								className="inline-flex w-fit items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-paper-faint transition-colors hover:text-rose"
							>
								<ArrowLeftRight className="h-3.5 w-3.5" />
								Swap front / back
							</button>
						</div>
					</Reveal>
				</div>

				{/* presets */}
				<Reveal delay={120} className="mt-6">
					<div className="flex flex-wrap items-center gap-2.5">
						<span className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper-faint">
							Presets
						</span>
						{PRESETS.map((p) => (
							<button
								key={p.name}
								type="button"
								data-testid={`preset-${p.name}`}
								onClick={() => onChange({ ...p.params })}
								className="group rounded-md border border-[var(--line-strong)] bg-[var(--ink-2)] px-3 py-1.5 text-left transition-colors hover:border-[var(--rose-line)]"
							>
								<span className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-paper group-hover:text-rose">
									{p.name}
								</span>
								<span className="ml-2 font-mono text-[10px] uppercase tracking-[0.08em] text-paper-faint">
									{p.tag}
								</span>
							</button>
						))}
					</div>
				</Reveal>
			</div>
		</section>
	);
}
