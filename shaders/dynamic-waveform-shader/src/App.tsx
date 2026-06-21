import {
	Activity,
	AudioWaveform,
	Gauge,
	MousePointer2,
	Radio,
	RotateCcw,
	Sliders,
	Waves,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ShaderCanvas from "@/components/ui/dynamic-waveform";

// ── Signal channels (the prompt's DEFAULT_PROPS + PRESETS, reframed) ─────────
type WaveSettings = {
	color1: string;
	color2: string;
	speed: number;
	complexity: number;
	amplitude: number;
	frequency: number;
	mouseDistortion: number;
};

const DEFAULT_PROPS: WaveSettings = {
	color1: "#fb7185", // Rose
	color2: "#67e8f9", // Cyan
	speed: 0.5,
	complexity: 4.0,
	amplitude: 1.0,
	frequency: 20.0,
	mouseDistortion: 0.5,
};

type Channel = {
	id: string;
	name: string;
	code: string;
	settings: WaveSettings;
};

const CHANNELS: Channel[] = [
	{
		id: "baseline",
		name: "Baseline",
		code: "CH-00",
		settings: DEFAULT_PROPS,
	},
	{
		id: "signal-scan",
		name: "Signal Scan",
		code: "CH-01",
		settings: {
			color1: "#4ade80",
			color2: "#ffffff",
			speed: 0.3,
			complexity: 2.0,
			amplitude: 0.5,
			frequency: 30.0,
			mouseDistortion: 0.2,
		},
	},
	{
		id: "deep-sea",
		name: "Deep Sea",
		code: "CH-02",
		settings: {
			color1: "#0369a1",
			color2: "#a5f3fc",
			speed: 0.2,
			complexity: 6.0,
			amplitude: 1.2,
			frequency: 10.0,
			mouseDistortion: 0.8,
		},
	},
	{
		id: "vaporwave",
		name: "Vaporwave",
		code: "CH-03",
		settings: {
			color1: "#f472b6",
			color2: "#38bdf8",
			speed: 0.6,
			complexity: 3.0,
			amplitude: 0.8,
			frequency: 15.0,
			mouseDistortion: 0.4,
		},
	},
];

// ── Fader / trim definitions (drive the shader uniforms directly) ───────────
type FaderKey =
	| "speed"
	| "complexity"
	| "amplitude"
	| "frequency"
	| "mouseDistortion";

const FADERS: {
	key: FaderKey;
	label: string;
	unit: string;
	min: number;
	max: number;
	step: number;
	decimals: number;
	icon: typeof Gauge;
	hint: string;
}[] = [
	{
		key: "speed",
		label: "Sweep Rate",
		unit: "×",
		min: 0,
		max: 2,
		step: 0.01,
		decimals: 2,
		icon: Gauge,
		hint: "Trace scroll speed",
	},
	{
		key: "complexity",
		label: "Harmonics",
		unit: "ord",
		min: 1,
		max: 8,
		step: 0.1,
		decimals: 1,
		icon: Waves,
		hint: "Stacked sine orders",
	},
	{
		key: "amplitude",
		label: "Amplitude",
		unit: "V",
		min: 0,
		max: 2,
		step: 0.01,
		decimals: 2,
		icon: AudioWaveform,
		hint: "Peak deflection",
	},
	{
		key: "frequency",
		label: "Frequency",
		unit: "Hz",
		min: 5,
		max: 50,
		step: 0.1,
		decimals: 1,
		icon: Radio,
		hint: "Base oscillation",
	},
	{
		key: "mouseDistortion",
		label: "Probe Gain",
		unit: "%",
		min: 0,
		max: 2,
		step: 0.01,
		decimals: 2,
		icon: MousePointer2,
		hint: "Cursor warp depth",
	},
];

const pad2 = (n: number) => String(Math.floor(n)).padStart(2, "0");
const formatClock = (sec: number) => {
	const h = Math.floor(sec / 3600);
	const m = Math.floor((sec % 3600) / 60);
	const s = Math.floor(sec % 60);
	return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
};

export default function App() {
	const [props, setProps] = useState<WaveSettings>(DEFAULT_PROPS);
	const [activeChannel, setActiveChannel] = useState<string>("baseline");
	const [booted, setBooted] = useState(false);

	// Live telemetry, read straight off the shader's render loop (onFrame).
	const [clock, setClock] = useState("00:00:00");
	const [fps, setFps] = useState(0);
	const [trace, setTrace] = useState(0); // sampled peak deflection (mV)
	const probeRef = useRef(0.5); // last mouse-Y uniform from the shader

	// Frame accounting kept in refs so the render loop stays allocation-free.
	const frameCount = useRef(0);
	const fpsWindowStart = useRef(performance.now());
	const lastClock = useRef(-1);

	useEffect(() => {
		const t = window.setTimeout(() => setBooted(true), 60);
		return () => window.clearTimeout(t);
	}, []);

	const handleFrame = useCallback(
		({ time, mouseY }: { time: number; mouseY: number }) => {
			probeRef.current = mouseY;

			// FPS over a rolling ~0.5s window.
			frameCount.current += 1;
			const now = performance.now();
			const elapsed = now - fpsWindowStart.current;
			if (elapsed >= 500) {
				setFps(Math.round((frameCount.current * 1000) / elapsed));
				frameCount.current = 0;
				fpsWindowStart.current = now;
			}

			// Mission clock ticks off the shader's own elapsed time, once per second.
			const whole = Math.floor(time);
			if (whole !== lastClock.current) {
				lastClock.current = whole;
				setClock(formatClock(time));
			}
		},
		[],
	);

	// Sampled trace level: the shader's summed amplitude is Σ(amp/i)·0.2 across the
	// active harmonics — recompute it here so the readout mirrors the real GLSL.
	useEffect(() => {
		let sum = 0;
		const orders = Math.floor(props.complexity);
		for (let i = 1; i <= orders; i++) sum += (props.amplitude / i) * 0.2;
		// Probe gain modulates the effective deflection, like u_mouse_distortion.
		const probe = 1 + (probeRef.current - 0.5) * props.mouseDistortion;
		setTrace(Math.abs(sum * probe) * 1000);
	}, [props.complexity, props.amplitude, props.mouseDistortion]);

	const applyChannel = useCallback((channel: Channel) => {
		setProps(channel.settings);
		setActiveChannel(channel.id);
	}, []);

	const handleValueChange = useCallback((key: FaderKey, value: number) => {
		setProps((prev) => ({ ...prev, [key]: value }));
		setActiveChannel("custom");
	}, []);

	const handleColorChange = useCallback(
		(key: "color1" | "color2", value: string) => {
			setProps((prev) => ({ ...prev, [key]: value }));
			setActiveChannel("custom");
		},
		[],
	);

	const reset = useCallback(() => applyChannel(CHANNELS[0]), [applyChannel]);

	const activeName =
		activeChannel === "custom"
			? "Custom"
			: (CHANNELS.find((c) => c.id === activeChannel)?.name ?? "Custom");

	return (
		<div className={`bench ${booted ? "is-booted" : ""}`}>
			{/* Live signal trace — the shader fills the viewport behind everything. */}
			<ShaderCanvas {...props} onFrame={handleFrame} />

			{/* Scope grading: graticule grid, scanlines, vignette, registration. */}
			<div className="scope-graticule" aria-hidden />
			<div className="scope-scanlines" aria-hidden />
			<div className="scope-vignette" aria-hidden />
			<div className="scope-sweep" aria-hidden />
			<div className="reticle" aria-hidden>
				<span className="reticle-corner tl" />
				<span className="reticle-corner tr" />
				<span className="reticle-corner bl" />
				<span className="reticle-corner br" />
			</div>

			{/* Top instrument rail */}
			<header className="rail rail--top">
				<div className="brand">
					<Activity className="brand-icon" strokeWidth={1.75} aria-hidden />
					<div className="brand-text">
						<span className="brand-name">WAVEFORM&nbsp;BENCH</span>
						<span className="brand-sub">Signal Analysis Instrument · MK-V</span>
					</div>
				</div>
				<div className="rail-meta">
					<span className="rail-chip">
						<span className="rail-chip-dot" /> ACQUIRING
					</span>
					<span className="rail-coord">
						SRC <b>three.js · GLSL</b>
					</span>
					<span className="rail-coord">
						MNT <b>@/components/ui</b>
					</span>
				</div>
			</header>

			{/* Left console — the instrument controls */}
			<section className="console" aria-label="Signal controls">
				<div className="console-head">
					<Sliders
						className="console-head-icon"
						strokeWidth={1.75}
						aria-hidden
					/>
					<h1>Dynamic Waveform</h1>
					<p>
						Drive the live GLSL trace. Every control writes straight to a shader
						uniform.
					</p>
				</div>

				{/* Trace colour trim */}
				<div className="trim-row">
					<ColorTrim
						label="Trace A"
						sub="Trough hue"
						value={props.color1}
						onChange={(v) => handleColorChange("color1", v)}
					/>
					<ColorTrim
						label="Trace B"
						sub="Crest hue"
						value={props.color2}
						onChange={(v) => handleColorChange("color2", v)}
					/>
				</div>

				{/* Faders */}
				<div className="faders">
					{FADERS.map((f) => {
						const Icon = f.icon;
						const value = props[f.key];
						const pct = ((value - f.min) / (f.max - f.min)) * 100;
						return (
							<div className="fader" key={f.key}>
								<div className="fader-top">
									<span className="fader-label">
										<Icon
											className="fader-icon"
											strokeWidth={1.75}
											aria-hidden
										/>
										{f.label}
									</span>
									<span className="fader-read">
										{value.toFixed(f.decimals)}
										<i>{f.unit}</i>
									</span>
								</div>
								<input
									type="range"
									className="fader-input"
									min={f.min}
									max={f.max}
									step={f.step}
									value={value}
									aria-label={`${f.label} (${f.hint})`}
									style={{ ["--pct" as string]: `${pct}%` }}
									onChange={(e) =>
										handleValueChange(f.key, parseFloat(e.target.value))
									}
								/>
								<span className="fader-hint">{f.hint}</span>
							</div>
						);
					})}
				</div>

				{/* Channel presets */}
				<div className="channels">
					<div className="channels-head">
						<span>Channel Memory</span>
						<button className="channels-reset" onClick={reset} type="button">
							<RotateCcw
								className="channels-reset-icon"
								strokeWidth={2}
								aria-hidden
							/>
							Reset
						</button>
					</div>
					<div className="channels-grid">
						{CHANNELS.map((c) => (
							<button
								key={c.id}
								type="button"
								className={`channel ${activeChannel === c.id ? "is-active" : ""}`}
								onClick={() => applyChannel(c)}
							>
								<span
									className="channel-swatch"
									style={{
										background: `linear-gradient(120deg, ${c.settings.color1}, ${c.settings.color2})`,
									}}
								/>
								<span className="channel-body">
									<b>{c.name}</b>
									<i>{c.code}</i>
								</span>
							</button>
						))}
					</div>
				</div>
			</section>

			{/* Bottom telemetry strip — driven by the shader's own per-frame state */}
			<footer className="telemetry" aria-label="Live telemetry">
				<dl className="telemetry-grid">
					<div className="telemetry-cell telemetry-cell--clock">
						<dt>Sweep Time</dt>
						<dd>{clock}</dd>
					</div>
					<div className="telemetry-cell">
						<dt>Refresh</dt>
						<dd>
							{fps}
							<span className="telemetry-unit">fps</span>
						</dd>
					</div>
					<div className="telemetry-cell">
						<dt>Trace Level</dt>
						<dd>
							{trace.toFixed(1)}
							<span className="telemetry-unit">mV</span>
						</dd>
					</div>
					<div className="telemetry-cell">
						<dt>Harmonics</dt>
						<dd>
							{pad2(props.complexity)}
							<span className="telemetry-unit">ord</span>
						</dd>
					</div>
					<div className="telemetry-cell telemetry-cell--meta">
						<dt>Active Channel</dt>
						<dd className="telemetry-channel">{activeName}</dd>
					</div>
				</dl>
				<div className="telemetry-foot">
					<span className="telemetry-live">
						<span className="telemetry-live-dot" /> Live GLSL render
					</span>
					<span>
						Move the cursor over the screen to bend the trace · probe gain{" "}
						{props.mouseDistortion.toFixed(2)}
					</span>
				</div>
			</footer>
		</div>
	);
}

// ── Colour trim "pot": a real swatch that opens the native picker ───────────
function ColorTrim({
	label,
	sub,
	value,
	onChange,
}: {
	label: string;
	sub: string;
	value: string;
	onChange: (v: string) => void;
}) {
	return (
		<label className="trim">
			<span
				className="trim-swatch"
				style={{ background: value, boxShadow: `0 0 22px -4px ${value}` }}
			/>
			<span className="trim-meta">
				<b>{label}</b>
				<i>{sub}</i>
				<code>{value.toUpperCase()}</code>
			</span>
			<input
				type="color"
				className="trim-input"
				value={value}
				aria-label={`${label} colour`}
				onChange={(e) => onChange(e.target.value)}
			/>
		</label>
	);
}
