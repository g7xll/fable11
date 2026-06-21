import { Orbit, Radio } from "lucide-react";
import { useEffect, useState } from "react";
import ShaderAnimation from "@/components/ui/spiral-shader";
import { cn } from "@/lib/utils";

/**
 * DemoOne — the integration the prompt asks for. The neon-rainbow spiral shader
 * is the fixed full-viewport background ({@link ShaderAnimation}, dropped in
 * unchanged at `@/components/ui/spiral-shader`); everything layered on top is a
 * calm "deep-field survey" instrument that frames it. The brief's required
 * markup — the `relative flex h-screen … bg-black` stage and the
 * `Galactic Spiral` lockup — is preserved; the heading is promoted to an <h1>
 * for semantics and the rest is additive chrome.
 */
export default function DemoOne() {
	const { elapsed, fps } = useTelemetry();

	return (
		<div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-black">
			{/* 1 · The shader, verbatim from the prompt, as a fixed backdrop. */}
			<ShaderAnimation />

			{/* 2 · Grading — pull focus to the core, then grain over the flats. */}
			<div
				aria-hidden
				className="stage-vignette pointer-events-none fixed inset-0 z-[5]"
			/>
			<div
				aria-hidden
				className="stage-grain pointer-events-none fixed inset-0 z-[6]"
			/>

			{/* 3 · Registration frame + corner crops anchor the field as a plate. */}
			<div className="pointer-events-none fixed inset-3 z-20 border border-white/10 sm:inset-5">
				<Corner className="left-0 top-0 border-l border-t" />
				<Corner className="right-0 top-0 border-r border-t" />
				<Corner className="bottom-0 left-0 border-b border-l" />
				<Corner className="bottom-0 right-0 border-b border-r" />
			</div>

			{/* 4 · Top utility bar. */}
			<header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-3 px-5 py-5 sm:px-8 sm:py-7">
				<div className="animate-rise flex items-center gap-3">
					<span className="grid h-9 w-9 place-items-center border border-white/15 bg-black/40 backdrop-blur-sm">
						<Orbit
							aria-hidden
							className="animate-ring-spin h-4 w-4 text-neon-cyan"
						/>
					</span>
					<div className="leading-tight">
						<p className="font-mono text-[10px] uppercase tracking-[0.34em] text-ink">
							Galactic Survey Array
						</p>
						<p className="font-mono text-[9px] uppercase tracking-[0.3em] text-haze">
							Deep Field · Channel 07
						</p>
					</div>
				</div>

				<div className="animate-rise flex items-center gap-2 [animation-delay:120ms]">
					<span className="hidden items-center gap-2 border border-white/15 bg-black/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-ink backdrop-blur-sm sm:flex">
						<span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-neon-magenta" />
						Live · WebGL
					</span>
					<span className="grid h-9 w-9 place-items-center border border-white/15 bg-black/40 backdrop-blur-sm">
						<Radio aria-hidden className="h-4 w-4 text-neon-magenta" />
					</span>
				</div>
			</header>

			{/* 5 · Hero lockup — the brief's title over a legibility scrim. */}
			<main className="pointer-events-none relative z-10 flex flex-col items-center px-6 text-center">
				<div
					aria-hidden
					className="title-scrim pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2"
				/>
				<p className="animate-rise font-mono text-[11px] uppercase tracking-ultra text-haze [animation-delay:160ms]">
					Transmission 04 — Neon Rainbow Spiral
				</p>
				<h1 className="title-glow animate-rise mt-5 whitespace-pre-wrap text-center text-5xl font-semibold leading-none tracking-tighter text-white [animation-delay:240ms] md:text-7xl">
					Galactic Spiral
				</h1>
				<span
					aria-hidden
					className="animate-rise mt-7 h-px w-24 bg-gradient-to-r from-transparent via-white/50 to-transparent [animation-delay:320ms]"
				/>
				<p className="animate-rise mt-6 max-w-md font-serif text-base italic text-ink/85 [animation-delay:400ms] sm:text-lg">
					A seven-band neon rainbow, wound into a spiral and rendered live on
					the GPU.
				</p>
			</main>

			{/* 6 · Telemetry ledger — live mission clock + measured render rate. */}
			<footer className="fixed inset-x-0 bottom-0 z-30 hidden items-center justify-between gap-6 px-8 py-5 md:flex">
				<Stat
					label="Mission"
					value={formatClock(elapsed)}
					valueClass="telemetry-clock"
				/>
				<Stat
					label="Render"
					value={`${Math.round(fps)} fps`}
					valueClass="telemetry-fps"
				/>
				<Stat label="R.A." value={formatRa(elapsed)} />
				<Stat label="Dec." value={formatDec(elapsed)} />
				<Stat label="Pipeline" value="Three.js · WebGL" />
				<Stat label="Bands / Arms" value="×7 / ×5" />
			</footer>

			{/* Mobile mini-ledger so small screens still show live state. */}
			<div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-center gap-4 px-5 py-4 font-mono text-[10px] uppercase tracking-[0.22em] text-haze md:hidden">
				<span className="telemetry-clock-m text-ink">
					{formatClock(elapsed)}
				</span>
				<span className="h-3 w-px bg-white/20" />
				<span>Three.js · WebGL</span>
			</div>
		</div>
	);
}

/* ── Live telemetry, driven by the demo's own rAF (the shader stays verbatim) ─ */
function useTelemetry() {
	const [state, setState] = useState({ elapsed: 0, fps: 60 });

	useEffect(() => {
		let raf = 0;
		const start = performance.now();
		let last = start;
		let pushAt = start;
		let frames = 0;
		let acc = 0;
		let fps = 60;

		const loop = (now: number) => {
			raf = requestAnimationFrame(loop);
			acc += now - last;
			last = now;
			frames += 1;
			if (acc >= 500) {
				fps = (frames * 1000) / acc;
				frames = 0;
				acc = 0;
			}
			// Throttle React updates to ~10 Hz; the rAF itself runs every frame.
			if (now - pushAt >= 100) {
				pushAt = now;
				setState({ elapsed: (now - start) / 1000, fps });
			}
		};

		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, []);

	return state;
}

function pad(n: number) {
	return String(Math.floor(n)).padStart(2, "0");
}

function formatClock(elapsed: number) {
	const s = Math.floor(elapsed);
	return `T+${pad((s / 3600) % 100)}:${pad((s / 60) % 60)}:${pad(s % 60)}`;
}

// Slow eastward drift across the 24h right-ascension circle.
function formatRa(elapsed: number) {
	const totalHours = (((200 + elapsed * 0.8) % 360) / 15 + 24) % 24;
	const h = Math.floor(totalHours);
	const m = Math.floor((totalHours - h) * 60);
	return `${pad(h)}h ${pad(m)}m`;
}

// Gentle wobble around the array's nominal +41° declination.
function formatDec(elapsed: number) {
	const dec = 41 + Math.sin(elapsed * 0.06) * 5;
	const whole = Math.floor(Math.abs(dec));
	const min = Math.floor((Math.abs(dec) - whole) * 60);
	return `+${pad(whole)}° ${pad(min)}′`;
}

function Corner({ className }: { className?: string }) {
	return (
		<span
			aria-hidden
			className={cn(
				"reticle-corner absolute h-5 w-5 border-white/40",
				className,
			)}
		/>
	);
}

function Stat({
	label,
	value,
	valueClass,
}: {
	label: string;
	value: string;
	valueClass?: string;
}) {
	return (
		<span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em]">
			<span className="text-haze">{label}</span>
			<span className={cn("text-ink", valueClass)}>{value}</span>
		</span>
	);
}
