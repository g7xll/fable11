import {
	Aperture,
	Gauge,
	Layers,
	Moon,
	Palette,
	Repeat,
	ZoomIn,
} from "lucide-react";
import {
	type ChangeEvent,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	ShaderCanvas,
	type ShaderParams,
} from "@/components/ui/sdf-dreamscape";

/* ──────────────────────────────────────────────────────────────────────────
 * SDF Dreamscape — "Oneirograph" dream-recorder console.
 *
 * The brief's WebGL fractal SDF shader is treated as a captured dream: a live
 * specimen behind glass. The four prompt controls (Hue / Speed / Iterations /
 * Zoom) are reframed as the recorder's tuning dials — Spectrum, Drift,
 * Recursion, Lens — while the mouse warps the dream in real time exactly as the
 * GLSL `u_mouse` interaction prescribes. A live telemetry strip reads the
 * shader's own per-frame state (render rate, recursion depth, lens depth, and
 * the running dream clock). "Dream states" snap all four parameters at once.
 * ────────────────────────────────────────────────────────────────────────── */

type DialKey = keyof ShaderParams;

interface DialSpec {
	key: DialKey;
	/** Control label shown on the deck. */
	label: string;
	/** What the parameter actually does, in the dream's vernacular. */
	caption: string;
	/** The brief's underlying uniform, surfaced for the integration story. */
	uniform: string;
	min: number;
	max: number;
	step: number;
	icon: typeof Palette;
	/** Formats the current value for display. */
	format: (v: number) => string;
}

const DIALS: DialSpec[] = [
	{
		key: "hue",
		label: "Spectrum",
		caption: "Palette phase of the dream",
		uniform: "u_hue",
		min: 0,
		max: 360,
		step: 1,
		icon: Palette,
		format: (v) => `${Math.round(v)}°`,
	},
	{
		key: "speed",
		label: "Drift",
		caption: "How fast the dream turns",
		uniform: "u_speed",
		min: 0,
		max: 2,
		step: 0.01,
		icon: Gauge,
		format: (v) => `${v.toFixed(2)}×`,
	},
	{
		key: "intensity",
		label: "Recursion",
		caption: "Fractal fold iterations",
		uniform: "u_intensity",
		min: 1,
		max: 8,
		step: 1,
		icon: Repeat,
		format: (v) => `${Math.round(v)} folds`,
	},
	{
		key: "complexity",
		label: "Lens",
		caption: "Zoom into the structure",
		uniform: "u_complexity",
		min: 0.5,
		max: 10,
		step: 0.1,
		icon: ZoomIn,
		format: (v) => `${v.toFixed(1)}×`,
	},
];

interface DreamState {
	id: string;
	name: string;
	params: ShaderParams;
}

// Presets snap all four shader uniforms at once — the signature interaction.
const DREAM_STATES: DreamState[] = [
	{
		id: "lucid",
		name: "Lucid",
		params: { hue: 180, speed: 0.4, intensity: 5, complexity: 2.5 },
	},
	{
		id: "abyssal",
		name: "Abyssal",
		params: { hue: 268, speed: 0.18, intensity: 8, complexity: 1.4 },
	},
	{
		id: "solar",
		name: "Solar",
		params: { hue: 44, speed: 0.9, intensity: 4, complexity: 4.2 },
	},
	{
		id: "rem",
		name: "REM",
		params: { hue: 312, speed: 1.6, intensity: 7, complexity: 6.5 },
	},
];

const DEFAULT_PARAMS: ShaderParams = DREAM_STATES[0].params;

function formatClock(totalSeconds: number): string {
	const s = Math.floor(totalSeconds % 60);
	const m = Math.floor((totalSeconds / 60) % 60);
	const h = Math.floor(totalSeconds / 3600);
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function App() {
	const [params, setParams] = useState<ShaderParams>(DEFAULT_PARAMS);
	const [activeState, setActiveState] = useState<string | null>(
		DREAM_STATES[0].id,
	);
	const [fps, setFps] = useState(0);
	const [elapsed, setElapsed] = useState(0);
	const [booted, setBooted] = useState(false);
	const startRef = useRef<number>(performance.now());

	// Orchestrated entrance reveal.
	useEffect(() => {
		const t = window.setTimeout(() => setBooted(true), 60);
		return () => window.clearTimeout(t);
	}, []);

	// Running dream clock, ticked once per second.
	useEffect(() => {
		const id = window.setInterval(() => {
			setElapsed((performance.now() - startRef.current) / 1000);
		}, 1000);
		return () => window.clearInterval(id);
	}, []);

	const setParam = useCallback((key: DialKey, value: number) => {
		setParams((p) => ({ ...p, [key]: value }));
		setActiveState(null); // any manual tweak breaks the active preset
	}, []);

	const handleDial = useCallback(
		(key: DialKey) => (e: ChangeEvent<HTMLInputElement>) =>
			setParam(key, parseFloat(e.target.value)),
		[setParam],
	);

	const applyState = useCallback((s: DreamState) => {
		setParams(s.params);
		setActiveState(s.id);
	}, []);

	const onFps = useCallback((v: number) => setFps(v), []);

	const clock = useMemo(() => formatClock(elapsed), [elapsed]);

	return (
		<div className="recorder">
			{/* Live dream specimen — the brief's shader fills the viewport. */}
			<div className="dream-stage" aria-hidden="true">
				<ShaderCanvas
					hue={params.hue}
					speed={params.speed}
					intensity={params.intensity}
					complexity={params.complexity}
					onFps={onFps}
					className="dream-canvas"
				/>
				<div className="dream-grain" />
				<div className="dream-vignette" />
			</div>

			{/* Registration frame + center reticle over the specimen. */}
			<div className="frame" aria-hidden="true">
				<span className="frame-corner tl" />
				<span className="frame-corner tr" />
				<span className="frame-corner bl" />
				<span className="frame-corner br" />
				<span className="frame-reticle" />
			</div>

			<main className={`console${booted ? " is-booted" : ""}`}>
				{/* ── Top bar ──────────────────────────────────────────────── */}
				<header className="bar bar--top">
					<div className="brand">
						<Moon className="brand-mark" strokeWidth={1.5} />
						<span className="brand-name">ONEIROGRAPH</span>
						<span className="brand-sub">Dream Recorder · Mk II</span>
					</div>
					<div className="bar-status">
						<span className="rec-dot" />
						<span>REC · SDF&nbsp;SPECIMEN</span>
					</div>
				</header>

				{/* ── Hero lockup ──────────────────────────────────────────── */}
				<section className="hero">
					<p className="hero-eyebrow">
						<Aperture className="hero-eyebrow-icon" strokeWidth={1.6} />
						Live WebGL signed-distance field
					</p>
					<h1 className="hero-title">
						SDF
						<br />
						Dreamscape
					</h1>
					<p className="hero-note">
						A recursive Julia-fold rendered on a single fragment shader. Move
						your cursor to bend the dream — the rest is yours to tune.
					</p>
				</section>

				{/* ── Tuning deck ──────────────────────────────────────────── */}
				<section className="deck">
					<div className="deck-head">
						<span className="deck-title">
							<Layers className="deck-title-icon" strokeWidth={1.6} />
							Tuning Deck
						</span>
						<div
							className="deck-presets"
							role="group"
							aria-label="Dream states"
						>
							{DREAM_STATES.map((s) => (
								<button
									key={s.id}
									type="button"
									className={`preset${activeState === s.id ? " is-active" : ""}`}
									aria-pressed={activeState === s.id}
									onClick={() => applyState(s)}
								>
									{s.name}
								</button>
							))}
						</div>
					</div>

					<div className="dials">
						{DIALS.map((d) => {
							const Icon = d.icon;
							const value = params[d.key];
							const pct = ((value - d.min) / (d.max - d.min)) * 100;
							return (
								<div className="dial" key={d.key}>
									<div className="dial-head">
										<Icon className="dial-icon" strokeWidth={1.6} />
										<div className="dial-meta">
											<label className="dial-label" htmlFor={`dial-${d.key}`}>
												{d.label}
											</label>
											<span className="dial-caption">{d.caption}</span>
										</div>
										<span className="dial-value">{d.format(value)}</span>
									</div>
									<input
										id={`dial-${d.key}`}
										className="dial-range"
										type="range"
										min={d.min}
										max={d.max}
										step={d.step}
										value={value}
										aria-label={`${d.label} (${d.uniform})`}
										style={{ ["--fill" as string]: `${pct}%` }}
										onChange={handleDial(d.key)}
									/>
									<span className="dial-uniform">{d.uniform}</span>
								</div>
							);
						})}
					</div>
				</section>

				{/* ── Telemetry strip (signature element) ──────────────────── */}
				<footer className="bar bar--bottom">
					<dl className="telemetry">
						<div className="tcell tcell--clock">
							<dt>Dream Time</dt>
							<dd>{clock}</dd>
						</div>
						<div className="tcell">
							<dt>Render</dt>
							<dd>
								{fps || "—"}
								<span className="tunit">fps</span>
							</dd>
						</div>
						<div className="tcell">
							<dt>Recursion</dt>
							<dd>
								{Math.round(params.intensity)}
								<span className="tunit">folds</span>
							</dd>
						</div>
						<div className="tcell">
							<dt>Lens</dt>
							<dd>
								{params.complexity.toFixed(1)}
								<span className="tunit">×</span>
							</dd>
						</div>
						<div className="tcell tcell--meta">
							<dt>Pipeline</dt>
							<dd className="tpipe">WebGL · GLSL · 6-tri quad</dd>
						</div>
					</dl>
				</footer>
			</main>
		</div>
	);
}
