import { useCallback, useEffect, useRef, useState } from "react";
import {
	Compass,
	Crosshair,
	Gauge,
	Orbit,
	Radar,
	Sparkles,
	Sun,
	Telescope,
	ZoomIn,
} from "lucide-react";
import CelestialSphere, {
	type CelestialFrame,
} from "@/components/ui/celestial-sphere";

/** The brief's demo defaults — used verbatim as the console's initial state. */
const DEFAULTS = {
	hue: 210.0,
	speed: 0.4,
	zoom: 1.2,
	particleSize: 4.0,
} as const;

/** Fictional "navigator" framing for the shader — a deep-field charting station. */
const STATION = {
	designation: "VANTA-IX",
	mission: "Deep-Field Navigator",
	frame: "Galactic Equatorial · J2000",
} as const;

function pad(n: number, width: number) {
	return Math.trunc(n).toString().padStart(width, "0");
}

/** Format shader time as a HUD feed clock T+MM:SS.d. The shader's own clock
 *  advances slowly (≈0.005 × speed per frame), so we surface a decisecond so
 *  the readout visibly ticks rather than appearing frozen for seconds at a time. */
function formatClock(seconds: number) {
	const s = Math.max(0, seconds);
	const deci = Math.floor((s * 10) % 10);
	return `T+${pad(s / 60, 2)}:${pad(s % 60, 2)}.${deci}`;
}

/** Signed, fixed-width clip-space offset for the warp readouts (e.g. +0.184). */
function signed(n: number) {
	return `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(3)}`;
}

/** A control fader wired straight to one of the shader's live uniforms. */
function Fader({
	id,
	label,
	icon,
	value,
	min,
	max,
	step,
	display,
	onChange,
}: {
	id: string;
	label: string;
	icon: React.ReactNode;
	value: number;
	min: number;
	max: number;
	step: number;
	display: string;
	onChange: (v: number) => void;
}) {
	const pct = ((value - min) / (max - min)) * 100;
	return (
		<div className="fader">
			<label className="fader-head" htmlFor={id}>
				<span className="fader-label">
					<span className="fader-icon" aria-hidden="true">
						{icon}
					</span>
					{label}
				</span>
				<span className="fader-value">{display}</span>
			</label>
			<input
				id={id}
				className="fader-input"
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				style={{ ["--pct" as string]: `${pct}%` }}
				onChange={(e) => onChange(parseFloat(e.target.value))}
			/>
		</div>
	);
}

function App() {
	// --- Live shader controls (the brief's props, promoted to instrument faders).
	const [hue, setHue] = useState<number>(DEFAULTS.hue);
	const [speed, setSpeed] = useState<number>(DEFAULTS.speed);
	const [zoom, setZoom] = useState<number>(DEFAULTS.zoom);
	const [particleSize, setParticleSize] = useState<number>(
		DEFAULTS.particleSize,
	);

	// --- Telemetry: written every frame through a ref, flushed to state on a
	// slower cadence so the HUD updates legibly without re-rendering each frame.
	const frameRef = useRef<CelestialFrame>({
		time: 0,
		fps: 0,
		warpX: 0,
		warpY: 0,
		pixelRatio: 1,
		hue: DEFAULTS.hue,
		zoom: DEFAULTS.zoom,
		particleSize: DEFAULTS.particleSize,
	});
	const [hud, setHud] = useState<CelestialFrame>(frameRef.current);
	const [booted, setBooted] = useState(false);

	// --- Cursor-tracking warp reticle (the signature element). The shader warps
	// the whole field toward the pointer; the reticle visualises exactly that.
	const reticleRef = useRef<HTMLDivElement>(null);
	const vectorRef = useRef<SVGLineElement>(null);

	const handleFrame = useCallback((frame: CelestialFrame) => {
		frameRef.current = frame;
	}, []);

	useEffect(() => {
		const id = window.setInterval(() => setHud({ ...frameRef.current }), 200);
		const boot = window.setTimeout(() => setBooted(true), 60);
		return () => {
			window.clearInterval(id);
			window.clearTimeout(boot);
		};
	}, []);

	// Track the pointer with the reticle + warp vector. This is a separate DOM
	// write from React state so it stays buttery (no re-render per mousemove).
	useEffect(() => {
		const move = (e: MouseEvent) => {
			const x = e.clientX;
			const y = e.clientY;
			if (reticleRef.current) {
				reticleRef.current.style.transform = `translate(${x}px, ${y}px)`;
				reticleRef.current.style.opacity = "1";
			}
			if (vectorRef.current) {
				vectorRef.current.setAttribute("x2", String(x));
				vectorRef.current.setAttribute("y2", String(y));
				vectorRef.current.style.opacity = "0.7";
			}
		};
		window.addEventListener("mousemove", move);
		return () => window.removeEventListener("mousemove", move);
	}, []);

	const resetControls = () => {
		setHue(DEFAULTS.hue);
		setSpeed(DEFAULTS.speed);
		setZoom(DEFAULTS.zoom);
		setParticleSize(DEFAULTS.particleSize);
	};

	return (
		<div className="app-container">
			{/* The brief's shader, fixed full-viewport behind the console chrome.
			    Props are wired to the live faders; onFrame feeds the HUD. */}
			<div className="sphere-layer" aria-hidden="true">
				<CelestialSphere
					hue={hue}
					speed={speed}
					zoom={zoom}
					particleSize={particleSize}
					onFrame={handleFrame}
					className="absolute top-0 left-0 w-full h-full"
				/>
			</div>

			{/* Grading layers keep the console legible over the bright nebula. */}
			<div className="grade-vignette" aria-hidden="true" />
			<div className="grade-scanlines" aria-hidden="true" />

			{/* Warp vector: a faint line from the field center to the cursor — the
			    actual direction the shader pushes the cosmos. Signature element. */}
			<svg className="warp-vector" aria-hidden="true">
				<line ref={vectorRef} className="warp-vector-line" x1="50%" y1="50%" />
			</svg>

			{/* Cursor-tracking gimbal reticle (signature element). */}
			<div ref={reticleRef} className="cursor-reticle" aria-hidden="true">
				<span className="cursor-ring" />
				<span className="cursor-ring cursor-ring--outer" />
				<span className="cursor-tick cursor-tick--n" />
				<span className="cursor-tick cursor-tick--s" />
				<span className="cursor-tick cursor-tick--e" />
				<span className="cursor-tick cursor-tick--w" />
				<span className="cursor-dot" />
			</div>

			<div className={`console${booted ? " is-booted" : ""}`}>
				{/* Top status rail */}
				<header className="rail rail--top">
					<div className="rail-mark">
						<Telescope className="rail-mark-icon" aria-hidden="true" />
						<span className="rail-mark-id">{STATION.designation}</span>
						<span className="rail-mark-sub">{STATION.mission}</span>
					</div>
					<div className="rail-frame">
						<Radar className="rail-frame-icon" aria-hidden="true" />
						<span>{STATION.frame}</span>
					</div>
				</header>

				{/* Hero lockup — the brief's required content, set as a charting card. */}
				<main className="hero">
					<p className="hero-eyebrow">
						<Sparkles className="hero-eyebrow-icon" aria-hidden="true" />
						Live WebGL · GLSL fragment field
					</p>
					<h1 className="hero-title">Celestial Sphere</h1>
					<p className="hero-lede">
						An interactive WebGL shader component for React.
					</p>
					<p className="hero-note">
						Six octaves of fractal noise fold into a drifting nebula over a
						sparse star field. Move your cursor — the whole sphere warps toward
						it. Steer the faders below to re-tune the field in real time.
					</p>
					<div className="hero-actions">
						<a className="hero-btn hero-btn--primary" href="#deck">
							<Orbit className="hero-btn-icon" aria-hidden="true" />
							Open navigator deck
						</a>
						<a
							className="hero-btn hero-btn--ghost"
							href="https://threejs.org/docs/#api/en/materials/ShaderMaterial"
							target="_blank"
							rel="noreferrer"
						>
							<Compass className="hero-btn-icon" aria-hidden="true" />
							ShaderMaterial docs
						</a>
					</div>
				</main>

				{/* Navigator deck — telemetry + the live control faders. */}
				<section id="deck" className="deck" aria-label="Navigator deck">
					{/* Live telemetry, read straight off the shader's onFrame state. */}
					<dl className="telemetry" aria-label="Live shader telemetry">
						<div className="telemetry-cell telemetry-cell--clock">
							<dt>Feed time</dt>
							<dd>{formatClock(hud.time)}</dd>
						</div>
						<div className="telemetry-cell">
							<dt>Render</dt>
							<dd>
								{hud.fps ? hud.fps.toFixed(0) : "—"}
								<span className="telemetry-unit">fps</span>
							</dd>
						</div>
						<div className="telemetry-cell telemetry-cell--warp">
							<dt>Warp · x / y</dt>
							<dd>
								{signed(hud.warpX)}
								<span className="telemetry-sep">/</span>
								{signed(hud.warpY)}
							</dd>
						</div>
						<div className="telemetry-cell">
							<dt>Hue</dt>
							<dd>
								{hud.hue.toFixed(0)}
								<span className="telemetry-unit">°</span>
							</dd>
						</div>
						<div className="telemetry-cell">
							<dt>Sample</dt>
							<dd>
								{hud.pixelRatio.toFixed(1)}
								<span className="telemetry-unit">×</span>
							</dd>
						</div>
					</dl>

					{/* Control faders — the brief's props promoted to live uniforms. */}
					<div className="controls">
						<div className="controls-head">
							<span className="controls-title">
								<Crosshair className="controls-title-icon" aria-hidden="true" />
								Field controls
							</span>
							<button
								type="button"
								className="controls-reset"
								onClick={resetControls}
							>
								Reset to brief
							</button>
						</div>
						<div className="controls-grid">
							<Fader
								id="hue"
								label="Hue"
								icon={<Sun />}
								value={hue}
								min={0}
								max={360}
								step={1}
								display={`${hue.toFixed(0)}°`}
								onChange={setHue}
							/>
							<Fader
								id="speed"
								label="Drift speed"
								icon={<Gauge />}
								value={speed}
								min={0}
								max={1.5}
								step={0.01}
								display={`${speed.toFixed(2)}×`}
								onChange={setSpeed}
							/>
							<Fader
								id="zoom"
								label="Zoom"
								icon={<ZoomIn />}
								value={zoom}
								min={0.5}
								max={3}
								step={0.01}
								display={`${zoom.toFixed(2)}×`}
								onChange={setZoom}
							/>
							<Fader
								id="particle"
								label="Star size"
								icon={<Sparkles />}
								value={particleSize}
								min={0}
								max={8}
								step={0.1}
								display={particleSize.toFixed(1)}
								onChange={setParticleSize}
							/>
						</div>
						<p className="controls-foot">
							<span className="controls-live">
								<span className="controls-live-dot" /> streaming
							</span>
							<span>Drag a fader to drive the GPU uniform live.</span>
						</p>
					</div>
				</section>
			</div>
		</div>
	);
}

export default App;
