# CHROMA OSC — WebGL RGB-Split Shader Hero

A shadcn-structured integration of the `WebGLShader` + `LiquidButton` components from
the prompt, framed as a live oscilloscope instrument.

The signature is the shader itself: a single `RawShaderMaterial` GLSL pass that draws
three additive sine ribbons (`0.05 / abs(p.y + sin(...))`) on pure black, with the R/G/B
channels distorted differently by a radial `distortion` term — chromatic aberration baked
into the math. Everything around it stays disciplined: a hairline `#27272a` instrument
card (kept exactly from the prompt's demo), corner brackets, an RGB-split mirrored
headline, a sweeping scan line, the demo's pinging green "available" pulse, and a
`LiquidButton` CTA. Top and bottom mono telemetry strips read the page's *real* frame rate
and shader uptime, sampled from `requestAnimationFrame`.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · shadcn structure · three.js · CVA ·
`@radix-ui/react-slot` · lucide-react

## Project shape (shadcn defaults)

The default component path is `@/components/ui` — required so the prompt's
`@/components/ui/web-gl-shader` and `@/components/ui/liquid-glass-button` imports resolve.
The `@` alias maps to `./src` (`vite.config.ts` + `tsconfig`), `cn` lives in
`@/lib/utils`, and tokens/theme are defined in `src/index.css` + `tailwind.config.ts`.

```
src/
  components/
    demo.tsx                       # the prompt's DemoOne, verbatim
    ui/
      web-gl-shader.tsx            # the prompt's WebGLShader, verbatim
      liquid-glass-button.tsx      # the prompt's LiquidButton/Button/MetalButton, verbatim
  lib/utils.ts                     # cn()
  App.tsx                          # the framed instrument hero
  index.css                        # tokens + vendored @font-face
public/fonts/                      # Space Grotesk, JetBrains Mono, Inter (woff2, offline)
```

## Assets

All fonts (Space Grotesk display, JetBrains Mono telemetry, Inter body) are vendored
locally in `public/fonts/` as variable woff2 files — no external requests, fully offline.
The shader needs no image assets; it is generated entirely in GLSL.

## Run

```sh
npm install
npm run dev      # dev server
npm run build    # type-check + production build
npm run preview  # serve the production build
```

See `prompt.md` for the original integration prompt.
