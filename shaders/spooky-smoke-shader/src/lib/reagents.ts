// The preset palette is framed as a tray of alchemical reagents. Each one maps a
// memorable name + reading to a hex value that feeds the SmokeBackground's
// `smokeColor` prop. The names are deliberately part of the séance fiction, but
// every value is a real, copy-pasteable hex string.

export interface Reagent {
  /** Roman-numeral index on the tray. */
  numeral: string;
  /** Reagent name shown on the vial label. */
  name: string;
  /** The divined "reading" — a one-line description of the resulting smoke. */
  reading: string;
  /** Hex colour passed straight into <SmokeBackground smokeColor=... />. */
  hex: string;
}

export const REAGENTS: Reagent[] = [
  {
    numeral: "I",
    name: "Cinder Ash",
    reading: "the neutral smoke. nothing summoned, nothing refused.",
    hex: "#808080",
  },
  {
    numeral: "II",
    name: "Wormwood",
    reading: "a green haze that lingers low over the table.",
    hex: "#5f7a4a",
  },
  {
    numeral: "III",
    name: "Dragon's Blood",
    reading: "a warning, drawn upward in vermilion.",
    hex: "#c1351d",
  },
  {
    numeral: "IV",
    name: "Belladonna",
    reading: "a violet bloom for things better left unseen.",
    hex: "#7b3fae",
  },
  {
    numeral: "V",
    name: "Spectral Cyan",
    reading: "cold light, the colour of a held breath.",
    hex: "#3aa6b9",
  },
  {
    numeral: "VI",
    name: "Witchfire",
    reading: "a low amber glow that refuses to settle.",
    hex: "#d98a2b",
  },
  {
    numeral: "VII",
    name: "Hexrose",
    reading: "a soft magenta veil, almost gentle.",
    hex: "#c2487f",
  },
  {
    numeral: "VIII",
    name: "Pale Bone",
    reading: "the séance ended. the smoke goes white.",
    hex: "#e6e0d2",
  },
];
