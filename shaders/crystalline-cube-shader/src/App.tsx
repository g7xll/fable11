import { useCallback, useEffect, useMemo, useState } from "react";
import {
	Gem,
	Sparkles,
	Sun,
	MousePointer2,
	Hexagon,
	Crosshair,
	Activity,
	RotateCcw,
} from "lucide-react";
import InteractiveShader from "@/components/ui/crystalline-cube";
import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------------------
   Crystalline Cube — framed as a lapidary analysis bench.

   The verbatim `InteractiveShader` (a ray-marched crystalline SDF with
   mouse-driven lighting) is the *specimen under the loupe*. Everything around
   it makes the four shader props legible as instrument readings: each prop is a
   calibrated fader with a live value, the bench derives gemological-sounding
   metrics from those props, and a catalog of specimens snaps all four at once.
---------------------------------------------------------------------------- */

type Params = {
	complexity: number;
	colorShift: number;
	lightIntensity: number;
	mouseInfluence: number;
};

type ControlKey = keyof Params;

type ControlSpec = {
	key: ControlKey;
	label: string;
	unit: string;
	hint: string;
	min: number;
	max: number;
	step: number;
	decimals: number;
	icon: typeof Gem;
};

const CONTROLS: ControlSpec[] = [
	{
		key: "complexity",
		label: "Lattice complexity",
		unit: "facets",
		hint: "Sine carving frequency of the SDF",
		min: 1.0,
		max: 10.0,
		step: 0.1,
		decimals: 2,
		icon: Hexagon,
	},
	{
		key: "colorShift",
		label: "Dispersion",
		unit: "Δλ",
		hint: "How fast the palette cycles over time",
		min: 0,
		max: 1.0,
		step: 0.01,
		decimals: 2,
		icon: Sparkles,
	},
	{
		key: "lightIntensity",
		label: "Loupe gain",
		unit: "lux",
		hint: "Multiplier on diffuse + specular response",
		min: 0.5,
		max: 3.0,
		step: 0.01,
		decimals: 2,
		icon: Sun,
	},
	{
		key: "mouseInfluence",
		label: "Light parallax",
		unit: "rel",
		hint: "How far the cursor walks the key light",
		min: 0,
		max: 1.0,
		step: 0.01,
		decimals: 2,
		icon: MousePointer2,
	},
];

/** A small lapidary catalog. Each specimen snaps all four shader props at once. */
type Specimen = {
	id: string;
	name: string;
	classification: string;
	params: Params;
	swatch: string;
};

const SPECIMENS: Specimen[] = [
	{
		id: "AX-01",
		name: "Aurora Quartz",
		classification: "Trigonal · self-luminous",
		params: {
			complexity: 4.0,
			colorShift: 0.3,
			lightIntensity: 1.5,
			mouseInfluence: 0.5,
		},
		swatch: "#74efd6",
	},
	{
		id: "VG-02",
		name: "Vermilion Garnet",
		classification: "Cubic · deep dispersion",
		params: {
			complexity: 2.4,
			colorShift: 0.62,
			lightIntensity: 2.1,
			mouseInfluence: 0.85,
		},
		swatch: "#ff8a5c",
	},
	{
		id: "FZ-03",
		name: "Fissure Beryl",
		classification: "Hexagonal · over-cut",
		params: {
			complexity: 8.6,
			colorShift: 0.14,
			lightIntensity: 1.1,
			mouseInfluence: 0.32,
		},
		swatch: "#c4a2ff",
	},
	{
		id: "GL-04",
		name: "Glacier Spinel",
		classification: "Cubic · low gain",
		params: {
			complexity: 5.7,
			colorShift: 0.08,
			lightIntensity: 0.8,
			mouseInfluence: 0.62,
		},
		swatch: "#8fd0ff",
	},
];

const DEFAULTS: Params = SPECIMENS[0].params;

function fmt(n: number, decimals: number) {
	return n.toFixed(decimals);
}

function fmtClock(ms: number) {
	const total = Math.floor(ms / 1000);
	const h = Math.floor(total / 3600);
	const m = Math.floor((total % 3600) / 60);
	const s = total % 60;
	return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

/** Detect WebGL up front so we can show an honest fallback rather than a void. */
function detectWebGL(): boolean {
	try {
		const c = document.createElement("canvas");
		return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
	} catch {
		return false;
	}
}

export default function App() {
	const [params, setParams] = useState<Params>(DEFAULTS);
	const [activeSpecimen, setActiveSpecimen] = useState<string>(SPECIMENS[0].id);
	const [armed, setArmed] = useState(false);
	const [fps, setFps] = useState(60);
	const [elapsed, setElapsed] = useState(0);
	const [webglOk] = useState<boolean>(() => detectWebGL());

	const setParam = useCallback((key: ControlKey, value: number) => {
		setParams((p) => ({ ...p, [key]: value }));
		setActiveSpecimen(""); // a manual tweak deselects the catalog entry
	}, []);

	const loadSpecimen = useCallback((s: Specimen) => {
		setParams(s.params);
		setActiveSpecimen(s.id);
	}, []);

	const reset = useCallback(() => {
		setParams(DEFAULTS);
		setActiveSpecimen(SPECIMENS[0].id);
	}, []);

	// Independent rAF probe for render rate + a mission clock. The shader runs its
	// own loop; this never touches it, it just measures wall-clock frame cadence.
	useEffect(() => {
		let raf = 0;
		let last = performance.now();
		const start = last;
		let acc = 0;
		let frames = 0;
		const tick = (now: number) => {
			const dt = now - last;
			last = now;
			acc += dt;
			frames += 1;
			if (acc >= 500) {
				setFps(Math.round((frames * 1000) / acc));
				acc = 0;
				frames = 0;
				setElapsed(now - start);
			}
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, []);

	// Reveal choreography.
	useEffect(() => {
		const id = window.setTimeout(() => setArmed(true), 120);
		return () => window.clearTimeout(id);
	}, []);

	// Derived "gemological" metrics so the four props feel like real readings.
	const facetCount = Math.round(params.complexity * 6 + 2);
	const refractiveIndex = useMemo(
		() => 1.4 + params.colorShift * 0.9 + params.complexity * 0.018,
		[params.colorShift, params.complexity],
	);
	const carat = useMemo(
		() => (params.lightIntensity * 1.7 + params.complexity * 0.21).toFixed(2),
		[params.lightIntensity, params.complexity],
	);

	const current = SPECIMENS.find((s) => s.id === activeSpecimen);

	return (
		<div className="relative h-screen w-screen overflow-hidden bg-void text-frost">
			{/* ---- The specimen window: the verbatim shader fills the viewport ---- */}
			<div className="absolute inset-0">
				{webglOk ? (
					<InteractiveShader
						complexity={params.complexity}
						colorShift={params.colorShift}
						lightIntensity={params.lightIntensity}
						mouseInfluence={params.mouseInfluence}
					/>
				) : (
					<div className="grid h-full w-full place-items-center bg-void px-6 text-center">
						<div className="max-w-sm">
							<Gem className="mx-auto mb-4 h-7 w-7 text-refraction" />
							<p className="font-mono text-xs uppercase tracking-widest2 text-steel">
								Loupe offline
							</p>
							<p className="mt-3 text-sm text-steel">
								This browser has no WebGL context, so the specimen can't be lit.
								The bench instrumentation around it is still live.
							</p>
						</div>
					</div>
				)}
			</div>

			{/* ---- Atmosphere: vignette, grain, edge fades so chrome stays legible ---- */}
			<div className="pointer-events-none absolute inset-0">
				<div className="grain absolute inset-0 opacity-60" />
				<div
					className="absolute inset-0"
					style={{
						background:
							"radial-gradient(120% 100% at 50% 50%, transparent 38%, rgba(8,11,17,0.55) 100%)",
					}}
				/>
				<div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-void/85 to-transparent" />
				<div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-void/90 to-transparent" />
			</div>

			{/* ---- Reticle corner brackets — the signature framing of the bench ---- */}
			<Reticle />
			<div className="scanline pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-refraction/40 to-transparent" />

			{/* ---- Masthead ---- */}
			<header
				className={cn(
					"pointer-events-none absolute left-0 right-0 top-0 z-20 flex items-start justify-between gap-6 px-6 py-5 sm:px-9 sm:py-7",
					armed ? "rise" : "opacity-0",
				)}
			>
				<div>
					<div className="flex items-center gap-2 text-refraction">
						<Gem className="h-4 w-4" />
						<span className="font-mono text-[10px] uppercase tracking-widest2 text-steel">
							Lapidary Bench
						</span>
					</div>
					<h1 className="mt-2 font-display text-4xl leading-[0.92] text-frost sm:text-5xl">
						Crystalline&nbsp;Cube
					</h1>
					<p className="mt-2 max-w-xs text-[13px] leading-snug text-steel">
						A ray-marched specimen under live lighting. Move the cursor to walk
						the key light across its facets.
					</p>
				</div>

				<div className="hidden text-right sm:block">
					<p className="font-mono text-[10px] uppercase tracking-widest2 text-dim">
						Mount
					</p>
					<p className="mt-1 font-mono text-xs text-steel">
						@/components/ui/crystalline-cube
					</p>
					<p className="mt-3 font-mono text-[10px] uppercase tracking-widest2 text-dim">
						Specimen
					</p>
					<p className="mt-1 font-display text-lg text-refraction">
						{current ? current.name : "Custom cut"}
					</p>
					<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">
						{current
							? `${current.id} · ${current.classification}`
							: "manual calibration"}
					</p>
				</div>
			</header>

			{/* ---- Specimen catalog (left rail, presets) ---- */}
			<nav
				className={cn(
					"absolute left-6 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-2 sm:left-9 lg:flex",
					armed ? "rise" : "opacity-0",
				)}
				aria-label="Specimen catalog"
				style={{ animationDelay: "120ms" }}
			>
				<p className="mb-1 font-mono text-[10px] uppercase tracking-widest2 text-dim">
					Catalog
				</p>
				{SPECIMENS.map((s) => {
					const active = s.id === activeSpecimen;
					return (
						<button
							key={s.id}
							onClick={() => loadSpecimen(s)}
							className={cn(
								"group flex w-56 items-center gap-3 rounded-md border px-3 py-2.5 text-left backdrop-blur-md transition-colors",
								active
									? "border-refraction/40 bg-slate/80"
									: "border-seam/70 bg-slate/45 hover:border-steel/40 hover:bg-slate/65",
							)}
							aria-pressed={active}
						>
							<span
								className="h-7 w-2 shrink-0 rounded-sm"
								style={{
									background: s.swatch,
									boxShadow: active ? `0 0 12px ${s.swatch}` : "none",
								}}
							/>
							<span className="min-w-0">
								<span className="block truncate font-body text-sm text-frost">
									{s.name}
								</span>
								<span className="block truncate font-mono text-[10px] uppercase tracking-[0.16em] text-dim">
									{s.id} · {s.classification}
								</span>
							</span>
						</button>
					);
				})}
			</nav>

			{/* ---- Facet console (right rail, the four shader props) ---- */}
			<section
				className={cn(
					"absolute bottom-24 right-4 z-20 w-[min(92vw,23rem)] sm:bottom-28 sm:right-9",
					armed ? "rise" : "opacity-0",
				)}
				style={{ animationDelay: "180ms" }}
				aria-label="Facet console"
			>
				<div className="rounded-xl border border-seam/80 bg-slate/70 p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl">
					<div className="mb-4 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Crosshair className="h-3.5 w-3.5 text-refraction" />
							<h2 className="font-mono text-[11px] uppercase tracking-widest2 text-steel">
								Facet console
							</h2>
						</div>
						<button
							onClick={reset}
							className="flex items-center gap-1.5 rounded border border-seam/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-steel transition-colors hover:border-refraction/40 hover:text-refraction"
						>
							<RotateCcw className="h-3 w-3" />
							Recut
						</button>
					</div>

					<div className="space-y-4">
						{CONTROLS.map((c) => {
							const value = params[c.key];
							const fill = (value - c.min) / (c.max - c.min);
							const Icon = c.icon;
							return (
								<div key={c.key}>
									<div className="mb-1.5 flex items-baseline justify-between gap-3">
										<label
											htmlFor={`fader-${c.key}`}
											className="flex items-center gap-2 text-[13px] text-frost"
										>
											<Icon className="h-3.5 w-3.5 text-steel" />
											{c.label}
										</label>
										<span className="font-mono text-sm tabular-nums text-refraction">
											{fmt(value, c.decimals)}
											<span className="ml-1 text-[10px] uppercase tracking-[0.12em] text-dim">
												{c.unit}
											</span>
										</span>
									</div>
									<input
										id={`fader-${c.key}`}
										type="range"
										className="fader"
										min={c.min}
										max={c.max}
										step={c.step}
										value={value}
										onChange={(e) =>
											setParam(c.key, parseFloat(e.target.value))
										}
										style={{ ["--fill" as string]: String(fill) }}
										aria-describedby={`hint-${c.key}`}
									/>
									<div
										id={`hint-${c.key}`}
										className="mt-0.5 flex items-center justify-between font-mono text-[10px] text-dim"
									>
										<span className="tracking-[0.1em]">{c.hint}</span>
										<span className="tabular-nums">
											{fmt(c.min, 0)}–{fmt(c.max, 0)}
										</span>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* ---- Telemetry strip (bottom) ---- */}
			<footer
				className={cn(
					"absolute inset-x-0 bottom-0 z-20 px-6 pb-5 sm:px-9 sm:pb-6",
					armed ? "rise" : "opacity-0",
				)}
				style={{ animationDelay: "240ms" }}
			>
				<div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-seam/70 pt-4">
					<Readout icon={Activity} label="Render" value={`${fps}`} unit="fps" />
					<Readout
						icon={Hexagon}
						label="Facets"
						value={`${facetCount}`}
						unit="ct"
					/>
					<Readout
						icon={Sparkles}
						label="Refr. index"
						value={refractiveIndex.toFixed(3)}
						unit="n"
					/>
					<Readout icon={Gem} label="Est. weight" value={carat} unit="ct" />
					<Readout
						icon={Crosshair}
						label="Bench clock"
						value={fmtClock(elapsed)}
						unit=""
						wide
					/>
					<p className="ml-auto hidden font-mono text-[10px] uppercase tracking-[0.16em] text-dim md:block">
						{webglOk ? "WebGL · live" : "WebGL · unavailable"}
					</p>
				</div>
			</footer>
		</div>
	);
}

/* ---------------------------------- bits ---------------------------------- */

function Readout({
	icon: Icon,
	label,
	value,
	unit,
	wide,
}: {
	icon: typeof Gem;
	label: string;
	value: string;
	unit: string;
	wide?: boolean;
}) {
	return (
		<div className={cn("flex items-center gap-2.5", wide && "min-w-[7.5rem]")}>
			<Icon className="h-3.5 w-3.5 text-refraction/80" />
			<div className="leading-none">
				<div className="font-mono text-[9px] uppercase tracking-[0.18em] text-dim">
					{label}
				</div>
				<div className="mt-1 font-mono text-sm tabular-nums text-frost">
					{value}
					{unit ? (
						<span className="ml-1 text-[10px] text-dim">{unit}</span>
					) : null}
				</div>
			</div>
		</div>
	);
}

/** The four corner reticle brackets that frame the specimen window. */
function Reticle() {
	const corners = [
		"left-4 top-4 border-l border-t sm:left-6 sm:top-6",
		"right-4 top-4 border-r border-t sm:right-6 sm:top-6",
		"left-4 bottom-4 border-l border-b sm:left-6 sm:bottom-6",
		"right-4 bottom-4 border-r border-b sm:right-6 sm:bottom-6",
	];
	return (
		<div className="pointer-events-none absolute inset-0 z-10">
			{corners.map((c) => (
				<span
					key={c}
					className={cn("absolute h-6 w-6 border-refraction/45", c)}
				/>
			))}
		</div>
	);
}
