import { useCallback, useEffect, useRef, useState } from "react";
import { Compass, Orbit, Sparkle, Telescope } from "lucide-react";
import CelestialBloomShader, {
	type CelestialBloomFrame,
} from "@/components/ui/celestial-bloom-shader";

const PETALS = 5;

/** Specimen catalog entry — the fictional "observatory" framing for the shader. */
const CATALOG = {
	designation: "CB-0517",
	survey: "Procedural Deep-Field Survey",
	instrument: "GLSL / fragment raymarch",
	declination: "+41° 16′ 09″",
	rightAscension: "17h 45m 40s",
} as const;

function pad(n: number, width: number) {
	return n.toFixed(0).padStart(width, "0");
}

/** Format shader seconds as a stopwatch-style mission clock T+HH:MM:SS. */
function formatClock(seconds: number) {
	const s = Math.max(0, seconds);
	const hh = Math.floor(s / 3600);
	const mm = Math.floor((s % 3600) / 60);
	const ss = Math.floor(s % 60);
	return `T+${pad(hh, 2)}:${pad(mm, 2)}:${pad(ss, 2)}`;
}

function App() {
	// Telemetry is written through a ref each frame (60fps) but flushed to React
	// state on a slower cadence so the HUD updates legibly without re-rendering
	// the whole tree on every shader frame.
	const frameRef = useRef<CelestialBloomFrame>({
		time: 0,
		fps: 0,
		pixelRatio: 1,
	});
	const [telemetry, setTelemetry] = useState<CelestialBloomFrame>({
		time: 0,
		fps: 0,
		pixelRatio: 1,
	});
	const [booted, setBooted] = useState(false);

	const handleFrame = useCallback((frame: CelestialBloomFrame) => {
		frameRef.current = frame;
	}, []);

	useEffect(() => {
		const id = window.setInterval(() => {
			setTelemetry({ ...frameRef.current });
		}, 250);
		// Trigger the entrance reveal on the next tick.
		const boot = window.setTimeout(() => setBooted(true), 60);
		return () => {
			window.clearInterval(id);
			window.clearTimeout(boot);
		};
	}, []);

	return (
		<div className="app-container">
			{/* The procedural shader, fixed at z-index -1, exactly per the brief. */}
			<CelestialBloomShader petals={PETALS} onFrame={handleFrame} />

			{/* Atmospheric grading so HUD chrome stays legible over the bloom. */}
			<div className="plate-vignette" aria-hidden="true" />
			<div className="plate-scanlines" aria-hidden="true" />
			<div className="plate-grid" aria-hidden="true" />

			{/* Reticle / registration corners — the observatory "plate" frame. */}
			<div className="reticle" aria-hidden="true">
				<span className="reticle-corner tl" />
				<span className="reticle-corner tr" />
				<span className="reticle-corner bl" />
				<span className="reticle-corner br" />
				<span className="reticle-cross" />
			</div>

			<div className={`content-overlay${booted ? " is-booted" : ""}`}>
				{/* Top instrument bar */}
				<header className="plate-bar plate-bar--top">
					<div className="plate-mark">
						<Telescope className="plate-mark-icon" aria-hidden="true" />
						<span className="plate-mark-text">VIRELLA OBSERVATORY</span>
					</div>
					<div className="plate-coords" aria-label="Catalog coordinates">
						<span>
							RA <b>{CATALOG.rightAscension}</b>
						</span>
						<span className="plate-coords-sep">/</span>
						<span>
							DEC <b>{CATALOG.declination}</b>
						</span>
					</div>
				</header>

				{/* Hero lockup — the brief's required content, set as an engraved plate. */}
				<main className="plate-hero">
					<p className="hero-eyebrow">
						<Sparkle className="hero-eyebrow-icon" aria-hidden="true" />
						Specimen {CATALOG.designation} · Live render
					</p>
					<h1>Celestial Bloom</h1>
					<p className="hero-subtitle">A Procedural Shader Animation</p>
					<p className="hero-note">
						Five petals of nebula, distorted by six octaves of value noise and
						lit from a single collapsing star core — generated in real time,
						never the same frame twice.
					</p>
					<div className="hero-actions">
						<a
							className="hero-btn hero-btn--primary"
							href="#telemetry"
							aria-label="Inspect the live telemetry readout"
						>
							<Orbit className="hero-btn-icon" aria-hidden="true" />
							Inspect telemetry
						</a>
						<a
							className="hero-btn hero-btn--ghost"
							href="https://threejs.org/docs/#api/en/materials/ShaderMaterial"
							target="_blank"
							rel="noreferrer"
						>
							<Compass className="hero-btn-icon" aria-hidden="true" />
							Shader source
						</a>
					</div>
				</main>

				{/* Live telemetry HUD — the signature element. Reports the shader's
				    own state, framed by the reticle. */}
				<section
					id="telemetry"
					className="plate-bar plate-bar--bottom"
					aria-label="Live shader telemetry"
				>
					<dl className="telemetry">
						<div className="telemetry-cell telemetry-cell--clock">
							<dt>Mission clock</dt>
							<dd>{formatClock(telemetry.time)}</dd>
						</div>
						<div className="telemetry-cell">
							<dt>Render</dt>
							<dd>
								{telemetry.fps ? telemetry.fps.toFixed(0) : "—"}
								<span className="telemetry-unit">fps</span>
							</dd>
						</div>
						<div className="telemetry-cell">
							<dt>Petals</dt>
							<dd>{pad(PETALS, 2)}</dd>
						</div>
						<div className="telemetry-cell">
							<dt>Sample</dt>
							<dd>
								{telemetry.pixelRatio.toFixed(1)}
								<span className="telemetry-unit">×</span>
							</dd>
						</div>
						<div className="telemetry-cell telemetry-cell--meta">
							<dt>Pipeline</dt>
							<dd className="telemetry-pipeline">{CATALOG.instrument}</dd>
						</div>
					</dl>
					<p className="telemetry-survey">
						{CATALOG.survey}
						<span className="telemetry-live">
							<span className="telemetry-live-dot" /> streaming
						</span>
					</p>
				</section>
			</div>
		</div>
	);
}

export default App;
