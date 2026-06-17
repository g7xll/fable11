import React, { useId } from "react";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  /** Right-aligned formatted readout of the current value. */
  display: string;
  onChange: (v: number) => void;
}

/**
 * A compact lab-instrument slider: mono label on the left, live value on the
 * right, a hairline track with a magenta fill below.
 */
const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}) => {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="select-none">
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={id}
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-haze"
        >
          {label}
        </label>
        <span className="font-mono text-xs tabular-nums text-paper">
          {display}
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
        className="lab-range mt-2 w-full"
        style={{
          background: `linear-gradient(90deg, var(--color-magenta) ${pct}%, rgba(242,240,251,0.14) ${pct}%)`,
        }}
      />
    </div>
  );
};

export default Slider;
