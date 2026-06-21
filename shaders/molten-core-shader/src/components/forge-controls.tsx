import { MonitorCog, Moon, Sun } from "lucide-react";
import type { MoltenCoreTheme } from "@/components/ui/molten-core-shader";
import { cn } from "@/lib/utils";

const OPTIONS: { value: MoltenCoreTheme; label: string; icon: typeof Sun }[] = [
	{ value: "light", label: "Light", icon: Sun },
	{ value: "system", label: "Auto", icon: MonitorCog },
	{ value: "dark", label: "Dark", icon: Moon },
];

export function ThemeToggle({
	value,
	onChange,
}: {
	value: MoltenCoreTheme;
	onChange: (next: MoltenCoreTheme) => void;
}) {
	return (
		<div
			role="radiogroup"
			aria-label="Base color"
			className="flex items-center gap-0.5 border border-ember-500/25 bg-forge-black/55 p-0.5 backdrop-blur-md"
		>
			{OPTIONS.map(({ value: v, label, icon: Icon }) => {
				const active = v === value;
				return (
					<button
						key={v}
						role="radio"
						aria-checked={active}
						aria-label={`${label} base`}
						title={`${label} base`}
						onClick={() => onChange(v)}
						className={cn(
							"flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors",
							"focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ember-400",
							active
								? "bg-ember-500 text-forge-black"
								: "text-forge-steel hover:text-ember-200",
						)}
					>
						<Icon className="h-3 w-3" />
						<span className="hidden sm:inline">{label}</span>
					</button>
				);
			})}
		</div>
	);
}

export function IntensityDial({
	value,
	onChange,
}: {
	value: number;
	onChange: (next: number) => void;
}) {
	return (
		<label className="group flex select-none items-center gap-3 border border-ember-500/25 bg-forge-black/55 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-forge-steel backdrop-blur-md">
			<span className="text-ember-200">Melt</span>
			<input
				type="range"
				min={0.35}
				max={1}
				step={0.01}
				value={value}
				aria-label="Lava melt intensity"
				onChange={(e) => onChange(Number(e.target.value))}
				className={cn(
					"h-1 w-28 cursor-pointer appearance-none rounded-full bg-forge-smoke accent-ember-500 sm:w-36",
					"[&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3",
					"[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
					"[&::-webkit-slider-thumb]:bg-ember-400 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,138,31,0.9)]",
					"focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ember-400",
				)}
			/>
			<span className="w-8 tabular-nums text-ember-100">
				{Math.round(value * 100)}
			</span>
		</label>
	);
}
