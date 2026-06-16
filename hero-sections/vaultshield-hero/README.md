# VaultShield Hero

Fullscreen hero section for a fictional password manager, **VaultShield** — built with React 18, TypeScript, Tailwind CSS, Framer Motion, and Lucide React icons.

The originating prompt is preserved verbatim (uppercased) in [`prompt.md`](./prompt.md).

## Highlights

- Full-viewport CloudFront background video (`autoPlay muted loop playsInline`, `object-cover`)
- `Helvetica Now Display Bold` display face + `Inter` body, wired through CSS variables
- Hero heading with inline Lucide icons (Zap, LockKeyhole, Fingerprint) baked into the line
- Staggered fade-up entrance (heading → subtext → CTA) on a `[0.22, 1, 0.36, 1]` ease
- Mobile slide-in menu sheet (`min(88vw, 360px)`, `#CFC8C5`) with blurred backdrop, staggered links, Escape/backdrop close, and body scroll lock
- CTA pill with purple glow, hover scale + brightness, tap shrink

## Run

```bash
npm install
npm run dev        # dev server
npm run build      # type-check + production build
```

## Verify (headless, CLI-only)

```bash
npm run build
npx vite preview --port 4723 &
node scripts/verify.mjs http://localhost:4723
```

The script drives headless Chromium through desktop (1440×900) and mobile (390×844) passes, asserting the video wiring, fonts, CSS variables, nav, heading/subtext/CTA computed styles, entrance animation completion, hover behavior, and the full mobile-sheet lifecycle.
