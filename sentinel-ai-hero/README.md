# SENTINEL AI — Hero Landing Page

Full-screen dark hero landing page for the fictional security company **SENTINEL AI**.

- **Stack**: React 18, Vite 5, TypeScript, Tailwind CSS 3, shadcn/ui (Button), `@splinetool/react-spline` + `@splinetool/runtime`
- **Font**: Sora (300–700) via Google Fonts
- **Theme**: dark-only HSL token system — charcoal background, vivid green primary (`119 99% 46%`)
- **3D**: lazy-loaded Spline scene as a full-bleed interactive background, with a `bg-black/30` legibility overlay
- **Motion**: staggered `fade-up` reveals (blur + translate) on every hero element

## Run

```sh
npm install
npm run dev      # dev server
npm run build    # type-check + production build
npm run preview  # serve the production build
```

See `PROMPT.txt` for the original experiment prompt.
