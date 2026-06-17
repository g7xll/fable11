# Animated Shader Background — AnoAI

A self-contained **React + TypeScript + Vite + Tailwind CSS v4** project that integrates the
provided `animated-shader-background.tsx` component (a `three.js` aurora fragment shader) and
composes a polished **AnoAI** product hero on top of it.

The live aurora is a full-viewport WebGL layer; the hero uses every `lucide-react` icon the
original snippet imported (`Infinity`, `Rocket`, `Shield`, `Brain`, `Play`, `ChevronDown`).

![demo](./demo.mp4)

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check (tsc -b) + production build
```

## Integration notes (answering the prompt)

This repo already satisfies the required stack, so no project bootstrap was needed:

- **shadcn project structure** — `components.json` is present, the `@` alias resolves to `./src`
  (configured in both `vite.config.ts` and `tsconfig`), the `cn()` helper lives in
  `src/lib/utils.ts`, and UI components live in **`src/components/ui/`**.
- **Tailwind CSS** — Tailwind **v4** via `@tailwindcss/vite`; the entry stylesheet
  `src/index.css` begins with `@import "tailwindcss";` and `@import "tw-animate-css";` and
  includes the required `@keyframes float`.
- **TypeScript** — strict mode, project references (`tsconfig.app.json` / `tsconfig.node.json`).

If you were starting from scratch instead, you would:

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install tailwindcss @tailwindcss/vite tw-animate-css
npx shadcn@latest init          # creates components.json + the @/ alias + src/lib/utils.ts
```

### Why `components/ui`

shadcn's `components.json` pins the `ui` alias to `@/components/ui`. The CLI (`npx shadcn add …`)
writes generated primitives there, and every component import in the ecosystem is written as
`@/components/ui/<name>`. Keeping this exact folder means the prompt's
`import AnoAI from "@/components/ui/animated-shader-background"` resolves unchanged, and any future
`shadcn add` lands its files in the same place without churn. This project's default component path
**is** `src/components/ui`, so the component was copied there verbatim (made TypeScript-correct).

### Component questions

- **Props / data** — the component is self-contained and takes no required props. The shader reads
  `iTime` / `iResolution` uniforms it manages itself. (`ShaderCanvas` takes one internal
  `onUnsupported` callback for the fallback.)
- **State** — local `useState` only (tracks WebGL availability to switch to the CSS fallback). No
  global store or context provider is required.
- **Assets** — no external images are required by the shader. The hero adds four locally-generated
  avatar SVGs (`public/assets/`) and a self-hosted **Geist** font (`public/fonts/`). All icons are
  `lucide-react`. Nothing is hotlinked — the project runs fully offline.
- **Responsive behavior** — full-bleed on every breakpoint; the nav collapses its links on small
  screens, the headline scales (`text-5xl → text-7xl`), CTAs stack, chips wrap, and there is no
  horizontal overflow.
- **Best placement** — as a landing/hero background. The shader canvas is `fixed inset-0 -z-10`, so
  any foreground section can sit on top of it.

## Robustness

`new THREE.WebGLRenderer()` is wrapped in `try/catch`, and a `webglcontextlost` listener is wired
up. When WebGL is unavailable (locked-down browsers, blocklisted GPUs, headless-without-GL), the
component renders an animated **CSS aurora fallback** instead of crashing the React tree or showing
flat black.

## Verification

`scripts/verify.mjs` is a headless check (Playwright, run against a live dev server) that asserts no
console/page errors, the shader paints visible aurora (decodes a screenshot, not just `readPixels`),
all hero elements render, fonts load, avatars decode, and the mobile layout has no overflow. It
adapts to the environment (WebGL present → asserts the canvas; WebGL absent → asserts the CSS
fallback engaged).
