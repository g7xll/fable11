import { useEffect, useRef, useState } from "react";

export interface StudioClock {
	/** Frames painted since mount (rAF ticks). */
	frames: number;
	/** Smoothed frames-per-second. */
	fps: number;
	/** Seconds since mount, monotonic. */
	uptime: number;
}

/**
 * A single shared rAF loop that drives every live readout in the studio
 * chrome — the masthead clock, the console telemetry strip, the ticker.
 * Kept as one loop (not one-per-widget) so the page never spins up a dozen
 * competing animation frames. Honors `prefers-reduced-motion` by falling back
 * to a 1 Hz interval so the numbers still advance without continuous painting.
 */
export function useStudioClock(): StudioClock {
	const [clock, setClock] = useState<StudioClock>({
		frames: 0,
		fps: 0,
		uptime: 0,
	});
	const raf = useRef(0);
	const start = useRef(0);
	const last = useRef(0);
	const frames = useRef(0);
	const fpsAccum = useRef({ t: 0, n: 0, fps: 0 });

	useEffect(() => {
		const reduce =
			typeof window !== "undefined" &&
			window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

		if (reduce) {
			const id = window.setInterval(() => {
				frames.current += 1;
				const uptime = frames.current;
				setClock({ frames: frames.current, fps: 1, uptime });
			}, 1000);
			return () => window.clearInterval(id);
		}

		const tick = (t: number) => {
			if (!start.current) {
				start.current = t;
				last.current = t;
			}
			const dt = t - last.current;
			last.current = t;
			frames.current += 1;

			// Smooth FPS over ~250ms windows.
			const a = fpsAccum.current;
			a.t += dt;
			a.n += 1;
			if (a.t >= 250) {
				a.fps = (a.n / a.t) * 1000;
				a.t = 0;
				a.n = 0;
			}

			setClock({
				frames: frames.current,
				fps: a.fps,
				uptime: (t - start.current) / 1000,
			});
			raf.current = requestAnimationFrame(tick);
		};

		raf.current = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf.current);
	}, []);

	return clock;
}
