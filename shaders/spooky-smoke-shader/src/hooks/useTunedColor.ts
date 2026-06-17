import { useCallback, useMemo, useState } from "react";
import { REAGENTS, type Reagent } from "@/lib/reagents";

const HEX_RE = /^#([a-f\d]{6})$/i;

export interface TunedColor {
  /** The current smoke colour as a normalised "#rrggbb" string. */
  hex: string;
  /** The reagent currently selected on the tray, or null for a manual colour. */
  activeReagent: Reagent | null;
  /** Decimal channel readout, e.g. { r: 128, g: 128, b: 128 }. */
  channels: { r: number; g: number; b: number };
  /** Pick a reagent from the tray. */
  selectReagent: (hex: string) => void;
  /** Set an arbitrary colour from the dial; ignores malformed values. */
  setHex: (hex: string) => void;
}

const toChannels = (hex: string) => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
});

/**
 * Single source of truth for the vapour colour. The value lives here so the hero
 * headline, the live readout, and the <SmokeBackground /> all stay in sync no
 * matter whether the colour came from a reagent vial or the manual dial.
 */
export function useTunedColor(initial = REAGENTS[5].hex): TunedColor {
  const [hex, setHexState] = useState(initial.toLowerCase());

  const setHex = useCallback((next: string) => {
    if (HEX_RE.test(next)) setHexState(next.toLowerCase());
  }, []);

  const selectReagent = useCallback((next: string) => setHex(next), [setHex]);

  const activeReagent = useMemo(
    () => REAGENTS.find((r) => r.hex.toLowerCase() === hex) ?? null,
    [hex]
  );

  const channels = useMemo(() => toChannels(hex), [hex]);

  return { hex, activeReagent, channels, selectReagent, setHex };
}
