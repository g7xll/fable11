import { useState, type CSSProperties, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- Fader (labeled range) ---------- */
export function Fader({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  hint?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="group block select-none">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        <span className="font-mono text-[11px] tabular-nums text-foreground/90">
          {format ? format(value) : value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        className="fader"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ "--pct": `${pct}%` } as CSSProperties}
        aria-label={label}
      />
      {hint ? (
        <span className="mt-1 block font-mono text-[9px] leading-tight text-muted-foreground/70">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

/* ---------- Toggle switch ---------- */
export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "relative h-[18px] w-[32px] rounded-full border transition-colors duration-200",
          checked
            ? "border-accent/60 bg-accent/25"
            : "border-border bg-white/5",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full transition-all duration-200",
            checked ? "left-[15px] bg-accent" : "left-[2px] bg-foreground/55",
          )}
        />
      </span>
    </button>
  );
}

/* ---------- Segmented control ---------- */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; icon?: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-lg border border-border bg-black/30 p-0.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-[7px] px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors",
              active
                ? "bg-white/10 text-foreground shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset]"
                : "text-muted-foreground hover:text-foreground/80",
            )}
            aria-pressed={active}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Copy button ---------- */
export function CopyButton({
  value,
  label = "Copy",
  className,
  variant = "ghost",
}: {
  value: string;
  label?: string;
  className?: string;
  variant?: "ghost" | "solid";
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Fallback for environments without the async clipboard API.
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* no-op */
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1300);
  };
  const base =
    variant === "solid"
      ? "inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/15 px-4 py-2.5 text-[13px] font-medium text-accent transition-colors hover:bg-accent/25"
      : "inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground";
  return (
    <button type="button" onClick={copy} className={cn(base, className)} aria-label={label}>
      {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : label}
    </button>
  );
}
