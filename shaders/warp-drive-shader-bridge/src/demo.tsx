import { useCallback, useRef, useState } from "react";
import WarpDriveShader, {
  type WarpDriveFrame,
} from "@/components/ui/warp-drive-shader";
import { NavReticle } from "@/components/nav-reticle";
import { HelmConsole } from "@/components/helm-console";
import {
  BriefSection,
  SetupSection,
  UsageSection,
  ApiSection,
  ConsoleFooter,
} from "@/components/showcase-sections";

/**
 * DemoOne — the integration showcase for the Warp Drive shader.
 *
 * The page is framed as a starship bridge: the brief's <WarpDriveShader /> runs
 * fixed behind everything as the canopy view, while the foreground is a glass
 * console reading the shader's own live state — a heading/warp reticle locked to
 * the tunnel's vanishing point, and a telemetry strip surfacing the iTime /
 * iMouse / iResolution uniforms. Below the fold is the shadcn + Tailwind +
 * TypeScript integration story.
 */
export default function DemoOne() {
  const [warpSpeed, setWarpSpeed] = useState(1.4);

  const [frame, setFrame] = useState<WarpDriveFrame>({
    time: 0,
    mouse: { x: 0, y: 0 },
    size: { width: 0, height: 0 },
    fps: 0,
  });

  // The shader emits ~20 Hz; we coalesce to animation frames so React state
  // never thrashes faster than the browser paints.
  const pending = useRef<WarpDriveFrame | null>(null);
  const scheduled = useRef(false);
  const handleFrame = useCallback((f: WarpDriveFrame) => {
    pending.current = f;
    if (scheduled.current) return;
    scheduled.current = true;
    requestAnimationFrame(() => {
      scheduled.current = false;
      if (pending.current) setFrame(pending.current);
    });
  }, []);

  return (
    <div id="top" className="console-grain relative min-h-screen w-full bg-void">
      {/* Canopy view: the brief's component, verbatim, fixed behind the page. */}
      <WarpDriveShader warpSpeed={warpSpeed} onFrame={handleFrame} />

      {/* Ambient hyperspace atmosphere + radial vignette so the bright tunnel
          core sits behind legible text. All page chrome, layered over the
          verbatim shader without altering it. */}
      <div className="warp-streaks pointer-events-none fixed inset-0 z-[1] origin-center" aria-hidden />
      <div className="warp-aura pointer-events-none fixed inset-0 z-[1]" aria-hidden />
      <div className="canopy-vignette pointer-events-none fixed inset-0 z-[1]" aria-hidden />

      {/* ------------------------------------------------------------------ */}
      {/* Bridge — above the fold                                            */}
      {/* ------------------------------------------------------------------ */}
      <header className="relative z-10 flex min-h-screen flex-col">
        {/* Top status bar */}
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <div className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-sm border border-helm/40">
              <span className="h-2.5 w-2.5 rounded-full bg-helm shadow-[0_0_10px] shadow-helm/70" />
            </span>
            <span className="font-display text-sm font-bold tracking-[0.25em] text-frost">
              WARP&nbsp;DRIVE
            </span>
            <span className="ml-1 rounded-sm border border-helm/25 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-helm/80">
              ui&nbsp;/&nbsp;shadcn
            </span>
          </div>
          <div className="hidden items-center gap-6 font-mono text-[10px] uppercase tracking-[0.25em] text-haze sm:flex">
            <a href="#integrate" className="transition-colors hover:text-frost">
              Brief
            </a>
            <a href="#integrate" className="transition-colors hover:text-frost">
              Setup
            </a>
            <span className="flex items-center gap-1.5 text-helm">
              <span className="h-1.5 w-1.5 animate-blink rounded-full bg-helm" />
              FTL&nbsp;ONLINE
            </span>
          </div>
        </div>

        {/* Centerpiece: title lockup + reticle gauge */}
        <div className="relative flex flex-1 flex-col items-center justify-center px-6 text-center">
          <span className="animate-fade-up font-mono text-[10px] uppercase tracking-[0.4em] text-helm [animation-delay:0.05s]">
            Interactive WebGL Shader · @/components/ui
          </span>

          <h1 className="animate-fade-up mt-6 font-display text-5xl font-black leading-[0.95] tracking-tight text-frost [animation-delay:0.12s] sm:text-7xl md:text-8xl">
            <span className="block">WARP</span>
            <span className="block bg-gradient-to-r from-helm via-frost to-warp bg-clip-text text-transparent">
              DRIVE
            </span>
          </h1>

          {/* Signature instrument */}
          <div className="animate-fade-up mt-10 [animation-delay:0.24s]">
            <NavReticle frame={frame} />
          </div>

          <p className="animate-fade-up mt-8 max-w-md text-[14px] leading-relaxed text-frost/70 [animation-delay:0.3s]">
            Drop one file into{" "}
            <code className="font-mono text-helm">components/ui</code> and your
            whole viewport jumps to hyperspace. Move your pointer to steer the
            tunnel; ride the throttle below.
          </p>

          <div className="animate-fade-up mt-7 flex flex-wrap items-center justify-center gap-3 [animation-delay:0.36s]">
            <a
              href="#integrate"
              className="rounded-md bg-helm px-6 py-3 font-mono text-[12px] font-semibold uppercase tracking-[0.15em] text-void shadow-[0_0_24px] shadow-helm/40 transition-transform hover:-translate-y-0.5"
            >
              Integrate the drive
            </a>
            <a
              href="#integrate"
              className="rounded-md border border-helm/30 px-6 py-3 font-mono text-[12px] uppercase tracking-[0.15em] text-frost transition-colors hover:border-helm/60 hover:bg-helm/5"
            >
              Read the brief
            </a>
          </div>
        </div>

        {/* Helm console docked at the bottom of the bridge */}
        <div className="mx-auto w-full max-w-3xl px-6 pb-10 sm:px-10">
          <HelmConsole
            frame={frame}
            warpSpeed={warpSpeed}
            onWarpSpeed={setWarpSpeed}
          />
          <div className="mt-4 flex items-center justify-center gap-2 font-mono text-[9px] uppercase tracking-[0.35em] text-haze">
            <span className="h-px w-6 bg-haze/40" />
            scroll to integrate
            <span className="h-px w-6 bg-haze/40" />
          </div>
        </div>

        {/* Canopy corner brackets */}
        <span className="corner-bracket left-4 top-16 border-l-2 border-t-2" />
        <span className="corner-bracket right-4 top-16 border-r-2 border-t-2" />
        <span className="corner-bracket bottom-4 left-4 border-b-2 border-l-2" />
        <span className="corner-bracket bottom-4 right-4 border-b-2 border-r-2" />
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Integration story — below the fold (solid backdrop)                */}
      {/* ------------------------------------------------------------------ */}
      <main className="relative z-10 bg-void/85 backdrop-blur-[2px]">
        <BriefSection />
        <SetupSection />
        <UsageSection />
        <ApiSection />
        <ConsoleFooter />
      </main>
    </div>
  );
}
