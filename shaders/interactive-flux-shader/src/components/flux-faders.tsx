import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * The signature element: the four shader parameters re-skinned as faders milled
 * into a synth module's aluminium faceplate. Each track is engraved, with an
 * amber LED that brightens as the value climbs and a draggable cap. They drive
 * the exact same state the prompt's built-in sliders do — just dressed as the
 * instrument they always wanted to be.
 */

export interface FaderSpec {
  id: string;
  label: string;
  legend: string;
  value: number;
  min: number;
  max: number;
  step: number;
  /** How the value is printed on the cap readout. */
  format: (v: number) => string;
  onChange: (v: number) => void;
}

export function FaderBank({ faders }: { faders: FaderSpec[] }) {
  return (
    <div className="grid gap-5">
      {faders.map((f) => (
        <Fader key={f.id} spec={f} />
      ))}
    </div>
  );
}

function Fader({ spec }: { spec: FaderSpec }) {
  const { label, legend, value, min, max, step, format, onChange } = spec;
  const inputId = useId();
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="group">
      <div className="mb-2 flex items-baseline justify-between">
        <label
          htmlFor={inputId}
          className="font-mono text-[11px] uppercase tracking-wide2 text-ink-100"
        >
          {label}
        </label>
        <span className="font-mono text-[10px] uppercase tracking-wide2 text-ink-400">
          {legend}
        </span>
      </div>

      <div className="relative flex items-center">
        {/* Engraved track. The amber fill is the "signal level" up to the cap. */}
        <div className="relative h-2 w-full rounded-full bg-chassis-950 shadow-[inset_0_1px_2px_rgba(0,0,0,0.9),inset_0_-1px_0_rgba(255,255,255,0.04)] ring-1 ring-black/60">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-dim to-amber shadow-[0_0_10px_rgba(244,183,64,0.5)] transition-[width] duration-75"
            style={{ width: `${pct}%` }}
            aria-hidden
          />
          {/* Engraved tick marks every 25%. */}
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-between px-[2px]"
            aria-hidden
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="h-3 w-px -translate-y-px bg-black/50" />
            ))}
          </div>
        </div>

        {/* Milled cap that rides the track. */}
        <div
          className="pointer-events-none absolute top-1/2 z-10 h-6 w-4 -translate-x-1/2 -translate-y-1/2 rounded-[3px] border border-black/70 bg-gradient-to-b from-alu-400 to-alu-600 shadow-[0_2px_4px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.18)] transition-[left] duration-75 group-hover:from-alu-500"
          style={{ left: `${pct}%` }}
          aria-hidden
        >
          <span className="absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-black/60" />
        </div>

        <input
          id={inputId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          aria-label={label}
          className={cn(
            "absolute inset-0 z-20 h-6 -my-2 w-full cursor-pointer appearance-none bg-transparent",
            "[&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-transparent",
            "[&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-transparent",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/70 focus-visible:ring-offset-2 focus-visible:ring-offset-chassis-800",
          )}
        />

        {/* Cap readout. */}
        <span className="ml-3 w-14 shrink-0 text-right font-mono text-[12px] tabular-nums text-amber">
          {format(value)}
        </span>
      </div>
    </div>
  );
}
