# LinkFlow — Boomerang Video Hero

A full-screen hero section for a fictional automation product, LinkFlow™. The standout technique is a custom "boomerang" background: the video plays through once while every frame is captured into offscreen canvases, then those frames replay forward and backward in a seamless 30fps ping-pong loop on a display canvas — no looping video element.

Built in React 18 + TypeScript with Vite and Tailwind CSS. Frame capture is driven by `requestVideoFrameCallback` with a `requestAnimationFrame` fallback (`BoomerangVideoBg.tsx`). Over the video sit a glassmorphic pill navbar with a sliding mobile drawer (staggered, cubic-bezier transitions), centered hero copy, a bottom-left CTA block, and a bottom-right video link — all motion is pure CSS `transition-*` classes, no animation library. Icons come from `lucide-react`; type uses Inter and self-hosted Neue Haas Grotesk over a green palette (`#1f2a1d` / `#336443` / `#85AB8B`).

## Run

```sh
npm install
npm run dev       # dev server
npm run build     # production build
npm run preview   # serve the build
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
