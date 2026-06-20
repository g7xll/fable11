# Heavyweight

A minimalist yet high-impact brutalist industrial design system / storefront for a fictional technical-apparel label, **Heavyweight®**. It runs on a "concrete" (`#F2F2F2`) and "ink" (`#0A0A0A`) palette with a persistent 4%-opacity film-grain overlay, grayscale imagery that reveals color on hover (700ms), and `mix-blend-difference` on the fixed header so text stays legible over any background. Red (`#DC2626`) is reserved strictly for live status dots and the cart badge.

Type pairs Anton for massive uppercase headlines (0.85 leading) with Space Grotesk for technical, monospace-style metadata; links use a 2px line-through hover. The layout is intentionally asymmetrical and "unbalanced": a non-standard header with elements pushed to extreme corners, a split hero with an off-screen-cropped image and a rotated section label, a snap-scrolling horizontal product strip, a 12-column technical info grid with a sticky left column, a "broken" live inventory grid, a rotated-poster masonry social-proof wall, and a utility footer anchored by a `10vw` ghost word.

A floating circular cart button, detail spec badges on images, and vanilla JS handle the cart count, scroll reveals, a live stock ticker, and drag-to-scroll — all respecting `prefers-reduced-motion`. Fonts and imagery are vendored locally.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
