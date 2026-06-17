import { useCallback, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Github, Grid2x2 } from "lucide-react";
import {
  DitheringShader,
  DitheringShapes,
  DitheringTypes,
  type DitheringShape,
  type DitheringType,
  type DitheringTelemetry,
} from "@/components/ui/dithering-shader";
import Slider from "@/components/Slider";
import ThresholdMatrix from "@/components/ThresholdMatrix";
import { cn } from "@/lib/utils";

/**
 * Simplex — a dithering-shader workbench.
 *
 * The brief's `demo.tsx` is the centerpiece: the ripple dither field fills the
 * viewport with a centered "Simplex" lockup. The integration wraps it as a
 * darkroom/pre-press bench — the control rail drives the shader's uniforms, and
 * the signature panel is the live Bayer threshold matrix doing the quantizing.
 * The page opens on the brief's exact preset; "Reset to brief" returns to it.
 */

// The exact preset from the prompt's demo.tsx.
const BRIEF = {
  shape: "ripple" as DitheringShape,
  type: "2x2" as DitheringType,
  colorBack: "#330000",
  colorFront: "#ffff00",
  pxSize: 2,
  speed: 1.2,
};

const SHAPE_ORDER = Object.keys(DitheringShapes) as DitheringShape[];
const TYPE_ORDER = Object.keys(DitheringTypes) as DitheringType[];
const TYPE_LABEL: Record<DitheringType, string> = {
  random: "Noise",
  "2x2": "2×2",
  "4x4": "4×4",
  "8x8": "8×8",
};

export default function App() {
  const [shape, setShape] = useState<DitheringShape>(BRIEF.shape);
  const [type, setType] = useState<DitheringType>(BRIEF.type);
  const [pxSize, setPxSize] = useState(BRIEF.pxSize);
  const [speed, setSpeed] = useState(BRIEF.speed);
  const [paused, setPaused] = useState(false);

  // Telemetry is per-frame; keep it out of React state and write to DOM refs
  // so we don't re-render the tree 60×/sec.
  const fpsRef = useRef<HTMLSpanElement | null>(null);
  const timeRef = useRef<HTMLSpanElement | null>(null);
  const resRef = useRef<HTMLSpanElement | null>(null);
  const cellsRef = useRef<HTMLSpanElement | null>(null);
  const barRef = useRef<HTMLSpanElement | null>(null);
  const lastPaint = useRef(0);

  const handleTelemetry = useCallback((t: DitheringTelemetry) => {
    const now = performance.now();
    if (now - lastPaint.current < 90) return;
    lastPaint.current = now;
    if (fpsRef.current) fpsRef.current.textContent = String(t.fps).padStart(2, "0");
    if (timeRef.current) timeRef.current.textContent = t.time.toFixed(1).padStart(5, "0");
    if (resRef.current) resRef.current.textContent = `${t.width}×${t.height}`;
    if (barRef.current)
      barRef.current.style.width = `${Math.min(100, (t.fps / 60) * 100)}%`;
  }, []);

  // How many device pixels each dither cell covers right now (informational).
  const cellNote = useMemo(() => `${pxSize}px`, [pxSize]);
  // Keep the static "cells" readout in sync with pxSize on the next paint.
  if (cellsRef.current) cellsRef.current.textContent = cellNote;

  const isBrief =
    shape === BRIEF.shape &&
    type === BRIEF.type &&
    pxSize === BRIEF.pxSize &&
    speed === BRIEF.speed;

  const resetToBrief = () => {
    setShape(BRIEF.shape);
    setType(BRIEF.type);
    setPxSize(BRIEF.pxSize);
    setSpeed(BRIEF.speed);
    setPaused(false);
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-oxblood text-bone">
      {/* ── Hero: the brief's demo.tsx, full-bleed ───────────────────────── */}
      <div className="absolute inset-0 z-0">
        <DitheringShader
          shape={shape}
          type={type}
          colorBack={BRIEF.colorBack}
          colorFront={BRIEF.colorFront}
          pxSize={pxSize}
          speed={speed}
          fill="window"
          paused={paused}
          onTelemetry={handleTelemetry}
          className="absolute inset-0"
        />
        {/* The brief's centered lockup. */}
        <span
          className="animate-develop pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-pre-wrap text-center font-display text-[clamp(3.5rem,14vw,9rem)] font-semibold leading-none tracking-tighter text-bone"
          style={{ textShadow: "0 2px 40px rgba(22,6,10,0.65)" }}
        >
          Simplex
        </span>
      </div>

      {/* Vignette so the chrome stays readable over bright dither bursts. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 45%, transparent 38%, rgba(8,3,5,0.72) 100%)",
        }}
      />

      {/* ── Top bar: wordmark + the shader's identity line ───────────────── */}
      <header className="animate-rise fixed inset-x-0 top-0 z-20 flex items-start justify-between gap-4 px-6 py-5 sm:px-9">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-md border border-line-strong bg-glass backdrop-blur">
            <BayerGlyph />
          </span>
          <div className="leading-none">
            <p className="font-display text-base font-bold tracking-tight text-bone">
              SIMPLEX
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.28em] text-ash">
              Dither Bench
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ash sm:flex">
            <span
              className={cn(
                "inline-block h-1.5 w-1.5 rounded-full",
                paused ? "bg-ash" : "animate-pulse bg-amber",
              )}
            />
            {paused ? "Frozen" : "Live · WebGL2"}
          </span>
          <a
            href="https://github.com/pulkitxm/claude-directory"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="View source on GitHub"
            className="grid h-8 w-8 place-items-center rounded-md border border-line bg-glass text-ash backdrop-blur transition-colors hover:border-amber/50 hover:text-bone"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </header>

      {/* ── Caption: name the technique plainly, top-left under the bar ──── */}
      <section className="animate-rise pointer-events-none fixed left-6 top-24 z-20 max-w-xs [animation-delay:120ms] sm:left-9 sm:top-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-amber">
          Ordered dithering · GLSL ES 3.0
        </p>
        <p className="mt-3 hidden font-body text-sm leading-relaxed text-bone/70 sm:block">
          A continuous field — ripple, simplex, swirl — crushed through a Bayer
          threshold matrix into two tones of ink. No textures. Just a per-pixel
          comparison, run on the GPU.
        </p>
      </section>

      {/* ── Signature: the live threshold matrix ─────────────────────────── */}
      <aside className="animate-rise fixed left-6 top-1/2 z-20 hidden w-[210px] -translate-y-1/2 [animation-delay:260ms] lg:block">
        <div className="halftone rounded-xl border border-line bg-glass p-4 backdrop-blur-xl">
          <ThresholdMatrix type={type} />
          <p className="mt-3 border-t border-line pt-3 font-mono text-[9px] leading-relaxed text-ash">
            The grid the shader indexes per pixel: brighter cell = higher
            threshold. Drag <span className="text-amber">Matrix</span> to swap it.
          </p>
        </div>
      </aside>

      {/* ── Control rail: wired straight to the shader uniforms ──────────── */}
      <aside className="animate-rise fixed bottom-5 left-1/2 z-20 w-[calc(100vw-2rem)] max-w-[420px] -translate-x-1/2 [animation-delay:340ms] sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0">
        <div className="rounded-2xl border border-line-strong bg-glass p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-ash">
              Dither controls
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetToBrief}
                disabled={isBrief && !paused}
                aria-label="Reset to the brief preset"
                title="Reset to brief"
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-md border text-bone transition-colors",
                  isBrief && !paused
                    ? "border-line text-ash"
                    : "border-line hover:border-amber/50",
                )}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPaused((v) => !v)}
                aria-pressed={paused}
                aria-label={paused ? "Resume animation" : "Pause animation"}
                className="grid h-7 w-7 place-items-center rounded-md border border-line text-bone transition-colors hover:border-amber/50"
              >
                {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Shape — the continuous field fed into the dither. */}
          <div className="mt-5">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
              Field
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {SHAPE_ORDER.map((s) => (
                <Chip key={s} active={shape === s} onClick={() => setShape(s)}>
                  {s}
                </Chip>
              ))}
            </div>
          </div>

          {/* Matrix — the ordered-dither kernel. */}
          <div className="mt-4">
            <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
              <Grid2x2 className="h-3 w-3" /> Matrix
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {TYPE_ORDER.map((t) => (
                <Chip key={t} active={type === t} onClick={() => setType(t)}>
                  {TYPE_LABEL[t]}
                </Chip>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <Slider
              label="Pixel size"
              value={pxSize}
              min={1}
              max={10}
              step={1}
              display={`${pxSize}px`}
              onChange={(v) => setPxSize(Math.round(v))}
            />
            <Slider
              label="Speed"
              value={speed}
              min={0}
              max={3}
              step={0.1}
              display={`${speed.toFixed(1)}×`}
              onChange={setSpeed}
            />
          </div>

          {/* ── Telemetry strip straight off the render loop ─────────────── */}
          <div className="mt-5 grid grid-cols-4 gap-2 border-t border-line pt-4">
            <Readout k="fps">
              <span ref={fpsRef} className="tabular-nums text-bone">00</span>
            </Readout>
            <Readout k="time">
              <span className="tabular-nums text-bone">
                <span ref={timeRef}>000.0</span>s
              </span>
            </Readout>
            <Readout k="cell">
              <span ref={cellsRef} className="tabular-nums text-bone">
                {cellNote}
              </span>
            </Readout>
            <Readout k="buffer">
              <span ref={resRef} className="text-[10px] tabular-nums text-bone">—</span>
            </Readout>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-line">
            <span
              ref={barRef}
              className="block h-full rounded-full bg-amber"
              style={{ width: "0%" }}
            />
          </div>
        </div>
      </aside>
    </main>
  );
}

/* ── Small parts ─────────────────────────────────────────────────────────── */

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-md border px-1.5 py-1.5 font-mono text-[10px] capitalize tracking-tight transition-colors",
        active
          ? "border-amber/60 bg-amber/15 text-amber"
          : "border-line text-ash hover:border-line-strong hover:text-bone",
      )}
    >
      {children}
    </button>
  );
}

function Readout({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-ash">{k}</span>
      <span className="font-mono text-xs">{children}</span>
    </div>
  );
}

/** A 2×2 Bayer glyph for the wordmark — the matrix in miniature. */
function BayerGlyph() {
  return (
    <span aria-hidden className="grid grid-cols-2 gap-px">
      {[0.95, 0.35, 0.2, 0.7].map((a, i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-[1px]"
          style={{ backgroundColor: `rgba(255,212,0,${a})` }}
        />
      ))}
    </span>
  );
}
