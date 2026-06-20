# Atelier Archive

A quiet-luxury, catalog-driven design system styled after high-end architectural magazines. It reads as a single vertically-scrolling "magazine spread" for a fictional furniture house, **Atelier Archive** — built on a cream off-white page (`#fdfbf9`) framed by vertical 1px page borders within a 1440px max width, with a subtle neutral border-grid that reinforces the archival feel.

Typography pairs a light, expressive serif (Zodiak, with Cormorant Garamond as the vendored analog) for headings — italic emphasis words throughout — against a clean grotesque sans (General Sans / Hanken Grotesk) for UI labels in 10px uppercase wide tracking. Imagery is procedurally generated SVG, desaturated and passed through a light grayscale to unify mixed sources.

Animations are slow and atmospheric: 1.2s fade-in reveals driven by IntersectionObserver, 2s image hover scales, animated 1px underline CTAs, a white slide-up overlay on the material grid, and a faint→black italic transition on the interactive room index.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
