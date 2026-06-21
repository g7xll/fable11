import { useEffect, useRef, useState } from "react";

export interface Telemetry {
	/** Smoothed frames-per-second of the render loop. */
	fps: number;
	/** Total frames counted since mount. */
	frames: number;
	/** Seconds since mount (wall clock). */
	uptime: number;
}

/**
 * A tiny requestAnimationFrame telemetry probe. It counts real animation frames
 * (so the FPS reading reflects the page actually painting, shader included) and
 * exposes a smoothed FPS, a frame counter, and an uptime clock. The state is
 * throttled to ~4 updates/sec so the HUD numbers are readable rather than a
 * blur, while the underlying counters stay frame-accurate.
 */
export function useTelemetry(): Telemetry {
	const [tele, setTele] = useState<Telemetry>({ fps: 0, frames: 0, uptime: 0 });
	const raf = useRef(0);
	const start = useRef(0);
	const lastTick = useRef(0);
	const lastEmit = useRef(0);
	const frameCount = useRef(0);
	const emaFps = useRef(0);

	useEffect(() => {
		const loop = (t: number) => {
			if (!start.current) {
				start.current = t;
				lastTick.current = t;
				lastEmit.current = t;
			}
			frameCount.current += 1;

			const dt = t - lastTick.current;
			lastTick.current = t;
			if (dt > 0) {
				const inst = 1000 / dt;
				// Exponential moving average smooths out scheduler jitter.
				emaFps.current = emaFps.current
					? emaFps.current * 0.9 + inst * 0.1
					: inst;
			}

			if (t - lastEmit.current >= 250) {
				lastEmit.current = t;
				setTele({
					fps: Math.round(emaFps.current),
					frames: frameCount.current,
					uptime: (t - start.current) / 1000,
				});
			}
			raf.current = requestAnimationFrame(loop);
		};
		raf.current = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf.current);
	}, []);

	return tele;
}
