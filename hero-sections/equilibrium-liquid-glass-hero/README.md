# Equilibrium — Liquid Glass Hero

A full-screen, single-screen hero for a wellness brand, sitting on a looping background video and overlaid with a "liquid glass" UI: a frosted blurred navbar pill, glassy CTA buttons, and a bottom-left headline block. Built with React 18, TypeScript, Vite, Tailwind CSS 3, and Lucide icons, with the Geist typeface from Google Fonts.

The signature effect is a `.liquid-glass` utility combining `backdrop-filter: blur(4px)` with a gradient-border `::before` pseudo-element drawn via mask compositing (`mask-composite: exclude`). There are no keyframe animations — buttons use Tailwind `transition-colors`, and all on-page motion comes from the looping muted autoplay video itself. Includes a responsive mobile menu toggled by state.

## Run

```sh
npm install
npm run dev      # start the Vite dev server
npm run build    # type-check (tsc) and build for production
npm run preview  # preview the production build
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
