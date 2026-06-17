# shader-plasma-grid-background

**PLASMASIGNAL** — a showcase for `shader-background.tsx`, the drop-in WebGL plasma-grid
background from the integration brief, set up inside a real shadcn-structured Vite +
TypeScript + Tailwind app.

The warping violet field is a single fragment shader (~90 lines of GLSL, one draw call).
The page treats it like a live instrument: a "Signal Lab" readout with an oscilloscope
HUD pulling real `iTime` / FPS / `iResolution` from the running WebGL context, and a
control deck of faders that promote the shader's baked-in constants to live uniforms so
you can re-tint and re-shape the field in real time.

## What's in `components/ui`

| File | Role |
|------|------|
| `shader-background.tsx` | The brief's component, verbatim, ported to TypeScript. Fixed, full-screen, `-z-10`, no props, no deps. |
| `shader-background.demo.tsx` | The brief's `demo.tsx` — one usecase export (`DemoOne`). |
| `shader-background-pro.tsx` | Parametric build used by the live demo: the constants become uniforms and it streams telemetry back. |

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run verify   # headless Playwright check (build → preview → assert)
```

## Stack

React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui structure (`@/components/ui`,
`@/lib/utils`), Lucide icons, raw WebGL. Fonts (Space Grotesk / Space Mono / Inter) and
all imagery (Unsplash) are vendored locally under `public/fonts` and `assets/` — the
project runs fully offline.
