import React, { useId } from "react";

interface FaderProps {
	label: string;
	value: number;
	min: number;
	max: number;
	step: number;
	/** Right-aligned formatted readout of the current value. */
	display: string;
	onChange: (v: number) => void;
}

/**
 * Instrument fader: mono label on the left, live value on the right, a hairline
 * track with an amber fill below.
 */
const Fader: React.FC<FaderProps> = ({
	label,
	value,
	min,
	max,
	step,
	display,
	onChange,
}) => {
	const id = useId();
	const pct = ((value - min) / (max - min)) * 100;
	return (
		<div className="select-none">
			<div className="flex items-baseline justify-between">
				<label
					htmlFor={id}
					className="font-mono text-[10px] uppercase tracking-[0.22em] text-ash"
				>
					{label}
				</label>
				<span className="font-mono text-xs tabular-nums text-paper">
					{display}
				</span>
			</div>
			<input
				id={id}
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(e) => onChange(parseFloat(e.target.value))}
				className="fader mt-2.5 w-full"
				style={{
					background: `linear-gradient(90deg, var(--color-amber) ${pct}%, rgba(237,237,242,0.14) ${pct}%)`,
				}}
			/>
		</div>
	);
};

export default Fader;
