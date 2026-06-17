import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Compass,
  Crosshair,
  Pause,
  Play,
  RotateCcw,
  Satellite,
  Snowflake,
} from "lucide-react";
import AuroraBorealisShader, {
  type AuroraTelemetry,
} from "@/components/ui/aurora-borealis-shader";
import { cn } from "@/lib/utils";

/**
 * Aurora Watch — the verbatim aurora-borealis shader from the brief, framed as a
 * high-latitude field-station instrument. The shader is the live night sky; the
 * console around it makes the shader's two hidden behaviours legible:
 *
 *   1. The cursor "flare" → tracked by a probe reticle, with the warp center
 *      read out as geomagnetic latitude / longitude.
 *   2. The FBM curtain's brightness → sampled straight off the GPU and mapped to
 *      a 9-step Kp-index gauge (the real geomagnetic-activity scale aurora
 *      forecasters use). The gauge is the page's signature element.
 *
 * The shader component itself stays a pristine `@/components/ui` drop-in; all the
 * instrument framing is composed around it here.
 */

// ── helpers ────────────────────────────────────────────────────────────────

function fmtClock(t: number) {
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Map the shader's measured luminance (around the probe, 0..1) onto a Kp-style
// 0..9 activity index. A gentle gamma lifts the dim mid-range so sweeping from
// the dark upper sky into a bright curtain walks the gauge across its full
// span instead of pinning at the top.
function kpFromBrightness(b: number) {
  const shaped = Math.pow(Math.min(1, Math.max(0, b)), 0.8);
  return Math.min(9, shaped * 9);
}

const KP_BANDS = [
  { max: 2, label: "Quiet", tone: "var(--frost)" },
  { max: 4, label: "Unsettled", tone: "var(--ice)" },
  { max: 6, label: "Active", tone: "var(--aurora)" },
  { max: 8, label: "Storm", tone: "var(--violet)" },
  { max: 9.01, label: "Severe", tone: "#ff7ad1" },
];

function kpBand(kp: number) {
  return KP_BANDS.find((b) => kp < b.max) ?? KP_BANDS[KP_BANDS.length - 1];
}

// Convert the warp center (0..1) to a station-style geographic readout, with the
// observatory pinned near Tromsø in the auroral oval.
function geo(mouseX: number, mouseY: number) {
  const lat = 66 + mouseY * 12; // 66°N .. 78°N
  const lon = -20 + mouseX * 60; // 20°W .. 40°E
  const fmt = (v: number, pos: string, neg: string) =>
    `${Math.abs(v).toFixed(1)}° ${v >= 0 ? pos : neg}`;
  return { lat: fmt(lat, "N", "S"), lon: fmt(lon, "E", "W") };
}

// ── component ────────────────────────────────────────────────────────────────

export default function App() {
  const [paused, setPaused] = useState(false);
  const [shaderKey, setShaderKey] = useState(0); // remount to reset the clock
  const [armed, setArmed] = useState(false); // load-sequence gate

  // Telemetry lands in a ref every frame; flushed to React on a throttled timer
  // so readouts stay live without re-rendering 60×/sec.
  const telemetryRef = useRef<AuroraTelemetry>({
    time: 0,
    fps: 60,
    mouseX: 0,
    mouseY: 0,
    brightness: 0,
  });
  const [display, setDisplay] = useState<AuroraTelemetry>(telemetryRef.current);
  const reticleRef = useRef<HTMLDivElement>(null);

  const onFrame = useCallback((t: AuroraTelemetry) => {
    telemetryRef.current = t;
    // Move the probe reticle imperatively for buttery tracking of the flare.
    const r = reticleRef.current;
    if (r) {
      r.style.left = `${t.mouseX * 100}%`;
      r.style.top = `${(1 - t.mouseY) * 100}%`; // mouseY is bottom-origin → flip
    }
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setDisplay({ ...telemetryRef.current }), 100);
    return () => window.clearInterval(id);
  }, []);

  // Arm the console shortly after mount so the reveal choreography plays.
  useEffect(() => {
    const id = window.setTimeout(() => setArmed(true), 120);
    return () => window.clearTimeout(id);
  }, []);

  const reset = () => {
    telemetryRef.current = { ...telemetryRef.current, time: 0 };
    setPaused(false);
    setShaderKey((k) => k + 1);
  };

  const kp = useMemo(() => kpFromBrightness(display.brightness), [display.brightness]);
  const band = kpBand(kp);
  const { lat, lon } = geo(display.mouseX, display.mouseY);
  const tracking = display.mouseX > 0.001 || display.mouseY > 0.001;

  return (
    <main className="relative h-screen w-screen overflow-hidden font-body text-ice">
      {/* Verbatim shader background */}
      <AuroraBorealisShader key={shaderKey} paused={paused} onFrame={onFrame} />

      {/* Probe reticle aligned to the shader's cursor flare */}
      <div
        ref={reticleRef}
        aria-hidden
        className="pointer-events-none fixed z-20 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500"
        style={{ left: "0%", top: "100%", opacity: armed ? 1 : 0 }}
      >
        <div className="relative h-28 w-28">
          <div className="absolute inset-0 rounded-full border border-ice/25" />
          <div
            className="absolute inset-[22px] rounded-full border border-aurora/45"
            style={{ animation: "probe-spin 18s linear infinite" }}
          />
          <div className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-ice/55" />
          <div className="absolute bottom-0 left-1/2 h-4 w-px -translate-x-1/2 bg-ice/55" />
          <div className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-ice/55" />
          <div className="absolute right-0 top-1/2 h-px w-4 -translate-y-1/2 bg-ice/55" />
          <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-aurora shadow-[0_0_14px_3px_rgba(63,240,168,0.85)]" />
        </div>
      </div>

      {/* ── HUD layer ─────────────────────────────────────────────────────── */}
      <div className="pointer-events-none relative z-10 flex h-full flex-col">
        <Brackets armed={armed} />

        {/* Top bar */}
        <header
          className={cn(
            "flex items-start justify-between px-5 pt-5 sm:px-9 sm:pt-7",
            armed ? "reveal" : "opacity-0",
          )}
          style={{ animationDelay: "0.15s" }}
        >
          <div className="flex items-center gap-3">
            <Snowflake className="h-4 w-4 text-ice" strokeWidth={1.5} />
            <div className="leading-tight">
              <div className="font-mono text-[11px] uppercase tracking-[0.34em] text-frost">
                Aurora Watch
              </div>
              <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-frost/60">
                Sta. KIRUNA-7 · 67°51′N
              </div>
            </div>
          </div>
          <div className="hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-frost sm:flex">
            <span
              className={cn(
                "inline-block h-1.5 w-1.5 rounded-full",
                tracking ? "bg-aurora" : "bg-frost",
              )}
              style={{ animation: "blip 1.6s ease-in-out infinite" }}
            />
            {tracking ? "Probe engaged" : "Sky idle"}
          </div>
        </header>

        {/* Centerpiece — the thesis */}
        <section className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <p
            className={cn(
              "mb-5 font-mono text-[11px] uppercase tracking-[0.5em] text-aurora/85",
              armed ? "reveal" : "opacity-0",
            )}
            style={{ animationDelay: "0.4s" }}
          >
            Live geomagnetic sky · 60° N
          </p>
          <h1
            className="font-display text-[clamp(2.6rem,11vw,8.5rem)] font-medium leading-[0.9] text-white"
            style={{
              animation: armed ? "title-blur 1.1s cubic-bezier(0.16,1,0.3,1) 0.3s both" : "none",
              opacity: armed ? undefined : 0,
              textShadow: "0 0 52px rgba(63,240,168,0.32), 0 0 90px rgba(176,107,255,0.22)",
            }}
          >
            Aurora
            <br />
            <span className="bg-gradient-to-r from-aurora via-ice to-violet bg-clip-text text-transparent">
              Borealis
            </span>
          </h1>
          <p
            className={cn(
              "mt-6 max-w-md font-body text-sm leading-relaxed text-frost sm:text-base",
              armed ? "reveal" : "opacity-0",
            )}
            style={{ animationDelay: "0.7s" }}
          >
            An interactive WebGL shader. Sweep your cursor across the night to draw
            a solar-wind flare through the curtain — the Kp gauge reads the light
            you raise.
          </p>

          {/* Controls */}
          <div
            className={cn(
              "pointer-events-auto mt-9 flex flex-wrap items-center justify-center gap-3",
              armed ? "reveal" : "opacity-0",
            )}
            style={{ animationDelay: "0.9s" }}
          >
            <button
              onClick={() => setPaused((p) => !p)}
              className="group inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--glass)] px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.18em] text-white backdrop-blur-md transition hover:border-aurora/60 hover:bg-aurora/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aurora"
              aria-pressed={paused}
            >
              {paused ? (
                <Play className="h-3.5 w-3.5 text-aurora" strokeWidth={2} />
              ) : (
                <Pause className="h-3.5 w-3.5 text-ice" strokeWidth={2} />
              )}
              {paused ? "Resume sky" : "Hold sky"}
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--line-soft)] bg-[var(--glass)] px-5 py-2.5 font-mono text-[12px] uppercase tracking-[0.18em] text-frost backdrop-blur-md transition hover:border-[var(--line)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ice"
            >
              <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
              Recalibrate
            </button>
          </div>
        </section>

        {/* Right rail — the signature Kp-index gauge */}
        <KpGauge armed={armed} kp={kp} band={band} />

        {/* Bottom telemetry strip */}
        <footer
          className={cn(
            "grid grid-cols-2 gap-px overflow-hidden border-t border-[var(--line-soft)] bg-[var(--line-soft)] sm:grid-cols-4",
            armed ? "reveal" : "opacity-0",
          )}
          style={{ animationDelay: "0.6s" }}
        >
          <Readout
            icon={<Activity className="h-3.5 w-3.5 text-aurora" strokeWidth={1.8} />}
            label="Render rate"
            value={`${display.fps.toFixed(0)} fps`}
          />
          <Readout
            icon={<Satellite className="h-3.5 w-3.5 text-ice" strokeWidth={1.8} />}
            label="Sky clock"
            value={fmtClock(display.time)}
            mono
          />
          <Readout
            icon={<Compass className="h-3.5 w-3.5 text-violet" strokeWidth={1.8} />}
            label="Probe latitude"
            value={lat}
            mono
          />
          <Readout
            icon={<Crosshair className="h-3.5 w-3.5 text-aurora" strokeWidth={1.8} />}
            label="Probe longitude"
            value={lon}
            mono
          />
        </footer>
      </div>
    </main>
  );
}

// ── pieces ────────────────────────────────────────────────────────────────

function Brackets({ armed }: { armed: boolean }) {
  const base = "pointer-events-none fixed h-10 w-10 border-ice/35 transition";
  const style = (i: number) =>
    ({
      animation: armed ? "bracket-in 0.7s cubic-bezier(0.16,1,0.3,1) both" : "none",
      animationDelay: `${0.1 + i * 0.08}s`,
      opacity: armed ? undefined : 0,
    }) as const;
  return (
    <>
      <div className={cn(base, "left-4 top-4 border-l border-t")} style={style(0)} />
      <div className={cn(base, "right-4 top-4 border-r border-t")} style={style(1)} />
      <div className={cn(base, "bottom-4 left-4 border-b border-l")} style={style(2)} />
      <div className={cn(base, "bottom-4 right-4 border-b border-r")} style={style(3)} />
    </>
  );
}

const KP_SEGMENTS = Array.from({ length: 9 });

function KpGauge({
  armed,
  kp,
  band,
}: {
  armed: boolean;
  kp: number;
  band: { label: string; tone: string };
}) {
  const lit = Math.round(kp);
  return (
    <div
      className={cn(
        "pointer-events-none fixed right-5 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex",
        armed ? "reveal" : "opacity-0",
      )}
      style={{ animationDelay: "0.5s" }}
    >
      <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-frost [writing-mode:vertical-rl]">
        Kp index
      </span>

      {/* segmented column, built bottom-up so Kp 9 sits at the top */}
      <div className="flex flex-col-reverse gap-1.5">
        {KP_SEGMENTS.map((_, i) => {
          const on = i < lit;
          return (
            <span
              key={i}
              className="h-3 w-7 rounded-[2px] border transition-all duration-300"
              style={{
                borderColor: on ? band.tone : "rgba(130,148,180,0.22)",
                background: on ? band.tone : "transparent",
                boxShadow: on ? `0 0 10px ${band.tone}` : "none",
                opacity: on ? 1 : 0.35,
              }}
            />
          );
        })}
      </div>

      {/* live numeric + band */}
      <div className="mt-1 flex flex-col items-center gap-0.5">
        <span
          className="font-display text-2xl leading-none tabular-nums"
          style={{ color: band.tone }}
        >
          {kp.toFixed(1)}
        </span>
        <span
          className="font-mono text-[9px] uppercase tracking-[0.24em]"
          style={{ color: band.tone }}
        >
          {band.label}
        </span>
      </div>
    </div>
  );
}

function Readout({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 bg-[var(--glacier)]/70 px-4 py-3.5 backdrop-blur-md sm:px-6 sm:py-4">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-[var(--line-soft)] bg-white/[0.03]">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="font-mono text-[9px] uppercase tracking-[0.26em] text-frost">{label}</div>
        <div
          className={cn(
            "truncate text-[15px] text-white",
            mono ? "font-mono tabular-nums" : "font-display",
          )}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
