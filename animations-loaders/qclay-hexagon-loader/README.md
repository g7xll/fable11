# QClay Hexagon Loader

A faithful, single full-screen recreation of the **QClay loader** — a centered
animated honeycomb of flat-top hexagonal tiles with a blue active center tile,
a soft blue glow, swapping icons, breathing polygon motion, a shimmering
"Loading Resources" label and an uneven, organic progress bar.

Built with **Vite + React + TypeScript**. No CSS clip-path approximations: the
polygons are the real supplied SVGs.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
npm run preview    # serve the production build on :4173
npm run verify     # headless Chromium CLI verification (no GUI)
```

## What it does

- **Background** — full viewport, soft radial gradient
  `radial-gradient(ellipse at center, #eef1f8 0%, #dde2ed 100%)`, no scrollbars.
- **Polygon cluster** — 29 tiles using three real SVGs:
  - `s-polygon` — pale flat hexagon (distant/outer tiles, ×22)
  - `c-polygon` — pale raised hexagon w/ white top stroke + blue drop & inner
    shadow (closer tiles, ×6)
  - `m-polygon` — blue active center tile (×1)
  - Positioned by a logical 141×155 grid (`STEP_X = 149`, `STEP_Y = 128.9`),
    scene container is exactly `1184 × 799.5px`, with the exact z-index stack
    from the spec.
- **Radial mask** on the scene so the outer tiles softly fade away.
- **Center glow** — 120px blurred blue circle behind the active row.
- **Breathing animation** — a `requestAnimationFrame` clock (period 3200ms)
  drives a sine wave. The center tile expands (`1 + 0.10·wave`) while every
  surrounding tile contracts inversely with a per-ring delay (`RING_DELAY = 0.08`)
  so the motion cascades outward, and each tile drifts in/out by multiplying its
  translation by its current scale.
- **Icon swapping** — only the three center-row tiles hold icons (left & right
  use the dark `icon-NN.svg`, the center uses the white `icon-w-NN.svg`). All 22
  icons are preloaded; every 2s a new unique random triplet crossfades in
  (incoming slides in from the right, outgoing slides out to the left) with no
  blink.
- **Loading label** — exactly `Loading Resources`, uppercased, with a moving
  shimmer gradient clipped to the text.
- **Progress bar** — thin 3px flat bar that fills with uneven random jumps and
  loops forever, feeling organic rather than linear.

## Assets

All assets are **vendored locally** so the loader is fully self-contained and
runs offline:

- `public/loader/icon-01.svg … icon-11.svg` and `icon-w-01.svg … icon-w-11.svg`
  — the 22 QClay icons (downloaded from
  `https://qclay.design/lovable/loader/`).
- `public/polygons/{c,m,s}-polygon.svg` — the three polygon SVGs, created
  verbatim from the spec.

No remote URLs are referenced at runtime.

## Verification

`npm run verify` boots a preview server and drives a headless Chromium through
the loader, asserting: page meta, fl/centered layout with no scrollbars, the
1184×799.5 masked scene, the exact 22/6/1 polygon split, the center glow, three
distinct settled icons with the correct dark/white sets at 32×32, the shimmering
"Loading Resources" label, the uneven progress bar, live breathing of the center
tile, an icon swap within one cycle, and zero console errors / failed requests.
