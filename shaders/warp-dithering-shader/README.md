# Warp · DITHER LAB

A shadcn-style integration of the **`DitheringShader`** WebGL2 component
([designali-in/dithering-shader](https://github.com/designali-in)) — a single
full-screen quad that renders seven procedural shape fields and thresholds them
to one bit through **random** or **Bayer 2×2 / 4×4 / 8×8** ordered dithering.

The brief's `demo.tsx` is the canonical **Warp** field (orange `#ff6600` over
navy `#000033`, `4×4` dither). Here it becomes the headline of a live **1-bit
CRT console**: a full-bleed responsive hero, a driving deck wired straight to
the component's props, a click-to-apply shape library, animated Bayer-matrix
explainers, and a props/uniforms API that mirrors the hero in real time.

![Warp dithering shader demo](./demo.mp4)

## Highlights

- **The component, verbatim.** `src/components/ui/dithering-shader.tsx` is the
  unmodified upstream file. The app composes it rather than forking it.
- **Responsive by composition.** `DitheringShader` takes fixed pixel
  `width`/`height`; a `ResizeObserver` wrapper (`responsive-dither.tsx`) measures
  its container so the same component fills a hero or a thumbnail.
- **Every prop is live.** Shape, dither kernel, `pxSize`, `speed`, `colorBack`
  and `colorFront` are all driven from the on-screen console; the params object
  is debounced before reaching the shader so dragging stays smooth.
- **Bounded GL contexts.** Each canvas owns a WebGL2 context, so shaders mount
  via `IntersectionObserver` only while near the viewport.
- **Offline & self-contained.** The field is generated entirely in the fragment
  shader — no images, fonts, or textures to ship. System font stacks only.

## Props

| Prop | Type | Default | Maps to |
|------|------|---------|---------|
| `shape` | `"simplex" \| "warp" \| "dots" \| "wave" \| "ripple" \| "swirl" \| "sphere"` | `"simplex"` | `u_shape` |
| `type` | `"random" \| "2x2" \| "4x4" \| "8x8"` | `"8x8"` | `u_type` |
| `colorBack` | `string` (hex) | `"#000000"` | `u_colorBack` |
| `colorFront` | `string` (hex) | `"#ffffff"` | `u_colorFront` |
| `pxSize` | `number` | `4` | `u_pxSize` |
| `speed` | `number` | `1` | time scale (`0` = static) |
| `width` / `height` | `number` | `800` | `u_resolution` |

## Getting started

```bash
npm install
npm run dev      # vite dev server
npm run build    # tsc -b && vite build
npm run verify   # headless WebGL2 + interaction checks
```

## Integration notes (shadcn)

`components.json` carries the canonical shadcn aliases: components resolve to
**`@/components/ui`** and styles to **`src/index.css`**. The component imports
itself as `@/components/ui/dithering-shader`, so it must live in
`components/ui` — that is the folder the shadcn CLI writes primitives into and
the path the `@/` alias points at. If you are not on shadcn yet, run
`npx shadcn@latest init` in a TypeScript + Tailwind project to register the
alias, then drop the file in. `DitheringShader` itself is dependency-free
(React only); `clsx` + `tailwind-merge` back the `cn()` helper and
`lucide-react` supplies the surrounding icons.

## Verification

`scripts/verify.mjs` boots the dev server and drives a headless Chromium
(software WebGL via SwiftShader) to assert the hero paints a real WebGL2 field
(screenshot-analysed: tonal range + orange-over-navy), that all 7 shape and 4
dither controls exist and rewire the hero, that the shape-library tiles mount
live canvases, and that the page logs no console errors.

---

Built with **Claude Fable 5** as a [claude-directory](../../README.md) shader
experiment. Component © [designali-in](https://github.com/designali-in).
