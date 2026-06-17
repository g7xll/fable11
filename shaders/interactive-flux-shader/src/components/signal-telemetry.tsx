import { useEffect, useRef } from "react";
import type { ShaderSample } from "@/components/ui/interactive-shader";

/**
 * Live readout for the field. The scope plots the shader's sampled centre
 * luminance over time (data read straight off the GPU framebuffer), so the
 * instrument visibly tracks what the shader is actually producing rather than
 * just echoing the slider positions. Hue, draw rate and octave count round it
 * out. Everything here is read-only telemetry.
 */

interface SignalTelemetryProps {
  sample: ShaderSample;
  complexity: number;
}

export function SignalTelemetry({ sample, complexity }: SignalTelemetryProps) {
  const octaves = Math.max(1, Math.min(10, Math.round(complexity)));
  const hue = Math.round(sample.hue);

  return (
    <div className="rounded-md border border-alu-500/50 bg-chassis-900/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wide2 text-ink-400">
          Signal · centre tap
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide2 text-ink-300">
          <span className="h-1.5 w-1.5 animate-led-flicker rounded-full bg-patch shadow-[0_0_6px_rgba(52,214,232,0.8)]" />
          Live
        </span>
      </div>

      <LuminanceScope luminance={sample.luminance} />

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Readout label="Lum" value={sample.luminance.toFixed(2)} />
        <Readout label="Rate" value={`${Math.round(sample.fps)} fps`} />
        <Readout label="Oct" value={`${octaves}×`} />
      </div>

      <div className="mt-2 flex items-center gap-2 rounded-sm border border-alu-500/40 bg-chassis-950/70 px-2 py-1.5">
        <span
          className="h-4 w-4 shrink-0 rounded-[2px] ring-1 ring-black/60"
          style={{
            background: `hsl(${hue} 70% 50%)`,
            boxShadow: `0 0 8px hsl(${hue} 70% 50% / 0.6)`,
          }}
          aria-hidden
        />
        <span className="font-mono text-[10px] uppercase tracking-wide2 text-ink-400">
          Dominant hue
        </span>
        <span className="ml-auto font-mono text-[12px] tabular-nums text-ink-100">
          {hue}°
        </span>
      </div>
    </div>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-alu-500/40 bg-chassis-950/70 px-2 py-1.5">
      <p className="font-mono text-[9px] uppercase tracking-wide2 text-ink-500">
        {label}
      </p>
      <p className="font-mono text-[13px] tabular-nums text-ink-50">{value}</p>
    </div>
  );
}

/**
 * A scrolling oscilloscope of the sampled luminance. Drawn on a tiny canvas so
 * the rolling history stays smooth without re-rendering React every frame; the
 * latest value is pushed in via an effect.
 */
function LuminanceScope({ luminance }: { luminance: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const historyRef = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);
  const latestRef = useRef(luminance);

  useEffect(() => {
    latestRef.current = luminance;
  }, [luminance]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    canvas.width = Math.max(1, Math.floor(cssW * dpr));
    canvas.height = Math.max(1, Math.floor(cssH * dpr));
    ctx.scale(dpr, dpr);

    const MAX = 96;
    const history = historyRef.current;

    const draw = () => {
      history.push(latestRef.current);
      if (history.length > MAX) history.shift();

      ctx.clearRect(0, 0, cssW, cssH);

      // Faint graticule.
      ctx.strokeStyle = "rgba(122,134,148,0.14)";
      ctx.lineWidth = 1;
      for (let gy = 1; gy < 4; gy++) {
        const y = (cssH / 4) * gy;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(cssW, y);
        ctx.stroke();
      }

      // Luminance trace.
      const step = cssW / (MAX - 1);
      ctx.beginPath();
      history.forEach((v, i) => {
        const x = i * step;
        const y = cssH - v * (cssH - 4) - 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "#f4b740";
      ctx.lineWidth = 1.4;
      ctx.lineJoin = "round";
      ctx.shadowColor = "rgba(244,183,64,0.55)";
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Leading dot at the latest sample.
      if (history.length) {
        const last = history[history.length - 1];
        const x = (history.length - 1) * step;
        const y = cssH - last * (cssH - 4) - 2;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#fde6b0";
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-16 w-full rounded-sm border border-alu-500/40 bg-chassis-950/80"
      aria-hidden
    />
  );
}
