# dithering-swirl-shader — DITHER/LAB

A self-contained shader experiment that integrates the **`DitheringShader`**
React component (a procedural WebGL2 field quantised to **two colours** through
an ordered **Bayer** dither matrix) into a polished vintage-monitor instrument.

> **DITHER/LAB** — _One field, two colours, decided on the GPU._ The prompt ships
> a `swirl` shape dithered 1-bit cyan-on-magenta; here it becomes a live console:
> swap the shape, swap the dither matrix, re-skin the phosphor, and watch a
> telemetry panel read real lit-pixel coverage straight off the framebuffer.

## What's here

- `src/components/ui/dithering-shader.tsx` — the integrated component. The
  prompt's shader (7 shapes × 4 dither modes) is preserved verbatim; two
  **additive, non-breaking** props were appended (see _Integration notes_).
- `src/components/ui/dithering-shader.demo.tsx` — the canonical demo from the
  prompt (`swirl` / `4x4` / cyan on `#220011`), shipped alongside the component.
- `src/components/signal-telemetry.tsx` — the signature panel: a CRT "beam"
  readout whose coverage trace is sampled from the **actual GPU framebuffer**,
  not estimated.
- `src/components/bayer-matrix.tsx` — renders the exact `bayer2x2/4x4/8x8`
  threshold tables the fragment shader indexes, so the panel always shows the
  math driving the field above it.
- `src/App.tsx` — the full instrument (field + wordmark + control deck +
  telemetry + matrix panel).
- `src/lib/utils.ts` — shadcn's `cn()` helper (clsx + tailwind-merge).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b (type-check) + production build
npm run typecheck  # type-check only
```

## Integration notes (the prompt's task)

This repo **already supports the shadcn project structure, Tailwind CSS, and
TypeScript**, so no scaffolding was required. The relevant decisions:

- **Default component path is `@/components/ui`.** The `@` alias maps to `src/`
  via both `vite.config.ts` (`resolve.alias`) and `tsconfig.app.json`
  (`compilerOptions.paths`); `components.json` records the shadcn aliases
  (`ui → @/components/ui`).
- **Why `/components/ui` matters:** shadcn distributes components by copying
  their source into _your_ tree and expects them under `components/ui`. Keeping
  that folder means the `@/components/ui/dithering-shader` import in the demo
  resolves out of the box, the shadcn CLI (`npx shadcn@latest add …`) drops
  future primitives in the right place, and library components stay separated
  from composed app code.
- **Props / API** — all optional, all backward-compatible with the pasted file:

  | Prop | Type | Default | Notes |
  |------|------|---------|-------|
  | `shape` | `simplex \| warp \| dots \| wave \| ripple \| swirl \| sphere` | `simplex` | which procedural field to dither |
  | `type` | `random \| 2x2 \| 4x4 \| 8x8` | `8x8` | dither mode (`random` = per-pixel hash, others = Bayer) |
  | `colorFront` / `colorBack` | `#rrggbb` | `#ffffff` / `#000000` | the two output colours |
  | `pxSize` | `number` | `4` | pixelisation block size |
  | `speed` | `number` | `1` | animation rate (`0` freezes, drawing one frame) |
  | `width` / `height` | `number` | `800` | fixed canvas size (ignored when `fill`) |
  | `fill` | `boolean` | `false` | **added** — track the parent box via `ResizeObserver` for a full-bleed background |
  | `onSample` | `(coverage: number) => void` | — | **added** — fires a few times/sec with the lit-pixel fraction read off the GL framebuffer |

- **No context/providers/stores** are needed — the component owns its WebGL
  lifecycle; app state is just the current controls, held in `App.tsx`.
- **External dependencies installed:** `lucide-react` (icons) plus shadcn's
  `clsx` + `tailwind-merge`. The shader itself is dependency-free raw WebGL2.
- **No image assets.** The field is fully procedural, so the prompt's
  "fill image assets with Unsplash" step does not apply; the only vendored
  media are two self-hosted fonts.

### Changes applied to the pasted component

1. **`fill` mode** — an optional `ResizeObserver` path so one component can back
   a fixed-size demo _and_ a full-viewport instrument. The documented
   `width`/`height` API is unchanged when `fill` is omitted.
2. **`onSample` probe** — reads the framebuffer once per tick (a single GPU→CPU
   sync) and reports lit-pixel coverage, which drives the telemetry panel.
3. A frozen shader (`speed={0}`) now draws a single frame instead of staying
   blank.

### If you were starting from an empty project

```bash
npm create vite@latest my-app -- --template react-ts   # React + TypeScript
cd my-app
npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p
npx shadcn@latest init       # creates components.json, the @/ alias, components/ui
# then drop dithering-shader.tsx into src/components/ui/
```

## Assets

Everything is vendored locally for offline use — no runtime CDN calls:

- **Fonts** (`public/fonts/`): Space Grotesk (display) and JetBrains Mono
  (telemetry/data), latin `.woff2` subsets self-hosted via `@font-face`.

## Stack

React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui structure, lucide-react,
raw WebGL2.

## Credit

Component: **`designali-in/dithering-shader`** (the `DitheringShader` from the
integration prompt).
