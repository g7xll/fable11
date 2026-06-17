# spooky-smoke-shader — AETHER

A self-contained shader experiment that integrates the **`spooky-smoke-animation`**
React component (a WebGL2 fbm-noise smoke field, tinted by a single `smokeColor`
prop) into a polished séance-themed "vapour reading instrument."

> **AETHER** — _Read the smoke._ Tune a live WebGL2 smoke field by colour: pick a
> reagent from the tray, or dial an arbitrary tint. Everything you see — the
> headline accent, the live readout, the background, and the two specimen panes —
> is driven by one shared hex value.

## What's here

- `src/components/ui/spooky-smoke-animation.tsx` — the integrated component,
  exporting `SmokeBackground`. This is the verbatim component from the prompt with
  two cosmetic bugs fixed (see **Integration notes** below).
- `src/components/ui/spooky-smoke-animation.demo.tsx` — the canonical demo
  (`Default` + `Customized`) shipped alongside the component.
- `src/components/VapourConsole.tsx` — the signature element: a reagent tray of
  preset colours plus a brass dial wrapping a native `<input type="color">`.
- `src/hooks/useTunedColor.ts` — single source of truth for the smoke colour.
- `src/lib/reagents.ts` — the preset palette, framed as alchemical reagents.
- `src/lib/utils.ts` — shadcn's `cn()` helper (clsx + tailwind-merge).
- `src/App.tsx` — the full scene.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build
npm run verify    # headless Chromium checks (boots dev server, asserts shader paints)
```

## Integration notes (the prompt's task)

This repo **already supports the shadcn project structure, Tailwind CSS, and
TypeScript**, so no scaffolding was required. The relevant decisions:

- **Default component path is `@/components/ui`.** The `@` alias maps to `src/`
  via both `vite.config.ts` (`resolve.alias`) and `tsconfig.app.json`
  (`compilerOptions.paths`). `components.json` records the shadcn aliases.
- **Why `/components/ui` matters:** shadcn distributes components by copying their
  source into _your_ tree, and it expects them under `components/ui` (see
  `components.json` → `aliases.ui`). Keeping that folder means the `@/components/ui/...`
  import in the component (and in `demo.tsx`) resolves out of the box, the shadcn
  CLI (`npx shadcn@latest add ...`) can drop future components in the right place,
  and primitives stay cleanly separated from composed app components.
- **The component takes one prop:** `smokeColor?: string` (a `#rrggbb` hex,
  default `#808080`). No context providers, stores, or data fetching are required —
  state is just the current colour, owned here by `useTunedColor`.
- **External dependencies installed:** `lucide-react` (icons), plus shadcn's
  utility trio `clsx` + `tailwind-merge` + `class-variance-authority`. The shader
  itself is dependency-free raw WebGL2.

### Two bug fixes applied to the pasted component

1. The interface was named `AnimatedBackgroundProps` but the component was typed
   `React.FC<SmokeBackgroundProps>`. Renamed the interface to
   `SmokeBackgroundProps` so the types match and compile.
2. The `fragmentShaderSource` and `vertexSrc` shader strings had lost their
   backticks in transit. Restored both as valid multi-line template literals. The
   WebGL2 smoke behaviour is otherwise identical to the original.

### If you were starting from an empty project

```bash
npm create vite@latest my-app -- --template react-ts   # React + TypeScript
cd my-app
npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p
npx shadcn@latest init       # sets up components.json, the @/ alias, and components/ui
# then drop spooky-smoke-animation.tsx into src/components/ui/
```

## Assets

Everything is vendored locally for offline use:

- **Fonts** (`public/fonts/`): Cormorant Garamond, Inter Tight, Space Mono
  (latin `.woff2` subsets, self-hosted via `@font-face`).
- **Textures** (`public/img/`): two Unsplash JPEGs used as a faint grain overlay.

## Stack

React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui structure, lucide-react,
raw WebGL2.
