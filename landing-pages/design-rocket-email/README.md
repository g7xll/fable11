# Design Rocket Certificates — Email-Style Marketing Page

A single-page app that renders an email-style marketing page for the **Design Rocket Certificates** AI leadership course (built in collaboration with Microsoft). It is laid out as a narrow 640px email container on a dark background, with a video hero, intro copy, two content sections (each pairing a looping video with copy and a CTA), a lime call-to-action card, and a footer with social icons and legal links.

Built with React 18 + TypeScript on Vite, styled with Tailwind CSS, with Lucide icons. Fonts are Instrument Serif (display headings) and Inter (body/UI). Notable techniques: auto-playing muted looped `<video>` backgrounds, a CSS `linear-gradient` overlay on the hero, and hover transitions on buttons and hover-zoom video cards.

## Run

```sh
npm install
npm run dev      # start the dev server
npm run build    # type-check (tsc) and build for production
npm run preview  # preview the production build
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
