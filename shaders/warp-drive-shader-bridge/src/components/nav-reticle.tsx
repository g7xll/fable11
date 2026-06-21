import { useMemo } from "react";
import type { WarpDriveFrame } from "@/components/ui/warp-drive-shader";

/**
 * NavReticle — the page's signature instrument.
 *
 * A circular helm gauge locked to the tunnel's vanishing point. It reads the
 * shader's own per-frame state (`onFrame`) and turns it into navigation
 * telemetry: a warp factor from `iTime`, a heading from the steered `iMouse`
 * vector, and a live FPS dial. Nothing here re-runs the shader — it only
 * visualizes what the GPU already produced.
 */

const TAU = Math.PI * 2;

function polar(cx: number, cy: number, r: number, angleRad: number) {
	return [cx + r * Math.cos(angleRad), cy + r * Math.sin(angleRad)] as const;
}

export function NavReticle({ frame }: { frame: WarpDriveFrame }) {
	// Heading: the steered offset of the vanishing point from screen center,
	// expressed as a compass-style bearing in degrees.
	const heading = useMemo(() => {
		const { mouse, size } = frame;
		const dx = mouse.x - size.width / 2;
		const dy = mouse.y - size.height / 2;
		let deg = (Math.atan2(dx, dy) * 180) / Math.PI; // 0 = "up"
		if (deg < 0) deg += 360;
		return deg;
	}, [frame]);

	// Warp factor: a readable 0–9.x scale derived from accumulated shader time,
	// wrapping like a real impulse gauge so it always feels in motion.
	const warpFactor = useMemo(() => {
		const f = ((frame.time * 0.37) % 9.4) + 0.6;
		return f;
	}, [frame.time]);

	const fps = Math.round(frame.fps);
	const fpsArc = Math.min(fps, 90) / 90; // 0..1 of the dial

	// Build tick marks once.
	const ticks = useMemo(() => {
		const out: {
			x1: number;
			y1: number;
			x2: number;
			y2: number;
			major: boolean;
		}[] = [];
		for (let i = 0; i < 60; i++) {
			const a = (i / 60) * TAU - Math.PI / 2;
			const major = i % 5 === 0;
			const r1 = 96;
			const r2 = major ? 84 : 90;
			const [x1, y1] = polar(120, 120, r1, a);
			const [x2, y2] = polar(120, 120, r2, a);
			out.push({ x1, y1, x2, y2, major });
		}
		return out;
	}, []);

	// FPS dial sweep (270° gauge from 7 o'clock to 5 o'clock).
	const gaugeStart = (135 * Math.PI) / 180;
	const gaugeSweep = (270 * Math.PI) / 180;
	const gaugeEnd = gaugeStart + gaugeSweep * fpsArc;
	const arcR = 104;
	const [gx1, gy1] = polar(120, 120, arcR, gaugeStart);
	const [gx2, gy2] = polar(120, 120, arcR, gaugeEnd);
	const largeArc = fpsArc * 270 > 180 ? 1 : 0;

	// Heading needle.
	const needleA = (heading * Math.PI) / 180 - Math.PI / 2;
	const [nx, ny] = polar(120, 120, 70, needleA);

	return (
		<div
			className="pointer-events-none relative h-[240px] w-[240px] select-none"
			role="img"
			aria-label={`Warp factor ${warpFactor.toFixed(1)}, heading ${Math.round(heading)} degrees, ${fps} frames per second`}
		>
			<svg
				viewBox="0 0 240 240"
				className="absolute inset-0 h-full w-full overflow-visible"
			>
				{/* Outer rotating ring */}
				<g
					className="origin-center animate-reticle-spin"
					style={{ transformBox: "fill-box" }}
				>
					<circle
						cx="120"
						cy="120"
						r="112"
						fill="none"
						stroke="rgba(56,225,255,0.18)"
						strokeWidth="1"
					/>
					<circle
						cx="120"
						cy="120"
						r="112"
						fill="none"
						stroke="rgba(56,225,255,0.55)"
						strokeWidth="1.5"
						strokeDasharray="2 30"
					/>
				</g>

				{/* Counter-rotating inner ring */}
				<g
					className="origin-center animate-reticle-spin-rev"
					style={{ transformBox: "fill-box" }}
				>
					<circle
						cx="120"
						cy="120"
						r="100"
						fill="none"
						stroke="rgba(56,225,255,0.12)"
						strokeWidth="1"
						strokeDasharray="1 12"
					/>
				</g>

				{/* Tick ring */}
				<g>
					{ticks.map((t, i) => (
						<line
							key={i}
							x1={t.x1}
							y1={t.y1}
							x2={t.x2}
							y2={t.y2}
							stroke={
								t.major ? "rgba(215,227,244,0.6)" : "rgba(111,126,152,0.4)"
							}
							strokeWidth={t.major ? 1.5 : 1}
						/>
					))}
				</g>

				{/* FPS gauge arc (amber, fills with frame rate) */}
				<path
					d={`M ${120 + arcR * Math.cos(gaugeStart)} ${120 + arcR * Math.sin(gaugeStart)} A ${arcR} ${arcR} 0 1 1 ${120 + arcR * Math.cos(gaugeStart + gaugeSweep)} ${120 + arcR * Math.sin(gaugeStart + gaugeSweep)}`}
					fill="none"
					stroke="rgba(111,126,152,0.25)"
					strokeWidth="2"
					strokeLinecap="round"
				/>
				<path
					d={`M ${gx1} ${gy1} A ${arcR} ${arcR} 0 ${largeArc} 1 ${gx2} ${gy2}`}
					fill="none"
					stroke="#ffc24b"
					strokeWidth="2.5"
					strokeLinecap="round"
				/>

				{/* Crosshair */}
				<line
					x1="120"
					y1="34"
					x2="120"
					y2="62"
					stroke="rgba(56,225,255,0.5)"
					strokeWidth="1"
				/>
				<line
					x1="120"
					y1="178"
					x2="120"
					y2="206"
					stroke="rgba(56,225,255,0.5)"
					strokeWidth="1"
				/>
				<line
					x1="34"
					y1="120"
					x2="62"
					y2="120"
					stroke="rgba(56,225,255,0.5)"
					strokeWidth="1"
				/>
				<line
					x1="178"
					y1="120"
					x2="206"
					y2="120"
					stroke="rgba(56,225,255,0.5)"
					strokeWidth="1"
				/>

				{/* Heading needle */}
				<line
					x1="120"
					y1="120"
					x2={nx}
					y2={ny}
					stroke="#38e1ff"
					strokeWidth="2"
					strokeLinecap="round"
					style={{ filter: "drop-shadow(0 0 4px rgba(56,225,255,0.8))" }}
				/>
				<circle cx="120" cy="120" r="3.5" fill="#38e1ff" />
				<circle cx={nx} cy={ny} r="2.5" fill="#ff3d8b" />
			</svg>

			{/* Center digital readout (warp factor) */}
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<span className="font-mono text-[9px] uppercase tracking-[0.3em] text-haze">
					Warp
				</span>
				<span className="font-display text-[34px] font-bold leading-none text-frost tabular-nums">
					{warpFactor.toFixed(1)}
				</span>
				<span className="mt-1 font-mono text-[9px] tracking-[0.25em] text-helm">
					ENGAGED
				</span>
			</div>

			{/* Corner micro-labels orbiting the gauge */}
			<span className="absolute left-1/2 top-[2px] -translate-x-1/2 font-mono text-[8px] tracking-[0.3em] text-haze">
				BOW
			</span>
			<span className="absolute bottom-[2px] left-1/2 -translate-x-1/2 font-mono text-[8px] tracking-[0.3em] text-haze">
				AFT
			</span>
		</div>
	);
}
