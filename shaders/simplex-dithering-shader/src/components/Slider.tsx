import { cn } from "@/lib/utils";

interface SliderProps {
	label: string;
	value: number;
	min: number;
	max: number;
	step: number;
	display: string;
	onChange: (value: number) => void;
	className?: string;
}

/**
 * Lab-instrument range control. The track is a hairline; the fill and value
 * readout share the amber ink the shader paints with, so the control reads as
 * part of the same instrument.
 */
export default function Slider({
	label,
	value,
	min,
	max,
	step,
	display,
	onChange,
	className,
}: SliderProps) {
	const pct = ((value - min) / (max - min)) * 100;

	return (
		<div className={cn("group", className)}>
			<div className="mb-2 flex items-baseline justify-between">
				<label className="font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
					{label}
				</label>
				<span className="font-mono text-xs tabular-nums text-amber">
					{display}
				</span>
			</div>
			<div className="relative flex items-center">
				{/* Painted fill behind the native track. */}
				<div className="pointer-events-none absolute inset-x-0 h-[3px] rounded-full bg-line" />
				<div
					className="pointer-events-none absolute h-[3px] rounded-full bg-amber/80"
					style={{ width: `${pct}%` }}
				/>
				<input
					type="range"
					min={min}
					max={max}
					step={step}
					value={value}
					onChange={(e) => onChange(parseFloat(e.target.value))}
					aria-label={label}
					className="dither-range relative z-10 w-full"
				/>
			</div>
		</div>
	);
}
