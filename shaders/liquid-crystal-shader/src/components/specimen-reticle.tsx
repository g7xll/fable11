/**
 * The signature element: a crossed-polarizer graticule that floats over the
 * shader and tracks the mouse-warp centre. Its degree ticks, crosshair, and
 * the small "interference order" tag tie the abstract bands to the microscopy
 * metaphor — this is the eyepiece you read the specimen through.
 *
 * It is purely decorative and `pointer-events: none`, so it never intercepts
 * the slider or canvas interactions.
 */
import { useMemo } from "react";
import type { InterferenceReading } from "@/lib/birefringence";

interface SpecimenReticleProps {
  /** Mouse-warp centre, normalized; { 0.5, 0.5 } is screen centre. */
  mouse: { x: number; y: number };
  reading: InterferenceReading;
}

export function SpecimenReticle({ mouse, reading }: SpecimenReticleProps) {
  // Mouse y is bottom-up from the shader; flip to top-down screen space.
  const left = `${(mouse.x * 100).toFixed(2)}%`;
  const top = `${((1 - mouse.y) * 100).toFixed(2)}%`;

  // Degree ticks around the ring — every 15°, longer at the cardinal marks.
  const ticks = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        const angle = i * 15;
        const major = angle % 90 === 0;
        return { angle, major };
      }),
    [],
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-20 hidden -translate-x-1/2 -translate-y-1/2 md:block"
      style={{ left, top }}
    >
      <div className="relative h-[260px] w-[260px]">
        {/* Slowly rotating graticule ring. */}
        <svg
          viewBox="0 0 260 260"
          className="absolute inset-0 h-full w-full animate-reticle-spin text-prism-cyan/70"
        >
          <circle
            cx="130"
            cy="130"
            r="112"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.45"
            strokeWidth="1"
          />
          <circle
            cx="130"
            cy="130"
            r="92"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.18"
            strokeWidth="1"
            strokeDasharray="2 5"
          />
          {ticks.map(({ angle, major }) => {
            const rad = (angle * Math.PI) / 180;
            const r1 = 112;
            const r2 = major ? 98 : 105;
            return (
              <line
                key={angle}
                x1={130 + Math.cos(rad) * r1}
                y1={130 + Math.sin(rad) * r1}
                x2={130 + Math.cos(rad) * r2}
                y2={130 + Math.sin(rad) * r2}
                stroke="currentColor"
                strokeOpacity={major ? 0.8 : 0.4}
                strokeWidth={major ? 1.4 : 1}
              />
            );
          })}
        </svg>

        {/* Static crossed-polarizer crosshair with a measured-gap centre. */}
        <svg
          viewBox="0 0 260 260"
          className="absolute inset-0 h-full w-full text-prism-violet"
        >
          <line x1="130" y1="36" x2="130" y2="108" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />
          <line x1="130" y1="152" x2="130" y2="224" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />
          <line x1="36" y1="130" x2="108" y2="130" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />
          <line x1="152" y1="130" x2="224" y2="130" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />
          <circle cx="130" cy="130" r="13" fill="none" stroke="currentColor" strokeOpacity="0.9" strokeWidth="1.2" />
          <circle cx="130" cy="130" r="1.6" fill="currentColor" />
        </svg>

        {/* Interference-order tag pinned to the lower-right of the reticle. */}
        <div className="absolute left-[64%] top-[64%] flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-bench-void/70 px-3 py-1 font-mono text-[10px] uppercase tracking-wider2 text-bench-bone/90 backdrop-blur-sm">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: reading.swatch }}
          />
          ord {reading.order}
        </div>
      </div>
    </div>
  );
}
