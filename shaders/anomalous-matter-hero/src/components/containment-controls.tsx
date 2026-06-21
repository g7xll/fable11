import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

/** A single labelled fader wired straight into a shader uniform. */
export function Fader({
	label,
	value,
	min,
	max,
	step,
	unit = "",
	format = (v) => String(Math.round(v)),
	onChange,
}: {
	label: string;
	value: number;
	min: number;
	max: number;
	step: number;
	unit?: string;
	format?: (v: number) => string;
	onChange: (next: number) => void;
}) {
	return (
		<label className="group flex select-none items-center gap-3 border border-glow-500/25 bg-void-ink/65 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-void-steel backdrop-blur-md">
			<span className="w-16 shrink-0 text-glow-200">{label}</span>
			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				aria-label={label}
				onChange={(e) => onChange(Number(e.target.value))}
				className={cn(
					"h-1 w-24 cursor-pointer appearance-none rounded-full bg-void-slate accent-glow-500 sm:w-32",
					"[&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3",
					"[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
					"[&::-webkit-slider-thumb]:bg-glow-300 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(52,182,241,0.9)]",
					"[&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:border-0",
					"[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-glow-300",
					"focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-glow-400",
				)}
			/>
			<span className="w-10 shrink-0 text-right tabular-nums text-glow-100">
				{format(value)}
				{unit}
			</span>
		</label>
	);
}

/** Freeze / resume the simulation clock. */
export function FreezeToggle({
	paused,
	onToggle,
}: {
	paused: boolean;
	onToggle: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onToggle}
			aria-pressed={paused}
			aria-label={paused ? "Resume specimen" : "Freeze specimen"}
			title={paused ? "Resume specimen" : "Freeze specimen"}
			className={cn(
				"flex items-center gap-2 border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] backdrop-blur-md transition-colors",
				"focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-glow-400",
				paused
					? "border-glow-400/60 bg-glow-500/15 text-glow-100"
					: "border-glow-500/25 bg-void-ink/65 text-void-steel hover:text-glow-200",
			)}
		>
			{paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
			<span>{paused ? "Frozen" : "Live"}</span>
		</button>
	);
}
