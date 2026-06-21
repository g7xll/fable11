import {
	Activity,
	Compass,
	Crosshair,
	Droplet,
	Pause,
	Play,
	RotateCcw,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import CelestialInkShader, {
	type InkFrame,
} from "@/components/ui/celestial-ink-shader";
import { cn } from "@/lib/utils";

/**
 * "Celestial Ink — Scrying Instrument"
 * ------------------------------------
 * The brief's WebGL ink-bloom shader, framed as a divination instrument: the
 * ink is a celestial field you read rather than just a background. An astrolabe
 * reticle tracks the pointer over the ink; a telemetry column reports the
 * shader's own per-frame state (ink time, rotation, ripple coordinates, render
 * rate); and a control rail lets you still the ink, cast it anew, and tune its
 * drift and ripple.
 */

const fmt = (n: number, d = 2) => n.toFixed(d);
const sign = (n: number) => (n >= 0 ? "+" : "-");

export default function App() {
	const [freeze, setFreeze] = useState(false);
	const [follow, setFollow] = useState(true);
	const [inkSpeed, setInkSpeed] = useState(1);
	const [rippleGain, setRippleGain] = useState(1);

	// Latest frame telemetry, written by the render loop into a ref and mirrored
	// into state at a throttled cadence so the HUD updates without re-rendering
	// every animation frame.
	const frameRef = useRef<InkFrame>({
		time: 0,
		angle: 0,
		ripple: { x: 0, y: 0 },
		fps: 60,
	});
	const [tel, setTel] = useState<InkFrame>(frameRef.current);

	const onFrame = useCallback((f: InkFrame) => {
		frameRef.current = f;
	}, []);

	useEffect(() => {
		const id = window.setInterval(() => setTel({ ...frameRef.current }), 90);
		return () => window.clearInterval(id);
	}, []);

	// Pointer position (viewport px) for the astrolabe reticle overlay.
	const stageRef = useRef<HTMLDivElement>(null);
	const reticleRef = useRef<HTMLDivElement>(null);
	const [reticleVisible, setReticleVisible] = useState(false);

	useEffect(() => {
		if (!follow) {
			setReticleVisible(false);
			return;
		}
		const onMove = (e: MouseEvent) => {
			const stage = stageRef.current;
			const ret = reticleRef.current;
			if (!stage || !ret) return;
			const rect = stage.getBoundingClientRect();
			const inside =
				e.clientX >= rect.left &&
				e.clientX <= rect.right &&
				e.clientY >= rect.top &&
				e.clientY <= rect.bottom;
			setReticleVisible(inside);
			ret.style.transform = `translate(${e.clientX - rect.left}px, ${
				e.clientY - rect.top
			}px)`;
		};
		window.addEventListener("mousemove", onMove);
		return () => window.removeEventListener("mousemove", onMove);
	}, [follow]);

	const angleDeg = ((tel.angle * 180) / Math.PI) % 360;

	return (
		<main className="relative h-full w-full overflow-hidden bg-void p-3 text-mist sm:p-5">
			{/* Instrument frame */}
			<div className="relative h-full w-full overflow-hidden rounded-[2px] border border-line/40">
				{/* ---- Live ink field ---------------------------------------- */}
				<div ref={stageRef} className="absolute inset-0">
					<CelestialInkShader
						fill
						freeze={freeze}
						inkSpeed={inkSpeed}
						rippleGain={rippleGain}
						onFrame={onFrame}
						className="h-full w-full"
					/>
					{/* texture + seating overlays (pointer-transparent) */}
					<div className="pointer-events-none absolute inset-0 ink-grain opacity-[0.18]" />
					<div className="pointer-events-none absolute inset-0 ink-vignette" />

					{/* Astrolabe reticle — the signature element. Follows the cursor
              over the ink and reads the warp like a divining sight. */}
					{follow && (
						<div
							ref={reticleRef}
							aria-hidden
							className={cn(
								"pointer-events-none absolute left-0 top-0 z-20 -ml-[68px] -mt-[68px] h-[136px] w-[136px] transition-opacity duration-300",
								reticleVisible ? "opacity-100" : "opacity-0",
							)}
						>
							<svg viewBox="0 0 136 136" className="h-full w-full">
								<g
									className="reticle-spin"
									style={{ transformOrigin: "68px 68px" }}
								>
									<circle
										cx="68"
										cy="68"
										r="58"
										fill="none"
										stroke="#ffe6b8"
										strokeOpacity="0.5"
										strokeWidth="1"
										strokeDasharray="3 6"
									/>
									{Array.from({ length: 24 }).map((_, i) => {
										const a = (i / 24) * Math.PI * 2;
										const r1 = i % 6 === 0 ? 48 : 53;
										return (
											<line
												key={i}
												x1={68 + Math.cos(a) * r1}
												y1={68 + Math.sin(a) * r1}
												x2={68 + Math.cos(a) * 58}
												y2={68 + Math.sin(a) * 58}
												stroke="#ffe6b8"
												strokeOpacity={i % 6 === 0 ? 0.85 : 0.4}
												strokeWidth="1"
											/>
										);
									})}
								</g>
								<circle
									cx="68"
									cy="68"
									r="30"
									fill="none"
									stroke="#e0497a"
									strokeOpacity="0.7"
									strokeWidth="1"
									className="reticle-spin-rev"
									style={{ transformOrigin: "68px 68px" }}
									strokeDasharray="44 10"
								/>
								<line
									x1="68"
									y1="22"
									x2="68"
									y2="40"
									stroke="#ffe6b8"
									strokeOpacity="0.8"
								/>
								<line
									x1="68"
									y1="96"
									x2="68"
									y2="114"
									stroke="#ffe6b8"
									strokeOpacity="0.8"
								/>
								<line
									x1="22"
									y1="68"
									x2="40"
									y2="68"
									stroke="#ffe6b8"
									strokeOpacity="0.8"
								/>
								<line
									x1="96"
									y1="68"
									x2="114"
									y2="68"
									stroke="#ffe6b8"
									strokeOpacity="0.8"
								/>
								<circle cx="68" cy="68" r="2.2" fill="#ffe6b8" />
							</svg>
						</div>
					)}
				</div>

				{/* Corner brackets */}
				{(["tl", "tr", "bl", "br"] as const).map((c) => (
					<span
						key={c}
						aria-hidden
						className={cn(
							"pointer-events-none absolute z-30 h-5 w-5 border-gold/60",
							c === "tl" && "left-3 top-3 border-l border-t",
							c === "tr" && "right-3 top-3 border-r border-t",
							c === "bl" && "bottom-3 left-3 border-b border-l",
							c === "br" && "bottom-3 right-3 border-b border-r",
						)}
					/>
				))}

				{/* Ruled tick rails */}
				<div className="tick-rail pointer-events-none absolute left-12 right-12 top-3 z-10 h-2 opacity-40" />
				<div className="tick-rail pointer-events-none absolute bottom-3 left-12 right-12 z-10 h-2 opacity-40" />

				{/* ---- HUD layer --------------------------------------------- */}
				<div className="pointer-events-none absolute inset-0 z-30 flex flex-col">
					{/* Top eyebrow strip */}
					<header className="rise flex items-center justify-between gap-4 px-5 pt-6 sm:px-8">
						<div className="flex items-center gap-3">
							<Droplet className="h-4 w-4 text-rose" strokeWidth={1.5} />
							<span className="font-mono text-[10px] uppercase tracking-widest2 text-mist/80">
								Inkstone Observatory
							</span>
						</div>
						<div className="flex items-center gap-2">
							<span
								className={cn(
									"h-1.5 w-1.5 rounded-full",
									freeze ? "bg-mist/50" : "bg-rose breathe",
								)}
							/>
							<span className="font-mono text-[10px] uppercase tracking-[0.3em] text-mist/70">
								{freeze ? "Held" : "Scrying"}
							</span>
						</div>
					</header>

					{/* Center lockup */}
					<div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
						<p className="rise mb-4 font-mono text-[10px] uppercase tracking-widest2 text-gold/70">
							Specimen No. 0451 — Celestial Field
						</p>
						<h1
							className="ink-title rise font-display text-[clamp(3rem,13vw,9.5rem)] font-semibold leading-[0.9] text-[#f7eefb]"
							style={{ animationDelay: "0.08s" }}
						>
							Celestial Ink
						</h1>
						<div
							className="rise mt-5 flex items-center gap-3"
							style={{ animationDelay: "0.16s" }}
						>
							<span className="h-px w-10 bg-line/70" />
							<p className="font-mono text-[10px] uppercase tracking-[0.42em] text-mist/80">
								An Interactive WebGL Shader
							</p>
							<span className="h-px w-10 bg-line/70" />
						</div>
						<p
							className="rise mt-7 max-w-md font-body text-sm leading-relaxed text-mist/70"
							style={{ animationDelay: "0.24s" }}
						>
							Move the cursor to disturb the ink — a ripple blooms where you
							read it. The field rotates and folds through six octaves of noise,
							drawn live on the GPU.
						</p>
					</div>

					{/* Spacer for the bottom rail height */}
					<div className="h-[136px] sm:h-[120px]" />
				</div>

				{/* ---- Telemetry column (left) ------------------------------- */}
				<aside className="rise absolute left-5 top-1/2 z-30 hidden -translate-y-1/2 sm:left-8 lg:block">
					<div className="w-[208px] border-l border-line/50 pl-4">
						<div className="mb-3 flex items-center gap-2">
							<Activity
								className="h-3.5 w-3.5 text-gold/80"
								strokeWidth={1.5}
							/>
							<span className="font-mono text-[9px] uppercase tracking-[0.3em] text-mist/60">
								Field Readout
							</span>
						</div>
						<Readout label="Ink time" value={`${fmt(tel.time, 2)} s`} />
						<Readout label="Rotation" value={`${fmt(angleDeg, 1)}°`} />
						<Readout
							label="Ripple · x"
							value={`${sign(tel.ripple.x)}${fmt(Math.abs(tel.ripple.x), 3)}`}
						/>
						<Readout
							label="Ripple · y"
							value={`${sign(tel.ripple.y)}${fmt(Math.abs(tel.ripple.y), 3)}`}
						/>
						<Readout label="Render" value={`${fmt(tel.fps, 0)} fps`} />
						<Readout label="Octaves" value="6 fBm" last />
					</div>
				</aside>

				{/* ---- Control rail (bottom) --------------------------------- */}
				<footer className="rise absolute inset-x-3 bottom-3 z-30 sm:inset-x-5">
					<div className="flex flex-col gap-3 rounded-[2px] border border-line/40 bg-void/55 px-4 py-3 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
						{/* Transport buttons */}
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={() => setFreeze((v) => !v)}
								aria-pressed={freeze}
								className="group inline-flex items-center gap-2 rounded-[2px] border border-line/50 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-mist transition-colors hover:border-gold/70 hover:text-gold"
							>
								{freeze ? (
									<Play className="h-3.5 w-3.5" strokeWidth={1.5} />
								) : (
									<Pause className="h-3.5 w-3.5" strokeWidth={1.5} />
								)}
								{freeze ? "Release" : "Still the ink"}
							</button>
							<button
								type="button"
								onClick={() => {
									setFreeze(false);
									setInkSpeed(1);
									setRippleGain(1);
								}}
								className="inline-flex items-center gap-2 rounded-[2px] border border-line/50 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-mist transition-colors hover:border-rose/70 hover:text-rose"
							>
								<RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
								Cast anew
							</button>
							<button
								type="button"
								onClick={() => setFollow((v) => !v)}
								aria-pressed={follow}
								className={cn(
									"inline-flex items-center gap-2 rounded-[2px] border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
									follow
										? "border-gold/60 text-gold"
										: "border-line/50 text-mist hover:border-gold/70 hover:text-gold",
								)}
							>
								<Crosshair className="h-3.5 w-3.5" strokeWidth={1.5} />
								Reticle
							</button>
						</div>

						{/* Faders */}
						<div className="flex flex-1 items-center gap-5 sm:max-w-md">
							<Fader
								icon={<Compass className="h-3.5 w-3.5" strokeWidth={1.5} />}
								label="Drift"
								value={inkSpeed}
								min={0}
								max={3}
								step={0.05}
								display={`${fmt(inkSpeed, 2)}×`}
								onChange={setInkSpeed}
							/>
							<Fader
								icon={<Droplet className="h-3.5 w-3.5" strokeWidth={1.5} />}
								label="Ripple"
								value={rippleGain}
								min={0}
								max={2.5}
								step={0.05}
								display={`${fmt(rippleGain, 2)}×`}
								onChange={setRippleGain}
							/>
						</div>
					</div>
				</footer>
			</div>
		</main>
	);
}

function Readout({
	label,
	value,
	last,
}: {
	label: string;
	value: string;
	last?: boolean;
}) {
	return (
		<div
			className={cn(
				"flex items-baseline justify-between gap-3 py-1.5",
				!last && "border-b border-line/25",
			)}
		>
			<span className="font-mono text-[9px] uppercase tracking-[0.22em] text-mist/55">
				{label}
			</span>
			<span className="font-mono text-[12px] tabular-nums text-gold/90">
				{value}
			</span>
		</div>
	);
}

function Fader({
	icon,
	label,
	value,
	min,
	max,
	step,
	display,
	onChange,
}: {
	icon: React.ReactNode;
	label: string;
	value: number;
	min: number;
	max: number;
	step: number;
	display: string;
	onChange: (v: number) => void;
}) {
	return (
		<label className="flex flex-1 items-center gap-3">
			<span className="flex items-center gap-1.5 text-mist/70">
				{icon}
				<span className="hidden font-mono text-[9px] uppercase tracking-[0.2em] md:inline">
					{label}
				</span>
			</span>
			<input
				type="range"
				className="fader flex-1"
				value={value}
				min={min}
				max={max}
				step={step}
				aria-label={label}
				onChange={(e) => onChange(parseFloat(e.target.value))}
			/>
			<span className="w-10 text-right font-mono text-[10px] tabular-nums text-gold/85">
				{display}
			</span>
		</label>
	);
}
