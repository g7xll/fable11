import { useCallback, useState } from "react";
import { ArrowDown, Github, Grid2x2, Layers, SquareCode } from "lucide-react";
import { ResponsiveDither } from "@/components/responsive-dither";
import { Hud } from "@/components/hud";
import { ControlRail } from "@/components/control-rail";
import { ShapeLibrary } from "@/components/shape-library";
import { DitherMatrices } from "@/components/dither-matrices";
import { PropApi } from "@/components/prop-api";
import { IntegrationDocs } from "@/components/integration-docs";
import { CornerBrackets, SectionHeading } from "@/components/chrome";
import { DEMO_PARAMS, SHAPES } from "@/lib/shader-meta";
import type { LiveParams, Size } from "@/lib/shader-meta";
import type {
  DitheringShape,
  DitheringType,
} from "@/components/ui/dithering-shader";

const RANDOM_BACKS = ["#000033", "#04050b", "#0b0220", "#001018", "#120016"];
const RANDOM_FRONTS = [
  "#ff6600",
  "#00e5ff",
  "#39ff14",
  "#ff2e63",
  "#ffd400",
  "#c084fc",
];

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)] as T;
}

export default function App() {
  const [params, setParams] = useState<LiveParams>(DEMO_PARAMS);
  const [stageSize, setStageSize] = useState<Size>({ width: 0, height: 0 });

  const patch = useCallback((next: Partial<LiveParams>) => {
    setParams((prev) => ({ ...prev, ...next }));
  }, []);

  const reset = useCallback(() => setParams(DEMO_PARAMS), []);

  const randomize = useCallback(() => {
    setParams({
      shape: pick(SHAPES).id,
      type: pick(["random", "2x2", "4x4", "8x8"] as DitheringType[]),
      pxSize: 1 + Math.floor(Math.random() * 9),
      speed: Number((0.3 + Math.random() * 1.2).toFixed(1)),
      colorBack: pick(RANDOM_BACKS),
      colorFront: pick(RANDOM_FRONTS),
    });
  }, []);

  const handleResize = useCallback((size: Size) => setStageSize(size), []);

  const activeShape =
    SHAPES.find((shape) => shape.id === params.shape) ?? SHAPES[0];

  return (
    <div className="min-h-screen bg-ink font-mono text-bone">
      {/* ============================== HERO ============================== */}
      <section className="relative flex h-[100svh] min-h-[680px] w-full overflow-hidden">
        <ResponsiveDither
          params={params}
          onResize={handleResize}
          className="absolute inset-0 z-0 bg-navy"
          rootMargin="160px"
        />

        {/* CRT + vignette veils */}
        <div className="crt-scanlines pointer-events-none absolute inset-0 z-[1] opacity-50" />
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 30%, transparent 35%, rgba(2,3,8,0.55) 100%)",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-24 bg-gradient-to-b from-ink/80 to-transparent" />

        {/* Top status bar */}
        <header className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="stipple flex h-8 w-8 items-center justify-center border border-amber/60" />
            <div className="leading-none">
              <p className="font-display text-sm font-semibold tracking-tight text-bone">
                DITHER<span className="text-amber">LAB</span>
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest2 text-ash">
                DitheringShader · components/ui
              </p>
            </div>
          </div>
          <Hud params={params} size={stageSize} />
        </header>

        {/* Centre wordmark */}
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center">
          <span className="mb-4 inline-flex items-center gap-2 border border-amber/40 bg-ink/50 px-3 py-1 font-mono text-[10px] uppercase tracking-widest2 text-amber backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-blink bg-amber" />
            live webgl2 · {params.type} dither
          </span>
          <h1 className="font-display text-[18vw] font-bold uppercase leading-[0.82] tracking-tighter text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.6)] sm:text-[15vw] lg:text-[12rem]">
            {activeShape.label}
          </h1>
          <p className="mt-4 max-w-md text-balance text-sm leading-relaxed text-bone/80">
            {activeShape.blurb}
          </p>
        </div>

        {/* Bottom driving console */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-4 sm:p-6">
          <ControlRail
            params={params}
            onChange={patch}
            onReset={reset}
            onRandomize={randomize}
          />
        </div>

        <CornerBrackets className="z-[2] p-3" />
      </section>

      {/* ============================ TICKER ============================ */}
      <div className="border-y border-border/70 bg-panel/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest2 text-ash sm:px-6">
          <span className="text-amber">▸ ordered dithering</span>
          <span>7 shape fields</span>
          <span>4 dither kernels</span>
          <span>random + bayer 2×2 / 4×4 / 8×8</span>
          <span className="hidden sm:inline">webgl2 · single fullscreen quad</span>
          <span className="ml-auto hidden text-bone sm:inline">
            component © designali-in
          </span>
        </div>
      </div>

      {/* ========================= SHAPE LIBRARY ========================= */}
      <section className="bg-blueprint border-b border-border/70">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading
            index="01"
            kicker="Shape library"
            title="One component, seven fields"
          >
            The <span className="font-mono text-amber">shape</span> prop swaps the
            procedural field driving the dither. Every tile below is the exact
            same <span className="font-mono">DitheringShader</span> inheriting the
            console's current dither, colours and pixel size — tap one to send it
            to the hero.
          </SectionHeading>
          <ShapeLibrary
            params={params}
            onSelect={(shape: DitheringShape) => patch({ shape })}
          />
        </div>
      </section>

      {/* ========================= DITHER MATRICES ========================= */}
      <section className="border-b border-border/70">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading
            index="02"
            kicker="Dither kernels"
            title="From white noise to Bayer 8×8"
          >
            The <span className="font-mono text-amber">type</span> prop selects how
            the continuous field is thresholded into one bit. The ordered Bayer
            maps below are the literal threshold tables compiled into the shader —
            brighter cells flip on later as a region brightens.
          </SectionHeading>
          <DitherMatrices
            active={params.type}
            onSelect={(type: DitheringType) => patch({ type })}
          />
          <div className="mt-6 flex items-center gap-2 font-mono text-[11px] text-ash">
            <Grid2x2 className="h-3.5 w-3.5 text-amber" />
            tip — drop <span className="text-amber">pxSize</span> on the console to
            shrink the cells and reveal the dithering detail.
          </div>
        </div>
      </section>

      {/* ============================ PROP API ============================ */}
      <section className="bg-blueprint border-b border-border/70">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading
            index="03"
            kicker="Props · uniforms"
            title="The component API, live"
          >
            Each prop forwards straight to a GLSL uniform on a single fullscreen
            quad. The <span className="text-amber">Now</span> column mirrors the
            hero's current state in real time.
          </SectionHeading>
          <PropApi params={params} size={stageSize} />
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: <Layers className="h-4 w-4" />,
                title: "State",
                body: "Stateless on the outside — props in, uniforms out. The lab keeps one params object and debounces it into the verbatim component.",
              },
              {
                icon: <SquareCode className="h-4 w-4" />,
                title: "Assets",
                body: "None. The field is generated entirely in the fragment shader, so there are no images, fonts or textures to ship.",
              },
              {
                icon: <Grid2x2 className="h-4 w-4" />,
                title: "Responsive",
                body: "Pass measured width/height; a ResizeObserver wrapper makes the fixed-size canvas fill any container from hero to thumbnail.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="flex flex-col gap-2 border border-border/70 bg-panel/40 p-4"
              >
                <div className="flex items-center gap-2 text-amber">
                  {card.icon}
                  <span className="font-mono text-[11px] uppercase tracking-widest2">
                    {card.title}
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed text-ash">
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== INTEGRATION ========================== */}
      <section className="border-b border-border/70">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading
            index="04"
            kicker="Integration"
            title="Drop it into a shadcn project"
          >
            Component path resolves to{" "}
            <span className="font-mono text-amber">@/components/ui</span>, styles to{" "}
            <span className="font-mono text-amber">src/index.css</span> — both read
            from <span className="font-mono">components.json</span>.
          </SectionHeading>
          <IntegrationDocs />
        </div>
      </section>

      {/* ============================= FOOTER ============================= */}
      <footer className="bg-ink">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-12 sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-3">
            <span className="stipple flex h-9 w-9 items-center justify-center border border-amber/60" />
            <div className="leading-tight">
              <p className="font-display text-sm font-semibold text-bone">
                DITHER<span className="text-amber">LAB</span>
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest2 text-ash">
                A Claude Fable 5 shader experiment
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 font-mono text-[11px] text-ash">
            <button
              type="button"
              onClick={() =>
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
              className="flex items-center gap-1.5 transition-colors hover:text-amber"
            >
              <ArrowDown className="h-3.5 w-3.5 rotate-180" /> back to top
            </button>
            <a
              href="https://github.com/designali-in"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-amber"
            >
              <Github className="h-3.5 w-3.5" /> designali-in
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
