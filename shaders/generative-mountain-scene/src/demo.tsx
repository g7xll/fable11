import { Suspense } from "react";
import GenerativeMountainScene from "@/components/ui/mountain-scene";

/**
 * The canonical demo from the integration brief: the scene filling a full-bleed
 * dark stage, wrapped in a Suspense boundary. Reproduced faithfully and reused
 * live as the hero stage in the showcase (only the fixed `h-screen` is relaxed
 * to `h-full` so it can sit inside a framed instrument window).
 */
export default function DemoOne() {
  return (
    <main className="relative h-full w-full overflow-hidden bg-[#0f172a] text-slate-100">
      <Suspense fallback={<div className="h-full w-full bg-[#0f172a]" />}>
        <GenerativeMountainScene />
      </Suspense>
    </main>
  );
}
