import { cn } from "@/lib/utils";
import { TYPES } from "@/lib/shader-meta";
import type { TypeInfo } from "@/lib/shader-meta";
import type { DitheringType } from "@/components/ui/dithering-shader";

// Deterministic hash so the "random" tile renders a stable noise field.
function hash(i: number): number {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function MatrixGrid({ info }: { info: TypeInfo }) {
  if (!info.matrix) {
    const cells = Array.from({ length: 64 }, (_, i) => hash(i));
    return (
      <div className="grid aspect-square w-full grid-cols-8 gap-px bg-navy">
        {cells.map((value, i) => (
          <span
            key={i}
            className="bg-amber"
            style={{ opacity: 0.12 + value * 0.85 }}
          />
        ))}
      </div>
    );
  }

  const { matrix, size } = info;
  const max = size * size - 1;
  return (
    <div
      className="grid aspect-square w-full gap-px bg-navy"
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
    >
      {matrix.flat().map((value, i) => (
        <span
          key={i}
          className="flex items-center justify-center bg-amber"
          style={{ opacity: 0.1 + (value / max) * 0.9 }}
        >
          {size <= 4 ? (
            <span className="font-mono text-[9px] text-navy mix-blend-difference">
              {value}
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );
}

interface DitherMatricesProps {
  active: DitheringType;
  onSelect: (type: DitheringType) => void;
}

/**
 * Visualises the four `type` kernels. Bayer cells show their threshold index;
 * the brighter the cell, the later that pixel flips on as the field lightens —
 * exactly the ordering compiled into `getBayerValue` in the shader.
 */
export function DitherMatrices({ active, onSelect }: DitherMatricesProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {TYPES.map((info) => {
        const selected = info.id === active;
        return (
          <button
            key={info.id}
            type="button"
            data-matrix={info.id}
            aria-pressed={selected}
            onClick={() => onSelect(info.id)}
            className={cn(
              "group flex flex-col gap-3 border bg-panel/50 p-4 text-left transition-colors",
              selected
                ? "border-amber shadow-phosphor"
                : "border-border/70 hover:border-amber/50"
            )}
          >
            <div className="relative">
              <MatrixGrid info={info} />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-semibold text-bone">
                  {info.label}
                </span>
                <span
                  className={cn(
                    "font-mono text-[9px] uppercase tracking-widest2",
                    selected
                      ? "text-amber"
                      : "text-ash group-hover:text-amber"
                  )}
                >
                  {selected ? "active" : "set →"}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-ash">
                {info.blurb}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
