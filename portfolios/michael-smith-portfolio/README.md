# Michael Smith — Dark Portfolio Landing Page

A single-page, forced-dark portfolio landing page for a fictional Chicago designer/developer. It opens with an animated loading screen, then reveals a full-viewport hero backed by a looping HLS video, followed by selected works, a journal feed, a scroll-driven parallax gallery, animated stats, and a contact/footer section with a marquee and a second HLS video.

Animations are driven by GSAP (entrance timelines, ScrollTrigger pinning/parallax, marquee) and Framer Motion (in-view reveals, route/page and presence transitions). Background video uses `hls.js` (loaded lazily via dynamic `import()`, with native HLS fallback for Safari). Notable techniques include requestAnimationFrame counters, a scroll-spy navbar, GSAP `ScrollTrigger.create` pin + scrubbed parallax, and animated CSS gradient ring borders.

Built with React 18 + react-router-dom + TypeScript + Vite + Tailwind CSS.

## Run

```sh
npm install
npm run dev       # dev server
npm run build     # type-check (tsc --noEmit) + production build
npm run lint      # tsc --noEmit
npm run preview   # serve the production build
npm run verify    # node scripts/verify.mjs
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
