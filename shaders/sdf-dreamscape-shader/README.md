# SDF Dreamscape

A WebGL fractal **signed-distance-field** shader — a recursive Julia-fold ringed
by a glowing palette and bent in real time by the cursor — rendered full-viewport
on a single fragment shader, then framed as a captured dream behind glass: the
**Oneirograph dream-recorder console**.

The shader component from the prompt is integrated (GLSL, the native-WebGL
animation loop, the throttled pointer handler, resize handling and cleanup
unchanged) at `src/components/ui/sdf-dreamscape.tsx`, the canonical shadcn
`@/components/ui` location. The untyped JS was ported to strict TypeScript and
split into two exports — a reusable `ShaderCanvas` / `useShaderAnimation`
primitive plus the brief's original self-contained `ShaderComponent` (default),
so `import ShaderComponent from "@/components/ui/sdf-dreamscape"` still renders
exactly what the prompt describes. It is wrapped in a deliberate piece of chrome:

- **Hero lockup** — `SDF Dreamscape` set in Big Shoulders Display over the live
  fractal, with an `h1` that reads "SDF Dreamscape" exactly as the brief
  specifies (styled uppercase via CSS).
- **Reticle / registration frame** — corner brackets and a centre cross-hair
  aligned to the dream core, over a vignette and faint film grain so the GPU
  output reads as a recorded specimen.
- **Tuning deck** — the brief's four controls (Hue / Speed / Iterations / Zoom)
  reframed as the recorder's dials — **Spectrum**, **Drift**, **Recursion**,
  **Lens** — each annotated with the underlying uniform (`u_hue`, `u_speed`,
  `u_intensity`, `u_complexity`) it drives. Four **dream-state presets**
  (Lucid / Abyssal / Solar / REM) snap all four uniforms at once.
- **Live telemetry strip (signature element)** — the shader emits its measured
  frame rate through an `onFps` callback, and the bottom bar reports the dream's
  own state: a running dream clock, render FPS, recursion depth, lens depth and
  the GPU pipeline. Moving the mouse warps the dream exactly as the GLSL
  `u_mouse` interaction prescribes.

Palette and type are derived from the shader's own cyan slider accent (signal
`#7df9ff`) over a near-black indigo void (`#05060b`). Type pairing: Big Shoulders
Display (display) · Inter (body) · Space Mono (data). Icons from `lucide-react`.
The entrance reveal and the record-light pulse both respect
`prefers-reduced-motion`.

## Stack

React 18, TypeScript, Vite 6, Tailwind CSS v4 (`@tailwindcss/vite`),
`lucide-react`, native WebGL (no 3D library). shadcn-style `@/*` path alias →
`./src`.

## Assets

Fully self-contained / offline-ready. The Big Shoulders Display, Inter and Space
Mono web fonts (latin subset) are vendored locally to `public/fonts/` and
referenced via `src/fonts.css` — no remote Google Fonts requests at runtime. The
visual is generated entirely on the GPU, so there are no image assets.

## Run

```bash
npm install
npm run dev       # dev server
npm run build     # type-check + production build
npm run preview   # serve the production build on :4173
npm run verify    # headless Playwright checks against the preview server
```

## Integration notes (per the prompt)

- **Project structure** — this is a Vite + React + TypeScript app with Tailwind
  CSS v4 and the shadcn `@/components/ui` convention already wired up (the `@`
  alias is configured in both `vite.config.ts` and `tsconfig.json`). If you are
  dropping the component into your own app instead, scaffold with the shadcn CLI
  (`npx shadcn@latest init`), which sets up Tailwind, TypeScript and the
  `components.json` alias map for you.
- **Why `/components/ui`** — shadcn treats `components/ui` as the home for
  primitive, copy-in UI building blocks resolved through the `@/components/ui`
  alias. Keeping the shader there means the import in the brief
  (`@/components/ui/sdf-dreamscape`) resolves unchanged and the component sits
  alongside the rest of your design-system primitives.
- **Dependencies** — the component itself needs nothing beyond React (it talks to
  the native WebGL API directly); `lucide-react` is used by the surrounding
  console for icons.
- **Props / state** — the original widget was fully self-contained with internal
  `useState` for the four params. `ShaderCanvas` exposes those same four values
  as props plus an additive `className` and `onFps` callback, all defaulting to
  the brief's behavior, so the host can wrap its own UI around the live canvas.
- **Images** — none. The procedural shader is the entire visual, so no Unsplash
  stock imagery is needed.
