# Red Sun

A coral-and-ink editorial template, **Red Sun**, that pairs a bold coral primary (`#EF4623`) with a deep ink-blue foundation (`#2D3B42`) for a modern, premium feel. It leans on large-scale serif typography, generous white space, soft peach (`#FDF1EE`) accents, ambient blurs, and large corner radii (no sharp 90° corners anywhere) — coral is the strict primary action color.

Type uses Instrument Serif for expressive headlines (italic for emphasis, hero at `clamp(4rem, 11vw, 10rem)`) and Manrope for body and UI. The asymmetrical, modular structure runs: a glassmorphism-on-scroll fixed nav with a rotating coral logo mark, a centered hero with ambient blob circles and a two-line headline, a value-proposition bento with a floating animated UI simulator (skeleton loaders + a "Code Generated" status bar), a three-column features bento (48px radii, large/dark/standard card styles), a full-width coral CTA with a dot-grid pattern, and a deep-ink 5-column footer.

The signature interaction is the "fade-up" reveal: every element starts at `translateY(28px) rotate(2deg)` and resolves on `cubic-bezier(0.16, 1, 0.3, 1)` with staggered delays — the 2-degree start rotation is the editorial tell. Float and shimmer loops respect `prefers-reduced-motion`. Fonts are vendored locally; icons are inline Lucide SVGs.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
