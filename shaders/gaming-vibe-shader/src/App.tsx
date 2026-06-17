import { useCallback, useEffect, useRef, useState } from "react";
import { Cpu, Gamepad2, Joystick, Radio, Volume2, Zap } from "lucide-react";
import NenoShader, { type NenoFrame } from "@/components/ui/neno-shader";

/* ── Control-deck channel definitions ─────────────────────────────────────
   Each fader promotes one of the shader's baked-in constants to a live knob.
   The labels speak the rig's vernacular (clock, sync, etc.) rather than the
   GLSL variable names. */
type Channel = {
	id: "speed" | "rings" | "warp" | "hue";
	label: string;
	hint: string;
	min: number;
	max: number;
	step: number;
};

const CHANNELS: Channel[] = [
	{ id: "speed", label: "Clock", hint: "Pulse rate", min: 0.01, max: 0.16, step: 0.005 },
	{ id: "rings", label: "Rings", hint: "Loop depth", min: 2, max: 12, step: 1 },
	{ id: "warp", label: "Warp", hint: "UV distortion", min: 0, max: 0.32, step: 0.01 },
	{ id: "hue", label: "Sync", hint: "Blue ⇄ magenta", min: 0, max: 1, step: 0.02 },
];

type DeckState = { speed: number; rings: number; warp: number; hue: number };

/* Three named presets — the "RGB profiles" a rig would ship with. */
const PRESETS: Record<string, DeckState> = {
	Cruise: { speed: 0.05, rings: 7, warp: 0.1, hue: 0.5 },
	Overclock: { speed: 0.13, rings: 11, warp: 0.22, hue: 0.68 },
	Glacier: { speed: 0.025, rings: 5, warp: 0.05, hue: 0.18 },
};

const RIG = {
	model: "NENO RIG // NR-7",
	chipset: "GLSL Fragment Core",
	signal: "WebGL · ShaderMaterial",
} as const;

function pad(n: number, width: number) {
	return Math.max(0, Math.floor(n)).toString().padStart(width, "0");
}

/** Render `time` (seconds) as an arcade session clock — MM:SS:CC (centiseconds). */
function formatClock(seconds: number) {
	const s = Math.max(0, seconds);
	const mm = Math.floor(s / 60);
	const ss = Math.floor(s % 60);
	const cc = Math.floor((s % 1) * 100);
	return `${pad(mm, 2)}:${pad(ss, 2)}:${pad(cc, 2)}`;
}

function App() {
	const [deck, setDeck] = useState<DeckState>(PRESETS.Cruise);
	const [activePreset, setActivePreset] = useState<string | null>("Cruise");
	const [booted, setBooted] = useState(false);

	// Telemetry is written each frame through a ref, then flushed to state on a
	// slower cadence so the HUD updates legibly without re-rendering per frame.
	const frameRef = useRef<NenoFrame>({
		time: 0,
		fps: 0,
		pixelRatio: 1,
		rings: deck.rings,
		warp: { x: 0, y: 0 },
	});
	const [telemetry, setTelemetry] = useState<NenoFrame>(frameRef.current);

	const handleFrame = useCallback((frame: NenoFrame) => {
		frameRef.current = frame;
	}, []);

	useEffect(() => {
		const flush = window.setInterval(() => {
			setTelemetry({ ...frameRef.current });
		}, 200);
		const boot = window.setTimeout(() => setBooted(true), 80);
		return () => {
			window.clearInterval(flush);
			window.clearTimeout(boot);
		};
	}, []);

	const setChannel = useCallback((id: Channel["id"], value: number) => {
		setActivePreset(null);
		setDeck((d) => ({ ...d, [id]: value }));
	}, []);

	const applyPreset = useCallback((name: string) => {
		setDeck(PRESETS[name]);
		setActivePreset(name);
	}, []);

	const warpX = telemetry.warp.x;
	const warpY = telemetry.warp.y;
	const isWarping = Math.abs(warpX) > 0.01 || Math.abs(warpY) > 0.01;

	return (
		<div className="rig">
			{/* The gaming-vibe shader — fixed behind everything. */}
			<div className="rig-shader" aria-hidden="true">
				<NenoShader
					speed={deck.speed}
					rings={deck.rings}
					warp={deck.warp}
					hueBlend={deck.hue}
					parallax={0.35}
					onFrame={handleFrame}
				/>
			</div>

			{/* CRT grading: scanlines, bloom vignette, screen curvature glow. */}
			<div className="rig-vignette" aria-hidden="true" />
			<div className="rig-scanlines" aria-hidden="true" />
			<div className="rig-bezel" aria-hidden="true" />

			{/* Targeting reticle — tracks the pointer-driven warp center. */}
			<div
				className={`rig-reticle${isWarping ? " is-live" : ""}`}
				style={{
					left: `${50 + warpX * 50}%`,
					top: `${50 - warpY * 50}%`,
				}}
				aria-hidden="true"
			>
				<span className="rig-reticle-ring" />
				<span className="rig-reticle-dot" />
			</div>

			<div className={`rig-screen${booted ? " is-booted" : ""}`}>
				{/* ── Marquee bar ─────────────────────────────────────────────── */}
				<header className="rig-marquee">
					<div className="rig-badge">
						<Gamepad2 className="rig-badge-icon" aria-hidden="true" />
						<span className="rig-badge-text">{RIG.model}</span>
					</div>
					<div className="rig-marquee-meta">
						<span className="rig-chip rig-chip--live">
							<Radio className="rig-chip-icon" aria-hidden="true" />
							RGB SYNC
						</span>
						<span className="rig-chip">
							<Cpu className="rig-chip-icon" aria-hidden="true" />
							{RIG.chipset}
						</span>
					</div>
				</header>

				{/* ── Hero lockup ─────────────────────────────────────────────── */}
				<main className="rig-hero">
					<p className="rig-eyebrow">
						<Joystick className="rig-eyebrow-icon" aria-hidden="true" />
						Insert coin · Press start
					</p>
					{/* The brief's required text — "Gaming vibe Shader" — set as the
					    cabinet marquee title. */}
					<h1 className="rig-title">
						<span className="rig-title-line rig-title-line--lead">Gaming vibe</span>
						<span className="rig-title-line rig-title-line--accent">Shader</span>
					</h1>
					<p className="rig-tagline">
						A neon ring field warping in real time — electric blue bleeding into
						magenta, seven octaves of pulse, never the same frame twice. Drag the
						deck or sweep the screen to bend the rig.
					</p>
				</main>

				{/* ── Control deck + telemetry ────────────────────────────────── */}
				<section className="rig-deck" aria-label="Shader control deck">
					{/* Preset profile selector. */}
					<div className="deck-presets" role="group" aria-label="RGB profiles">
						<span className="deck-presets-label">
							<Zap className="deck-presets-icon" aria-hidden="true" />
							Profile
						</span>
						{Object.keys(PRESETS).map((name) => (
							<button
								key={name}
								type="button"
								className={`deck-preset${activePreset === name ? " is-active" : ""}`}
								onClick={() => applyPreset(name)}
								aria-pressed={activePreset === name}
							>
								{name}
							</button>
						))}
					</div>

					<div className="deck-body">
						{/* Faders — each wired straight into a shader uniform. */}
						<div className="deck-faders">
							{CHANNELS.map((ch) => {
								const value = deck[ch.id];
								const pct = ((value - ch.min) / (ch.max - ch.min)) * 100;
								const display =
									ch.id === "rings"
										? value.toFixed(0)
										: ch.id === "hue"
											? value.toFixed(2)
											: value.toFixed(3);
								return (
									<label key={ch.id} className="fader">
										<span className="fader-head">
											<span className="fader-label">{ch.label}</span>
											<span className="fader-value">{display}</span>
										</span>
										<input
											className="fader-input"
											type="range"
											min={ch.min}
											max={ch.max}
											step={ch.step}
											value={value}
											onChange={(e) =>
												setChannel(ch.id, Number(e.target.value))
											}
											style={{ ["--fill" as string]: `${pct}%` }}
											aria-label={`${ch.label} — ${ch.hint}`}
										/>
										<span className="fader-hint">{ch.hint}</span>
									</label>
								);
							})}
						</div>

						{/* Live telemetry — reads the shader's own per-frame state. */}
						<dl className="deck-telemetry" aria-label="Live shader telemetry">
							<div className="tcell tcell--clock">
								<dt>Session</dt>
								<dd>{formatClock(telemetry.time)}</dd>
							</div>
							<div className="tcell">
								<dt>Frame rate</dt>
								<dd>
									{telemetry.fps ? telemetry.fps.toFixed(0) : "—"}
									<span className="tunit">fps</span>
								</dd>
							</div>
							<div className="tcell">
								<dt>Rings</dt>
								<dd>{pad(telemetry.rings, 2)}</dd>
							</div>
							<div className="tcell">
								<dt>Sample</dt>
								<dd>
									{telemetry.pixelRatio.toFixed(1)}
									<span className="tunit">×</span>
								</dd>
							</div>
							<div className="tcell tcell--warp">
								<dt>Warp lock</dt>
								<dd>
									{isWarping ? (
										<>
											{warpX >= 0 ? "+" : ""}
											{warpX.toFixed(2)}, {warpY >= 0 ? "+" : ""}
											{warpY.toFixed(2)}
										</>
									) : (
										"CENTER"
									)}
								</dd>
							</div>
						</dl>
					</div>

					<footer className="deck-footer">
						<span className="deck-signal">
							<Volume2 className="deck-signal-icon" aria-hidden="true" />
							{RIG.signal}
						</span>
						<span className="deck-live">
							<span className="deck-live-dot" />
							Streaming live
						</span>
					</footer>
				</section>
			</div>
		</div>
	);
}

export default App;
