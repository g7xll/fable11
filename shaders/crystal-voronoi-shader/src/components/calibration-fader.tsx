import { useId } from "react";

interface CalibrationFaderProps {
  label: string;
  /** Short unit/abbr shown after the readout, e.g. "cells", "×". */
  unit?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  /** Hex tint for the fill + thumb, so each axis reads as its own channel. */
  tint: string;
  /** Decimal places in the readout. */
  precision?: number;
  onChange: (value: number) => void;
}

/**
 * A single precision calibration fader — the prompt's range input reframed as a
 * lab dial. The track fills with the axis tint up to the current value and the
 * thumb is a small faceted diamond, echoing the Voronoi cells on the stage.
 */
export function CalibrationFader({
  label,
  unit,
  value,
  min,
  max,
  step,
  tint,
  precision = 2,
  onChange,
}: CalibrationFaderProps) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="group">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className="font-mono text-[10px] uppercase tracking-[0.26em] text-frost-300"
        >
          {label}
        </label>
        <span className="font-mono text-[11px] tabular-nums text-frost-50">
          {value.toFixed(precision)}
          {unit ? (
            <span className="ml-1 text-frost-400 text-[9px] uppercase tracking-[0.12em]">
              {unit}
            </span>
          ) : null}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="cal-fader"
        style={
          {
            "--pct": `${pct}%`,
            "--fill": tint,
            "--glow": `${tint}99`,
          } as React.CSSProperties
        }
        aria-label={label}
      />
    </div>
  );
}
