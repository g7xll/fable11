import { useEffect, useRef, type RefObject } from "react";

export interface PressTelemetry {
  fpsRef: RefObject<HTMLSpanElement | null>;
  framesRef: RefObject<HTMLSpanElement | null>;
  uptimeRef: RefObject<HTMLSpanElement | null>;
  inkRef: RefObject<HTMLSpanElement | null>;
}

/**
 * A live "press telemetry" stream, read once per animation frame and written
 * straight to the DOM through refs so the 60fps feed never re-renders React:
 *
 *   · fps     — smoothed from real requestAnimationFrame deltas
 *   · frames  — total composited frames since the press started
 *   · uptime  — wall-clock since mount (mm:ss)
 *   · ink     — mean ink coverage, genuinely sampled off the dither <canvas>:
 *               the WebGL canvas is composited onto a tiny offscreen 2D buffer
 *               and the share of opaque, ink-coloured pixels is averaged
 *               (0–100%). Best-effort — a frame that can't be sampled keeps the
 *               last good reading rather than flickering to zero.
 *
 * @param canvasHost ref to the element that wraps the dither canvas to read.
 */
export function useTelemetry(canvasHost: RefObject<HTMLElement | null>): PressTelemetry {
  const fpsRef = useRef<HTMLSpanElement>(null);
  const framesRef = useRef<HTMLSpanElement>(null);
  const uptimeRef = useRef<HTMLSpanElement>(null);
  const inkRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    let frames = 0;
    const start = performance.now();
    let last = start;
    let acc = 0;
    let accFrames = 0;
    let ink = 0;
    let sampleCountdown = 0;

    // Tiny offscreen buffer used to read ink density off the live shader.
    const sampler = document.createElement("canvas");
    sampler.width = 48;
    sampler.height = 30;
    const sctx = sampler.getContext("2d", { willReadFrequently: true });

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      frames += 1;
      acc += dt;
      accFrames += 1;

      if (acc >= 250) {
        const fps = (accFrames * 1000) / acc;
        if (fpsRef.current) fpsRef.current.textContent = fps.toFixed(0).padStart(2, "0");
        acc = 0;
        accFrames = 0;
      }

      if (framesRef.current) framesRef.current.textContent = frames.toLocaleString();

      if (uptimeRef.current) {
        const s = Math.floor((now - start) / 1000);
        uptimeRef.current.textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(
          s % 60,
        ).padStart(2, "0")}`;
      }

      sampleCountdown -= dt;
      if (sampleCountdown <= 0 && sctx) {
        sampleCountdown = 160;
        const canvas = canvasHost.current?.querySelector("canvas");
        if (canvas) {
          try {
            sctx.clearRect(0, 0, sampler.width, sampler.height);
            sctx.drawImage(canvas, 0, 0, sampler.width, sampler.height);
            const { data } = sctx.getImageData(0, 0, sampler.width, sampler.height);
            const total = data.length / 4;
            let covered = 0;
            for (let i = 0; i < data.length; i += 4) {
              // ink = opaque, warm (red-dominant) dots over a transparent back
              if (data[i + 3] > 24 && data[i] > 40) covered += 1;
            }
            const pct = (covered / total) * 100;
            ink = ink * 0.6 + pct * 0.4;
            if (inkRef.current) inkRef.current.textContent = ink.toFixed(1);
          } catch {
            /* compositing a WebGL frame can occasionally miss; keep last value */
          }
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [canvasHost]);

  return { fpsRef, framesRef, uptimeRef, inkRef };
}
