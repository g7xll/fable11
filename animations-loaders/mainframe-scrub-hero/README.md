# Mainframe® — Scrub Hero

An interactive contact hero for the fictional studio **Mainframe®**. On desktop, the
background film is *scrubbed natively by the cursor*: horizontal mouse movement drives
`video.currentTime` (one full-viewport sweep ≈ 80% of the timeline), with seeks
serialized through the `seeked` event so tracking stays smooth frame to frame. Below
the `lg` breakpoint scrubbing is disabled and the video simply autoplays beneath the
content.

The headline types itself out with a custom `useTypewriter` hook (blinking block
cursor, removed when typing completes), and a multi-select row of service pills feeds
a contingent status banner that springs open with the current selection.

Built from the verbatim prompt in [`prompt.md`](./prompt.md).

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS v4 (`@tailwindcss/vite`, Inter via Google Fonts, `--font-sans` theme token)
- Framer Motion (`motion/react`) — drop-in reveals, spring check icons, `AnimatePresence` banner swap
- lucide-react icons
- Playwright (headless verification)

## Architecture notes

- `src/components/BackgroundVideo.tsx` — full-bleed `<video>`; desktop mousemove
  scrubbing with delta-based targeting, clamping, and a one-seek-in-flight queue
  (no-op seeks are skipped — the browser fires no `seeked` for them, which would
  wedge the queue); mobile autoplay hook.
- `src/components/Navbar.tsx` — fixed transparent navbar; comma-separated desktop
  links; hamburger that morphs into an ✕; full-screen blurred mobile overlay. The
  overlay renders *inside* the fixed `z-10` header so it stacks above the white
  mobile content layer (also `z-10`, later in the DOM).
- `src/hooks/useTypewriter.ts` — `setTimeout` + `setInterval`, returns
  `{ displayed, done }`.
- `src/components/ServicePicker.tsx` — multi-select pills with spring check icons
  and the `AnimatePresence mode="wait"` placeholder/banner swap.
- `src/App.tsx` — the spec's layout shell. One addition: `pt-24 lg:pt-12` on `main`
  so the fixed header never overlaps the headline on small screens.

## Run

```sh
npm install
npm run dev
```

## Verify

```sh
npm run build    # tsc --noEmit + vite build
npm run verify   # headless Playwright suite against the built app
```

`scripts/verify.mjs` serves `dist/` via `vite preview` and intercepts the CloudFront
video URL with a local 4-second fixture (`scripts/fixtures/scrub-fixture.mp4`),
served with proper `Accept-Ranges`/206 semantics so Chromium treats it as seekable.
That keeps all 49 checks — including actual scrub-forward / rewind-and-clamp
assertions and mobile autoplay — deterministic and offline-safe.
