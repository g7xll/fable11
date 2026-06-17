# Galactic Spiral Shader

A 7-colour **neon rainbow spiral** GLSL fragment shader — five interleaved arms
wound around a bright core in polar coordinates — rendered full-viewport with
Three.js, then framed as a **deep-field survey transmission**.

The shader component from the prompt is integrated essentially verbatim (shader
code, animation loop, resize handling, and cleanup unchanged) at
`src/components/ui/spiral-shader.tsx`, the canonical shadcn `@/components/ui`
location. The only edit is dropping the unused default `React` import so the
strict build (`noUnusedLocals`) passes — the JSX automatic runtime needs no
`React` in scope. It is wrapped in a deliberate piece of chrome:

- **Galactic Spiral hero lockup** — the brief's `Galactic Spiral` title set over
  a soft radial legibility scrim, with an eyebrow (`Transmission 04 — Neon
  Rainbow Spiral`) and a Fraunces italic strapline. The brief's exact stage
  (`relative flex h-screen w-full … bg-black`) and title styling
  (`text-5xl md:text-7xl font-semibold tracking-tighter`) are preserved; the
  heading is promoted to a semantic `<h1>`.
- **Registration plate** — an inset hairline frame with four corner crops and a
  vignette + film-grain grade that pulls focus to the spiral core.
- **Live telemetry ledger (signature element)** — a bottom bar reporting a
  mission clock, the *measured* render FPS, and slowly drifting right-ascension /
  declination coordinates. These are driven by the demo's own
  `requestAnimationFrame` loop so the shader component stays untouched; the
  ledger collapses to a compact mobile strip below `md`.

Palette and type are derived from the shader's own GLSL neon constants over a
near-black void (`#05010a`). Type pairing: Inter (display) · Space Mono (data) ·
Fraunces (strapline). Icons from `lucide-react`. The entrance reveal and the
ambient pulse both respect `prefers-reduced-motion`.

## Stack

React 18, TypeScript, Vite 6, Tailwind CSS v4 (`@tailwindcss/vite`), Three.js,
`lucide-react`. shadcn-style `@/*` path alias → `./src`, with `components.json`
and `src/lib/utils.ts` (`cn`) wired up.

## Assets

Fully self-contained / offline-ready. The Inter, Space Mono and Fraunces web
fonts (latin subset) are vendored locally to `public/fonts/` and referenced via
`src/fonts.css` — no remote Google Fonts requests at runtime. The visual is
generated entirely on the GPU, so there are no image assets.

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
  alias is configured in both `vite.config.ts` and `tsconfig.json`, and there's
  a `components.json`). If you are dropping the component into your own app
  instead, scaffold with the shadcn CLI (`npx shadcn@latest init`), which sets
  up Tailwind, TypeScript and the `components.json` alias map for you.
- **Why `/components/ui`** — shadcn treats `components/ui` as the home for
  primitive, copy-in UI building blocks resolved through the `@/components/ui`
  alias. Keeping the shader there means the import in the brief
  (`@/components/ui/spiral-shader`) resolves unchanged and the component sits
  alongside the rest of your design-system primitives.
- **Dependencies** — only `three` is required by the component itself;
  `lucide-react` (icons) and `clsx` + `tailwind-merge` (the `cn` helper) are used
  by the surrounding demo.
- **Props / state** — `ShaderAnimation` takes no props and holds no external
  state; it self-manages its Three.js scene in a `useEffect` and tears it down
  on unmount. It is rendered as a zero-config fixed background. All live state in
  this demo (clock, FPS, coordinates) is owned by the demo, not the shader.
- **Images** — none. The procedural shader is the entire visual, so no Unsplash
  stock imagery is needed.
- **Responsive behaviour** — the canvas tracks its container via a `resize`
  listener and fills the viewport at every size; the telemetry ledger collapses
  to a single-line mobile strip below `md`, and the title scales from
  `text-5xl` to `text-7xl`.
- **Where to use it** — as an immersive full-bleed hero / landing backdrop or a
  splash/loading scene where a living, GPU-cheap background is wanted behind a
  short headline.
