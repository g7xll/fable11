import {
	Activity,
	Gauge,
	Github,
	Layers3,
	MousePointer2,
	Pause,
	Play,
	Sparkles,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import Slider from "@/components/Slider";
import ShaderAnimation, {
	type ShaderTelemetry,
} from "@/components/ui/shader-animation";
import { cn } from "@/lib/utils";

/**
 * PRISMA — WebGL Shader Lab.
 *
 * The flowing-gradient shader fills the viewport and reads as the instrument's
 * viewport; the chrome is monochrome glass so the GPU output is the only color.
 * This is the integration's home for the shader's controls (the prompt's
 * Interactive/Static toggle lives in the rail alongside live parameters) and
 * its signature element: a live telemetry HUD fed straight from the rAF loop.
 */
export default function App() {
	const [interactive, setInteractive] = useState(true);
	const [paused, setPaused] = useState(false);
	const [layers, setLayers] = useState(4);
	const [intensity, setIntensity] = useState(1);
	const [speed, setSpeed] = useState(1);

	// Telemetry is high-frequency (every frame). We keep it out of React state
	// to avoid re-rendering the whole tree 60x/sec, and write directly to DOM
	// refs in the HUD instead.
	const fpsRef = useRef<HTMLSpanElement | null>(null);
	const timeRef = useRef<HTMLSpanElement | null>(null);
	const resRef = useRef<HTMLSpanElement | null>(null);
	const mouseRef = useRef<HTMLSpanElement | null>(null);
	const barRef = useRef<HTMLSpanElement | null>(null);
	const lastPaint = useRef(0);

	const handleTelemetry = useCallback((t: ShaderTelemetry) => {
		// Throttle DOM writes to ~12fps; the readouts stay legible and cheap.
		const now = performance.now();
		if (now - lastPaint.current < 80) return;
		lastPaint.current = now;
		if (fpsRef.current)
			fpsRef.current.textContent = String(t.fps).padStart(2, "0");
		if (timeRef.current)
			timeRef.current.textContent = t.time.toFixed(1).padStart(5, "0");
		if (resRef.current) resRef.current.textContent = `${t.width}×${t.height}`;
		if (mouseRef.current)
			mouseRef.current.textContent = `${t.mouseX.toFixed(2)}, ${t.mouseY.toFixed(2)}`;
		if (barRef.current)
			barRef.current.style.width = `${Math.min(100, (t.fps / 60) * 100)}%`;
	}, []);

	return (
		<main className="relative h-screen w-screen overflow-hidden bg-ink text-paper">
			<ShaderAnimation
				fill="window"
				showOverlay={false}
				interactive={interactive}
				paused={paused}
				layers={layers}
				intensity={intensity}
				speed={speed}
				onTelemetry={handleTelemetry}
			/>

			{/* Subtle vignette so the chrome stays readable over bright shader bursts. */}
			<div
				aria-hidden
				className="pointer-events-none fixed inset-0 z-[1]"
				style={{
					background:
						"radial-gradient(130% 100% at 50% 0%, transparent 40%, rgba(7,7,15,0.55) 100%)",
				}}
			/>

			{/* Viewfinder corner brackets — frame the canvas as an instrument. */}
			<div aria-hidden className="pointer-events-none fixed inset-5 z-[2]">
				<div className="bracket bracket-tl absolute left-0 top-0 h-4 w-4" />
				<div className="bracket bracket-tr absolute right-0 top-0 h-4 w-4" />
				<div className="bracket bracket-bl absolute bottom-0 left-0 h-4 w-4" />
				<div className="bracket bracket-br absolute bottom-0 right-0 h-4 w-4" />
			</div>

			{/* ── Top bar: wordmark + status ──────────────────────────────────── */}
			<header className="animate-rise fixed inset-x-0 top-0 z-10 flex items-center justify-between px-7 py-6 sm:px-10">
				<div className="flex items-center gap-3">
					<span className="grid h-7 w-7 place-items-center rounded-md border border-line bg-glass backdrop-blur">
						<span
							aria-hidden
							className="h-3 w-3"
							style={{
								clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
								background: "linear-gradient(135deg,#5b5bff,#e5237a)",
							}}
						/>
					</span>
					<div className="leading-none">
						<p className="grad-text font-display text-lg font-bold tracking-tight">
							PRISMA
						</p>
						<p className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-haze">
							Shader Lab
						</p>
					</div>
				</div>

				<div className="flex items-center gap-4">
					<span className="hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-haze sm:flex">
						<span
							className={cn(
								"inline-block h-1.5 w-1.5 rounded-full",
								paused ? "bg-haze" : "bg-magenta",
							)}
						/>
						{paused ? "Paused" : "Live · GPU"}
					</span>
					<a
						href="https://github.com"
						target="_blank"
						rel="noreferrer noopener"
						aria-label="View source"
						className="grid h-8 w-8 place-items-center rounded-md border border-line bg-glass text-haze backdrop-blur transition-colors hover:text-paper"
					>
						<Github className="h-4 w-4" />
					</a>
				</div>
			</header>

			{/* ── Hero thesis: the shader is the subject, named plainly ───────── */}
			<section className="pointer-events-none fixed left-7 top-28 z-10 max-w-xl sm:left-10 sm:top-1/2 sm:-translate-y-1/2">
				<p className="animate-rise font-mono text-xs uppercase tracking-[0.32em] text-haze [animation-delay:120ms]">
					Fragment shader · GLSL ES 1.0
				</p>
				<h1 className="animate-rise mt-4 font-display text-[clamp(2.6rem,7vw,5.5rem)] font-bold leading-[0.95] tracking-tight [animation-delay:200ms]">
					A gradient field,
					<br />
					<span className="grad-text">drawn on the GPU.</span>
				</h1>
				<p className="animate-rise mt-5 hidden max-w-md font-body text-sm leading-relaxed text-haze [animation-delay:300ms] sm:block sm:text-base">
					Four fractal layers fold into one another every frame, tinted by a
					cosine palette and rippled by your cursor. No textures, no video —
					just math compiled to your graphics card. Tune it from the rail.
				</p>
			</section>

			{/* ── Control rail: the integration's home for the shader controls ── */}
			<aside className="animate-rise fixed bottom-7 left-7 z-10 w-[270px] [animation-delay:380ms] sm:left-auto sm:right-7">
				<div className="rounded-2xl border border-line bg-glass p-5 backdrop-blur-xl">
					<div className="flex items-center justify-between">
						<p className="font-mono text-[10px] uppercase tracking-[0.28em] text-haze">
							Controls
						</p>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => setPaused((v) => !v)}
								aria-pressed={paused}
								aria-label={paused ? "Resume animation" : "Pause animation"}
								className="grid h-7 w-7 place-items-center rounded-md border border-line text-paper transition-colors hover:border-indigo/60"
							>
								{paused ? (
									<Play className="h-3.5 w-3.5" />
								) : (
									<Pause className="h-3.5 w-3.5" />
								)}
							</button>
							<button
								type="button"
								onClick={() => setInteractive((v) => !v)}
								aria-pressed={interactive}
								aria-label={
									interactive
										? "Disable cursor interaction"
										: "Enable cursor interaction"
								}
								title={interactive ? "🖱️ Interactive" : "🚫 Static"}
								className={cn(
									"grid h-7 w-7 place-items-center rounded-md border transition-colors",
									interactive
										? "border-indigo/60 bg-indigo/15 text-paper"
										: "border-line text-haze hover:text-paper",
								)}
							>
								<MousePointer2 className="h-3.5 w-3.5" />
							</button>
						</div>
					</div>

					<div className="mt-5 space-y-5">
						<Slider
							label="Layers"
							value={layers}
							min={1}
							max={6}
							step={1}
							display={String(layers)}
							onChange={(v) => setLayers(Math.round(v))}
						/>
						<Slider
							label="Glow"
							value={intensity}
							min={0.2}
							max={2}
							step={0.05}
							display={`${intensity.toFixed(2)}×`}
							onChange={setIntensity}
						/>
						<Slider
							label="Speed"
							value={speed}
							min={0.1}
							max={3}
							step={0.1}
							display={`${speed.toFixed(1)}×`}
							onChange={setSpeed}
						/>
					</div>

					<div className="mt-5 grid grid-cols-3 gap-2 border-t border-line pt-4">
						<Stat
							icon={<Layers3 className="h-3 w-3" />}
							k="layers"
							v={String(layers)}
						/>
						<Stat
							icon={<Sparkles className="h-3 w-3" />}
							k="glow"
							v={`${intensity.toFixed(1)}`}
						/>
						<Stat
							icon={<Gauge className="h-3 w-3" />}
							k="speed"
							v={`${speed.toFixed(1)}`}
						/>
					</div>
				</div>
			</aside>

			{/* ── Signature: live telemetry HUD straight off the render loop ──── */}
			<aside className="animate-rise fixed bottom-7 left-7 z-10 hidden w-[230px] [animation-delay:440ms] sm:block">
				<div className="rounded-2xl border border-line bg-glass p-5 backdrop-blur-xl">
					<div className="flex items-center gap-2">
						<Activity className="h-3.5 w-3.5 text-magenta" />
						<p className="font-mono text-[10px] uppercase tracking-[0.28em] text-haze">
							Telemetry
						</p>
					</div>

					<dl className="mt-4 space-y-2.5 font-mono text-xs">
						<Readout k="fps">
							<span ref={fpsRef} className="tabular-nums text-paper">
								00
							</span>
						</Readout>
						<Readout k="time">
							<span className="tabular-nums text-paper">
								<span ref={timeRef}>000.0</span>s
							</span>
						</Readout>
						<Readout k="res">
							<span ref={resRef} className="tabular-nums text-paper">
								—
							</span>
						</Readout>
						<Readout k="mouse">
							<span ref={mouseRef} className="tabular-nums text-paper">
								0.50, 0.50
							</span>
						</Readout>
					</dl>

					<div className="mt-4 h-1 overflow-hidden rounded-full bg-line">
						<span
							ref={barRef}
							className="block h-full rounded-full bg-gradient-to-r from-indigo to-magenta"
							style={{ width: "0%" }}
						/>
					</div>
				</div>
			</aside>
		</main>
	);
}

function Readout({ k, children }: { k: string; children: React.ReactNode }) {
	return (
		<div className="flex items-baseline justify-between">
			<dt className="uppercase tracking-[0.2em] text-haze">{k}</dt>
			<dd>{children}</dd>
		</div>
	);
}

function Stat({ icon, k, v }: { icon: React.ReactNode; k: string; v: string }) {
	return (
		<div className="flex flex-col items-center gap-1 text-center">
			<span className="text-haze">{icon}</span>
			<span className="font-mono text-sm tabular-nums text-paper">{v}</span>
			<span className="font-mono text-[9px] uppercase tracking-[0.18em] text-haze">
				{k}
			</span>
		</div>
	);
}
