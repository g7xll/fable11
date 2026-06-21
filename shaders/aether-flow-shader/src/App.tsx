import { Crosshair, Hexagon, Wind } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChannelRail } from "@/components/channel-rail";
import { PresetBank } from "@/components/preset-bank";
import { Telemetry } from "@/components/telemetry";
import { ShaderCanvas, type ShaderProps } from "@/components/ui/aether-flow";
import { type AetherPreset, PRESETS } from "@/lib/presets";

/* Reticle bracket — drawn at each corner of the observation window so the live
   field reads as something under instrument observation, not a stock hero. */
function Bracket({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 40 40"
			className={className}
			fill="none"
			stroke="currentColor"
			strokeWidth="1"
			aria-hidden="true"
		>
			<path d="M1 12 V1 H12" />
			<path d="M28 1 H39 V12" />
			<path d="M39 28 V39 H28" />
			<path d="M12 39 H1 V28" />
		</svg>
	);
}

export default function App() {
	const initial = PRESETS[0];
	const [values, setValues] = useState<ShaderProps>(initial.values);
	const [activeCode, setActiveCode] = useState<string | null>(initial.code);
	const [warp, setWarp] = useState({ x: 0.5, y: 0.5 });

	// Throttle warp-coordinate state updates to one per frame so a fast pointer
	// doesn't thrash React; the shader itself reads the raw event directly.
	const pending = useRef<{ x: number; y: number } | null>(null);
	const raf = useRef<number>(0);
	const handleWarp = useCallback((x: number, y: number) => {
		pending.current = { x, y };
		if (raf.current) return;
		raf.current = requestAnimationFrame(() => {
			raf.current = 0;
			if (pending.current) setWarp(pending.current);
		});
	}, []);
	useEffect(() => () => cancelAnimationFrame(raf.current), []);

	// A manual fader move means the field no longer matches a stored patch.
	const setChannel = (key: keyof ShaderProps, value: number) => {
		setValues((v) => ({ ...v, [key]: value }));
		setActiveCode(null);
	};

	const selectPreset = (p: AetherPreset) => {
		setValues(p.values);
		setActiveCode(p.code);
	};

	const activeName =
		PRESETS.find((p) => p.code === activeCode)?.name ?? "Custom";

	return (
		<div className="relative min-h-screen overflow-hidden bg-ink-900 text-chalk lg:h-screen">
			{/* Ambient grain over the whole console. */}
			<div className="pointer-events-none absolute inset-0 z-50 grain opacity-[0.04] mix-blend-overlay" />

			<div className="relative z-10 flex min-h-screen flex-col lg:h-screen">
				{/* ── Masthead ───────────────────────────────────────────────── */}
				<header className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-hairline/70 px-5 py-3.5 sm:px-7">
					<div className="flex items-center gap-3">
						<span className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-signal-400/40 bg-signal-400/10 text-signal-300">
							<Wind className="h-4 w-4" strokeWidth={1.5} />
						</span>
						<div className="leading-none">
							<p className="font-display text-[15px] font-medium tracking-tight text-chalk">
								Aether&nbsp;Flow
							</p>
							<p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider2 text-muted">
								Atmosphere&nbsp;Synthesizer
							</p>
						</div>
					</div>
					<div className="hidden items-center gap-6 font-mono text-[10px] uppercase tracking-wider2 text-muted sm:flex">
						<span className="flex items-center gap-1.5">
							<Hexagon
								className="h-3 w-3 text-signal-400/70"
								strokeWidth={1.5}
							/>
							fbm · {Math.round(values.complexity)} oct
						</span>
						<span className="flex items-center gap-1.5">
							<span className="h-1.5 w-1.5 rounded-full bg-aether-amber animate-blink" />
							webgl online
						</span>
						<span className="text-muted/60">v1.0</span>
					</div>
				</header>

				{/* ── Body: instrument rail + observation window ─────────────── */}
				<div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
					{/* Instrument rail */}
					<aside className="flex w-full flex-col border-b border-hairline/70 bg-ink-800/80 lg:w-[340px] lg:flex-shrink-0 lg:border-b-0 lg:border-r">
						<div className="border-b border-hairline/70 px-5 py-4">
							<p className="font-mono text-[10px] uppercase tracking-wider2 text-signal-400/80">
								Console&nbsp;·&nbsp;01
							</p>
							<h1 className="mt-1.5 font-display text-2xl font-medium leading-tight tracking-tight text-chalk text-balance">
								Sculpt a living aether.
							</h1>
							<p className="mt-2 max-w-[44ch] font-sans text-[13px] leading-relaxed text-muted">
								A fractal-noise gas, rendered on a single full-screen quad. Pull
								the faders to retune the field, recall a patch, or sweep the
								window to bend the gas around your cursor.
							</p>
						</div>

						<div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
							<ChannelRail values={values} onChange={setChannel} />
							<div className="rule h-px" />
							<PresetBank activeCode={activeCode} onSelect={selectPreset} />
							<div className="rule h-px" />
							<Telemetry warp={warp} channel={activeName} />
						</div>

						<div className="flex-shrink-0 border-t border-hairline/70 px-5 py-3">
							<p className="font-mono text-[9px] leading-relaxed text-muted/70">
								<span className="text-signal-400/80">
									@/components/ui/aether-flow
								</span>
								{" — "}
								drop-in ShaderCanvas + ControlSlider · three.js
							</p>
						</div>
					</aside>

					{/* Observation window */}
					<main className="relative min-h-[62vh] flex-1 overflow-hidden lg:min-h-0">
						<ShaderCanvas {...values} onWarp={handleWarp} />

						{/* Vignette + top scrim for legibility of overlays. */}
						<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_45%,transparent_55%,rgba(7,5,16,0.65)_100%)]" />

						{/* Corner reticle brackets. */}
						<Bracket className="pointer-events-none absolute left-4 top-4 h-7 w-7 text-signal-300/40" />
						<Bracket className="pointer-events-none absolute right-4 top-4 h-7 w-7 text-signal-300/40" />
						<Bracket className="pointer-events-none absolute bottom-4 left-4 h-7 w-7 text-signal-300/40" />
						<Bracket className="pointer-events-none absolute bottom-4 right-4 h-7 w-7 text-signal-300/40" />

						{/* Sweeping scan line. */}
						<div className="pointer-events-none absolute inset-x-0 top-0 h-[55%] overflow-hidden">
							<div className="h-full w-full animate-scan bg-[linear-gradient(180deg,transparent,rgba(167,139,250,0.10),transparent)]" />
						</div>

						{/* Hero lockup, top-left of the window. */}
						<div className="pointer-events-none absolute left-6 top-6 max-w-[18ch] animate-rise sm:left-8 sm:top-8">
							<p className="font-mono text-[10px] uppercase tracking-ultra text-signal-300/80">
								Field&nbsp;·&nbsp;{activeName}
							</p>
							<h2 className="mt-2 font-display text-[clamp(2.4rem,5.5vw,4.2rem)] font-bold leading-[0.92] tracking-tight text-chalk mix-blend-soft-light">
								AETHER
								<br />
								FLOW
							</h2>
						</div>

						{/* Warp coordinate caption, follows the cursor's last position. */}
						<div className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-hairline/70 bg-ink-900/60 px-3.5 py-1.5 backdrop-blur-md">
							<Crosshair
								className="h-3.5 w-3.5 text-signal-300/80"
								strokeWidth={1.5}
							/>
							<span className="font-mono text-[11px] tabular-nums tracking-wide text-chalk/85">
								warp&nbsp;[{warp.x.toFixed(2)}, {warp.y.toFixed(2)}]
							</span>
							<span className="hidden font-mono text-[10px] uppercase tracking-wide text-muted sm:inline">
								· move to bend
							</span>
						</div>
					</main>
				</div>
			</div>
		</div>
	);
}
