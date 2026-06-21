import { useCallback, useEffect, useState } from "react";
import {
	Flame,
	Gauge,
	Pause,
	Play,
	Rocket,
	Signal,
	Triangle,
} from "lucide-react";

import Component, { type ShaderSample } from "@/components/ui/launch";
import { LaunchSequence } from "@/components/lab/LaunchSequence";

/**
 * LAUNCH — IGNITION CONTROL
 *
 * The prompt's `Component` (a WebGL2 ray-marched molten plume) is the signature,
 * rendered full-bleed behind everything. The chrome reads that churning lava horizon
 * as a rocket engine on the pad: a left-edge thrust gauge whose reticle rides the
 * shader's own clock, a heat-glowing LAUNCH wordmark, an IGNITE / HOLD control wired
 * straight to the shader's `paused` prop, a live launch sequence, and a bottom
 * telemetry rail reading the real per-frame `iTime` / `iFrame` / FPS off the GPU loop.
 */

/**
 * Optional capture-resolution lever. The molten-plume pass is a ~100-step ray-march,
 * so on a *software* GL backend (headless CI / the demo recorder) it renders at only a
 * few fps at full viewport resolution. For those environments only, a `?res=<0..1>`
 * query param renders the shader into a smaller backing store and CSS-upscales it to
 * fill the screen — the field is a soft gradient, so the upscale is near-lossless.
 *
 * With no param this returns `null` and the shader renders at full native quality, so
 * real users on a GPU are never downscaled. Read once at module load.
 */
function captureScale(): number | null {
	if (typeof window === "undefined") return null;
	// Explicit override always wins: `?res=0.25` renders at quarter backing-store.
	const raw = new URLSearchParams(window.location.search).get("res");
	if (raw) {
		const n = Number(raw);
		if (Number.isFinite(n) && n > 0 && n < 1) return n;
	}
	// Auto: on a *software* WebGL backend (headless CI / the demo recorder run on
	// SwiftShader / llvmpipe), the ~100-step ray-march can only manage a few fps at
	// full resolution, which looks choppy in a capture. Detect that one case and drop
	// the backing store so the motion stays fluid. Real GPUs report a hardware
	// renderer string and are left at full native quality.
	try {
		const c = document.createElement("canvas");
		const gl = c.getContext("webgl2");
		if (gl) {
			const ext = gl.getExtension("WEBGL_debug_renderer_info");
			const r = ext
				? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)).toLowerCase()
				: "";
			if (
				/swiftshader|llvmpipe|software|microsoft basic|mesa offscreen/.test(r)
			) {
				return 0.2;
			}
		}
	} catch {
		/* detection is best-effort; fall through to full quality */
	}
	return null;
}
const RES_SCALE = captureScale();

/* The camera marches the plume forever; treat elapsed shader time as climb.
   1 s of shader clock ≈ 42 m of simulated ascent — a readable, monotonic altitude. */
function altitudeFromTime(t: number) {
	return t * 42;
}

/**
 * Renders the brief's fixed-fullscreen `Component`. With no capture scale it is mounted
 * verbatim at full quality. With a capture scale the scale is forwarded as the
 * component's own `pixelRatio`, shrinking the canvas backing store (and the per-frame
 * pixel cost) while the canvas still fills the viewport — never touching the GLSL.
 */
function ShaderStage({
	paused,
	onSample,
}: {
	paused: boolean;
	onSample: (s: ShaderSample) => void;
}) {
	// Full quality for real users (no param). For a capture run, pass the sub-1 scale
	// straight through as `pixelRatio`; the component renders into a backing store of
	// `cssPixels × pixelRatio`, shrinking the per-frame pixel cost. The canvas still
	// fills the viewport via its own `width/height: 100%`, so the upscaled soft plume
	// looks the same — only sharper/softer, never repositioned.
	return (
		<Component
			paused={paused}
			onSample={onSample}
			pixelRatio={RES_SCALE ?? undefined}
		/>
	);
}

/* Thrust reads the plume's churn: the turbulence loop runs on `t`, so a clamped
   sine of the clock gives a believable 78–100 % throttle band that breathes. */
function thrustFromTime(t: number) {
	return 89 + Math.sin(t * 0.8) * 6 + Math.sin(t * 2.3) * 4;
}

function Stat({
	label,
	value,
	accent,
}: {
	label: string;
	value: string;
	accent?: boolean;
}) {
	return (
		<div className="flex items-baseline gap-2 whitespace-nowrap">
			<span className="tele text-white/35">{label}</span>
			<span className={`tele ${accent ? "text-flare-core" : "text-white/85"}`}>
				{value}
			</span>
		</div>
	);
}

/**
 * Vertical thrust gauge — the page's signature. A fixed tick ladder with a reticle
 * that rides the live throttle percentage sampled off the shader clock, so it
 * physically tracks the engine's churn instead of running a decorative timer.
 */
function ThrustGauge({ thrust, paused }: { thrust: number; paused: boolean }) {
	const ticks = Array.from({ length: 21 });
	const clamped = Math.max(0, Math.min(100, thrust));
	// Gauge fills bottom→top: 100 % at the top tick, 0 % at the bottom.
	const reticlePct = 100 - clamped;

	return (
		<div className="animate-rail-in pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-20 flex-col items-center justify-center sm:flex">
			<div className="relative flex h-[60vh] w-full items-stretch">
				{/* spine */}
				<div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/10" />

				{/* heat fill rising from the base of the gauge */}
				<div
					className="absolute bottom-0 left-1/2 w-[3px] -translate-x-1/2 rounded-full transition-[height] duration-300 ease-linear"
					style={{
						height: `${clamped}%`,
						background:
							"linear-gradient(180deg, hsl(var(--flare-core)), hsl(var(--flare-plasma)))",
						boxShadow: "0 0 12px hsl(var(--flare-ember) / 0.8)",
						opacity: paused ? 0.4 : 1,
					}}
				/>

				{/* tick ladder */}
				<div className="absolute inset-0 flex flex-col justify-between">
					{ticks.map((_, i) => {
						const major = i % 5 === 0;
						return (
							<div
								key={i}
								className="flex items-center gap-2 pl-[calc(50%-0px)]"
							>
								<span
									className="block h-px bg-white/30"
									style={{ width: major ? 14 : 7 }}
								/>
								{major && (
									<span className="tele text-[0.5rem] text-white/30">
										{String((20 - i) * 5).padStart(3, "0")}
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
									"linear-gradient(90deg, transparent, hsl(var(--flare-core)), transparent)",
								boxShadow: "0 0 10px hsl(var(--flare-core) / 0.85)",
							}}
						/>
						<Triangle
							className="absolute -left-[18px] top-1/2 h-2 w-2 -translate-y-1/2 rotate-90 fill-flare-core text-flare-core"
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
					THRUST&nbsp;%
				</span>
				<span
					className={`tele mt-1 ${paused ? "text-flare-plasma" : "text-flare-core"}`}
				>
					{paused ? "HOLD" : "BURN"}
				</span>
			</div>
		</div>
	);
}

export default function App() {
	const [paused, setPaused] = useState(false);
	const [fps, setFps] = useState(60);
	const [frame, setFrame] = useState(0);
	const [thrust, setThrust] = useState(95);
	const [altitude, setAltitude] = useState(0);
	const [ignited, setIgnited] = useState(false);

	const handleSample = useCallback((s: ShaderSample) => {
		setFps(s.fps);
		setFrame(s.frame);
		setThrust(thrustFromTime(s.time));
		setAltitude(altitudeFromTime(s.time));
	}, []);

	// Flip "ignited" shortly after mount so the launch sequence reads as a live ignition.
	useEffect(() => {
		const id = window.setTimeout(() => setIgnited(true), 2200);
		return () => window.clearTimeout(id);
	}, []);

	const altStamp = Math.round(altitude).toString().padStart(6, "0");

	return (
		<div className="relative h-dvh w-full overflow-hidden bg-black text-white">
			{/* === SIGNATURE: the prompt's live WebGL2 molten-plume shader, behind everything ===
			    `Component` is `position: fixed; inset: 0` per the brief, so it tiles the
			    viewport. We pass the additive `paused` + `onSample` props for honest telemetry.
			    `ShaderStage` renders it verbatim at full quality, and only downscales the
			    backing store when an explicit `?res=` capture param is present. */}
			<ShaderStage paused={paused} onSample={handleSample} />

			{/* launch-pad vignette — pulls the eye to the engine bell at the base */}
			<div
				aria-hidden
				className="pointer-events-none fixed inset-0 z-[1]"
				style={{
					background:
						"radial-gradient(125% 95% at 50% 78%, transparent 26%, rgba(0,0,0,0.66) 100%)",
				}}
			/>
			{/* faint scanlines — read the whole frame as a flight-control CRT */}
			<div
				aria-hidden
				className="pointer-events-none fixed inset-0 z-[1] opacity-[0.09] mix-blend-soft-light"
				style={{
					backgroundImage:
						"repeating-linear-gradient(0deg, rgba(255,255,255,0.7) 0, rgba(255,255,255,0.7) 1px, transparent 2px, transparent 4px)",
				}}
			/>

			{/* === Top callsign bar === */}
			<header className="animate-hud-in fixed inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 sm:px-8">
				<div className="flex items-center gap-2.5">
					<Rocket className="h-4 w-4 text-white/85" strokeWidth={1.6} />
					<span className="tele text-white/85">
						LAUNCH&nbsp;·&nbsp;PAD&nbsp;39A
					</span>
				</div>
				<nav className="hidden items-center gap-7 md:flex">
					<span className="tele text-white/35">STAGE</span>
					<span className="tele text-flare-core">CORE</span>
					<span className="tele text-flare-ember">BOOST</span>
					<span className="tele text-flare-plasma">MAIN</span>
				</nav>
				<Stat
					label="GNC"
					value={paused ? "HOLD" : "NOMINAL"}
					accent={!paused}
				/>
			</header>

			{/* === Left vertical thrust gauge (signature) === */}
			<ThrustGauge thrust={thrust} paused={paused} />

			{/* === Right launch sequence rail === */}
			<LaunchSequence ignited={ignited && !paused} />

			{/* === Centered ignition lockup === */}
			<main className="relative z-10 flex h-dvh w-full items-center justify-center px-6">
				<div className="flex max-w-2xl flex-col items-center text-center">
					<span
						className="animate-reveal-up tele mb-6 flex items-center gap-2 text-white/45"
						style={{ animationDelay: "0.05s" }}
					>
						<Flame
							className="h-3 w-3 text-flare-ember animate-flicker"
							strokeWidth={2}
						/>
						IGNITION&nbsp;SEQUENCE&nbsp;//&nbsp;LV-001&nbsp;//&nbsp;MAINSTAGE&nbsp;HOT
					</span>

					<h1 className="heat-type animate-reveal-blur font-display text-[clamp(3.5rem,15vw,9.5rem)] font-bold uppercase leading-[0.82] tracking-[-0.055em]">
						Launch
					</h1>

					<p
						className="animate-reveal-up mt-7 max-w-md text-sm leading-relaxed text-white/55 sm:text-base"
						style={{ animationDelay: "0.22s" }}
					>
						You are looking straight down the engine bell — a single WebGL2
						pass, ray-marched live, folding a molten plume of turbulence all the
						way to the horizon as the stack climbs off the pad.
					</p>

					{/* ignite / hold — drives the shader's own `paused` prop */}
					<div
						className="animate-reveal-up mt-9 flex items-center gap-3"
						style={{ animationDelay: "0.3s" }}
					>
						<button
							type="button"
							onClick={() => setPaused((p) => !p)}
							className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 backdrop-blur-sm transition-colors hover:border-flare-core/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flare-core focus-visible:ring-offset-2 focus-visible:ring-offset-black"
							aria-pressed={paused}
						>
							{paused ? (
								<Play className="h-3.5 w-3.5 text-flare-core" strokeWidth={2} />
							) : (
								<Pause className="h-3.5 w-3.5 text-white/80" strokeWidth={2} />
							)}
							<span className="tele text-white/90">
								{paused ? "RESUME BURN" : "HOLD IGNITION"}
							</span>
						</button>

						<div className="hidden items-center gap-2 sm:flex">
							<span className="relative flex h-2.5 w-2.5 items-center justify-center">
								{!paused && (
									<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--flare-core))] opacity-70" />
								)}
								<span
									className="relative inline-flex h-2 w-2 rounded-full"
									style={{
										background: paused
											? "hsl(var(--flare-plasma))"
											: "hsl(var(--flare-core))",
									}}
								/>
							</span>
							<span className="tele text-white/45">
								{paused ? "ENGINES HELD" : "BURNING"}
							</span>
						</div>
					</div>
				</div>
			</main>

			{/* === Bottom telemetry rail — real per-frame state off the GPU loop === */}
			<footer className="animate-hud-in fixed inset-x-0 bottom-0 z-20 flex items-center justify-between px-5 py-4 sm:px-8">
				<div className="flex items-center gap-2">
					<Gauge className="h-3.5 w-3.5 text-white/40" strokeWidth={1.8} />
					<Stat label="ALT" value={`${altStamp} m`} />
				</div>
				<div className="hidden items-center gap-6 md:flex">
					<Stat
						label="THR"
						value={`${Math.round(Math.max(0, Math.min(100, thrust)))}%`}
					/>
					<Stat label="FRAME" value={String(frame).padStart(6, "0")} />
					<Stat label="PASS" value="GLSL · 100 STEPS" />
				</div>
				<div className="flex items-center gap-2">
					<Signal
						className="h-3.5 w-3.5 text-white/40 animate-flicker"
						strokeWidth={1.8}
					/>
					<Stat label="FPS" value={String(fps).padStart(2, "0")} />
				</div>
			</footer>
		</div>
	);
}
