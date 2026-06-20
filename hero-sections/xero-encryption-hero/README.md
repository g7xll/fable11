# Xero — Encryption Hero

A single-section landing hero for a fictional data-encryption product: a navbar, a rounded dark hero card featuring an animated icon pipeline — a beam of light that travels between three neumorphic nodes, splashing as it passes through the central Xero "X" logo — and a row of five monochrome brand logos. Built with React + TypeScript on Vite, styled entirely with plain global CSS (no Tailwind for the hero), with the Inter typeface from Google Fonts.

The signature visual is the pink-magenta gradient arc near the top of the card, built from many hand-tuned radial-gradient stops, with a crosshatch grid clipped to the arc via `mask-image`. The beam is driven by a `requestAnimationFrame` state machine (`p1` → `splash` → `p2` → `idle`, ~3.4s per cycle) that slides the bright window of an SVG `linearGradient` in `userSpaceOnUse` mode along a path recomputed from live node positions via `getBoundingClientRect()` on mount and resize. Nodes use neumorphic soft-UI box-shadows, side-light glows toggle as the beam passes, and a CSS keyframe splash plays at the center.

## Run

```sh
npm install
npm run dev      # start the Vite dev server
npm run build    # type-check (tsc --noEmit) and build for production
npm run preview  # preview the production build
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
