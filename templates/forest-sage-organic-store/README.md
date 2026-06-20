# Verde

An earthy, high-end editorial e-commerce storefront for a fictional farm-to-table grocery brand, **Verde**. It combines heavy condensed display type (Anton) with clean tracked-out sans utility text (Inter), a "forest and sage" color story (forest `#01472e` — used for all dark text, never black — sage, olive, cream, moss), a persistent 4%-opacity SVG fractal-noise overlay, and ultra-rounded color-blocked sections that curve over one another with `5rem` top corners.

The vertically stacked layout runs from a floating pill nav, through a full-viewport sage hero with a `23vw` Anton word and floating organic ingredient images, an infinite forest marquee strip, an olive product grid with blur-reveal "Quick Add" buttons on hover, a cream editorial story band, and a forest footer with an underline-only newsletter input.

Motion is the premium signature: scroll reveals slide up from `translateY(100px)` over 1.2s, the hero word reveals letter-by-letter on load, and foreground images run an infinite float keyframe plus scroll-depth parallax — all on the exact `cubic-bezier(0.16, 1, 0.3, 1)`. Fonts and imagery are vendored locally.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
