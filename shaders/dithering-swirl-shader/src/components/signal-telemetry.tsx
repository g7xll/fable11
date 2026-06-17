import { useEffect, useRef, useState } from "react";
import { Activity, Gauge, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignalTelemetryProps {
  /** Lit-pixel fraction (0–1) sampled off the GL framebuffer. */
  coverage: number;
  /** Frames per second, measured from rAF in the parent. */
  fps: number;
  /** Seconds the shader clock has been running. */
  uptime: number;
  className?: string;
}

const TRACE_POINTS = 48;

/**
 * Signature readout: every number here tracks the live shader. `coverage` is
 * read straight off the GPU (fraction of phosphor-lit pixels), FPS/uptime come
 * from the render loop, and the trace is the rolling coverage history — so the
 * panel literally breathes with the swirl beneath it.
 */
export function SignalTelemetry({
  coverage,
  fps,
  uptime,
  className,
}: SignalTelemetryProps) {
  const [history, setHistory] = useState<number[]>(() =>
    new Array(TRACE_POINTS).fill(0),
  );
  const covRef = useRef(coverage);
  covRef.current = coverage;

  useEffect(() => {
    const id = window.setInterval(() => {
      setHistory((h) => [...h.slice(1), covRef.current]);
    }, 110);
    return () => window.clearInterval(id);
  }, []);

  const litPct = Math.round(coverage * 100);
  // Beam current — a playful CRT analogue: more lit phosphor draws more "mA".
  const beam = (0.4 + coverage * 2.6).toFixed(2);
  const mins = Math.floor(uptime / 60);
  const secs = Math.floor(uptime % 60);
  const clock = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const path = history
    .map((v, i) => {
      const x = (i / (TRACE_POINTS - 1)) * 100;
      const y = 28 - v * 26;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <div
      className={cn(
        "panel w-64 rounded-md p-4 font-mono text-cyan-100",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-cyan-300">
          <Radio className="h-3.5 w-3.5" />
          Ink Telemetry
        </span>
        <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-cyan-500">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-cyan-400 shadow-[0_0_8px_#00ffff]" />
          Live
        </span>
      </div>

      {/* Rolling coverage trace */}
      <div className="mt-3 rounded-sm border border-cyan-400/15 bg-ink/60 p-2">
        <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-12 w-full">
          <defs>
            <linearGradient id="trace-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(0,255,255,0.35)" />
              <stop offset="100%" stopColor="rgba(0,255,255,0)" />
            </linearGradient>
          </defs>
          {[7, 14, 21].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="rgba(0,255,255,0.08)"
              strokeWidth="0.4"
            />
          ))}
          <path d={`${path} L100,30 L0,30 Z`} fill="url(#trace-fill)" />
          <path
            d={path}
            fill="none"
            stroke="#00ffff"
            strokeWidth="1"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5">
        <Stat
          icon={<Gauge className="h-3 w-3" />}
          label="Coverage"
          value={`${litPct}%`}
        />
        <Stat
          icon={<Activity className="h-3 w-3" />}
          label="Ink"
          value={`${beam} pt`}
        />
        <Stat label="Render" value={`${Math.round(fps)} fps`} />
        <Stat label="Uptime" value={clock} />
      </dl>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="flex items-center gap-1 text-[9px] uppercase tracking-[0.18em] text-cyan-500">
        {icon}
        {label}
      </dt>
      <dd className="text-sm font-medium tabular-nums text-cyan-50 phosphor-soft">
        {value}
      </dd>
    </div>
  );
}
