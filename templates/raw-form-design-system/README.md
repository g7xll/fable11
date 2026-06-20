# Raw Form

A high-contrast brutalist e-commerce storefront / design system for a fictional label, **Studio/Raw**, that prioritizes typographic drama and atmospheric depth — massive type breaks, soft organic gradient blobs, and a sharp grid-based hierarchy instead of container-heavy UI. It blends Swiss brutalism with a warm palette: base `#E4E2DD`, ink `#1E1E1E`, accent red-orange `#DB4A2B`, warm orange, and soft pink.

Type pairs Clash Display for all headings (hero at `18vw`, 0.75 line-height, tight tracking) with Satoshi for body, nav, and metadata. The single vertically-scrolling page runs: a fixed transparent nav, a typographic hero with three multiply-blended blurred blobs behind a "RAW / FORM." headline, an "Outerwear" category divider, a borderless product grid (5 products plus a dark "Full Archive" tile), a "Designed for Movement" campaign block, an "Objects" divider, and a dark footer with a `10vw` background year.

Signature components include the interactive CTA button (a white fill sweeping left-to-right behind the text on hover) and the animated gradient blobs. Entrance uses an 0.8s `cubic-bezier(0.16, 1, 0.3, 1)` slide-up with stagger delays. Fonts and apparel imagery are vendored locally.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
