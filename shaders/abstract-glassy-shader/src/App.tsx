import { useCallback, useRef, useState } from "react";
import {
  DEFAULT_SETTINGS,
  ShaderComponent,
  type ShaderSettings,
  type ShaderStats,
} from "@/components/ui/abstract-glassy-shader";
import { TopBar } from "@/components/lab/TopBar";
import { HeroPanel } from "@/components/lab/HeroPanel";
import { TelemetryHud } from "@/components/lab/TelemetryHud";
import { ControlDeck } from "@/components/lab/ControlDeck";
import { Docs } from "@/components/lab/sections";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function App() {
  const [settings, setSettings] = useState<ShaderSettings>(() => ({
    ...DEFAULT_SETTINGS,
    paused: prefersReducedMotion(),
  }));

  const statsRef = useRef<ShaderStats>({
    time: 0,
    fps: 60,
    width: 0,
    height: 0,
    blobA: [0.4, 0],
    blobB: [-0.4, 0],
  });

  const onChange = useCallback(
    (patch: Partial<ShaderSettings>) => setSettings((s) => ({ ...s, ...patch })),
    [],
  );
  const onReset = useCallback(() => setSettings({ ...DEFAULT_SETTINGS }), []);
  const onFrame = useCallback((s: ShaderStats) => {
    statsRef.current = s;
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Live shader — fixed, full-viewport, behind everything. */}
      <div className="fixed inset-0 z-0">
        <ShaderComponent settings={settings} onFrame={onFrame} />
      </div>
      {/* Legibility + instrument overlays (never intercept pointer events). */}
      <div className="vignette pointer-events-none fixed inset-0 z-0" />
      <div className="grain pointer-events-none fixed inset-0 z-0" />
      <div className="scanlines pointer-events-none fixed inset-0 z-0 opacity-40" />

      <TopBar />

      {/* HERO — the live viewport screen */}
      <section className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1280px] flex-col justify-between gap-8 px-4 pb-6 pt-24 sm:px-6 sm:pt-28">
        <div className="flex flex-1 items-start justify-between gap-6 pt-2 lg:pt-8">
          <HeroPanel />
          <div className="hidden shrink-0 lg:block">
            <TelemetryHud statsRef={statsRef} settings={settings} />
          </div>
        </div>

        <ControlDeck settings={settings} onChange={onChange} onReset={onReset} />
      </section>

      {/* DOCS — opaque, scrolls over the shader */}
      <Docs />
    </div>
  );
}
