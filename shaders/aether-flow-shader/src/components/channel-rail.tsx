import type { CSSProperties } from "react";
import { ControlSlider, type ShaderProps } from "@/components/ui/aether-flow";
import { CHANNELS } from "@/lib/presets";

interface ChannelRailProps {
	values: ShaderProps;
	onChange: (key: keyof ShaderProps, value: number) => void;
}

/**
 * The five faders. Each row wraps the verbatim `ControlSlider` from the
 * `components/ui` piece, adds a one-line description of what the channel does,
 * and feeds the slider's fill ratio into a CSS var so the re-skinned track
 * paints its filled portion. The numeric readout/label markup all comes from
 * ControlSlider itself — this only frames it.
 */
export function ChannelRail({ values, onChange }: ChannelRailProps) {
	return (
		<div className="space-y-5">
			<span className="font-mono text-[10px] uppercase tracking-wider2 text-muted">
				Field channels
			</span>
			{CHANNELS.map((c, i) => {
				const v = values[c.key];
				const fill = ((v - c.min) / (c.max - c.min)) * 100;
				return (
					<div
						key={c.key}
						className="aether-channel"
						style={{ "--fill": `${fill}%` } as CSSProperties}
					>
						<div className="mb-1 flex items-center gap-2">
							<span className="font-mono text-[10px] text-signal-400/80">
								{String(i + 1).padStart(2, "0")}
							</span>
							<span className="h-px flex-1 bg-hairline/70" />
							<span className="font-mono text-[9px] uppercase tracking-wide text-muted/70">
								{c.unit}
							</span>
						</div>
						<ControlSlider
							label={c.label}
							value={v}
							min={c.min}
							max={c.max}
							step={c.step}
							onChange={(e) => onChange(c.key, parseFloat(e.target.value))}
							className="aether-fader"
						/>
						<p className="mt-1.5 font-sans text-[11px] leading-snug text-muted/80">
							{c.blurb}
						</p>
					</div>
				);
			})}
		</div>
	);
}
