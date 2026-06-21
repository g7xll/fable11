import {
	Droplets,
	Flame,
	Pause,
	Play,
	RotateCcw,
	Sliders,
	Waves,
} from "lucide-react";
import { Fader, Segmented } from "@/components/lab/controls";
import { cn } from "@/lib/utils";
import type {
	PaletteId,
	ShaderSettings,
} from "@/components/ui/abstract-glassy-shader";

export function ControlDeck({
	settings,
	onChange,
	onReset,
}: {
	settings: ShaderSettings;
	onChange: (patch: Partial<ShaderSettings>) => void;
	onReset: () => void;
}) {
	return (
		<div className="glass rounded-2xl p-4">
			<div className="mb-3.5 flex items-center justify-between">
				<div className="flex items-center gap-1.5">
					<Sliders className="h-3.5 w-3.5 text-accent" />
					<span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/80">
						Control Deck
					</span>
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => onChange({ paused: !settings.paused })}
						className={cn(
							"inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors",
							settings.paused
								? "border-accent/50 bg-accent/15 text-accent"
								: "border-border bg-white/5 text-foreground/80 hover:bg-white/10",
						)}
					>
						{settings.paused ? (
							<Play className="h-3 w-3" />
						) : (
							<Pause className="h-3 w-3" />
						)}
						{settings.paused ? "Play" : "Freeze"}
					</button>
					<button
						type="button"
						onClick={onReset}
						className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white/5 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/80 transition-colors hover:bg-white/10"
					>
						<RotateCcw className="h-3 w-3" />
						Reset
					</button>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-x-5 gap-y-3.5 sm:grid-cols-3 lg:grid-cols-4">
				<Fader
					label="Speed"
					value={settings.speed}
					min={0}
					max={3}
					step={0.05}
					onChange={(v) => onChange({ speed: v })}
					format={(v) => `${v.toFixed(2)}×`}
				/>
				<Fader
					label="Merge · k"
					value={settings.merge}
					min={0.02}
					max={0.6}
					step={0.01}
					onChange={(v) => onChange({ merge: v })}
				/>
				<Fader
					label="Glow"
					value={settings.glow}
					min={2}
					max={24}
					step={0.5}
					onChange={(v) => onChange({ glow: v })}
					format={(v) => v.toFixed(1)}
				/>
				<Fader
					label="Spread"
					value={settings.spread}
					min={0.05}
					max={0.7}
					step={0.01}
					onChange={(v) => onChange({ spread: v })}
				/>
				<Fader
					label="Radius A"
					value={settings.radius1}
					min={0.05}
					max={0.4}
					step={0.01}
					onChange={(v) => onChange({ radius1: v })}
				/>
				<Fader
					label="Radius B"
					value={settings.radius2}
					min={0.05}
					max={0.4}
					step={0.01}
					onChange={(v) => onChange({ radius2: v })}
				/>
				<Fader
					label="Core"
					value={settings.core}
					min={0}
					max={1}
					step={0.05}
					onChange={(v) => onChange({ core: v })}
				/>
				<div className="block">
					<span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
						Palette
					</span>
					<Segmented<PaletteId>
						value={settings.palette}
						onChange={(v) => onChange({ palette: v })}
						options={[
							{
								value: "spectrum",
								label: "Spec",
								icon: <Waves className="h-3 w-3" />,
							},
							{
								value: "glass",
								label: "Glass",
								icon: <Droplets className="h-3 w-3" />,
							},
							{
								value: "ember",
								label: "Ember",
								icon: <Flame className="h-3 w-3" />,
							},
						]}
					/>
				</div>
			</div>
		</div>
	);
}
