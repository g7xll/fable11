# Viktor Oddy — Creative Studio Landing Page

Single-page landing for the fictional creative design studio **Viktor Oddy**,
built with React + TypeScript + Vite + Tailwind CSS and lucide-react icons.

Typography pairs **PP Neue Montreal** (body, Webflow CDN) with **PP Mondwest**
(serif accent, served locally from `/PPMondwest-Regular.woff2`).

## Sections

1. Hero (narrow centered column, staggered fade-in-up reveals)
2. Infinite GIF marquee (30s desktop / 10s mobile loop)
3. Testimonial quote with scroll parallax portrait
4. Pricing cards (dark Monthly Partnership / light Custom Project)
5. Auto-scrolling testimonial carousel (3s autoplay, hover pause, infinite via tripled list)
6. Project showcase (per-item IntersectionObserver reveals)
7. "Partner with us" CTA with cursor-trail GIF thumbnails
8. Footer, copyright bar, fixed floating bottom nav

## Run

```sh
npm install
npm run dev      # dev server
npm run build    # type-check + production build
npm run preview  # serve dist/
```
