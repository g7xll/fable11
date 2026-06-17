import { PRESETS, type AetherPreset } from "@/lib/presets";
import { cn } from "@/lib/utils";

interface PresetBankProps {
  activeCode: string | null;
  onSelect: (preset: AetherPreset) => void;
}

/**
 * The patch library. Each chip recalls a full set of uniforms; the active one
 * is lit. Names come from the gas/aether states they evoke, not generic
 * "Preset 1/2/3" — the label encodes the mood the field will take.
 */
export function PresetBank({ activeCode, onSelect }: PresetBankProps) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider2 text-muted">
          Patch bank
        </span>
        <span className="font-mono text-[10px] text-muted/70">
          {PRESETS.length} states
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {PRESETS.map((p) => {
          const active = p.code === activeCode;
          return (
            <button
              key={p.code}
              type="button"
              onClick={() => onSelect(p)}
              aria-pressed={active}
              className={cn(
                "group relative flex flex-col gap-1 overflow-hidden rounded-[3px] border px-2.5 py-2 text-left transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-signal-400",
                active
                  ? "border-signal-400/60 bg-signal-400/10"
                  : "border-hairline/70 bg-ink-700/60 hover:border-signal-400/40 hover:bg-ink-600/70",
              )}
            >
              <span className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: p.swatch,
                    boxShadow: active
                      ? `0 0 8px ${p.swatch}`
                      : `0 0 4px ${p.swatch}88`,
                  }}
                />
                <span
                  className={cn(
                    "font-display text-[13px] font-medium leading-none",
                    active ? "text-chalk" : "text-chalk/80",
                  )}
                >
                  {p.name}
                </span>
              </span>
              <span className="font-mono text-[9px] leading-tight text-muted/80">
                {p.caption}
              </span>
              <span
                className={cn(
                  "absolute right-1.5 top-1.5 font-mono text-[8px] tracking-wide transition-opacity",
                  active ? "text-signal-300 opacity-100" : "text-muted/50 opacity-0 group-hover:opacity-100",
                )}
              >
                {p.code}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
