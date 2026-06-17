import { useCallback, useRef, useState } from "react";
import { Pause, Play, Radio, Triangle } from "lucide-react";

import ShaderDemo_ATC, { type ShaderSample } from "@/components/ui/atc-shader";

/**
 * ATC — APERTURE TRANSIT CORRIDOR
 *
 * The prompt's `ShaderDemo_ATC` (a WebGL2 chromatic warp-tunnel) is the signature,
 * rendered full-bleed behind everything. The chrome reads the corridor as a deep-space
 * transit instrument: a left-edge depth gauge whose reticle tracks the shader's own
 * marching clock, a chromatic-split wordmark echoing the GLSL color separation, and a
 * bottom telemetry rail wired to the real per-frame fps + time sampled off the GPU loop.
 */

/** Format the corridor's drift distance from the shader clock (p.x += t / 0.2 ⇒ 5 u/s). */
function depthFromTime(t: number) {
	return t * 5; // corridor units travelled — matches the shader's `t / 0.2` advance
}

function Stat({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-baseline gap-2 whitespace-nowrap">
			<span className="tele text-white/35">{label}</span>
			<span className="tele text-white/85">{value}</span>
		</div>
	);
}

/**
 * Vertical aperture-depth gauge — the page's signature. A fixed tick ladder with a
 * reticle that rides the fractional part of the corridor depth, so it physically tracks
 * the shader's marching cadence instead of running a decorative timer.
 */
function DepthGauge({ depth, paused }: { depth: number; paused: boolean }) {
	const ticks = Array.from({ length: 21 });
	// Reticle position cycles through the gauge once every 40 corridor units.
	const frac = ((depth % 40) + 40) % 40;
	const reticlePct = (frac / 40) * 100;

	return (
		<div className="animate-gauge-in pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-20 flex-col items-center justify-center sm:flex">
			<div className="relative flex h-[58vh] w-full items-stretch">
				{/* spine */}
				<div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/10" />

				{/* tick ladder */}
				<div className="absolute inset-0 flex flex-col justify-between">
					{ticks.map((_, i) => {
						const major = i % 5 === 0;
						return (
							<div key={i} className="flex items-center gap-2 pl-[calc(50%-0px)]">
								<span
									className="block h-px bg-white/30"
									style={{ width: major ? 14 : 7 }}
								/>
								{major && (
									<span className="tele text-[0.5rem] text-white/30">
										{String((20 - i) * 2).padStart(2, "0")}
									</span>
								)}
							</div>
						);
					})}
				</div>

				{/* live reticle */}
				<div
					className="absolute left-1/2 -translate-x-1/2 transition-[top] duration-300 ease-linear"
					style={{ top: `${reticlePct}%` }}
				>
					<div className="relative -translate-y-1/2">
						<div
							className="h-[2px] w-9 -translate-x-1/2"
							style={{
								background:
									"linear-gradient(90deg, transparent, hsl(var(--iris-cyan)), transparent)",
								boxShadow: "0 0 10px hsl(var(--iris-cyan) / 0.8)",
							}}
						/>
						<Triangle
							className="absolute -left-[18px] top-1/2 h-2 w-2 -translate-y-1/2 rotate-90 fill-iris-cyan text-iris-cyan"
							strokeWidth={0}
						/>
					</div>
				</div>
			</div>

			{/* gauge caption */}
			<div className="mt-5 flex flex-col items-center gap-1">
				<span
					className="tele text-[0.5rem] text-white/40"
					style={{ writingMode: "vertical-rl" }}
				>
					CORRIDOR&nbsp;DEPTH
				</span>
				<span className={`tele mt-1 ${paused ? "text-iris-amber" : "text-iris-cyan"}`}>
					{paused ? "HOLD" : "FEED"}
				</span>
			</div>
		</div>
	);
}

export default function App() {
	const [paused, setPaused] = useState(false);
	const [fps, setFps] = useState(60);
	const [depth, setDepth] = useState(0);
	// Hold the latest depth so the freeze button label and gauge stay in sync.
	const depthRef = useRef(0);

	const handleSample = useCallback((s: ShaderSample) => {
		setFps(s.fps);
		const d = depthFromTime(s.time);
		depthRef.current = d;
		setDepth(d);
	}, []);

	const dStamp = depth.toFixed(1).padStart(8, "0");

	return (
		<div className="relative h-dvh w-full overflow-hidden bg-black text-white">
			{/* === SIGNATURE: the prompt's live WebGL2 warp-tunnel shader, behind everything === */}
			<div className="fixed inset-0 z-0">
				<ShaderDemo_ATC paused={paused} onSample={handleSample} />
			</div>

			{/* aperture vignette — pulls the eye down the corridor throat */}
			<div
				aria-hidden
				className="pointer-events-none fixed inset-0 z-[1]"
				style={{
					background:
						"radial-gradient(115% 95% at 50% 50%, transparent 30%, rgba(0,0,0,0.62) 100%)",
				}}
			/>
			{/* faint scanlines — read the corridor as a CRT transit display */}
			<div
				aria-hidden
				className="pointer-events-none fixed inset-0 z-[1] opacity-[0.10] mix-blend-soft-light"
				style={{
					backgroundImage:
						"repeating-linear-gradient(0deg, rgba(255,255,255,0.7) 0, rgba(255,255,255,0.7) 1px, transparent 2px, transparent 4px)",
				}}
			/>

			{/* === Top callsign bar === */}
			<header className="animate-hud-in fixed inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 sm:px-8">
				<div className="flex items-center gap-2.5">
					<Radio
						className="h-4 w-4 text-white/80 animate-signal-flicker"
						strokeWidth={1.6}
					/>
					<span className="tele text-white/85">ATC&nbsp;·&nbsp;APERTURE&nbsp;TRANSIT</span>
				</div>
				<nav className="hidden items-center gap-7 md:flex">
					<span className="tele text-white/35">CHANNELS</span>
					<span className="tele text-iris-cyan">C</span>
					<span className="tele text-iris-magenta">M</span>
					<span className="tele text-iris-amber">A</span>
				</nav>
				<Stat label="LINK" value={paused ? "HOLD" : "LIVE"} />
			</header>

			{/* === Left vertical depth gauge (signature) === */}
			<DepthGauge depth={depth} paused={paused} />

			{/* === Centered aperture lockup === */}
			<main className="relative z-10 flex h-dvh w-full items-center justify-center px-6">
				<div className="flex max-w-2xl flex-col items-center text-center">
					<span
						className="animate-reveal-up tele mb-6 text-white/45"
						style={{ animationDelay: "0.05s" }}
					>
						CORRIDOR&nbsp;//&nbsp;ATC-001&nbsp;//&nbsp;THROAT&nbsp;OPEN
					</span>

					<h1
						className="iris-split animate-reveal-blur font-display text-[clamp(2.75rem,11vw,7rem)] font-bold uppercase leading-[0.86] tracking-[-0.05em]"
						data-text="Aperture"
					>
						Aperture
					</h1>
					<h1
						className="iris-split animate-reveal-blur font-display text-[clamp(2.75rem,11vw,7rem)] font-bold uppercase leading-[0.86] tracking-[-0.05em]"
						data-text="Transit"
						style={{ animationDelay: "0.12s" }}
					>
						Transit
					</h1>

					<p
						className="animate-reveal-up mt-6 max-w-md text-sm leading-relaxed text-white/55 sm:text-base"
						style={{ animationDelay: "0.22s" }}
					>
						You are looking down the throat of an aperture transit corridor — a single
						WebGL2 pass, ray-marched live, folding chromatic light all the way to the
						vanishing point.
					</p>

					{/* freeze / resume — drives the shader's own `paused` prop */}
					<div
						className="animate-reveal-up mt-9 flex items-center gap-3"
						style={{ animationDelay: "0.3s" }}
					>
						<button
							type="button"
							onClick={() => setPaused((p) => !p)}
							className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 backdrop-blur-sm transition-colors hover:border-iris-cyan/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-black"
							aria-pressed={paused}
						>
							{paused ? (
								<Play className="h-3.5 w-3.5 text-iris-cyan" strokeWidth={2} />
							) : (
								<Pause className="h-3.5 w-3.5 text-white/80" strokeWidth={2} />
							)}
							<span className="tele text-white/90">
								{paused ? "RESUME TRANSIT" : "HOLD CORRIDOR"}
							</span>
						</button>

						<div className="hidden items-center gap-2 sm:flex">
							<span className="relative flex h-2.5 w-2.5 items-center justify-center">
								{!paused && (
									<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--iris-cyan))] opacity-70" />
								)}
								<span
									className="relative inline-flex h-2 w-2 rounded-full"
									style={{
										background: paused
											? "hsl(var(--iris-amber))"
											: "hsl(var(--iris-cyan))",
									}}
								/>
							</span>
							<span className="tele text-white/45">
								{paused ? "STREAM HELD" : "STREAMING"}
							</span>
						</div>
					</div>
				</div>
			</main>

			{/* === Bottom telemetry rail — real per-frame fps + corridor depth off the GPU loop === */}
			<footer className="animate-hud-in fixed inset-x-0 bottom-0 z-20 flex items-center justify-between px-5 py-4 sm:px-8">
				<Stat label="DEPTH" value={`${dStamp}u`} />
				<div className="hidden items-center gap-6 md:flex">
					<Stat label="PASS" value="GLSL · 50 STEPS" />
					<Stat label="MAP" value="TANH · 0.2" />
				</div>
				<Stat label="FPS" value={String(fps).padStart(2, "0")} />
			</footer>
		</div>
	);
}
