# Superdesign — Cinematic Agency

An immersive, dark-mode creative-agency landing page that uses 3D spatial depth and high-contrast editorial typography for a theatrical feel. The base is near-black `#050505` with Aspekta (weights 300/500/700/900) for everything and all-uppercase headings. Accents are minimal but punchy: a cyan→pink gradient (`#06B6D4`→`#EC4899`) for primary CTAs and a purple glow for pricing. Depth comes from `1px solid rgba(255,255,255,0.1)` borders plus `backdrop-filter: blur(8px)` — no drop shadows.

The page scrolls through a fixed `mix-blend-difference` nav, a 3D rolodex cube hero (`perspective: 2000px`, four faces on a constant infinite X-axis rotation) over massive background wordmark type, a case-studies bento grid, a three-tier pricing section with a featured white center card, a startups banner, a glassmorphism price calculator with a live range slider, and a massive-scale editorial footer. Images start grayscale and reveal color on hover; buttons scale to 1.02. The cube rotation, grayscale hover, button scale, and calculator are all live and responsive down to mobile.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
