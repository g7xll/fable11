# Valmax — Ralph Edwards Photography

A single-page React landing site for **Valmax**, the fictional cinematic photography studio of Ralph Edwards. The site is permanently dark (OKLCH near-black with a lime selection accent) and opens with a ~3.6s `IntroSequence` — concentric circles, radiating rays, and a clip-revealed wordmark that flies into the topbar slot — before the rest of the page animates in. Sections (RalphHero, OurPhotographer, AllTypes, MechanicalMarvels, Footer) are layered over a canvas `Starfield` (with an optional constellation ring) and an SVG `LineField` of animated lines and monospace star markers, with floating photo collages, pointer parallax, and a scroll-driven parallax background.

Built with TanStack Start v1, React 19, Tailwind v4 (single `src/styles.css`), Framer Motion, and lucide-react. The page is a single route (`/`) rendering `<ValmaxLanding />`, with motion orchestrated via shared blur-in / photo-in variants and a 2.9s intro delay; `prefers-reduced-motion` shortens the intro and disables hero parallax. Image assets have graceful fallbacks (placeholder divs, text wordmark, omitted decoratives).

## Run

```sh
npm install
npm run dev      # custom dev server (scripts/dev.mjs)
npm run dev:hmr  # vite dev with HMR
npm run build    # vite build
npm run serve    # preview the build
npm run lint     # tsc --noEmit
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
