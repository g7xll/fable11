import { useCallback, useEffect, useRef, useState } from "react";
import { Gem, RotateCcw, Sparkles } from "lucide-react";
import InteractiveShader from "@/components/ui/crystal-shader";
import { CalibrationFader } from "@/components/calibration-fader";
import { SpecimenTelemetry } from "@/components/specimen-telemetry";
import { Goniometer } from "@/components/goniometer";

/** Factory-calibration defaults — the prompt's original prop values. */
const DEFAULTS = {
  cellDensity: 8.0,
  animationSpeed: 0.2,
  warpFactor: 0.6,
  mouseInfluence: 0.15,
};

/**
 * DemoOne — the integration the prompt asks for. `InteractiveShader` is the
 * fixed full-viewport specimen on the stage; everything around it is a quiet
 * crystallography station that steers the four shader uniforms through
 * precision faders and reads the field's live state straight off the GPU.
 */
export default function DemoOne() {
  const [cellDensity, setCellDensity] = useState(DEFAULTS.cellDensity);
  const [animationSpeed, setAnimationSpeed] = useState(DEFAULTS.animationSpeed);
  const [warpFactor, setWarpFactor] = useState(DEFAULTS.warpFactor);
  const [mouseInfluence, setMouseInfluence] = useState(DEFAULTS.mouseInfluence);

  // Live read-out state, throttled so the ~12×/s probe never churns React.
  const [luminance, setLuminance] = useState(0);
  const [rgb, setRgb] = useState<[number, number, number]>([0.5, 0.5, 0.5]);
  const [fps, setFps] = useState(60);
  const [uptime, setUptime] = useState(0);

  const lastPush = useRef(0);
  const handleSample = useCallback(
    (sample: { luminance: number; rgb: [number, number, number] }) => {
      const now = performance.now();
      if (now - lastPush.current > 120) {
        lastPush.current = now;
        setLuminance(sample.luminance);
        setRgb(sample.rgb);
      }
    },
    [],
  );

  // Independent FPS / uptime meter so telemetry stays honest even when the
  // probe is throttled.
  useEffect(() => {
    const start = performance.now();
    let frames = 0;
    let lastTick = start;
    let raf = 0;
    const loop = () => {
      frames += 1;
      const now = performance.now();
      if (now - lastTick >= 500) {
        setFps((frames * 1000) / (now - lastTick));
        frames = 0;
        lastTick = now;
        setUptime((now - start) / 1000);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const reset = useCallback(() => {
    setCellDensity(DEFAULTS.cellDensity);
    setAnimationSpeed(DEFAULTS.animationSpeed);
    setWarpFactor(DEFAULTS.warpFactor);
    setMouseInfluence(DEFAULTS.mouseInfluence);
  }, []);

  const isDefault =
    cellDensity === DEFAULTS.cellDensity &&
    animationSpeed === DEFAULTS.animationSpeed &&
    warpFactor === DEFAULTS.warpFactor &&
    mouseInfluence === DEFAULTS.mouseInfluence;

  return (
    <div className="specimen-grain specimen-vignette relative min-h-svh w-full overflow-hidden text-frost-50">
      {/* The shader IS the specimen — fixed, full-viewport, behind everything. */}
      <InteractiveShader
        cellDensity={cellDensity}
        animationSpeed={animationSpeed}
        warpFactor={warpFactor}
        mouseInfluence={mouseInfluence}
        onSample={handleSample}
      />

      {/* Caliper frame — corner brackets that seat the field as an instrument. */}
      <div className="pointer-events-none fixed inset-3 z-10 sm:inset-5">
        <Bracket className="left-0 top-0 border-l-2 border-t-2" />
        <Bracket className="right-0 top-0 border-r-2 border-t-2" />
        <Bracket className="bottom-0 left-0 border-b-2 border-l-2" />
        <Bracket className="bottom-0 right-0 border-b-2 border-r-2" />
      </div>

      {/* Top instrument bar */}
      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-3 px-5 py-5 sm:px-8 sm:py-7">
        <div className="flex animate-rise items-center gap-3">
          <span className="grid h-9 w-9 place-items-center border border-cryo-teal/40 bg-obsidian-900/55 backdrop-blur-md">
            <Gem className="h-4 w-4 text-cryo-teal" />
          </span>
          <div className="leading-tight">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-frost-100">
              Cryolite Lab
            </p>
            <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-frost-400">
              Specimen VN-04 · Voronoi Lattice
            </p>
          </div>
        </div>

        <span className="hidden items-center gap-2 border border-cryo-teal/25 bg-obsidian-900/55 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-frost-100 backdrop-blur-md sm:flex">
          <span className="h-1.5 w-1.5 animate-ice-pulse rounded-full bg-cryo-teal" />
          WebGL · Live
        </span>
      </header>

      {/* Hero lockup — framed by the goniometer reticle. */}
      <main className="pointer-events-none relative z-10 flex min-h-svh flex-col items-center justify-center px-6 text-center">
        <div className="relative">
          <Goniometer />
          <p className="animate-rise font-mono text-[11px] uppercase tracking-ultra text-cryo-teal [animation-delay:140ms]">
            Voronoi · Warped · Interactive
          </p>
          <h1 className="mt-5 animate-facet font-display text-[clamp(3rem,13vw,9.5rem)] font-light leading-[0.86] tracking-[-0.02em] text-frost-50 [animation-delay:200ms] [text-shadow:0_1px_2px_rgba(6,7,11,0.6),0_2px_70px_rgba(82,224,207,0.32)]">
            Crystal
            <br />
            <span className="italic text-frost-100">Synthesis</span>
          </h1>
          <p className="mx-auto mt-6 max-w-md animate-rise font-sans text-sm leading-relaxed text-frost-200/80 [animation-delay:320ms]">
            A live WebGL specimen. Move the cursor to repel the lattice; tune the
            four calibration axes to grow a different crystal.
          </p>
        </div>
      </main>

      {/* Calibration deck — the prompt's four sliders as a lab control panel. */}
      <section className="fixed inset-x-0 bottom-0 z-30 px-4 pb-5 sm:px-6 sm:pb-7">
        <div className="mx-auto w-full max-w-3xl animate-rise border border-steel/45 bg-obsidian-900/72 backdrop-blur-xl [animation-delay:420ms]">
          {/* Panel header */}
          <div className="relative flex items-center justify-between gap-3 overflow-hidden border-b border-steel/40 px-5 py-3">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-scan-x bg-gradient-to-r from-transparent via-cryo-teal/10 to-transparent"
            />
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-cryo-violet" />
              <h2 className="font-mono text-[11px] uppercase tracking-[0.28em] text-frost-100">
                Calibration Deck
              </h2>
            </div>
            <button
              type="button"
              onClick={reset}
              disabled={isDefault}
              className="flex items-center gap-1.5 border border-steel/50 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-frost-300 transition-colors hover:border-cryo-teal/60 hover:text-cryo-teal focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cryo-teal disabled:cursor-not-allowed disabled:opacity-35"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>

          {/* Faders + telemetry */}
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 px-5 py-5 md:grid-cols-[1fr_auto] md:gap-x-10">
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              <CalibrationFader
                label="Cell Density"
                unit="cells"
                value={cellDensity}
                min={2}
                max={20}
                step={0.1}
                precision={1}
                tint="#67c8f0"
                onChange={setCellDensity}
              />
              <CalibrationFader
                label="Animation Speed"
                unit="×"
                value={animationSpeed}
                min={0}
                max={1}
                step={0.01}
                tint="#52e0cf"
                onChange={setAnimationSpeed}
              />
              <CalibrationFader
                label="Warp Factor"
                unit="dist"
                value={warpFactor}
                min={0}
                max={1}
                step={0.01}
                tint="#9a7bf0"
                onChange={setWarpFactor}
              />
              <CalibrationFader
                label="Mouse Influence"
                unit="repel"
                value={mouseInfluence}
                min={0}
                max={0.5}
                step={0.01}
                tint="#7c5cd4"
                onChange={setMouseInfluence}
              />
            </div>

            {/* Live read-out, hidden on the narrowest screens to keep the deck calm. */}
            <div className="hidden md:block">
              <SpecimenTelemetry
                fps={fps}
                uptime={uptime}
                luminance={luminance}
                rgb={rgb}
                cellDensity={cellDensity}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Bracket({ className }: { className?: string }) {
  return (
    <span
      className={`absolute h-6 w-6 border-cryo-teal/55 ${className ?? ""}`}
      aria-hidden
    />
  );
}
