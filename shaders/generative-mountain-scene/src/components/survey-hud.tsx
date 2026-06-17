import { Activity, Gauge, MountainSnow, Sun } from "lucide-react";
import type { MountainSceneFrame } from "@/components/ui/mountain-scene";

function pad(n: number, width: number) {
  return Math.max(0, Math.floor(n)).toString().padStart(width, "0");
}

/** Format shader seconds as a stopwatch-style survey clock T+HH:MM:SS. */
function formatClock(seconds: number) {
  const s = Math.max(0, seconds);
  return `T+${pad(s / 3600, 2)}:${pad((s % 3600) / 60, 2)}:${pad(s % 60, 2)}`;
}

/** Signed, fixed-width float so the readouts don't jitter in width. */
function sgn(n: number, digits = 2) {
  const v = n.toFixed(digits);
  return n >= 0 ? `+${v}` : v;
}

interface SurveyHudProps {
  frame: MountainSceneFrame;
  paused: boolean;
}

/**
 * The signature live telemetry strip. Every value here is read straight off the
 * scene's per-frame `onFrame` payload — the elapsed `time` uniform, the smoothed
 * render FPS, the sampling ratio, and the live world position of the mouse-driven
 * point light (which is literally the `pointLightPosition` uniform the fragment
 * shader lights the massif with).
 */
export function SurveyHud({ frame, paused }: SurveyHudProps) {
  const { elapsed, time, fps, light } = frame;

  return (
    <section
      aria-label="Live scene telemetry"
      className="relative overflow-hidden rounded-xl border border-slate-line bg-ink-900/70 backdrop-blur-md"
    >
      <div className="bg-scanlines pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />

      {/* Header row */}
      <div className="flex items-center justify-between border-b border-slate-line/80 px-4 py-2.5">
        <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-haze/55">
          <Activity className="h-3.5 w-3.5 text-glacier" />
          Survey Telemetry
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em]">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              paused ? "bg-altitude" : "animate-pulse-dot bg-contour"
            }`}
          />
          <span className={paused ? "text-altitude" : "text-contour"}>
            {paused ? "drift held" : "streaming"}
          </span>
        </span>
      </div>

      {/* Readout grid */}
      <dl className="grid grid-cols-2 gap-px bg-slate-line/40 sm:grid-cols-3 lg:grid-cols-6">
        <Cell label="Survey clock" icon={<MountainSnow className="h-3 w-3" />} wide>
          <span className="tnum text-glacier">{formatClock(elapsed)}</span>
        </Cell>
        <Cell label="Render" icon={<Gauge className="h-3 w-3" />}>
          <span className="tnum">{fps ? fps.toFixed(0) : "--"}</span>
          <span className="ml-1 text-[10px] text-haze/40">fps</span>
        </Cell>
        <Cell label="Drift · time" icon={<Activity className="h-3 w-3" />}>
          <span className="tnum">{time.toFixed(3)}</span>
        </Cell>
        <Cell label="Light · X" icon={<Sun className="h-3 w-3 text-altitude" />}>
          <span className="tnum text-altitude">{sgn(light.x)}</span>
        </Cell>
        <Cell label="Light · Y">
          <span className="tnum text-altitude">{sgn(light.y)}</span>
        </Cell>
        <Cell label="Light · Z">
          <span className="tnum text-altitude">{sgn(light.z)}</span>
        </Cell>
      </dl>
    </section>
  );
}

function Cell({
  label,
  icon,
  children,
  wide,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`bg-ink-900/85 px-3.5 py-3 ${wide ? "col-span-2 sm:col-span-1" : ""}`}>
      <dt className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-haze/40">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 font-mono text-[15px] font-medium leading-none text-haze">{children}</dd>
    </div>
  );
}
