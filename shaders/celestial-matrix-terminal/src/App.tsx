import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	Crosshair,
	Pause,
	Play,
	RadioTower,
	RotateCcw,
	Satellite,
	ShieldCheck,
	Waypoints,
} from "lucide-react";
import CelestialMatrixShader, {
	type MatrixSample,
} from "@/components/ui/martrix-shader";
import { cn, pad } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Boot / login transcript                                                    */
/*  The signature: the relay station authenticates the operator with a typed   */
/*  handshake against the live transmission feed, then unlocks the console.     */
/* -------------------------------------------------------------------------- */

interface BootLine {
	text: string;
	/** Visual class for the line once typed. */
	tone: "dim" | "ion" | "aurora" | "amber";
	/** Pause (ms) after this line finishes typing, before the next begins. */
	pause: number;
}

const BOOT_LINES: BootLine[] = [
	{
		text: "meridian://relay-9 $ link --feed celestial-matrix",
		tone: "ion",
		pause: 280,
	},
	{
		text: "carrier lock ......... acquired @ 12.97 GHz",
		tone: "dim",
		pause: 140,
	},
	{
		text: "decoding digital rain ... 30x30 lattice stable",
		tone: "dim",
		pause: 140,
	},
	{
		text: "gravitational warp ... bound to operator cursor",
		tone: "dim",
		pause: 200,
	},
	{
		text: "auth handshake [████████████] verified",
		tone: "aurora",
		pause: 220,
	},
	{ text: "> ACCESS GRANTED — operator on station", tone: "amber", pause: 0 },
];

const TYPE_SPEED = 16; // ms per character

const TONE_CLASS: Record<BootLine["tone"], string> = {
	dim: "text-mist/80",
	ion: "text-ion",
	aurora: "text-aurora",
	amber: "text-amber",
};

/**
 * Drives the boot transcript on a single wall-clock timer, then flags
 * completion. Time-based (rather than one setTimeout per character) so the typing
 * keeps a steady cadence even while the WebGL render loop and live telemetry are
 * competing for the main thread — each tick simply shows however much of the
 * transcript "should" be visible by now.
 */
function useBootSequence() {
	const [progress, setProgress] = useState({
		lineIndex: 0,
		charIndex: 0,
		done: false,
	});

	useEffect(() => {
		const start = performance.now();
		let raf = 0;

		const tick = () => {
			let budget = performance.now() - start; // ms available to "spend" so far

			for (let i = 0; i < BOOT_LINES.length; i++) {
				const line = BOOT_LINES[i];
				const typeMs = line.text.length * TYPE_SPEED;

				if (budget < typeMs) {
					setProgress({
						lineIndex: i,
						charIndex: Math.min(
							line.text.length,
							Math.floor(budget / TYPE_SPEED),
						),
						done: false,
					});
					raf = requestAnimationFrame(tick);
					return;
				}
				budget -= typeMs;

				if (budget < line.pause) {
					// Line fully typed, holding before the next one.
					setProgress({
						lineIndex: i,
						charIndex: line.text.length,
						done: false,
					});
					raf = requestAnimationFrame(tick);
					return;
				}
				budget -= line.pause;
			}

			// Whole transcript consumed.
			const last = BOOT_LINES.length - 1;
			setProgress({
				lineIndex: last,
				charIndex: BOOT_LINES[last].text.length,
				done: true,
			});
		};

		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, []);

	return progress;
}

/* -------------------------------------------------------------------------- */
/*  Small presentational pieces                                                */
/* -------------------------------------------------------------------------- */

function Readout({
	label,
	value,
	accent = "text-ion",
}: {
	label: string;
	value: string;
	accent?: string;
}) {
	return (
		<div className="flex flex-col gap-1">
			<span className="font-mono text-[10px] uppercase tracking-[0.28em] text-mist/60">
				{label}
			</span>
			<span
				className={cn("font-mono text-sm tabular-nums leading-none", accent)}
			>
				{value}
			</span>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/*  App                                                                         */
/* -------------------------------------------------------------------------- */

export default function App() {
	const { lineIndex, charIndex, done } = useBootSequence();

	// Console clock controls wired into the shader's feed clock.
	const [frozen, setFrozen] = useState(false);
	const [calibrateAt, setCalibrateAt] = useState(0); // bump to remount the shader

	// Live telemetry read straight off the GPU loop.
	const [sample, setSample] = useState<MatrixSample>({
		time: 0,
		warp: { x: 0.5, y: 0.5 },
		fps: 60,
	});
	const onSample = useCallback((s: MatrixSample) => setSample(s), []);

	// Cursor reticle position (screen px), tracked so the lock marker follows the
	// same warp center the shader is bending around.
	const [reticle, setReticle] = useState<{ x: number; y: number } | null>(null);
	const rafReticle = useRef<number | null>(null);
	useEffect(() => {
		const onMove = (e: PointerEvent) => {
			if (rafReticle.current != null) return;
			rafReticle.current = window.requestAnimationFrame(() => {
				rafReticle.current = null;
				setReticle({ x: e.clientX, y: e.clientY });
			});
		};
		window.addEventListener("pointermove", onMove);
		return () => {
			window.removeEventListener("pointermove", onMove);
			if (rafReticle.current != null) cancelAnimationFrame(rafReticle.current);
		};
	}, []);

	const recalibrate = useCallback(() => {
		setFrozen(false);
		setCalibrateAt((n) => n + 1); // forces a fresh shader instance -> clock to 0
	}, []);

	// Derived, human-readable telemetry strings.
	const feedClock = useMemo(() => {
		const total = Math.max(0, sample.time);
		const mm = Math.floor(total / 60);
		const ss = Math.floor(total % 60);
		const cs = Math.floor((total * 100) % 100);
		return `${pad(mm, 2)}:${pad(ss, 2)}.${pad(cs, 2)}`;
	}, [sample.time]);

	const warpCoord = `${sample.warp.x.toFixed(3)} , ${sample.warp.y.toFixed(3)}`;
	const fps = `${Math.round(sample.fps)} fps`;

	return (
		<main className="relative h-screen w-screen overflow-hidden bg-void text-white">
			{/* 0) Deep-space ambient glow, painted behind the rain so the void reads as
          a star field with a faint transmission rather than a black rectangle. */}
			<div
				className="pointer-events-none absolute inset-0 z-0"
				style={{
					background:
						"radial-gradient(60% 50% at 50% 40%, rgba(26,77,222,0.16), transparent 70%), " +
						"radial-gradient(45% 40% at 78% 78%, rgba(25,204,127,0.10), transparent 72%), " +
						"radial-gradient(40% 38% at 18% 22%, rgba(127,233,255,0.08), transparent 74%)",
				}}
				aria-hidden
			/>

			{/* 1) Live shader feed (the brief's component), mounted as an absolute
          back layer so its stacking is explicit inside this scene. */}
			<CelestialMatrixShader
				key={calibrateAt}
				frozen={frozen}
				onSample={onSample}
				ariaLabel="Celestial Matrix animated background"
				className="absolute inset-0 z-[1]"
				style={{
					position: "absolute",
					width: "100%",
					height: "100%",
					zIndex: 1,
				}}
			/>

			{/* 2) Atmosphere layers over the rain */}
			<div className="pointer-events-none absolute inset-0 z-10 vignette" />
			<div className="pointer-events-none absolute inset-0 z-10 crt-scanlines opacity-40" />
			<div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-ion/60 to-transparent" />

			{/* 3) Cursor warp reticle — marks the gravitational lock the rain bends around */}
			{reticle && (
				<div
					className="pointer-events-none absolute z-20 hidden md:block"
					style={{
						left: reticle.x,
						top: reticle.y,
						transform: "translate(-50%, -50%)",
					}}
					aria-hidden
				>
					<Crosshair className="h-9 w-9 text-ion/70" strokeWidth={1} />
					{/* Flip the label to the cursor's inner side so it never clips off-screen. */}
					<span
						className={cn(
							"absolute top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] text-ion/70",
							reticle.x > window.innerWidth - 160
								? "right-7 text-right"
								: "left-7",
						)}
					>
						warp · lock
					</span>
				</div>
			)}

			{/* 4) Top status bar */}
			<header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-5 sm:px-10">
				<div className="flex items-center gap-3">
					<Satellite className="h-5 w-5 text-aurora" strokeWidth={1.5} />
					<div className="leading-none">
						<p className="font-display text-sm font-semibold tracking-[0.18em] text-white">
							MERIDIAN STATION
						</p>
						<p className="mt-1 font-mono text-[10px] uppercase tracking-[0.34em] text-mist/70">
							Orbital Relay 9 · Deep-Field Telemetry
						</p>
					</div>
				</div>
				<div className="hidden items-center gap-2 sm:flex">
					<span className="relative flex h-2 w-2">
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aurora/70" />
						<span className="relative inline-flex h-2 w-2 rounded-full bg-aurora" />
					</span>
					<span className="font-mono text-[11px] uppercase tracking-[0.28em] text-aurora">
						feed live
					</span>
				</div>
			</header>

			{/* 5) The console: bracketed CRT terminal */}
			<section className="absolute inset-0 z-20 flex items-start justify-center overflow-y-auto px-5 pb-28 pt-28 sm:items-center sm:px-8 sm:py-24">
				<div className="relative w-full max-w-2xl animate-crt-flicker">
					{/* corner brackets */}
					<span className="bracket bracket-tl" />
					<span className="bracket bracket-tr" />
					<span className="bracket bracket-bl" />
					<span className="bracket bracket-br" />

					<div className="relative overflow-hidden rounded-sm border border-ion/25 bg-void/55 shadow-[0_0_60px_-12px_rgba(26,77,222,0.55)] backdrop-blur-md">
						{/* sweeping scan line */}
						<div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 animate-scan-sweep bg-gradient-to-b from-ion/12 to-transparent" />

						{/* terminal title bar */}
						<div className="flex items-center justify-between border-b border-ion/15 bg-white/[0.02] px-4 py-2.5">
							<div className="flex items-center gap-2">
								<RadioTower
									className="h-3.5 w-3.5 text-ion"
									strokeWidth={1.5}
								/>
								<span className="font-mono text-[11px] uppercase tracking-[0.3em] text-mist">
									feed://celestial-matrix
								</span>
							</div>
							<div className="flex items-center gap-1.5">
								<span className="h-2 w-2 rounded-full bg-mist/30" />
								<span className="h-2 w-2 rounded-full bg-mist/30" />
								<span className="h-2 w-2 rounded-full bg-amber/80" />
							</div>
						</div>

						{/* transcript */}
						<div className="px-5 pb-5 pt-4 sm:px-7">
							<div className="min-h-[8.5rem] space-y-1.5 font-mono text-[12.5px] leading-relaxed sm:text-[13px]">
								{BOOT_LINES.map((line, i) => {
									if (i > lineIndex) return null;
									const isCurrent = i === lineIndex && !done;
									const shown = isCurrent
										? line.text.slice(0, charIndex)
										: line.text;
									return (
										<p
											key={i}
											className={cn(
												"whitespace-pre-wrap break-words",
												TONE_CLASS[line.tone],
											)}
										>
											{shown}
											{isCurrent && (
												<span className="ml-0.5 inline-block h-3.5 w-2 translate-y-[2px] animate-caret-blink bg-ion" />
											)}
										</p>
									);
								})}
							</div>

							{/* identity reveal — appears after ACCESS GRANTED */}
							<div
								className={cn(
									"mt-5 border-t border-ion/15 pt-5 transition-all duration-700",
									done
										? "translate-y-0 opacity-100"
										: "pointer-events-none translate-y-2 opacity-0",
								)}
							>
								<p className="font-mono text-[10px] uppercase tracking-[0.4em] text-aurora">
									Celestial Matrix
								</p>
								<h1 className="mt-2 font-display text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-[2.6rem]">
									An interactive WebGL shader,
									<br />
									decoded as a live relay feed.
								</h1>
								<p className="mt-3 max-w-md font-body text-sm leading-relaxed text-mist">
									Move your cursor to bend the digital rain — the warp marks the
									gravitational lock the lattice falls toward. Every readout
									below is sampled straight off the render loop.
								</p>

								{/* controls */}
								<div className="mt-5 flex flex-wrap items-center gap-3">
									<button
										type="button"
										onClick={() => setFrozen((f) => !f)}
										aria-pressed={frozen}
										className="group inline-flex items-center gap-2 rounded-sm border border-ion/35 bg-ion/5 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ion transition-colors hover:bg-ion/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ion/60"
									>
										{frozen ? (
											<Play className="h-3.5 w-3.5" strokeWidth={2} />
										) : (
											<Pause className="h-3.5 w-3.5" strokeWidth={2} />
										)}
										{frozen ? "resume feed" : "freeze feed"}
									</button>
									<button
										type="button"
										onClick={recalibrate}
										className="inline-flex items-center gap-2 rounded-sm border border-mist/25 bg-white/[0.02] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-mist transition-colors hover:border-aurora/40 hover:text-aurora focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora/50"
									>
										<RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
										recalibrate
									</button>
									<span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-aurora/90">
										<ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
										secure
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* 6) Telemetry strip — driven by the shader's own per-frame samples */}
			<footer className="absolute inset-x-0 bottom-0 z-30 border-t border-ion/12 bg-void/55 px-6 py-3.5 backdrop-blur-sm sm:px-10">
				<div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-8 gap-y-3">
					<Readout
						label="Feed clock"
						value={feedClock}
						accent="font-mono text-ion"
					/>
					<Readout label="Warp x · y" value={warpCoord} accent="text-aurora" />
					<Readout label="Render rate" value={fps} accent="text-ion" />
					<Readout
						label="Carrier"
						value={frozen ? "HELD" : "STREAMING"}
						accent={frozen ? "text-amber" : "text-aurora"}
					/>
					<div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.26em] text-mist/60 lg:flex">
						<Waypoints className="h-3.5 w-3.5 text-mist/50" strokeWidth={1.5} />
						lattice 30 × 30 · band 12.97 GHz
					</div>
				</div>
			</footer>
		</main>
	);
}
