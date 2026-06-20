# Axion Studio — Design Agency Landing Page

A single-page landing site for **Axion Studio**, a strategy-led design agency. Three stacked sections — a full-viewport animated-shader hero, an "about" section, and a featured case-studies section.

Built with React 18 + TypeScript on Vite, styled with Tailwind CSS, with Lucide icons. The hero background uses an animated WebGL shader stack (`Shader`, `Swirl`, `ChromaFlow`, `FlutedGlass`, `FilmGrain` from the `shaders` package, with `pixi.js` as a peer dependency). Other distinctive techniques: a hover "text-roll" CTA interaction, a live London wall-clock updated every second, a slide-up mobile bottom-sheet menu, and CSS hover-expanding pill buttons over autoplaying case-study video.

## Run

```sh
npm install
npm run dev      # start the dev server
npm run build    # type-check (tsc -b) and build for production
npm run preview  # preview the production build
npm run verify   # run the Playwright verification script
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
