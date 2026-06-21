import { Activity, Crosshair, Radio, Waves } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import LivingNebulaShader, {
	type NebulaFrameState,
} from "@/components/ui/living-nebula";

/**
 * DemoOne — the brief's demo, kept intact (an `app-container` holding the
 * <LivingNebulaShader /> plus an `overlay-content` block whose `title` reads
 * "Living Nebula" and whose `description` reads "An Interactive WebGL Shader"),
 * then framed as a deep-space radio-observatory sky-feed console: the shader is
 * the live sky feed, the cursor is a gravitational lens, and the surrounding
 * chrome is the operator's terminal reading the feed's own per-frame state.
 */
export default function DemoOne() {
	// Live state lifted straight off the shader's animation loop.
	const [frame, setFrame] = useState<NebulaFrameState>({
		time: 0,
		fps: 0,
		warp: null,
	});
	const [supported, setSupported] = useState(true);
	const [ready, setReady] = useState(false);
	// rAF-throttle React updates so the HUD repaints at most once per frame
	// regardless of how often the shader fires onFrame.
	const pending = useRef<NebulaFrameState | null>(null);
	const raf = useRef<number | null>(null);

	useEffect(() => {
		const t = window.setTimeout(() => setReady(true), 60);
		return () => window.clearTimeout(t);
	}, []);

	const handleFrame = (state: NebulaFrameState) => {
		pending.current = state;
		if (raf.current != null) return;
		raf.current = requestAnimationFrame(() => {
			raf.current = null;
			if (pending.current) setFrame(pending.current);
		});
	};

	useEffect(
		() => () => {
			if (raf.current != null) cancelAnimationFrame(raf.current);
		},
		[],
	);

	const feedClock = formatClock(frame.time);
	const fps = supported ? Math.round(frame.fps) : 0;
	const warp = frame.warp;

	return (
		<div className={`app-container${ready ? " is-ready" : ""}`}>
			{/* ── The brief's demo: live shader + overlay copy ─────────────── */}
			<LivingNebulaShader onFrame={handleFrame} onContext={setSupported} />

			{/* Instrument chrome over the feed window */}
			<div className="console" aria-hidden="true">
				<span className="console__bracket console__bracket--tl" />
				<span className="console__bracket console__bracket--tr" />
				<span className="console__bracket console__bracket--bl" />
				<span className="console__bracket console__bracket--br" />
				<span className="console__scanline" />
				<span className="console__vignette" />
			</div>

			{/* ── Top status bar ───────────────────────────────────────────── */}
			<header className="masthead">
				<div className="masthead__brand">
					<Radio
						className="masthead__glyph"
						strokeWidth={1.6}
						aria-hidden="true"
					/>
					<span className="masthead__call">DSO·N7</span>
					<span className="masthead__sep" aria-hidden="true">
						/
					</span>
					<span className="masthead__name">DEEP-SKY OBSERVATORY</span>
				</div>
				<div className="masthead__status">
					<span
						className={`signal-dot${supported ? " signal-dot--live" : " signal-dot--down"}`}
						aria-hidden="true"
					/>
					<span className="masthead__feed">
						{supported ? "FEED · LIVE" : "FEED · NO SIGNAL"}
					</span>
				</div>
			</header>

			{/* ── Hero / overlay content (from the brief) ──────────────────── */}
			<div className="overlay-content">
				<p className="eyebrow">
					<span className="eyebrow__rule" aria-hidden="true" />
					Sky feed 02 · interstellar medium
				</p>
				<h1 className="title">Living Nebula</h1>
				<p className="description">An Interactive WebGL Shader</p>
				<p className="lede">
					A two-layer fractal gas cloud rendered live on the GPU. Sweep the feed
					and the medium lenses around your cursor — a gravitational well
					bending the magenta and ion-blue flows in real time.
				</p>
				<div className="legend" role="list">
					<span className="legend__item" role="listitem">
						<span
							className="legend__swatch legend__swatch--magenta"
							aria-hidden="true"
						/>
						Plasma layer · fbm ×2
					</span>
					<span className="legend__item" role="listitem">
						<span
							className="legend__swatch legend__swatch--ion"
							aria-hidden="true"
						/>
						Ion layer · fbm ×4
					</span>
					<span className="legend__item" role="listitem">
						<Crosshair size={13} strokeWidth={1.8} aria-hidden="true" />
						Lens · cursor warp
					</span>
				</div>
			</div>

			{/* ── Bottom telemetry rail, driven by the shader's own state ──── */}
			<dl className="telemetry">
				<div className="telemetry__cell telemetry__cell--clock">
					<dt>
						<Waves size={12} strokeWidth={2} aria-hidden="true" /> Feed time
					</dt>
					<dd>{feedClock}</dd>
				</div>
				<div className="telemetry__cell">
					<dt>
						<Activity size={12} strokeWidth={2} aria-hidden="true" /> Render
						rate
					</dt>
					<dd>
						{fps}
						<span className="telemetry__unit">fps</span>
					</dd>
				</div>
				<div className="telemetry__cell telemetry__cell--warp">
					<dt>
						<Crosshair size={12} strokeWidth={2} aria-hidden="true" /> Warp
						center
					</dt>
					<dd>{warp ? `${signed(warp.x)}, ${signed(warp.y)}` : "— idle —"}</dd>
				</div>
				<div className="telemetry__cell telemetry__cell--layers">
					<dt>Gas layers</dt>
					<dd>
						02<span className="telemetry__unit">active</span>
					</dd>
				</div>
				<div className="telemetry__cell telemetry__cell--octaves">
					<dt>fbm octaves</dt>
					<dd>
						06<span className="telemetry__unit">per layer</span>
					</dd>
				</div>
			</dl>
		</div>
	);
}

/** T+HH:MM:SS feed clock from elapsed shader seconds. */
function formatClock(seconds: number): string {
	const s = Math.max(0, Math.floor(seconds));
	const hh = String(Math.floor(s / 3600)).padStart(2, "0");
	const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
	const ss = String(s % 60).padStart(2, "0");
	return `T+${hh}:${mm}:${ss}`;
}

/** Fixed-width signed coordinate, e.g. +0.214 / -1.083. */
function signed(n: number): string {
	const v = n.toFixed(3);
	return n >= 0 ? `+${v}` : v;
}
