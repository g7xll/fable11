import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownRight,
  Box,
  Compass,
  Layers,
  type LucideIcon,
  MountainSnow,
  MousePointer2,
  Pause,
  Play,
  Sparkles,
  Terminal,
  Triangle,
  Waves,
} from "lucide-react";
import GenerativeMountainScene, {
  type MountainSceneFrame,
} from "@/components/ui/mountain-scene";
import { SurveyHud } from "@/components/survey-hud";
import { CornerBrackets } from "@/components/corner-brackets";
import { CodeBlock } from "@/components/code-block";
import {
  COMPONENT_SOURCE,
  DEMO_SOURCE,
  INSTALL_CMD,
  USAGE_SOURCE,
} from "@/source-snippets";

/** Fictional survey-station framing for the procedural scene. */
const STATION = {
  designation: "GMS-128",
  sector: "Procedural Relief Survey",
  pipeline: "GLSL vertex displacement · simplex 3D",
  grid: "12 × 8 · 128² segments",
  datum: "N 47° 25′ · E 010° 59′",
} as const;

/** Selectable ridge tints — promotes the brief's single `#7dd3fc` to a palette. */
const TINTS: { name: string; value: string }[] = [
  { name: "Glacier", value: "#7dd3fc" },
  { name: "Aurora", value: "#5eead4" },
  { name: "Magma", value: "#fb923c" },
  { name: "Iris", value: "#a5b4fc" },
  { name: "Bone", value: "#e2e8f0" },
];

const EMPTY_FRAME: MountainSceneFrame = {
  elapsed: 0,
  time: 0,
  fps: 0,
  pixelRatio: 1,
  light: { x: 0, y: 2, z: 2 },
};

function App() {
  // Telemetry is written through a ref every frame (60fps) but flushed to React
  // state on a slower cadence so the HUD updates legibly without re-rendering
  // the whole tree on every shader frame.
  const frameRef = useRef<MountainSceneFrame>(EMPTY_FRAME);
  const [telemetry, setTelemetry] = useState<MountainSceneFrame>(EMPTY_FRAME);
  const [paused, setPaused] = useState(false);
  const [tint, setTint] = useState(TINTS[0].value);
  const [booted, setBooted] = useState(false);

  const handleFrame = useCallback((frame: MountainSceneFrame) => {
    frameRef.current = frame;
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTelemetry({ ...frameRef.current });
    }, 120);
    const boot = window.setTimeout(() => setBooted(true), 60);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(boot);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-ink-950 text-haze">
      {/* ───────────────────────── HERO STATION ───────────────────────── */}
      <section className="relative flex min-h-screen flex-col">
        {/* Top instrument bar */}
        <header className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-line/70 bg-ink-950/70 px-5 py-3 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-md border border-slate-line bg-ink-900">
              <MountainSnow className="h-4 w-4 text-glacier" />
            </span>
            <div className="leading-tight">
              <p className="font-display text-[13px] font-semibold tracking-tightest text-haze">
                ORONOMY
              </p>
              <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-haze/45">
                Terrain Survey Station
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 font-mono text-[10.5px] uppercase tracking-[0.16em] text-haze/45">
            <span className="hidden sm:inline">
              Datum <b className="text-haze/75">{STATION.datum}</b>
            </span>
            <span className="hidden h-3 w-px bg-slate-line md:inline" />
            <span>
              Spec <b className="text-glacier">{STATION.designation}</b>
            </span>
          </div>
        </header>

        {/* Live stage frame */}
        <div className="relative flex flex-1 items-stretch px-4 pb-5 pt-5 sm:px-8 sm:pb-8">
          <div
            className={`relative flex-1 overflow-hidden rounded-2xl border border-slate-line bg-[#0f172a] transition-opacity duration-700 ${
              booted ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* The procedural scene (the brief's demo), reused live as the stage. */}
            <GenerativeMountainScene
              baseColor={tint}
              paused={paused}
              onFrame={handleFrame}
              className="absolute inset-0 z-0 h-full w-full"
            />

            {/* Survey-plate chrome layered above the scene. */}
            <div className="bg-survey-grid-fine pointer-events-none absolute inset-0 z-10 opacity-60" aria-hidden="true" />
            <div className="bg-scanlines pointer-events-none absolute inset-0 z-10 opacity-30" aria-hidden="true" />
            <div className="stage-vignette pointer-events-none absolute inset-0 z-10" aria-hidden="true" />
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 animate-scan-sweep bg-gradient-to-b from-glacier/10 to-transparent"
              aria-hidden="true"
            />
            <CornerBrackets className="z-20" size={26} />

            {/* Stage corner labels */}
            <div className="pointer-events-none absolute left-4 top-4 z-20 font-mono text-[10px] uppercase tracking-[0.2em] text-haze/55">
              <span className="text-glacier">●</span> live render
            </div>
            <div className="pointer-events-none absolute right-4 top-4 z-20 font-mono text-[10px] uppercase tracking-[0.18em] text-haze/40">
              {STATION.grid}
            </div>
            <div className="pointer-events-none absolute bottom-4 left-4 z-20 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-haze/45">
              <MousePointer2 className="h-3 w-3 text-altitude" />
              move pointer → relight ridges
            </div>

            {/* Hero lockup — the brief's content, set as an engraved survey plate. */}
            <div className="pointer-events-none absolute inset-0 z-20 flex items-end">
              <div className="w-full px-6 pb-16 sm:px-12 sm:pb-20">
                <div className="max-w-2xl">
                  <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-line/80 bg-ink-950/55 px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.2em] text-glacier backdrop-blur-sm">
                    <Sparkles className="h-3 w-3" />
                    Specimen {STATION.designation} · procedural relief
                  </p>
                  <h1 className="glacier-split font-display text-[clamp(2.6rem,7vw,5.4rem)] font-semibold leading-[0.92] tracking-tightest text-haze">
                    Generative
                    <br />
                    Mountain Scene
                  </h1>
                  <p className="mt-4 max-w-xl text-balance text-[15px] leading-relaxed text-haze/70 sm:text-base">
                    A solid massif raised in real time — a 128² plane pushed along
                    its normal by two octaves of 3D simplex noise, lit by a single
                    point light that follows your cursor across the ridgeline.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Control + telemetry rail under the stage */}
        <div className="relative z-20 px-4 pb-7 sm:px-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <ControlBar
              paused={paused}
              onToggle={() => setPaused((p) => !p)}
              tint={tint}
              onTint={setTint}
            />
            <a
              href="#integration"
              className="group inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-haze/55 transition-colors hover:text-glacier"
            >
              Integration brief
              <ArrowDownRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </a>
          </div>
          <SurveyHud frame={telemetry} paused={paused} />
        </div>
      </section>

      {/* ───────────────────────── INTEGRATION STORY ───────────────────────── */}
      <main
        id="integration"
        className="bg-survey-grid relative border-t border-slate-line/70 bg-ink-950"
      >
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          {/* Section heading */}
          <SectionLabel icon={Box} text="components/ui · drop-in" />
          <h2 className="mt-4 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-tightest text-haze sm:text-[2.6rem]">
            One Three.js component. Solid terrain, no gaps, fully self-contained.
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-haze/65">
            The brief ships a single React component. It mounts its own renderer,
            owns its animation loop, and tears everything down on unmount — so it
            slots straight into a shadcn/Tailwind/TypeScript project under{" "}
            <code className="rounded bg-ink-800 px-1.5 py-0.5 font-mono text-[13px] text-glacier">
              @/components/ui
            </code>
            . The only runtime dependency is <span className="text-haze">three</span>.
          </p>

          {/* Install + scaffold steps */}
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <Step n={1} title="Install the one dependency" icon={Terminal}>
              <p className="mb-3 text-[14px] leading-relaxed text-haze/65">
                Add Three.js and its types. Everything else (React, Tailwind,
                TypeScript) is already part of a shadcn project.
              </p>
              <CodeBlock filename="bash" code={INSTALL_CMD} />
            </Step>
            <Step n={2} title="Why it lives in components/ui" icon={Layers}>
              <p className="text-[14px] leading-relaxed text-haze/65">
                shadcn resolves the <code className="font-mono text-glacier">ui</code>{" "}
                alias to <code className="font-mono text-haze">@/components/ui</code>.
                Dropping <code className="font-mono text-haze">mountain-scene.tsx</code>{" "}
                there means it is importable as{" "}
                <code className="font-mono text-haze">@/components/ui/mountain-scene</code>{" "}
                everywhere, sits beside the rest of your primitives, and stays
                upgrade-safe. If your project doesn't have that folder yet, create
                it — the alias in <code className="font-mono text-haze">components.json</code>{" "}
                expects it.
              </p>
            </Step>
          </div>

          {/* Anatomy */}
          <div className="mt-20">
            <SectionLabel icon={Triangle} text="anatomy of the massif" />
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <AnatomyCard
                icon={Box}
                title="128² displaced plane"
                body="A PlaneGeometry(12, 8, 128, 128) is laid flat (rotated −90°). 16k+ vertices give the ridges enough resolution to read as solid relief."
              />
              <AnatomyCard
                icon={Waves}
                title="Two octaves of simplex"
                body="The vertex shader pushes each vertex along its normal by snoise() at base + 2× frequency, scrolling slowly on the y axis via the time uniform."
              />
              <AnatomyCard
                icon={Compass}
                title="Fresnel + diffuse rim"
                body="The fragment shader lights the surface with Lambert diffuse off the cursor-driven point light, plus a fresnel rim so silhouettes catch the glacier tint."
              />
            </div>
          </div>

          {/* Source tabs */}
          <div className="mt-20">
            <SectionLabel icon={Terminal} text="copy the source" />
            <h3 className="mt-4 font-display text-2xl font-semibold tracking-tightest text-haze">
              Three files, zero config
            </h3>
            <SourceTabs />
          </div>

          {/* Props / uniforms API */}
          <div className="mt-20">
            <SectionLabel icon={Layers} text="props · uniforms" />
            <h3 className="mt-4 font-display text-2xl font-semibold tracking-tightest text-haze">
              API surface
            </h3>
            <div className="mt-6 grid gap-8 lg:grid-cols-2">
              <ApiTable
                caption="Component props"
                rows={[
                  ["baseColor?", "string", `Ridge tint → the color uniform. Default "#7dd3fc".`],
                  ["paused?", "boolean", "Freezes the time uniform's drift. Default false."],
                  ["className?", "string", "Classes for the full-bleed mount div."],
                  ["onFrame?", "(f) => void", "Per-frame telemetry callback (see below)."],
                ]}
              />
              <ApiTable
                caption="onFrame payload · MountainSceneFrame"
                rows={[
                  ["elapsed", "number", "Real unpaused seconds since mount."],
                  ["time", "number", "Raw value of the time uniform (slow drift)."],
                  ["fps", "number", "Smoothed render frames per second."],
                  ["pixelRatio", "number", "Renderer DPR (capped at 2)."],
                  ["light", "{x,y,z}", "World position of the point light."],
                ]}
              />
            </div>
            <p className="mt-6 max-w-2xl text-[13.5px] leading-relaxed text-haze/55">
              The live HUD above is wired to <code className="font-mono text-glacier">onFrame</code>{" "}
              — the survey clock is the <code className="font-mono text-haze">time</code> uniform,
              and the three Light · X/Y/Z readouts are the exact{" "}
              <code className="font-mono text-haze">pointLightPosition</code> vector the fragment
              shader uses to light the terrain.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-line/70 px-5 py-8 sm:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-haze/40 sm:flex-row sm:items-center">
            <span className="flex items-center gap-2">
              <MountainSnow className="h-3.5 w-3.5 text-glacier" />
              ORONOMY · {STATION.sector}
            </span>
            <span>{STATION.pipeline}</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

/* ───────────────────────── Sub-components ───────────────────────── */

function ControlBar({
  paused,
  onToggle,
  tint,
  onTint,
}: {
  paused: boolean;
  onToggle: () => void;
  tint: string;
  onTint: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-line bg-ink-900/80 px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-haze/80 backdrop-blur-sm transition-colors hover:border-glacier/60 hover:text-glacier"
        aria-pressed={paused}
      >
        {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
        {paused ? "Resume drift" : "Freeze drift"}
      </button>

      <div className="flex items-center gap-2 rounded-lg border border-slate-line bg-ink-900/80 px-3 py-1.5 backdrop-blur-sm">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-haze/40">
          Tint
        </span>
        <div className="flex items-center gap-1.5">
          {TINTS.map((t) => {
            const active = t.value === tint;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => onTint(t.value)}
                title={t.name}
                aria-label={`Set ridge tint to ${t.name}`}
                aria-pressed={active}
                className={`h-5 w-5 rounded-full border transition-transform hover:scale-110 ${
                  active ? "border-white" : "border-white/20"
                }`}
                style={{
                  backgroundColor: t.value,
                  boxShadow: active ? `0 0 0 2px rgba(255,255,255,0.18)` : undefined,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-glacier">
      <Icon className="h-3.5 w-3.5" />
      {text}
      <span className="ml-1 h-px w-10 bg-gradient-to-r from-glacier/60 to-transparent" />
    </span>
  );
}

function Step({
  n,
  title,
  icon: Icon,
  children,
}: {
  n: number;
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-line bg-ink-900/40 p-5">
      <div className="mb-3 flex items-center gap-3">
        <span className="grid h-7 w-7 place-items-center rounded-md border border-slate-line bg-ink-950 font-mono text-[12px] text-glacier">
          {n}
        </span>
        <Icon className="h-4 w-4 text-haze/50" />
        <h4 className="font-display text-[15px] font-semibold tracking-tight text-haze">
          {title}
        </h4>
      </div>
      {children}
    </div>
  );
}

function AnatomyCard({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-line bg-ink-900/40 p-5 transition-colors hover:border-glacier/40">
      <div className="bg-contour pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
      <div className="relative">
        <span className="grid h-9 w-9 place-items-center rounded-lg border border-slate-line bg-ink-950 text-glacier">
          <Icon className="h-4 w-4" />
        </span>
        <h4 className="mt-4 font-display text-[16px] font-semibold tracking-tight text-haze">
          {title}
        </h4>
        <p className="mt-2 text-[13.5px] leading-relaxed text-haze/60">{body}</p>
      </div>
    </div>
  );
}

const TABS = [
  { id: "component", label: "mountain-scene.tsx", code: COMPONENT_SOURCE },
  { id: "demo", label: "demo.tsx", code: DEMO_SOURCE },
  { id: "usage", label: "with telemetry", code: USAGE_SOURCE },
] as const;

function SourceTabs() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("component");
  const current = useMemo(() => TABS.find((t) => t.id === active) ?? TABS[0], [active]);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={`rounded-lg border px-3 py-1.5 font-mono text-[11.5px] transition-colors ${
              active === t.id
                ? "border-glacier/60 bg-glacier/10 text-glacier"
                : "border-slate-line bg-ink-900/40 text-haze/55 hover:text-haze"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-3">
        <CodeBlock filename={current.label} code={current.code} />
      </div>
    </div>
  );
}

function ApiTable({
  caption,
  rows,
}: {
  caption: string;
  rows: [string, string, string][];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-line bg-ink-900/40">
      <div className="border-b border-slate-line bg-ink-900/70 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-haze/55">
        {caption}
      </div>
      <table className="w-full text-left">
        <tbody>
          {rows.map(([name, type, desc]) => (
            <tr key={name} className="border-b border-slate-line/50 last:border-0">
              <td className="whitespace-nowrap px-4 py-3 align-top font-mono text-[12.5px] text-glacier">
                {name}
              </td>
              <td className="whitespace-nowrap px-2 py-3 align-top font-mono text-[12px] text-altitude/90">
                {type}
              </td>
              <td className="px-4 py-3 text-[13px] leading-relaxed text-haze/60">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
