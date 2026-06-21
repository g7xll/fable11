import { useCallback, useEffect, useRef, useState } from "react";
import {
	Flower2,
	Pause,
	Play,
	RotateCcw,
	Sparkles,
	Clock3,
} from "lucide-react";
import DigitalPetalsShader, {
	type PetalTelemetry,
} from "@/components/ui/digital-petals-shader";
import { cn } from "@/lib/utils";

/**
 * Digital Petals — framed as a herbarium specimen plate for a living *digital
 * cultivar*. The verbatim Three.js shader is the pressed flower; the plate
 * around it catalogues it the way a botanist would: a plate number, a binomial
 * name set in Fraunces, and a "cultivation log" that reads the shader's own
 * per-frame state.
 *
 * The signature device is the Petal Dial — a small radial gauge that draws the
 * *actual* number of petals the fragment shader is rendering this frame
 * (5 + sin(t·0.3)·2, so it breathes between 3 and 7). It is synced frame-
 * accurately to the GPU, surfacing the shader's hidden arithmetic on the plate.
 */

function fmtClock(t: number) {
	const m = Math.floor(t / 60);
	const s = Math.floor(t % 60);
	return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function App() {
	const [paused, setPaused] = useState(false);
	const [shaderKey, setShaderKey] = useState(0); // remount to reset the clock
	const [armed, setArmed] = useState(false); // load-sequence gate

	// Telemetry updates every frame; we keep it in a ref and flush to React on a
	// throttled interval so the plate reads live without re-rendering 60×/sec.
	const telemetryRef = useRef<PetalTelemetry>({
		time: 0,
		petals: 5,
		bloom: 0,
		fps: 60,
		mouseX: 0.5,
		mouseY: 0.5,
	});
	const [display, setDisplay] = useState<PetalTelemetry>(telemetryRef.current);

	// The dial is driven imperatively so it tracks petal breathing smoothly even
	// though the textual readouts only refresh a few times a second.
	const dialNeedleRef = useRef<SVGGElement>(null);
	const bloomFillRef = useRef<HTMLDivElement>(null);

	const onFrame = useCallback((t: PetalTelemetry) => {
		telemetryRef.current = t;

		// Rotate the dial needle across its arc as petals breathe 3 → 7.
		const needle = dialNeedleRef.current;
		if (needle) {
			const frac = Math.min(1, Math.max(0, (t.petals - 3) / 4)); // 3..7 → 0..1
			const angle = -120 + frac * 240; // −120°…+120° sweep
			needle.style.transform = `rotate(${angle}deg)`;
		}
		// Fill the bloom meter to the live cursor bloom strength.
		const fill = bloomFillRef.current;
		if (fill) fill.style.transform = `scaleX(${t.bloom})`;
	}, []);

	useEffect(() => {
		const id = window.setInterval(
			() => setDisplay({ ...telemetryRef.current }),
			110,
		);
		return () => window.clearInterval(id);
	}, []);

	// Arm the plate shortly after mount so the unfurl choreography plays.
	useEffect(() => {
		const id = window.setTimeout(() => setArmed(true), 110);
		return () => window.clearTimeout(id);
	}, []);

	const reset = () => {
		telemetryRef.current = { ...telemetryRef.current, time: 0 };
		setPaused(false);
		setShaderKey((k) => k + 1);
	};

	// The shader rounds petals to a visible integer count of lobes; show that.
	const petalInt = Math.round(display.petals);
	const blooming = display.bloom > 0.04;

	return (
		<main className="relative h-screen w-screen overflow-hidden bg-ink font-body text-parchment">
			{/* The shader, framed inside the plate (parent-fit, interactive). */}
			<div className="absolute inset-0">
				<DigitalPetalsShader
					key={shaderKey}
					fitToParent
					paused={paused}
					onFrame={onFrame}
					className="absolute inset-0 h-full w-full"
				/>
				{/* Engraved film keeps the parchment legible over the bloom. */}
				<div
					className="pointer-events-none absolute inset-0 plate-vignette"
					aria-hidden
				/>
			</div>

			{/* ── Plate frame: engraved double rule + botanical corner sprigs ─────── */}
			<PlateFrame armed={armed} />

			{/* ── Plate content ──────────────────────────────────────────────────── */}
			<div className="pointer-events-none relative z-10 flex h-full flex-col">
				{/* Top register: herbarium / plate metadata */}
				<header
					className={cn(
						"flex items-start justify-between px-6 pt-6 sm:px-10 sm:pt-9",
						armed ? "unfurl" : "opacity-0",
					)}
					style={{ animationDelay: "0.1s" }}
				>
					<div className="flex items-center gap-3">
						<Flower2 className="h-4 w-4 text-pollen" strokeWidth={1.5} />
						<span className="font-mono text-[10px] uppercase tracking-[0.42em] text-pollen/80">
							Hortus Digitalis
						</span>
					</div>
					<div className="text-right font-mono text-[10px] uppercase leading-relaxed tracking-[0.32em] text-sepia">
						<div>Plate No. 05</div>
						<div className="text-pollen/70">Coll. WebGL · MMXXVI</div>
					</div>
				</header>

				{/* Left gutter: vertical plate label */}
				<span
					className={cn(
						"pointer-events-none fixed left-6 top-1/2 hidden -translate-y-1/2 font-mono text-[9px] uppercase tracking-[0.5em] text-sepia/70 [writing-mode:vertical-rl] lg:block",
						armed ? "unfurl" : "opacity-0",
					)}
					style={{ animationDelay: "0.45s" }}
				>
					Specimen · cultivated in silico · pigment mixed on the GPU
				</span>

				{/* Centerpiece: the binomial lockup */}
				<section className="flex flex-1 flex-col items-center justify-center px-6 text-center">
					<p
						className={cn(
							"mb-5 font-mono text-[10px] uppercase tracking-[0.55em] text-pollen/80",
							armed ? "unfurl" : "opacity-0",
						)}
						style={{ animationDelay: "0.35s" }}
					>
						Living digital cultivar
					</p>

					<h1
						className="font-display text-[clamp(2.7rem,12vw,9rem)] font-medium leading-[0.86] text-parchment"
						style={{
							animation: armed
								? "title-bloom 1.2s cubic-bezier(0.16,1,0.3,1) 0.28s both"
								: "none",
							opacity: armed ? undefined : 0,
							textShadow: "0 0 60px rgba(214,31,122,0.28)",
						}}
					>
						Digital
						<br />
						<span
							className="italic text-pollen"
							style={{ fontVariationSettings: '"SOFT" 80, "opsz" 110' }}
						>
							Petals
						</span>
					</h1>

					{/* Binomial caption — the "scientific name" of the cultivar. */}
					<p
						className={cn(
							"mt-5 font-display text-base italic text-sepia sm:text-lg",
							armed ? "unfurl" : "opacity-0",
						)}
						style={{ animationDelay: "0.6s" }}
					>
						Flos pixelatus{" "}
						<span className="not-italic font-mono text-[11px] uppercase tracking-[0.25em] text-pollen/70">
							var. shadertoy
						</span>
					</p>

					<p
						className={cn(
							"mt-6 max-w-md text-sm leading-relaxed text-parchment/75",
							armed ? "unfurl" : "opacity-0",
						)}
						style={{ animationDelay: "0.72s" }}
					>
						An interactive WebGL shader. Glide your cursor across the plate to
						seed a bloom of light; the corolla breathes between three and seven
						petals on its own.
					</p>

					{/* Controls */}
					<div
						className={cn(
							"pointer-events-auto mt-9 flex items-center gap-3",
							armed ? "unfurl" : "opacity-0",
						)}
						style={{ animationDelay: "0.86s" }}
					>
						<button
							onClick={() => setPaused((p) => !p)}
							className="group inline-flex items-center gap-2 rounded-full border border-rule glass px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-parchment transition hover:border-pollen/60 hover:text-pollen focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pollen"
							aria-pressed={paused}
						>
							{paused ? (
								<Play className="h-3.5 w-3.5 text-pollen" strokeWidth={2} />
							) : (
								<Pause className="h-3.5 w-3.5 text-petal" strokeWidth={2} />
							)}
							{paused ? "Resume growth" : "Press specimen"}
						</button>
						<button
							onClick={reset}
							className="inline-flex items-center gap-2 rounded-full border border-rule-soft glass px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-sepia transition hover:border-rule hover:text-parchment focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris"
						>
							<RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
							Replant
						</button>
					</div>
				</section>

				{/* ── Cultivation log: signature petal dial + live readouts ────────── */}
				<footer
					className={cn(
						"grid grid-cols-2 items-stretch gap-px overflow-hidden border-t border-rule-soft bg-rule-soft md:grid-cols-[auto_1fr_1fr_1fr]",
						armed ? "unfurl" : "opacity-0",
					)}
					style={{ animationDelay: "0.55s" }}
				>
					{/* Signature: the live petal dial */}
					<div className="col-span-2 flex items-center gap-4 glass px-5 py-4 md:col-span-1 md:px-7">
						<PetalDial needleRef={dialNeedleRef} petals={petalInt} />
						<div>
							<div className="font-mono text-[9px] uppercase tracking-[0.28em] text-sepia">
								Corolla
							</div>
							<div className="font-display text-2xl leading-none text-parchment">
								{petalInt}
								<span className="ml-1 font-mono text-[10px] uppercase tracking-[0.2em] text-pollen/70">
									petals
								</span>
							</div>
						</div>
					</div>

					<Readout
						icon={
							<Sparkles className="h-3.5 w-3.5 text-petal" strokeWidth={1.8} />
						}
						label="Bloom index"
						value={`${(display.bloom * 100).toFixed(0)}%`}
						sub={
							<div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-parchment/10">
								<div
									ref={bloomFillRef}
									className="h-full origin-left rounded-full bg-gradient-to-r from-petal via-pollen to-iris"
									style={{ transform: "scaleX(0)" }}
								/>
							</div>
						}
						status={blooming ? "Light seeded" : "Dormant"}
					/>
					<Readout
						icon={
							<Clock3 className="h-3.5 w-3.5 text-iris" strokeWidth={1.8} />
						}
						label="Growth clock"
						value={fmtClock(display.time)}
						mono
						status={paused ? "Pressed" : "Growing"}
					/>
					<Readout
						icon={
							<Flower2 className="h-3.5 w-3.5 text-pollen" strokeWidth={1.8} />
						}
						label="Render rate"
						value={`${display.fps.toFixed(0)} fps`}
						mono
						status="GPU corolla"
					/>
				</footer>
			</div>
		</main>
	);
}

/* ── Signature element: the Petal Dial ──────────────────────────────────────
 * A radial gauge whose needle sweeps an arc as the corolla breathes (3→7), and
 * whose ring draws exactly `petals` lobe ticks — the shader's live integer made
 * visible on the plate. */
function PetalDial({
	needleRef,
	petals,
}: {
	needleRef: React.Ref<SVGGElement>;
	petals: number;
}) {
	const ticks = Array.from({ length: 7 });
	return (
		<svg viewBox="0 0 100 100" className="h-14 w-14 shrink-0" aria-hidden>
			{/* gauge arc */}
			<circle
				cx="50"
				cy="50"
				r="42"
				fill="none"
				stroke="rgba(233,200,121,0.18)"
				strokeWidth="1"
			/>
			{/* lobe ticks — the first `petals` are lit (the live count) */}
			{ticks.map((_, i) => {
				const lit = i < petals;
				const angle = -120 + (i / 6) * 240; // spread 7 ticks across the sweep
				const rad = (angle * Math.PI) / 180;
				const x1 = 50 + Math.sin(rad) * 34;
				const y1 = 50 - Math.cos(rad) * 34;
				const x2 = 50 + Math.sin(rad) * 42;
				const y2 = 50 - Math.cos(rad) * 42;
				return (
					<line
						key={i}
						x1={x1}
						y1={y1}
						x2={x2}
						y2={y2}
						stroke={lit ? "#e9c879" : "rgba(169,150,127,0.3)"}
						strokeWidth={lit ? 2 : 1}
						strokeLinecap="round"
					/>
				);
			})}
			{/* needle (rotated imperatively each frame) */}
			<g
				ref={needleRef}
				style={{
					transformOrigin: "50px 50px",
					transition: "transform 90ms linear",
				}}
			>
				<line
					x1="50"
					y1="50"
					x2="50"
					y2="16"
					stroke="#d61f7a"
					strokeWidth="2.4"
					strokeLinecap="round"
				/>
			</g>
			{/* hub */}
			<circle
				cx="50"
				cy="50"
				r="4.5"
				fill="#120a14"
				stroke="#e9c879"
				strokeWidth="1.4"
			/>
			<circle cx="50" cy="50" r="1.6" fill="#d61f7a" />
		</svg>
	);
}

function PlateFrame({ armed }: { armed: boolean }) {
	// A botanical sprig drawn at each corner, plus a thin engraved double rule.
	const Sprig = ({
		className,
		delay,
	}: {
		className: string;
		delay: string;
	}) => (
		<svg
			viewBox="0 0 60 60"
			className={cn(
				"pointer-events-none fixed h-12 w-12 text-pollen/60",
				className,
				armed ? "corner-draw" : "opacity-0",
			)}
			style={{ animationDelay: delay }}
			aria-hidden
		>
			<path
				d="M4 56 C 4 30, 18 18, 44 10"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.1"
				strokeLinecap="round"
			/>
			<path
				d="M18 26 C 24 20, 30 20, 34 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1"
				strokeLinecap="round"
			/>
			<path
				d="M12 40 C 18 34, 24 34, 28 38"
				fill="none"
				stroke="currentColor"
				strokeWidth="1"
				strokeLinecap="round"
			/>
			<circle cx="45" cy="9" r="2.4" fill="currentColor" />
			<circle cx="35" cy="23" r="1.5" fill="currentColor" />
			<circle cx="29" cy="37" r="1.5" fill="currentColor" />
		</svg>
	);
	return (
		<>
			{/* engraved double rule just inside the viewport */}
			<div
				className={cn(
					"pointer-events-none fixed inset-3 border border-rule sm:inset-5",
					armed ? "unfurl" : "opacity-0",
				)}
				style={{ animationDelay: "0.05s" }}
				aria-hidden
			/>
			<div
				className={cn(
					"pointer-events-none fixed inset-[14px] border border-rule-soft sm:inset-[22px]",
					armed ? "unfurl" : "opacity-0",
				)}
				style={{ animationDelay: "0.12s" }}
				aria-hidden
			/>
			{/* corner sprigs, each rotated to face inward */}
			<Sprig className="left-4 top-4 sm:left-6 sm:top-6" delay="0.2s" />
			<Sprig
				className="right-4 top-4 -scale-x-100 sm:right-6 sm:top-6"
				delay="0.28s"
			/>
			<Sprig
				className="bottom-4 left-4 -scale-y-100 sm:bottom-6 sm:left-6"
				delay="0.36s"
			/>
			<Sprig
				className="bottom-4 right-4 -scale-100 sm:bottom-6 sm:right-6"
				delay="0.44s"
			/>
		</>
	);
}

function Readout({
	icon,
	label,
	value,
	sub,
	status,
	mono,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
	sub?: React.ReactNode;
	status?: string;
	mono?: boolean;
}) {
	return (
		<div className="flex flex-col justify-center gap-1 glass px-5 py-4 sm:px-6">
			<div className="flex items-center gap-2.5">
				<span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-rule-soft bg-white/[0.03]">
					{icon}
				</span>
				<span className="font-mono text-[9px] uppercase tracking-[0.26em] text-sepia">
					{label}
				</span>
			</div>
			<div
				className={cn(
					"mt-1 text-xl text-parchment",
					mono ? "font-mono tabular-nums" : "font-display",
				)}
			>
				{value}
			</div>
			{sub}
			{status && (
				<div className="mt-1 flex items-center gap-1.5">
					<span
						className="inline-block h-1.5 w-1.5 rounded-full bg-pollen"
						style={{ animation: "pulse-dot 2.2s ease-in-out infinite" }}
					/>
					<span className="font-mono text-[9px] uppercase tracking-[0.24em] text-pollen/70">
						{status}
					</span>
				</div>
			)}
		</div>
	);
}
