import { useEffect, useRef, useState } from "react";
import { Activity, Radio } from "lucide-react";

/**
 * Live containment readout. Energy is sampled straight off the GPU (center-pixel
 * luminance, 0–1) and rendered as a rolling sparkline + bar, alongside a live
 * render-rate counter and the fixed shader recipe.
 */
export function ContainmentTelemetry({
  energy,
  paused,
}: {
  energy: number;
  paused: boolean;
}) {
  const history = useRef<number[]>(new Array(48).fill(0));
  const [, force] = useState(0);
  const fpsRef = useRef(0);
  const frames = useRef(0);
  const lastFlush = useRef(performance.now());

  // Roll the energy history + recompute FPS on each animation frame.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      frames.current += 1;
      const now = performance.now();
      if (now - lastFlush.current >= 250) {
        fpsRef.current = Math.round(
          (frames.current * 1000) / (now - lastFlush.current),
        );
        frames.current = 0;
        lastFlush.current = now;
        const h = history.current;
        h.push(energy);
        h.shift();
        force((n) => n + 1);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [energy]);

  const pct = Math.min(100, Math.round(energy * 140));
  const h = history.current;
  const max = Math.max(0.04, ...h);
  const points = h
    .map((v, i) => {
      const x = (i / (h.length - 1)) * 100;
      const y = 100 - (v / max) * 100;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="w-64 border border-glow-500/25 bg-void-ink/70 p-4 font-mono backdrop-blur-md">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-glow-200">
          <Activity className="h-3 w-3" />
          Anomaly Energy
        </span>
        <span className="flex items-center gap-1 text-[9px] uppercase tracking-[0.2em] text-void-steel">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              paused ? "bg-void-steel" : "animate-pulse-soft bg-glow-400"
            }`}
          />
          {paused ? "Hold" : "Rec"}
        </span>
      </div>

      {/* Rolling sparkline of the GPU luminance probe. */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="mt-3 h-14 w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(52,182,241,0.45)" />
            <stop offset="100%" stopColor="rgba(52,182,241,0)" />
          </linearGradient>
        </defs>
        <polygon points={`0,100 ${points} 100,100`} fill="url(#spark)" />
        <polyline
          points={points}
          fill="none"
          stroke="rgb(111,208,251)"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-2xl font-bold tabular-nums text-glow-100">
          {pct}
          <span className="ml-0.5 text-xs text-void-steel">%</span>
        </span>
        <span className="text-[9px] uppercase tracking-[0.22em] text-void-steel">
          flux index
        </span>
      </div>
      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-void-slate">
        <div
          className="h-full rounded-full bg-gradient-to-r from-glow-500 to-glow-200 transition-[width] duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>

      <dl className="mt-4 space-y-1.5 border-t border-glow-500/15 pt-3 text-[10px] uppercase tracking-[0.18em]">
        <Row label="Render" value={`${fpsRef.current || "--"} fps`} />
        <Row label="Lattice" value="Icosahedron · 64" />
        <Row label="Field" value="Simplex 3D" />
        <Row
          label="Source"
          value={
            <span className="inline-flex items-center gap-1">
              <Radio className="h-2.5 w-2.5" />
              Cursor point-light
            </span>
          }
        />
      </dl>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-void-steel">{label}</dt>
      <dd className="text-glow-100">{value}</dd>
    </div>
  );
}
