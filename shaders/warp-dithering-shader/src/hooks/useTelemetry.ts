import { useEffect, useState } from "react";

export interface Telemetry {
  /** Smoothed page render rate, sampled twice a second. */
  fps: number;
  /** Seconds since the HUD mounted. */
  elapsed: number;
}

/**
 * A lightweight rAF probe for the HUD. It deliberately commits state only at
 * ~2 Hz (not every frame) so the readout stays cheap and never forces the
 * shader tree to re-render on the animation hot path.
 */
export function useTelemetry(): Telemetry {
  const [telemetry, setTelemetry] = useState<Telemetry>({ fps: 0, elapsed: 0 });

  useEffect(() => {
    let raf = 0;
    let frames = 0;
    const start = performance.now();
    let last = start;

    const loop = (now: number) => {
      frames += 1;
      const dt = now - last;
      if (dt >= 500) {
        setTelemetry({
          fps: Math.round((frames * 1000) / dt),
          elapsed: (now - start) / 1000,
        });
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return telemetry;
}
