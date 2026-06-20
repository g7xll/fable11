# Modern Editorial Manifesto

A premium editorial launch page built around massive typographic headlines, a rhythmic vertical scroll, and a deep contrast between charcoal (`#0A0A0C`) and warm cream/paper (`#E8E6E1`) with a gold-cream accent (`#D4C5A2`). Type pairs Fraunces (variable high-contrast serif, with optical sizing) for headlines up to 15vw with tight 0.8 leading and Manrope for body. A global SVG grain overlay (opacity ~0.04, `mix-blend-mode: overlay`) adds paper-stock texture, and selection color is `#D4C5A2` on dark text.

The page unfolds as ten thematic chapters: a full-screen typographic hero cover with a vertical side label, an intro paragraph, a sticky two-column essay with a bordered pull-quote, a vertical narrative list of full-width hover rows, a light-background manifesto grid, gradient-clipped editorial testimonials, a backdrop-blur CTA card, a final statement, and a footer. Navigation floats via `mix-blend-difference`. Motion is slow and deliberate (≥1s eased) — reveal-on-scroll fades and a staggered hero entrance — with reduced-motion respected. No box-shadows, rounded buttons, icon libraries, or images.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
