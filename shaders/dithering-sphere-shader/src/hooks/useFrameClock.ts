import { useEffect, useRef, useState } from "react";

export type FrameClock = {
	/** Seconds since the page mounted (the lab's wall clock). */
	time: number;
	/** Smoothed frames-per-second of the render loop. */
	fps: number;
	/** Total animation frames drawn. */
	frames: number;
};

/**
 * A single rAF loop that produces the live telemetry shown in the HUD. It runs
 * independently of the shader's own internal clock — it simply measures the
 * page's real render cadence, so the readouts reflect what the browser is
 * actually painting. Throttled to ~10 state updates/sec to stay cheap.
 */
export function useFrameClock(): FrameClock {
	const [clock, setClock] = useState<FrameClock>({ time: 0, fps: 60, frames: 0 });
	const raf = useRef(0);

	useEffect(() => {
		const start = performance.now();
		let last = start;
		let acc = 0;
		let frames = 0;
		let fps = 60;

		const tick = (now: number) => {
			const dt = now - last;
			last = now;
			frames += 1;
			acc += dt;
			// Exponential moving average smooths the readout.
			if (dt > 0) fps = fps * 0.9 + (1000 / dt) * 0.1;

			if (acc >= 100) {
				acc = 0;
				setClock({
					time: (now - start) / 1000,
					fps: Math.round(fps),
					frames,
				});
			}
			raf.current = requestAnimationFrame(tick);
		};

		raf.current = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf.current);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return clock;
}
