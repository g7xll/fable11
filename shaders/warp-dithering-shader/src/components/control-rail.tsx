import { Dices, RotateCcw, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { SHAPES, TYPES } from "@/lib/shader-meta";
import type {
	DitheringShape,
	DitheringType,
} from "@/components/ui/dithering-shader";
import type { LiveParams } from "@/lib/shader-meta";

interface ControlRailProps {
	params: LiveParams;
	onChange: (patch: Partial<LiveParams>) => void;
	onReset: () => void;
	onRandomize: () => void;
}

interface Option {
	id: string;
	label: string;
}

function Segmented({
	groupLabel,
	options,
	value,
	onSelect,
	dataAttr,
}: {
	groupLabel: string;
	options: Option[];
	value: string;
	onSelect: (id: string) => void;
	dataAttr: string;
}) {
	return (
		<div className="flex flex-col gap-1.5">
			<span className="text-[9px] uppercase tracking-widest2 text-ash">
				{groupLabel}
			</span>
			<div className="flex flex-wrap gap-1">
				{options.map((option) => {
					const active = option.id === value;
					return (
						<button
							key={option.id}
							type="button"
							data-control={dataAttr}
							data-value={option.id}
							aria-pressed={active}
							onClick={() => onSelect(option.id)}
							className={cn(
								"border px-2.5 py-1 font-mono text-[11px] uppercase leading-none tracking-wide transition-colors",
								active
									? "border-amber bg-amber/15 text-amber shadow-phosphor"
									: "border-border/70 bg-ink/60 text-ash hover:border-amber/50 hover:text-bone",
							)}
						>
							{option.label}
						</button>
					);
				})}
			</div>
		</div>
	);
}

function Fader({
	label,
	value,
	min,
	max,
	step,
	display,
	dataAttr,
	onInput,
}: {
	label: string;
	value: number;
	min: number;
	max: number;
	step: number;
	display: string;
	dataAttr: string;
	onInput: (value: number) => void;
}) {
	return (
		<div className="flex min-w-[120px] flex-col gap-1.5">
			<div className="flex items-center justify-between">
				<span className="text-[9px] uppercase tracking-widest2 text-ash">
					{label}
				</span>
				<span className="font-mono text-[11px] tabular-nums text-amber">
					{display}
				</span>
			</div>
			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				data-control={dataAttr}
				aria-label={label}
				onChange={(event) => onInput(Number(event.target.value))}
			/>
		</div>
	);
}

function Swatch({
	label,
	value,
	dataAttr,
	onChange,
}: {
	label: string;
	value: string;
	dataAttr: string;
	onChange: (value: string) => void;
}) {
	return (
		<label className="flex cursor-pointer flex-col gap-1.5">
			<span className="text-[9px] uppercase tracking-widest2 text-ash">
				{label}
			</span>
			<span className="flex items-center gap-2 border border-border/70 bg-ink/60 px-1.5 py-1">
				<input
					type="color"
					value={value}
					data-control={dataAttr}
					aria-label={label}
					onChange={(event) => onChange(event.target.value)}
					className="h-5 w-6"
				/>
				<span className="font-mono text-[11px] uppercase tabular-nums text-bone">
					{value}
				</span>
			</span>
		</label>
	);
}

/** The live driving console pinned to the bottom of the hero. */
export function ControlRail({
	params,
	onChange,
	onReset,
	onRandomize,
}: ControlRailProps) {
	return (
		<div className="relative border border-border/70 bg-panel/80 p-4 backdrop-blur-md">
			<div className="mb-3 flex items-center gap-2 text-amber">
				<SlidersHorizontal className="h-3.5 w-3.5" />
				<span className="font-mono text-[11px] uppercase tracking-widest2">
					Driving console
				</span>
				<span className="ml-auto flex gap-1.5">
					<button
						type="button"
						data-action="randomize"
						onClick={onRandomize}
						className="flex items-center gap-1.5 border border-border/70 bg-ink/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-ash transition-colors hover:border-amber/60 hover:text-bone"
					>
						<Dices className="h-3 w-3" /> Random
					</button>
					<button
						type="button"
						data-action="reset"
						onClick={onReset}
						className="flex items-center gap-1.5 border border-border/70 bg-ink/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-ash transition-colors hover:border-amber/60 hover:text-bone"
					>
						<RotateCcw className="h-3 w-3" /> Reset
					</button>
				</span>
			</div>

			<div className="flex flex-wrap items-start gap-x-6 gap-y-4">
				<Segmented
					groupLabel="Shape · u_shape"
					dataAttr="shape"
					options={SHAPES.map((s) => ({ id: s.id, label: s.label }))}
					value={params.shape}
					onSelect={(id) => onChange({ shape: id as DitheringShape })}
				/>
				<Segmented
					groupLabel="Dither · u_type"
					dataAttr="type"
					options={TYPES.map((t) => ({ id: t.id, label: t.label }))}
					value={params.type}
					onSelect={(id) => onChange({ type: id as DitheringType })}
				/>
				<Fader
					label="px size"
					dataAttr="pxSize"
					value={params.pxSize}
					min={1}
					max={16}
					step={1}
					display={params.pxSize.toFixed(0)}
					onInput={(value) => onChange({ pxSize: value })}
				/>
				<Fader
					label="speed"
					dataAttr="speed"
					value={params.speed}
					min={0}
					max={2}
					step={0.1}
					display={params.speed.toFixed(1)}
					onInput={(value) => onChange({ speed: value })}
				/>
				<Swatch
					label="back"
					dataAttr="colorBack"
					value={params.colorBack}
					onChange={(value) => onChange({ colorBack: value })}
				/>
				<Swatch
					label="front"
					dataAttr="colorFront"
					value={params.colorFront}
					onChange={(value) => onChange({ colorFront: value })}
				/>
			</div>
		</div>
	);
}
