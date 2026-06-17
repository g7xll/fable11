# Aether Flow Shader

A faithful integration of the **Aether Flow** React component — a procedural
**fractal-noise (fBm) gas** rendered on a single full-screen Three.js quad —
wrapped in a distinctive *atmosphere synthesizer* console. The shader is the
live observation window; everything around it (a left-anchored instrument rail
with five faders, a named **patch bank**, and a live **telemetry** strip) is a
calm, opinionated control surface that drives the shader's uniforms and reads
its per-frame state back out.

Built with **React + TypeScript + Vite + Tailwind CSS** on the **shadcn**
project structure, exactly as the prompt requires. The component drops into
`@/components/ui/aether-flow` and is consumed verbatim.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
```

## What you can do

- **Tune the field** — five faders (Hue, Speed, Intensity, Complexity, Warp)
  map straight onto the shader's `u_*` uniforms across the exact ranges from the
  brief.
- **Recall a patch** — six named atmospheric states (Nebula, Ember, Abyss,
  Drift, Solar, Bloom) each snap the whole field to a stored set of uniforms.
  Move any fader and the active patch flips to **Custom**.
- **Bend the gas** — moving the pointer over the window warps the noise around
  the cursor (the component's own `u_mouse` + `u_warp` math); the warp
  coordinate is mirrored live in the readout and telemetry.

## Design notes

- **Subject:** an imaginary atmosphere synthesizer — a console for sculpting a
  living aether. The shader *is* the hero; no stock photography is needed.
- **Type:** Space Grotesk (geometric display grotesque), Inter (body/utility),
  Space Mono (telemetry/data). All three are **vendored locally** (latin woff2
  in `src/fonts/`) so the project runs fully offline — no runtime CDN calls.
- **Signature element:** the field is framed as something *under observation* —
  corner reticle brackets, a sweeping scan line, and a `Telemetry` strip whose
  FPS + uptime run on the same real `requestAnimationFrame` clock the shader
  animates on, so the numbers move with the gas rather than being faked.
- **Palette:** an ink console (`#070510`) with a violet **signal** accent
  (`#a78bfa`) and a warm **aether amber**, derived from the shader's own HSV
  bloom ramp.
- Responsive down to mobile (the rail stacks above the window), respects
  `prefers-reduced-motion`, and keeps visible keyboard focus on every control.

---

# Integration guide (answering the prompt)

The prompt is a shadcn-style *"integrate this component"* brief. Here are the
answers it asks for.

## 1. Project prerequisites (shadcn + Tailwind + TypeScript)

This project already ships the required stack. To drop the component into a
**fresh** app instead, set the stack up first:

```bash
# Vite + React + TypeScript
npm create vite@latest my-app -- --template react-ts
cd my-app

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# shadcn (creates components.json, the @/* alias, and lib/utils.ts)
npx shadcn@latest init
```

Make sure `tsconfig.json` and your bundler resolve the `@/*` alias to `src/*`
(see `tsconfig.json` and `vite.config.ts` here for the exact config).

## 2. Why `components/ui`

The brief asks to copy the component into `/components/ui`. That folder is the
shadcn convention for **primitive, reusable building blocks** — the layer you
copy in and own, as opposed to app-specific composites. Keeping `aether-flow`
there means:

- the `@/components/ui/*` import path stays stable and matches every other
  shadcn primitive, so the `ui` alias in `components.json` resolves it without
  special-casing;
- it reads as a drop-in dependency (own it, restyle it) rather than page code;
- app composites — here `channel-rail`, `preset-bank`, `telemetry` — live one
  level up in `@/components/` and import the primitive, keeping the boundary
  between *reusable shader* and *this page's console* clear.

So the verbatim component lives at
[`src/components/ui/aether-flow.tsx`](./src/components/ui/aether-flow.tsx).

## 3. Dependencies

The only external runtime dependency the component needs is **three**:

```bash
npm install three
# dev: types for the editor / strict build
npm install -D @types/three
```

`clsx` + `tailwind-merge` (via `@/lib/utils`) and `lucide-react` (icons in the
console chrome) round out the install — all already in `package.json`.

## 4. Answers to the brief's questions

- **What props does it take?** `ShaderCanvas` takes the five uniform values
  (`hue`, `speed`, `intensity`, `complexity`, `warp`); `ControlSlider` takes
  `label`, `value`, `onChange`, `min`, `max`, `step`. Both gain optional,
  default-off passthroughs here (`className`, and a `ShaderCanvas` `onWarp`
  callback) without changing the original behaviour.
- **State management?** Plain React `useState` in the host page holds the five
  uniforms and the active patch — no context or store is required.
- **Required assets?** None. The shader is fully procedural; the only vendored
  assets are the three local fonts. No Unsplash imagery is needed for a shader
  surface, so the brief's "fill with Unsplash stock images" step does not apply.
- **Responsive behaviour?** The canvas fills its container and re-reads size on
  `resize`; the console rail sits beside the window on desktop and stacks above
  it on mobile.
- **Best place to use it?** As a full-bleed ambient background or an interactive
  hero — anywhere you want a living, tunable atmosphere behind your content.

## 5. The verbatim demo

The brief's minimal `demo.tsx` (centered title over the shader with a glass
fader panel) is preserved as
[`src/demo.tsx`](./src/demo.tsx) (`DemoOne`); the richer console in
[`src/App.tsx`](./src/App.tsx) is what the app renders.
