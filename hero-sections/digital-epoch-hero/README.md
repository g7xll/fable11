# Digital Epoch

A cinematic landing-page hero: a full-bleed, video-backed rounded hero card with a floating bottom navbar, followed by a seamless infinite logo marquee. Built with React, TypeScript, Tailwind CSS v4, and Motion (Framer Motion), with Lucide icons and a `cn()` class-merge helper (clsx + tailwind-merge). Type pairs Inter (`--font-sans`) with Outfit (`--font-display`).

The marquee is a pure CSS `@keyframes` scroller — two identical halves translated to `-50%` for an imperceptible loop — with a `mask-image` edge fade and a pause-on-hover state. The hero plays an autoplaying muted background video behind a fade-and-slide-up text layer; logo cards reveal a gradient wash and invert their mark on hover. The background video and logo SVGs are vendored locally under `public/assets/`.

## Run

```sh
npm install
npm run dev      # start the Vite dev server
npm run build    # type-check (tsc) and build for production
npm run preview  # preview the production build
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
