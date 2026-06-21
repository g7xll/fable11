import {
	Activity,
	Circle,
	Palette,
	Power,
	Radio,
	RotateCcw,
	Waves,
} from "lucide-react";
import {
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import ShaderCanvas, {
	type ShaderCanvasProps,
} from "@/components/ui/digital-glitch";

/* ──────────────────────────────────────────────────────────────────────────
 * STATIC // BUREAU
 * A decommissioned broadcast signal-calibration bench. The prompt's CRT
 * digital-glitch shader is the "monitor feed"; everything around it is the
 * faceplate of the rack-mounted instrument used to tune that feed.
 * ────────────────────────────────────────────────────────────────────────── */

// The component's live props are the bench's control state. Defaults match the
// brief's DEFAULT_PROPS exactly.
const DEFAULT_PROPS: ShaderCanvasProps = {
	baseColor: "#ffffff",
	speed: 0.3,
	glitchIntensity: 0.5,
	rgbShift: 0.01,
	scanlineDensity: 800.0,
	scanlineOpacity: 0.2,
};

// Presets carried over verbatim from the brief, re-labelled as transmission
// channels you can patch the bench into.
interface Channel {
	id: string;
	name: string;
	note: string;
	settings: ShaderCanvasProps;
}

const CHANNELS: Channel[] = [
	{
		id: "CH-00",
		name: "Bench Default",
		note: "Reference feed",
		settings: DEFAULT_PROPS,
	},
	{
		id: "CH-12",
		name: "Subtle Interference",
		note: "Clean phosphor",
		settings: {
			baseColor: "#a7f3d0",
			speed: 0.2,
			glitchIntensity: 0.2,
			rgbShift: 0.002,
			scanlineDensity: 1000.0,
			scanlineOpacity: 0.1,
		},
	},
	{
		id: "CH-31",
		name: "Damaged VCR",
		note: "Tape dropout",
		settings: {
			baseColor: "#fde047",
			speed: 0.1,
			glitchIntensity: 1.0,
			rgbShift: 0.02,
			scanlineDensity: 400.0,
			scanlineOpacity: 0.35,
		},
	},
	{
		id: "CH-77",
		name: "Cyberpunk",
		note: "Magenta carrier",
		settings: {
			baseColor: "#ec4899",
			speed: 0.5,
			glitchIntensity: 0.6,
			rgbShift: 0.015,
			scanlineDensity: 600.0,
			scanlineOpacity: 0.15,
		},
	},
];

// Each fader maps one shader uniform to an engineering-bench control with its
// own label, unit, range, and the broadcast term it stands in for.
interface Fader {
	key: keyof Omit<ShaderCanvasProps, "baseColor">;
	label: string;
	term: string;
	min: number;
	max: number;
	step: number;
	decimals: number;
	unit: string;
	icon: ReactNode;
}

const FADERS: Fader[] = [
	{
		key: "speed",
		label: "Sweep Rate",
		term: "deflection clock",
		min: 0,
		max: 1,
		step: 0.01,
		decimals: 2,
		unit: "×",
		icon: <Activity size={13} strokeWidth={2.2} />,
	},
	{
		key: "glitchIntensity",
		label: "Sync Tear",
		term: "horizontal hold",
		min: 0,
		max: 1,
		step: 0.01,
		decimals: 2,
		unit: "",
		icon: <Waves size={13} strokeWidth={2.2} />,
	},
	{
		key: "rgbShift",
		label: "Convergence",
		term: "RGB registration",
		min: 0,
		max: 0.05,
		step: 0.001,
		decimals: 3,
		unit: "δ",
		icon: <Circle size={13} strokeWidth={2.2} />,
	},
	{
		key: "scanlineDensity",
		label: "Raster Lines",
		term: "vertical resolution",
		min: 100,
		max: 2000,
		step: 10,
		decimals: 0,
		unit: "ln",
		icon: <Radio size={13} strokeWidth={2.2} />,
	},
	{
		key: "scanlineOpacity",
		label: "Beam Bias",
		term: "scanline gain",
		min: 0,
		max: 1,
		step: 0.01,
		decimals: 2,
		unit: "",
		icon: <Power size={13} strokeWidth={2.2} />,
	},
];

// Two-digit zero-padded helper for the timecode readout.
const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");

export default function App() {
	const [props, setProps] = useState<ShaderCanvasProps>(DEFAULT_PROPS);
	const [activeChannel, setActiveChannel] = useState<string>("CH-00");
	const [booted, setBooted] = useState(false);

	// Live broadcast telemetry driven straight off the shader's own animation
	// loop: a measured FPS and an SMPTE-style 30fps-drop timecode.
	const [fps, setFps] = useState(0);
	const [frame, setFrame] = useState(0);
	const startRef = useRef<number>(performance.now());
	const lastRef = useRef<number>(performance.now());
	const frameCountRef = useRef<number>(0);

	useEffect(() => {
		const t = window.setTimeout(() => setBooted(true), 80);
		return () => window.clearTimeout(t);
	}, []);

	useEffect(() => {
		let raf = 0;
		const tick = (now: number) => {
			frameCountRef.current += 1;
			const dt = now - lastRef.current;
			if (dt >= 500) {
				setFps(Math.round((frameCountRef.current * 1000) / dt));
				frameCountRef.current = 0;
				lastRef.current = now;
			}
			// SMPTE timecode @ 30fps from boot.
			setFrame(Math.floor(((now - startRef.current) / 1000) * 30));
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, []);

	const timecode = useMemo(() => {
		const totalFrames = frame;
		const f = totalFrames % 30;
		const totalSeconds = Math.floor(totalFrames / 30);
		const s = totalSeconds % 60;
		const m = Math.floor(totalSeconds / 60) % 60;
		const h = Math.floor(totalSeconds / 3600);
		return `${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`;
	}, [frame]);

	// Signal strength derived from the live shader state — more tear / shift /
	// scanline bias = a weaker, dirtier signal. Reads 0–100%.
	const signal = useMemo(() => {
		const degradation =
			props.glitchIntensity * 0.45 +
			(props.rgbShift / 0.05) * 0.3 +
			props.scanlineOpacity * 0.25;
		return Math.max(2, Math.round((1 - degradation) * 100));
	}, [props.glitchIntensity, props.rgbShift, props.scanlineOpacity]);

	const patchChannel = useCallback((channel: Channel) => {
		setProps(channel.settings);
		setActiveChannel(channel.id);
	}, []);

	const setUniform = useCallback(
		(key: keyof ShaderCanvasProps, value: string | number) => {
			setProps((prev) => ({ ...prev, [key]: value }));
			setActiveChannel("MANUAL");
		},
		[],
	);

	const reset = useCallback(() => {
		setProps(DEFAULT_PROPS);
		setActiveChannel("CH-00");
	}, []);

	const channelLabel =
		activeChannel === "MANUAL"
			? "MANUAL TRIM"
			: `${activeChannel} · ${
					CHANNELS.find((c) => c.id === activeChannel)?.name ?? ""
				}`;

	return (
		<div className="bench">
			{/* ── Monitor feed: the prompt's full-viewport CRT shader ─────────── */}
			<div className="feed">
				<ShaderCanvas {...props} />
			</div>

			{/* CRT grading: curvature vignette + faint phosphor bloom over the feed */}
			<div className="crt-vignette" aria-hidden="true" />
			<div className="crt-bloom" aria-hidden="true" />

			{/* ── Faceplate frame around the whole bench ─────────────────────── */}
			<div className="faceplate" aria-hidden="true">
				<span className="screw tl" />
				<span className="screw tr" />
				<span className="screw bl" />
				<span className="screw br" />
			</div>

			<main className={`console ${booted ? "is-booted" : ""}`}>
				{/* ── Top status rail ─────────────────────────────────────────── */}
				<header className="rail rail--top">
					<div className="brand">
						<Radio className="brand-glyph" size={18} strokeWidth={2.4} />
						<div className="brand-lockup">
							<span className="brand-name">STATIC&nbsp;BUREAU</span>
							<span className="brand-sub">Signal Calibration Bench</span>
						</div>
					</div>

					<div className="status-strip">
						<span className="rec">
							<span className="rec-dot" />
							REC
						</span>
						<span className="tc-label">SMPTE</span>
						<span className="tc">{timecode}</span>
						<span className="std">NTSC&nbsp;525i</span>
					</div>
				</header>

				{/* ── Body: brand spine (left) + control rack (right) ─────────── */}
				<div className="body">
					<section className="spine">
						<p className="spine-eyebrow">UNIT&nbsp;07 / RACK&nbsp;B</p>
						<h1 className="headline">
							TUNE
							<br />
							THE
							<br />
							<span className="headline-glow">DECAY</span>
						</h1>
						<p className="lede">
							A live CRT transmission, degrading in real time. Drive the trim
							controls to push the raster past its tolerances — or patch a
							preset channel and read the signal loss off the meter.
						</p>
						<dl className="spec">
							<div className="spec-row">
								<dt>Source</dt>
								<dd>digital-glitch.tsx</dd>
							</div>
							<div className="spec-row">
								<dt>Pipeline</dt>
								<dd>GLSL · three.js · WebGL</dd>
							</div>
							<div className="spec-row">
								<dt>Channel</dt>
								<dd className="spec-active">{channelLabel}</dd>
							</div>
						</dl>
					</section>

					<section className="rack" aria-label="Signal calibration controls">
						<div className="rack-head">
							<span className="rack-title">TRIM&nbsp;CONTROLS</span>
							<span className="rack-id">PNL-Δ</span>
						</div>

						{/* Carrier tint — the shader's u_base_color */}
						<div className="control control--swatch">
							<label className="control-top" htmlFor="carrier">
								<span className="control-icon">
									<Palette size={13} strokeWidth={2.2} />
								</span>
								<span className="control-label">Carrier Tint</span>
								<span className="control-term">phosphor colour</span>
							</label>
							<div className="swatch-row">
								<input
									id="carrier"
									type="color"
									value={props.baseColor}
									onChange={(e) => setUniform("baseColor", e.target.value)}
									className="swatch-input"
									aria-label="Carrier tint colour"
								/>
								<span className="swatch-hex">
									{props.baseColor.toUpperCase()}
								</span>
							</div>
						</div>

						{/* The five numeric uniforms as engineering trim faders */}
						<div className="faders">
							{FADERS.map((fader) => {
								const value = props[fader.key];
								const ratio = (value - fader.min) / (fader.max - fader.min);
								return (
									<div className="control control--fader" key={fader.key}>
										<label className="control-top" htmlFor={fader.key}>
											<span className="control-icon">{fader.icon}</span>
											<span className="control-label">{fader.label}</span>
											<span className="control-term">{fader.term}</span>
											<span className="control-readout">
												{value.toFixed(fader.decimals)}
												<i>{fader.unit}</i>
											</span>
										</label>
										<div
											className="fader-track"
											style={
												{
													"--ratio": ratio,
												} as React.CSSProperties
											}
										>
											<input
												id={fader.key}
												type="range"
												min={fader.min}
												max={fader.max}
												step={fader.step}
												value={value}
												onChange={(e) =>
													setUniform(fader.key, parseFloat(e.target.value))
												}
												className="fader-input"
											/>
											<div className="fader-ticks" aria-hidden="true">
												{Array.from({ length: 9 }).map((_, i) => (
													<span key={i} />
												))}
											</div>
										</div>
									</div>
								);
							})}
						</div>

						{/* Channel selector — the brief's presets, as patch buttons */}
						<div className="channels">
							<span className="channels-label">PATCH&nbsp;CHANNEL</span>
							<div className="channels-grid">
								{CHANNELS.map((channel) => (
									<button
										key={channel.id}
										type="button"
										className={`channel-btn ${
											activeChannel === channel.id ? "is-active" : ""
										}`}
										onClick={() => patchChannel(channel)}
									>
										<span className="channel-id">{channel.id}</span>
										<span className="channel-name">{channel.name}</span>
										<span className="channel-note">{channel.note}</span>
									</button>
								))}
							</div>
							<button type="button" className="reset-btn" onClick={reset}>
								<RotateCcw size={13} strokeWidth={2.4} />
								RESET&nbsp;BENCH
							</button>
						</div>
					</section>
				</div>

				{/* ── Bottom telemetry rail — signature live readout ──────────── */}
				<footer className="rail rail--bottom">
					<div className="meter">
						<span className="meter-label">SIGNAL</span>
						<div className="meter-bar">
							<div className="meter-fill" style={{ width: `${signal}%` }} />
							<div className="meter-grid" aria-hidden="true" />
						</div>
						<span className="meter-value">
							{String(signal).padStart(3, "0")}
							<i>%</i>
						</span>
					</div>

					<dl className="telemetry">
						<div className="tele-cell">
							<dt>Refresh</dt>
							<dd>
								{String(fps).padStart(2, "0")}
								<i>fps</i>
							</dd>
						</div>
						<div className="tele-cell">
							<dt>Sweep</dt>
							<dd>
								{props.speed.toFixed(2)}
								<i>×</i>
							</dd>
						</div>
						<div className="tele-cell">
							<dt>Raster</dt>
							<dd>
								{props.scanlineDensity.toFixed(0)}
								<i>ln</i>
							</dd>
						</div>
						<div className="tele-cell tele-cell--live">
							<dt>Feed</dt>
							<dd>
								<span className="live-dot" />
								ON&nbsp;AIR
							</dd>
						</div>
					</dl>
				</footer>
			</main>
		</div>
	);
}
