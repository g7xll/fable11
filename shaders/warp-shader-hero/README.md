# Paper Warp // Shader Lab

A shadcn-style integration of the prompt's `@paper-design/shaders-react`
**`<Warp>`** hero. The verbatim component is dropped into `components/ui`
exactly as supplied — and then framed as an **instrument deck**: instead of a
lone full-bleed background, the hero sits behind glass as a live *specimen* in a
brushed-graphite scope housing, steered from a left-hand module rack.

The prompt's component is preserved untouched at
`src/components/ui/wrap-shader.tsx` (and its `demo.tsx` companion). The lab view
re-renders the same `<Warp>` element with every baked-in prop promoted to a live
control, so you can see the exact hero the brief asked for — and dial it.

## What the deck does

- **Parameter Bay** — every Warp uniform from the prompt is a live fader: speed,
  swirl, swirl-iterations, distortion, proportion, softness, shape-scale, scale,
  rotation. Move one and the hero updates in real time.
- **Geometry** — a segmented selector switches the Warp `shape` between the
  library's three patterns (`checks` / `stripes` / `edge`).
- **Presets** — four moods built on the *same* component. **Lagoon** is the
  prompt's verbatim teal/aqua checks; Ember, Ultraviolet and Graphite re-tint and
  re-shape it to show how far one component travels.
- **Palette** — the four-stop colour ramp is editable inline (hsl/hex).
- **Transport** — Hold/Run freezes the shader clock (also bound to **Space**);
  Reset returns to the prompt's exact configuration.
- **Telemetry** — a live strip reads real FPS, frame count and uptime off
  `requestAnimationFrame`; the scope shows the active preset/shape and live
  `SPD`/`SCL` readouts.
- **Integrate** — copies the `npm i @paper-design/shaders-react` install command
  and points back at the drop-in `components/ui` file.

## The component, verbatim

`src/components/ui/wrap-shader.tsx` is the prompt's `WarpShaderHero` exactly as
given. The supplied `src/components/ui/demo.tsx` is the prompt's usage example,
with two JSX typos from the original snippet corrected so it type-checks (a
malformed `className= "…"` and a broken `< /div>` closing tag) — same component,
same wrapper. The lab's adjustable view lives separately in
`src/components/lab/` so the drop-in file stays pristine.

## Stack

React 19, TypeScript, Vite 7, Tailwind CSS v4, `@paper-design/shaders-react`,
`lucide-react`.

## Design

| Token | Value |
|-------|-------|
| Chassis / rail | `#060809` / `#0a0d11` |
| Panel faceplate | `#0e1217` / `#12171d` |
| Engraved hairline | `#1d242d` |
| Signal (live) | `#3ee0c4` |
| Warning (amber) | `#ffb23e` |
| Ink | `#eef2f4` |
| Type | Geist Sans + Geist Mono (vendored locally) |

Signature: the live Warp hero seated in a scope housing — corner brackets, a
scanline overlay, an inner vignette, and a travelling signal-sweep bar on the
bottom bus. The signal accents mirror the prompt's teal/aqua palette.

## Assets

The **Geist Sans** and **Geist Mono** variable fonts are **vendored locally**
under `assets/fonts/*.woff2` and bundled by Vite — the project runs fully
offline, with no CDN or remote font calls. Icons are `lucide-react` (no remote
SVGs); the favicon is an inline local SVG.

## Run

```bash
npm install
npm run dev       # dev server
npm run build     # type-check (tsc -b) + production build
npm run preview   # serve the production build
npm run verify    # headless Playwright checks (boots its own dev server)
```

`npm run verify` boots a dev server, drives a headless Chromium with software
WebGL, and asserts: the deck header renders, the verbatim hero copy renders, the
`<Warp>` shader paints a live WebGL canvas, the speed fader sweeps
`0.00 → 3.00`, switching a preset re-labels the scope, and no page/console
errors fire.
