# Superdesign — Editorial Grid

A sophisticated editorial-tech interface using a trio of typefaces: Playfair Display (serif) for headers, Space Grotesk (sans) for body, and Space Mono for all technical data, labels, and buttons. The palette is organic and muted — background `#F7F6F2`, foreground `#1C1C1C`, and a muted forest-green accent `#3D7068` — with 1px `#E5E4DE` borders instead of shadows. A fixed background layer carries vertical guides at 25/50/75% plus a 40px square grid masked with a radial fade toward the edges. All animation uses `cubic-bezier(0.16, 1, 0.3, 1)` at 700–1000ms.

Content runs through a floating-to-fixed blurred nav, a 9vw serif hero with a pulse-dot badge and a tracking-expanding CTA, a three-column statistics grid, a scroll-synced word-reveal section (per-span opacity 0.15→1.0), an interactive workflow with a sticky grayscale card and a `#3B82F6` scan-line progress bar, use-case tabs with a 240px ghost glyph, and a bottom-bordered contact form. Border-radius never exceeds 2px and fills stay solid — no vibrant gradients.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
