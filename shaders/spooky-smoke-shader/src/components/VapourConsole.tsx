import { Pipette } from "lucide-react";
import { REAGENTS } from "@/lib/reagents";
import type { TunedColor } from "@/hooks/useTunedColor";
import { cn } from "@/lib/utils";

interface VapourConsoleProps {
	tuned: TunedColor;
}

/**
 * The signature element: a "vapour console" that tunes the SmokeBackground's
 * `smokeColor`. A tray of reagent vials supplies presets, the brass dial wraps a
 * native <input type="color"> for arbitrary tints, and a live readout echoes the
 * exact value being pushed into the shader.
 */
export function VapourConsole({ tuned }: VapourConsoleProps) {
	const { hex, activeReagent, channels, selectReagent, setHex } = tuned;

	return (
		<section
			aria-label="Vapour console"
			className="glow-soft relative w-full max-w-[440px] border border-ash/15 bg-void/55 backdrop-blur-md"
		>
			{/* corner registration marks */}
			<span className="reg-mark pointer-events-none absolute -left-px -top-px h-4 w-4" />
			<span className="reg-mark pointer-events-none absolute -right-px -top-px h-4 w-4" />
			<span className="reg-mark pointer-events-none absolute -bottom-px -left-px h-4 w-4" />
			<span className="reg-mark pointer-events-none absolute -bottom-px -right-px h-4 w-4" />

			{/* header strip */}
			<header className="flex items-center justify-between border-b border-ash/12 px-5 py-3">
				<span className="font-mono text-[10px] uppercase tracking-[0.34em] text-smoke">
					Vapour console
				</span>
				<span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-smoke/70">
					<span className="h-1.5 w-1.5 animate-flicker rounded-full bg-ember" />
					live
				</span>
			</header>

			<div className="space-y-6 px-5 py-5">
				{/* live readout */}
				<div className="flex items-stretch gap-4">
					<div
						className="relative h-16 w-16 shrink-0 border border-ash/15"
						style={{ background: hex }}
						aria-hidden="true"
					>
						<span className="absolute inset-0 grain-overlay" />
					</div>
					<div className="flex min-w-0 flex-col justify-center">
						<div className="font-display text-3xl leading-none text-ash">
							{activeReagent ? activeReagent.name : "Manual tincture"}
						</div>
						<p className="mt-1 truncate font-mono text-[11px] uppercase tracking-[0.18em] text-smoke">
							{hex} · r{channels.r} g{channels.g} b{channels.b}
						</p>
					</div>
				</div>

				{/* reagent tray */}
				<div>
					<p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-smoke/70">
						Reagent tray
					</p>
					<div className="grid grid-cols-4 gap-2">
						{REAGENTS.map((r) => {
							const selected = r.hex.toLowerCase() === hex;
							return (
								<button
									key={r.hex}
									type="button"
									onClick={() => selectReagent(r.hex)}
									aria-pressed={selected}
									title={`${r.name} — ${r.hex}`}
									className={cn(
										"group relative flex aspect-square flex-col items-center justify-end gap-1 border p-1.5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ash/60",
										selected
											? "border-ash/70 bg-ash/[0.06]"
											: "border-ash/12 hover:border-ash/35",
									)}
								>
									<span
										className="h-6 w-6 rounded-full transition-transform duration-200 group-hover:scale-110"
										style={{
											background: r.hex,
											boxShadow: selected
												? `0 0 14px -2px ${r.hex}`
												: `0 0 0 1px rgba(235,231,223,0.12)`,
										}}
										aria-hidden="true"
									/>
									<span className="font-mono text-[9px] uppercase tracking-[0.1em] text-smoke/80">
										{r.numeral}
									</span>
								</button>
							);
						})}
					</div>
				</div>

				{/* brass dial — wraps native color input */}
				<div className="flex items-center justify-between border-t border-ash/12 pt-5">
					<div className="min-w-0 pr-4">
						<p className="font-mono text-[10px] uppercase tracking-[0.3em] text-smoke/70">
							Manual dial
						</p>
						<p className="mt-1 font-display text-base italic leading-tight text-bone/90">
							{activeReagent
								? activeReagent.reading
								: "an unnamed tint of your own divining."}
						</p>
					</div>
					<label
						className="relative grid h-14 w-14 shrink-0 cursor-pointer place-items-center rounded-full border border-ash/25 bg-ink transition-colors duration-200 hover:border-ash/55 focus-within:ring-2 focus-within:ring-ash/60"
						title="Open the manual colour dial"
					>
						<span
							className="pointer-events-none absolute inset-1.5 rounded-full"
							style={{ background: hex, boxShadow: `0 0 18px -4px ${hex}` }}
							aria-hidden="true"
						/>
						<Pipette
							className="pointer-events-none relative h-4 w-4 text-void mix-blend-difference"
							strokeWidth={1.75}
							aria-hidden="true"
						/>
						<input
							type="color"
							value={hex}
							onChange={(e) => setHex(e.target.value)}
							className="reagent-dial absolute inset-0 opacity-0"
							aria-label="Tune the smoke colour with a custom value"
						/>
					</label>
				</div>
			</div>
		</section>
	);
}
