type FaderProps = {
	id: string;
	label: string;
	/** GLSL identifier this fader drives, shown as a mono sub-label. */
	uniform: string;
	value: number;
	min: number;
	max: number;
	step: number;
	/** Format the live value for display. */
	format: (v: number) => string;
	onChange: (v: number) => void;
};

/**
 * One labelled blueprint fader. The thumb is styled in index.css (`.fader`).
 * Each fader promotes a baked-in GLSL `const` from the brief's shader to a live
 * uniform, so dragging it re-shapes or re-tints the whole field in real time.
 */
export function Fader({
	id,
	label,
	uniform,
	value,
	min,
	max,
	step,
	format,
	onChange,
}: FaderProps) {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-baseline justify-between">
				<label
					htmlFor={id}
					className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-ink"
				>
					{label}
				</label>
				<span
					className="font-mono text-xs tabular-nums text-cobalt-bright"
					data-fader-value={id}
				>
					{format(value)}
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
				onChange={(e) => onChange(Number(e.target.value))}
				aria-label={`${label} (${uniform})`}
			/>
			<span className="font-mono text-[10px] tracking-[0.05em] text-ink-faint">
				{uniform}
			</span>
		</div>
	);
}
