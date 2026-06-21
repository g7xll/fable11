import {
	Activity,
	Crosshair,
	Pause,
	Play,
	Radio,
	RotateCcw,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import CelestialMatrixShader, {
	type ShaderTelemetry,
} from "@/components/ui/martrix-shader";
import { cn } from "@/lib/utils";

/**
 * Celestial Matrix — framed as a deep-space signal console. The verbatim
 * Three.js shader is the live "celestial feed"; the HUD around it makes the
 * shader's hidden interaction (the cursor-driven gravitational warp) legible
 * through a reticle, coordinate readouts, and a frequency rail.
 */

const RAIL_TICKS = Array.from({ length: 24 });

function fmtTime(t: number) {
	const m = Math.floor(t / 60);
	const s = Math.floor(t % 60);
	const cs = Math.floor((t % 1) * 100);
	return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

export default function App() {
	const [paused, setPaused] = useState(false);
	const [shaderKey, setShaderKey] = useState(0); // remount to reset the clock
	const [armed, setArmed] = useState(false); // load-sequence gate

	// Telemetry is updated every frame; we keep it in a ref and flush to React on
	// a throttled interval so the readouts feel live without re-rendering 60×/sec.
	const telemetryRef = useRef<ShaderTelemetry>({
		time: 0,
		fps: 60,
		mouseX: 0,
		mouseY: 0,
	});
	const [display, setDisplay] = useState<ShaderTelemetry>(telemetryRef.current);
	const reticleRef = useRef<HTMLDivElement>(null);

	const onFrame = useCallback((t: ShaderTelemetry) => {
		telemetryRef.current = t;
		// Move the reticle imperatively for buttery tracking of the warp center.
		const r = reticleRef.current;
		if (r) {
			r.style.left = `${t.mouseX * 100}%`;
			// mouseY is measured from the bottom (shader space) → flip for screen top.
			r.style.top = `${(1 - t.mouseY) * 100}%`;
		}
	}, []);

	useEffect(() => {
		const id = window.setInterval(
			() => setDisplay({ ...telemetryRef.current }),
			90,
		);
		return () => window.clearInterval(id);
	}, []);

	// Arm the console shortly after mount so the reveal choreography plays.
	useEffect(() => {
		const id = window.setTimeout(() => setArmed(true), 120);
		return () => window.clearTimeout(id);
	}, []);

	const reset = () => {
		telemetryRef.current = {
			time: 0,
			fps: 60,
			mouseX: telemetryRef.current.mouseX,
			mouseY: telemetryRef.current.mouseY,
		};
		setPaused(false);
		setShaderKey((k) => k + 1);
	};

	const lock = display.mouseX > 0.001 || display.mouseY > 0.001;

	return (
		<main className="relative h-screen w-screen overflow-hidden font-body text-[#eaf1ff]">
			{/* Verbatim shader background */}
			<CelestialMatrixShader
				key={shaderKey}
				paused={paused}
				onFrame={onFrame}
			/>

			{/* Cursor reticle aligned to the shader's gravitational warp center */}
			<div
				ref={reticleRef}
				aria-hidden
				className="pointer-events-none fixed z-20 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
				style={{ left: "0%", top: "100%", opacity: armed ? 1 : 0 }}
			>
				<div className="relative h-24 w-24">
					<div className="absolute inset-0 rounded-full border border-ion/30" />
					<div className="absolute inset-[18px] rounded-full border border-aurora/40" />
					<div className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-ion/60" />
					<div className="absolute bottom-0 left-1/2 h-3 w-px -translate-x-1/2 bg-ion/60" />
					<div className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-ion/60" />
					<div className="absolute right-0 top-1/2 h-px w-3 -translate-y-1/2 bg-ion/60" />
					<div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-aurora shadow-[0_0_12px_2px_rgba(25,204,127,0.8)]" />
				</div>
			</div>

			{/* ── HUD layer ─────────────────────────────────────────────────────── */}
			<div className="pointer-events-none relative z-10 flex h-full flex-col">
				{/* Corner brackets */}
				<Brackets armed={armed} />

				{/* Top bar */}
				<header
					className={cn(
						"flex items-center justify-between px-5 pt-5 sm:px-8 sm:pt-7",
						armed ? "reveal" : "opacity-0",
					)}
					style={{ animationDelay: "0.15s" }}
				>
					<div className="flex items-center gap-2.5">
						<Radio className="h-4 w-4 text-aurora" strokeWidth={1.6} />
						<span className="font-mono text-[11px] uppercase tracking-[0.34em] text-mist">
							Orbital Observatory
						</span>
					</div>
					<div className="hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-mist sm:flex">
						<span
							className={cn(
								"inline-block h-1.5 w-1.5 rounded-full",
								lock ? "bg-aurora" : "bg-signal",
							)}
							style={{ animation: "blip 1.6s ease-in-out infinite" }}
						/>
						{lock ? "Signal lock" : "Scanning"}
					</div>
				</header>

				{/* Left frequency rail */}
				<FrequencyRail armed={armed} fps={display.fps} />

				{/* Centerpiece — the thesis */}
				<section className="flex flex-1 flex-col items-center justify-center px-6 text-center">
					<p
						className={cn(
							"mb-5 font-mono text-[11px] uppercase tracking-[0.5em] text-ion/80",
							armed ? "reveal" : "opacity-0",
						)}
						style={{ animationDelay: "0.4s" }}
					>
						Live celestial feed
					</p>
					<h1
						className="font-display text-[clamp(2.6rem,11vw,8.5rem)] font-medium leading-[0.92] text-white"
						style={{
							animation: armed
								? "title-blur 1.1s cubic-bezier(0.16,1,0.3,1) 0.3s both"
								: "none",
							opacity: armed ? undefined : 0,
							textShadow: "0 0 48px rgba(26,77,222,0.45)",
						}}
					>
						Celestial
						<br />
						<span className="bg-gradient-to-r from-signal via-ion to-aurora bg-clip-text text-transparent">
							Matrix
						</span>
					</h1>
					<p
						className={cn(
							"mt-6 max-w-md font-body text-sm leading-relaxed text-mist sm:text-base",
							armed ? "reveal" : "opacity-0",
						)}
						style={{ animationDelay: "0.7s" }}
					>
						An interactive WebGL shader. Move your cursor across the void to
						bend the falling matrix around a gravitational warp.
					</p>

					{/* Controls */}
					<div
						className={cn(
							"pointer-events-auto mt-9 flex items-center gap-3",
							armed ? "reveal" : "opacity-0",
						)}
						style={{ animationDelay: "0.9s" }}
					>
						<button
							onClick={() => setPaused((p) => !p)}
							className="group inline-flex items-center gap-2 rounded-full border border-line bg-[var(--glass)] px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.18em] text-white backdrop-blur-md transition hover:border-aurora/60 hover:bg-aurora/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aurora"
							aria-pressed={paused}
						>
							{paused ? (
								<Play className="h-3.5 w-3.5 text-aurora" strokeWidth={2} />
							) : (
								<Pause className="h-3.5 w-3.5 text-ion" strokeWidth={2} />
							)}
							{paused ? "Resume feed" : "Freeze feed"}
						</button>
						<button
							onClick={reset}
							className="inline-flex items-center gap-2 rounded-full border border-line-soft bg-[var(--glass)] px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.18em] text-mist backdrop-blur-md transition hover:border-line hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ion"
						>
							<RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
							Recalibrate
						</button>
					</div>
				</section>

				{/* Bottom telemetry strip */}
				<footer
					className={cn(
						"grid grid-cols-2 gap-px overflow-hidden border-t border-line-soft bg-line-soft sm:grid-cols-4",
						armed ? "reveal" : "opacity-0",
					)}
					style={{ animationDelay: "0.6s" }}
				>
					<Readout
						icon={
							<Activity className="h-3.5 w-3.5 text-aurora" strokeWidth={1.8} />
						}
						label="Render rate"
						value={`${display.fps.toFixed(0)} fps`}
					/>
					<Readout
						icon={<Radio className="h-3.5 w-3.5 text-ion" strokeWidth={1.8} />}
						label="Feed time"
						value={fmtTime(display.time)}
						mono
					/>
					<Readout
						icon={
							<Crosshair
								className="h-3.5 w-3.5 text-signal"
								strokeWidth={1.8}
							/>
						}
						label="Warp · X"
						value={display.mouseX.toFixed(3)}
						mono
					/>
					<Readout
						icon={
							<Crosshair
								className="h-3.5 w-3.5 text-aurora"
								strokeWidth={1.8}
							/>
						}
						label="Warp · Y"
						value={display.mouseY.toFixed(3)}
						mono
					/>
				</footer>
			</div>
		</main>
	);
}

function Brackets({ armed }: { armed: boolean }) {
	const base = "pointer-events-none fixed h-10 w-10 border-ion/45 transition";
	const style = (i: number) =>
		({
			animation: armed
				? "bracket-in 0.7s cubic-bezier(0.16,1,0.3,1) both"
				: "none",
			animationDelay: `${0.1 + i * 0.08}s`,
			opacity: armed ? undefined : 0,
		}) as const;
	return (
		<>
			<div
				className={cn(base, "left-4 top-4 border-l border-t")}
				style={style(0)}
			/>
			<div
				className={cn(base, "right-4 top-4 border-r border-t")}
				style={style(1)}
			/>
			<div
				className={cn(base, "bottom-4 left-4 border-b border-l")}
				style={style(2)}
			/>
			<div
				className={cn(base, "bottom-4 right-4 border-b border-r")}
				style={style(3)}
			/>
		</>
	);
}

function FrequencyRail({ armed, fps }: { armed: boolean; fps: number }) {
	// Tick brightness wiggles with the render rate so the rail feels "alive".
	const energy = Math.min(1, Math.max(0, (fps - 30) / 60));
	return (
		<div
			className={cn(
				"pointer-events-none fixed left-5 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-2 lg:flex",
				armed ? "reveal" : "opacity-0",
			)}
			style={{ animationDelay: "0.5s" }}
		>
			<span className="mb-2 font-mono text-[9px] uppercase tracking-[0.3em] text-mist [writing-mode:vertical-rl]">
				Frequency
			</span>
			<div className="relative flex flex-col gap-[6px]">
				{RAIL_TICKS.map((_, i) => (
					<span
						key={i}
						className="h-px bg-ion"
						style={{
							width: i % 4 === 0 ? 18 : 9,
							opacity: 0.2 + (i % 4 === 0 ? 0.5 : 0.18) * energy,
						}}
					/>
				))}
				{/* scanning blip */}
				<span
					className="absolute left-0 h-3 w-5 rounded-full bg-aurora/70 blur-[3px]"
					style={{ animation: "rail-scan 3.4s ease-in-out infinite" }}
				/>
			</div>
		</div>
	);
}

function Readout({
	icon,
	label,
	value,
	mono,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
	mono?: boolean;
}) {
	return (
		<div className="flex items-center gap-3 bg-[var(--void-2)]/70 px-4 py-3.5 backdrop-blur-md sm:px-6 sm:py-4">
			<span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-line-soft bg-white/[0.03]">
				{icon}
			</span>
			<div className="min-w-0">
				<div className="font-mono text-[9px] uppercase tracking-[0.26em] text-mist">
					{label}
				</div>
				<div
					className={cn(
						"truncate text-[15px] text-white",
						mono ? "font-mono tabular-nums" : "font-display",
					)}
				>
					{value}
				</div>
			</div>
		</div>
	);
}
