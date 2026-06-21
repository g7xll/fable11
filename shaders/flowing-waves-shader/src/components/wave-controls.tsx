import { Activity, CalendarClock, Eye, Minus, Plus, Waves } from "lucide-react";
import type { WaveMode } from "@/components/ui/flowing-waves-shader";
import { cn } from "@/lib/utils";

const MODES: {
	value: WaveMode;
	label: string;
	short: string;
	icon: typeof Waves;
}[] = [
	{ value: "neutral", label: "Calm", short: "Calm", icon: Waves },
	{ value: "active", label: "Active swell", short: "Active", icon: Activity },
	{
		value: "upcoming",
		label: "Upcoming",
		short: "Forecast",
		icon: CalendarClock,
	},
];

/**
 * Segmented selector for the shader's three color branches. This is the
 * humane re-framing of the original `active reminders` / `upcoming reminders`
 * booleans: an exclusive sea-state mode rather than two overlapping switches.
 */
export function ModeSelector({
	value,
	onChange,
}: {
	value: WaveMode;
	onChange: (next: WaveMode) => void;
}) {
	return (
		<div
			role="radiogroup"
			aria-label="Sea state"
			className="glass flex items-center gap-0.5 rounded-none border border-tide-500/25 p-0.5"
		>
			{MODES.map(({ value: v, label, short, icon: Icon }) => {
				const active = v === value;
				const accent =
					v === "active"
						? "bg-tide-400 text-abyss-900"
						: v === "upcoming"
							? "bg-kelp-400 text-abyss-900"
							: "bg-foam-100 text-abyss-900";
				return (
					<button
						key={v}
						role="radio"
						aria-checked={active}
						aria-label={label}
						title={label}
						onClick={() => onChange(v)}
						className={cn(
							"flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors",
							"focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-tide-300",
							active ? accent : "text-foam-300 hover:text-foam-100",
						)}
					>
						<Icon className="h-3 w-3" />
						<span className="hidden sm:inline">{short}</span>
					</button>
				);
			})}
		</div>
	);
}

/** The third original boolean — `disableCenterDimming` — as a single toggle. */
export function ClarityToggle({
	value,
	onChange,
}: {
	value: boolean;
	onChange: (next: boolean) => void;
}) {
	return (
		<button
			role="switch"
			aria-checked={value}
			aria-label="Lift center dimming"
			onClick={() => onChange(!value)}
			className={cn(
				"glass group flex items-center gap-2 border border-tide-500/25 px-2.5 py-1.5",
				"font-mono text-[10px] uppercase tracking-[0.2em] transition-colors",
				"focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-tide-300",
				value ? "text-tide-100" : "text-foam-300 hover:text-foam-100",
			)}
		>
			<Eye className="h-3 w-3" />
			<span className="hidden sm:inline">Center</span>
			<span
				className={cn(
					"relative inline-flex h-3 w-6 items-center rounded-full transition-colors",
					value ? "bg-tide-400" : "bg-abyss-500",
				)}
				aria-hidden
			>
				<span
					className={cn(
						"inline-block h-2 w-2 translate-x-0.5 rounded-full bg-abyss-900 transition-transform",
						value && "translate-x-3.5 bg-foam-50",
					)}
				/>
			</span>
		</button>
	);
}

/**
 * Amplitude dial driving the shader's `intensity` uniform. Stepper buttons
 * keep it usable on touch; the range slider is the primary control.
 */
export function AmplitudeDial({
	value,
	onChange,
}: {
	value: number;
	onChange: (next: number) => void;
}) {
	const clamp = (n: number) => Math.min(1, Math.max(0.35, n));
	return (
		<div className="glass flex select-none items-center gap-2 border border-tide-500/25 px-2.5 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-foam-300">
			<span className="text-tide-100">Amp</span>
			<button
				type="button"
				aria-label="Decrease amplitude"
				onClick={() => onChange(clamp(value - 0.05))}
				className="grid h-4 w-4 place-items-center text-foam-300 transition-colors hover:text-tide-200 focus-visible:outline focus-visible:outline-1 focus-visible:outline-tide-300"
			>
				<Minus className="h-3 w-3" />
			</button>
			<input
				type="range"
				min={0.35}
				max={1}
				step={0.01}
				value={value}
				aria-label="Wave amplitude"
				onChange={(e) => onChange(Number(e.target.value))}
				className={cn(
					"h-1 w-24 cursor-pointer appearance-none rounded-full bg-abyss-500 accent-tide-400 sm:w-32",
					"[&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3",
					"[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
					"[&::-webkit-slider-thumb]:bg-tide-300 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(84,182,255,0.9)]",
					"focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-tide-300",
				)}
			/>
			<button
				type="button"
				aria-label="Increase amplitude"
				onClick={() => onChange(clamp(value + 0.05))}
				className="grid h-4 w-4 place-items-center text-foam-300 transition-colors hover:text-tide-200 focus-visible:outline focus-visible:outline-1 focus-visible:outline-tide-300"
			>
				<Plus className="h-3 w-3" />
			</button>
			<span className="w-7 tabular-nums text-foam-50">
				{Math.round(value * 100)}
			</span>
		</div>
	);
}
