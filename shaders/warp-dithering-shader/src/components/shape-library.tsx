import { cn } from "@/lib/utils";
import { ResponsiveDither } from "@/components/responsive-dither";
import { CornerBrackets } from "@/components/chrome";
import { SHAPES } from "@/lib/shader-meta";
import type { LiveParams } from "@/lib/shader-meta";
import type { DitheringShape } from "@/components/ui/dithering-shader";

interface ShapeLibraryProps {
  params: LiveParams;
  onSelect: (shape: DitheringShape) => void;
}

/**
 * Seven live tiles — the very same <DitheringShader />, one per shape, all
 * inheriting the console's current dither/colour/pixel settings so the grid
 * doubles as a preview of how the active look reads across every field.
 */
export function ShapeLibrary({ params, onSelect }: ShapeLibraryProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SHAPES.map((shape) => {
        const active = shape.id === params.shape;
        const tileParams: LiveParams = { ...params, shape: shape.id };
        return (
          <button
            key={shape.id}
            type="button"
            data-specimen={shape.id}
            aria-pressed={active}
            onClick={() => onSelect(shape.id)}
            className={cn(
              "group relative flex flex-col overflow-hidden border bg-ink text-left transition-colors",
              active
                ? "border-amber shadow-phosphor"
                : "border-border/70 hover:border-amber/50"
            )}
          >
            <div className="relative aspect-[5/3] w-full overflow-hidden">
              <ResponsiveDither
                params={tileParams}
                className="absolute inset-0"
                rootMargin="220px"
                debounce={150}
              />
              <div className="crt-scanlines pointer-events-none absolute inset-0 opacity-40" />
              <CornerBrackets tone={active ? "amber" : "ash"} />
              <span className="absolute left-2 top-2 font-mono text-[10px] uppercase tracking-widest2 text-bone/90 mix-blend-difference">
                u_shape {shape.uniform}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-1 border-t border-border/70 p-3">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-semibold text-bone">
                  {shape.label}
                </span>
                {active ? (
                  <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest2 text-amber">
                    <span className="h-1.5 w-1.5 animate-blink bg-amber" /> live
                  </span>
                ) : (
                  <span className="font-mono text-[9px] uppercase tracking-widest2 text-ash transition-colors group-hover:text-amber">
                    apply →
                  </span>
                )}
              </div>
              <p className="text-[11px] leading-relaxed text-ash">
                {shape.blurb}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
