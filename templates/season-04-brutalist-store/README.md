# Season 04 — Brutalist Store

A high-fashion brutalist e-commerce storefront that blends luxury editorial sensibilities with harsh, technical-utilitarian industrial design. A single vertically-scrolling landing page runs through a sticky blend-mode nav, a full-screen split-indented hero, a manifesto grid, "Outerwear" and "Objects" category dividers, an asymmetric product grid, and a multi-column dark newsletter footer capped by a giant ghost brand title.

The aesthetic is "raw": a neutral beige base (`#E3E2DE`) with brownish-black text (`#1B0E0D`), burnt-red (`#C72A09`) and deep-brown (`#61220F`) accents, neon acid-green (`#31EF07`) micro-interactions, all under a persistent SVG fractal-noise grain overlay (`mix-blend-mode: multiply`, opacity 0.08). Type pairs Clash Grotesk for massive tight-tracked display headings, General Sans for body and UI, and a monospace for technical metadata and prices — all vendored locally. Signature touches include the `mix-blend-mode: difference` sticky nav, scaling neon-green hover underlines, grayscale imagery with `scale(1.05)` hover, a 12-column asymmetric grid, and a sharp-edged neon "Quick View" badge revealed on product hover. Fonts and imagery are served locally so it runs fully offline.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
