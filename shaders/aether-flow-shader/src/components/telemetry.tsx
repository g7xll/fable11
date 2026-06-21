import { useEffect, useRef, useState } from "react";

interface TelemetryProps {
	/** Normalized warp coordinate (0..1), origin bottom-left, from the canvas. */
	warp: { x: number; y: number };
	/** Active preset name for the readout. */
	channel: string;
}

interface Live {
	fps: number;
	uptime: number;
}

/**
 * A live readout strip. The clock and FPS run on a real rAF loop — the same one
 * the shader animates on — so the numbers move with the field rather than being
 * faked. The recorder freezes both rAF and Date.now() and advances them one
 * frame at a time, so these readings stay correct in the recorded demo too.
 */
export function Telemetry({ warp, channel }: TelemetryProps) {
	const [live, setLive] = useState<Live>({ fps: 0, uptime: 0 });

	// Mutable accumulators so the rAF loop never re-subscribes.
	const start = useRef<number>(0);
	const last = useRef<number>(0);
	const frames = useRef<number>(0);
	const acc = useRef<number>(0);

	useEffect(() => {
		let raf = 0;
		const tick = (t: number) => {
			if (!start.current) {
				start.current = t;
				last.current = t;
			}
			const dt = t - last.current;
			last.current = t;
			frames.current += 1;
			acc.current += dt;
			// Refresh the on-screen numbers ~5x/sec to keep them legible.
			if (acc.current >= 200) {
				setLive({
					fps: Math.round((frames.current * 1000) / acc.current),
					uptime: (t - start.current) / 1000,
				});
				frames.current = 0;
				acc.current = 0;
			}
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, []);

	const mm = String(Math.floor(live.uptime / 60)).padStart(2, "0");
	const ss = String(Math.floor(live.uptime % 60)).padStart(2, "0");
	const cs = String(Math.floor((live.uptime * 100) % 100)).padStart(2, "0");

	const rows: [string, string][] = [
		["State", channel.toUpperCase()],
		["Uptime", `${mm}:${ss}.${cs}`],
		["Render", `${String(live.fps).padStart(3, " ")} fps`],
		["Warp.x", warp.x.toFixed(3)],
		["Warp.y", warp.y.toFixed(3)],
	];

	return (
		<div className="rounded-[3px] border border-hairline/70 bg-ink-800/70 p-3">
			<div className="mb-2.5 flex items-center justify-between">
				<span className="font-mono text-[10px] uppercase tracking-wider2 text-muted">
					Telemetry
				</span>
				<span className="flex items-center gap-1.5">
					<span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-blink" />
					<span className="font-mono text-[9px] uppercase tracking-wide text-emerald-300/90">
						live
					</span>
				</span>
			</div>
			<dl className="grid grid-cols-1 gap-y-1">
				{rows.map(([k, val]) => (
					<div key={k} className="flex items-center justify-between">
						<dt className="font-mono text-[10px] text-muted/80">{k}</dt>
						<dd className="font-mono text-[11px] tabular-nums text-chalk/90">
							{val}
						</dd>
					</div>
				))}
			</dl>
		</div>
	);
}
