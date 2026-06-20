# Stellar.ai — Landing Page Hero

A single-screen, centered hero for an AI-productivity landing page: a navbar, a gradient headline, a CTA, an auto-cycling tab bar, a looping background video with four tab-driven overlay cards, and a row of company logos — everything entering with a staggered fade-in-up. Built with React 18, Vite, Tailwind CSS 3, and Lucide icons, with the Inter typeface from Google Fonts.

Notable techniques: custom CSS keyframe animations driven by staggered inline `animationDelay`, an auto-cycling tab state (`setInterval` advancing every 4s) and conditional overlay components keyed off the active tab — each overlay is remounted via `key` to retrigger its entrance. The four overlays (Analyse setup wizard, Train metrics panel, Testing results, Deploy checklist) sit over a looping muted autoplay video vendored locally under `public/assets/`. The color system uses only Tailwind's default palette, including the black→gray heading gradient.

## Run

```sh
npm install
npm run dev      # start the Vite dev server
npm run build    # build for production
npm run preview  # preview the production build
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
