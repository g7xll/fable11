import {
	Activity,
	Cpu,
	Crosshair,
	Pause,
	Play,
	RotateCcw,
	Waves,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import CyberneticGridShader, {
	type ShaderTelemetry,
} from "@/components/ui/cybernetic-grid-shader";
import { cn } from "@/lib/utils";

/**
 * Cybernetic Grid — framed as a lattice-integrity diagnostic console. The
 * verbatim Three.js shader is the live "field"; the chrome around it makes the
 * shader's hidden interaction (the cursor-driven grid warp + glow) legible
 * through a probe caliper, coordinate readouts, and an integrity gauge.
 */

const GAUGE_TICKS = Array.from({ length: 26 });

function fmtClock(t: number) {
	const m = Math.floor(t / 60);
	const s = Math.floor(t % 60);
	const cs = Math.floor((t % 1) * 100);
	return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

export default function App() {
	const [paused, setPaused] = useState(false);
	const [shaderKey, setShaderKey] = useState(0); // remount to re-seed the field
	const [armed, setArmed] = useState(false); // boot-sequence gate

	// Telemetry updates every frame; we keep it in a ref and flush to React on a
	// throttled interval so the readouts feel live without re-rendering 60×/sec.
	const telemetryRef = useRef<ShaderTelemetry>({
		time: 0,
		fps: 60,
		mouseX: 0.5,
		mouseY: 0.5,
	});
	const [display, setDisplay] = useState<ShaderTelemetry>(telemetryRef.current);
	const caliperRef = useRef<HTMLDivElement>(null);
	const [locked, setLocked] = useState(false); // true once the operator deflects the field

	const onFrame = useCallback((t: ShaderTelemetry) => {
		telemetryRef.current = t;
		// Move the probe caliper imperatively for buttery tracking of the warp center.
		const c = caliperRef.current;
		if (c) {
			c.style.left = `${t.mouseX * 100}%`;
			// mouseY is measured from the bottom (shader space) → flip for screen top.
			c.style.top = `${(1 - t.mouseY) * 100}%`;
		}
	}, []);

	useEffect(() => {
		const id = window.setInterval(
			() => setDisplay({ ...telemetryRef.current }),
			90,
		);
		return () => window.clearInterval(id);
	}, []);

	// Flip the status to "deflecting" the first time the operator moves the probe.
	useEffect(() => {
		const mark = () => setLocked(true);
		window.addEventListener("pointermove", mark, { once: true });
		return () => window.removeEventListener("pointermove", mark);
	}, []);

	// Arm the console shortly after mount so the reveal choreography plays.
	useEffect(() => {
		const id = window.setTimeout(() => setArmed(true), 120);
		return () => window.clearTimeout(id);
	}, []);

	const reseed = () => {
		telemetryRef.current = {
			time: 0,
			fps: 60,
			mouseX: telemetryRef.current.mouseX,
			mouseY: telemetryRef.current.mouseY,
		};
		setPaused(false);
		setShaderKey((k) => k + 1);
	};

	// Integrity reads as a function of render rate — a healthy field holds ~60fps.
	const integrity = Math.min(
		100,
		Math.max(0, Math.round((display.fps / 60) * 100)),
	);

	return (
		<main className="relative h-screen w-screen overflow-hidden font-body text-[#e8f0ff]">
			{/* Verbatim shader background */}
			<CyberneticGridShader key={shaderKey} paused={paused} onFrame={onFrame} />

			{/* ── Probe caliper — the signature element. A square engineering bracket
          with extending tick-arms + a coordinate tag that rides the cursor and
          snaps to the shader's warp center, plus a deflection ring echoing the
          shader's sin-ripple warp. ─────────────────────────────────────────── */}
			<div
				ref={caliperRef}
				aria-hidden
				className="pointer-events-none fixed z-30 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500"
				style={{ left: "50%", top: "50%", opacity: armed ? 1 : 0 }}
			>
				<div className="relative h-28 w-28">
					{/* deflection rings */}
					<span
						className="absolute inset-0 rounded-full border border-cyan/40"
						style={{ animation: "deflect 2.4s ease-out infinite" }}
					/>
					<span
						className="absolute inset-0 rounded-full border border-magenta/40"
						style={{ animation: "deflect 2.4s ease-out 1.2s infinite" }}
					/>
					{/* corner brackets */}
					{(
						[
							"left-0 top-0 border-l border-t",
							"right-0 top-0 border-r border-t",
							"bottom-0 left-0 border-b border-l",
							"bottom-0 right-0 border-b border-r",
						] as const
					).map((pos, i) => (
						<span key={i} className={cn("absolute h-4 w-4 border-cyan", pos)} />
					))}
					{/* tick-arms */}
					<span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-cyan/70" />
					<span className="absolute bottom-0 left-1/2 h-3 w-px -translate-x-1/2 bg-cyan/70" />
					<span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-cyan/70" />
					<span className="absolute right-0 top-1/2 h-px w-3 -translate-y-1/2 bg-cyan/70" />
					{/* core dot */}
					<span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-magenta shadow-[0_0_14px_3px_rgba(255,51,204,0.85)]" />
					{/* coordinate tag */}
					<span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-sm border border-line bg-[var(--glass)] px-2 py-0.5 font-mono text-[10px] tabular-nums tracking-wider text-cyan backdrop-blur-sm">
						{display.mouseX.toFixed(2)} · {display.mouseY.toFixed(2)}
					</span>
				</div>
			</div>

			{/* ── HUD layer ───────────────────────────────────────────────────────── */}
			<div className="pointer-events-none relative z-20 flex h-full flex-col">
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
						<Cpu className="h-4 w-4 text-cyan" strokeWidth={1.6} />
						<span className="font-mono text-[11px] uppercase tracking-[0.34em] text-steel">
							Lattice Diagnostics
						</span>
						<span className="hidden font-mono text-[11px] tracking-[0.2em] text-steel/60 sm:inline">
							/ unit&nbsp;CG-09
						</span>
					</div>
					<div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-steel">
						<span
							className={cn(
								"inline-block h-1.5 w-1.5 rounded-full",
								locked ? "bg-magenta" : "bg-cobalt",
							)}
							style={{ animation: "blip 1.6s ease-in-out infinite" }}
						/>
						{locked ? "Field deflecting" : "Field nominal"}
					</div>
				</header>

				{/* Left integrity gauge */}
				<IntegrityGauge armed={armed} integrity={integrity} />

				{/* Centerpiece — the thesis */}
				<section className="flex flex-1 flex-col items-center justify-center px-6 text-center">
					<p
						className={cn(
							"mb-5 font-mono text-[11px] uppercase tracking-[0.5em] text-cyan/85",
							armed ? "reveal" : "opacity-0",
						)}
						style={{ animationDelay: "0.4s" }}
					>
						Interactive WebGL field
					</p>
					<h1
						className="font-display text-[clamp(2.6rem,11.5vw,9rem)] font-bold uppercase leading-[0.9] text-white"
						style={{
							animation: armed
								? "title-glitch 1s cubic-bezier(0.16,1,0.3,1) 0.28s both"
								: "none",
							opacity: armed ? undefined : 0,
							textShadow: "0 0 42px rgba(26,128,255,0.42)",
						}}
					>
						Cybernetic
						<br />
						<span className="bg-gradient-to-r from-cobalt via-cyan to-magenta bg-clip-text text-transparent">
							Grid
						</span>
					</h1>
					<p
						className={cn(
							"mt-6 max-w-md font-body text-sm leading-relaxed text-steel sm:text-base",
							armed ? "reveal" : "opacity-0",
						)}
						style={{ animationDelay: "0.7s" }}
					>
						A live diagnostic feed of the cybernetic lattice. Sweep your cursor
						to deflect the grid — energy pulses and a bright glow warp around
						the probe.
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
							className="group inline-flex items-center gap-2 rounded-sm border border-line bg-[var(--glass)] px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.18em] text-white backdrop-blur-md transition hover:border-cyan/60 hover:bg-cyan/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
							aria-pressed={paused}
						>
							{paused ? (
								<Play className="h-3.5 w-3.5 text-cyan" strokeWidth={2} />
							) : (
								<Pause className="h-3.5 w-3.5 text-magenta" strokeWidth={2} />
							)}
							{paused ? "Resume field" : "Hold lattice"}
						</button>
						<button
							onClick={reseed}
							className="inline-flex items-center gap-2 rounded-sm border border-line-soft bg-[var(--glass)] px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.18em] text-steel backdrop-blur-md transition hover:border-line hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt"
						>
							<RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
							Re-seed
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
							<Activity className="h-3.5 w-3.5 text-cyan" strokeWidth={1.8} />
						}
						label="Render rate"
						value={`${display.fps.toFixed(0)} fps`}
					/>
					<Readout
						icon={
							<Waves className="h-3.5 w-3.5 text-cobalt" strokeWidth={1.8} />
						}
						label="Field uptime"
						value={fmtClock(display.time)}
						mono
					/>
					<Readout
						icon={
							<Crosshair
								className="h-3.5 w-3.5 text-magenta"
								strokeWidth={1.8}
							/>
						}
						label="Probe · X"
						value={display.mouseX.toFixed(3)}
						mono
					/>
					<Readout
						icon={
							<Crosshair className="h-3.5 w-3.5 text-cyan" strokeWidth={1.8} />
						}
						label="Probe · Y"
						value={display.mouseY.toFixed(3)}
						mono
					/>
				</footer>
			</div>
		</main>
	);
}

function Brackets({ armed }: { armed: boolean }) {
	const base = "pointer-events-none fixed h-10 w-10 border-cyan/45";
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

function IntegrityGauge({
	armed,
	integrity,
}: {
	armed: boolean;
	integrity: number;
}) {
	// Lit tick count tracks integrity so the rail visibly fills with the field's
	// health, while a sweeping blip scans it.
	const lit = Math.round((integrity / 100) * GAUGE_TICKS.length);
	return (
		<div
			className={cn(
				"pointer-events-none fixed left-5 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-2 lg:flex",
				armed ? "reveal" : "opacity-0",
			)}
			style={{ animationDelay: "0.5s" }}
		>
			<span className="mb-1 font-mono text-[9px] uppercase tracking-[0.3em] text-steel [writing-mode:vertical-rl]">
				Integrity {integrity}%
			</span>
			<div className="relative flex flex-col-reverse gap-[6px]">
				{GAUGE_TICKS.map((_, i) => {
					const on = i < lit;
					return (
						<span
							key={i}
							className={cn(
								"h-px transition-colors",
								on ? "bg-cyan" : "bg-steel",
							)}
							style={{
								width: i % 4 === 0 ? 18 : 9,
								opacity: on ? (i % 4 === 0 ? 0.85 : 0.55) : 0.2,
							}}
						/>
					);
				})}
				<span
					className="absolute left-0 h-3 w-5 rounded-full bg-magenta/70 blur-[3px]"
					style={{
						["--sweep" as string]: "190px",
						animation: "gauge-sweep 3.4s ease-in-out infinite",
					}}
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
		<div className="flex items-center gap-3 bg-abyss-2/70 px-4 py-3.5 backdrop-blur-md sm:px-6 sm:py-4">
			<span className="grid h-7 w-7 shrink-0 place-items-center rounded-sm border border-line-soft bg-white/[0.03]">
				{icon}
			</span>
			<div className="min-w-0">
				<div className="font-mono text-[9px] uppercase tracking-[0.26em] text-steel">
					{label}
				</div>
				<div
					className={cn(
						"truncate text-[15px] text-white",
						mono ? "font-mono tabular-nums" : "font-display font-medium",
					)}
				>
					{value}
				</div>
			</div>
		</div>
	);
}
