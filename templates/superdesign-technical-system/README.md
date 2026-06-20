# Superdesign — Technical System

A landing page for an AI design-review product, built on a "Technical Minimalist" design system inspired by technical blueprints and high-end UI wireframes. It uses a full-page mosaic grid background of interlocking rectangular panels, razor-thin 1px hairlines, and a prestige forest-green primary color. The aesthetic is flat and 2D, with no shadows, no gradients, and fully square (0px-radius) corners.

Type pairs Space Grotesk (display) with JetBrains Mono (all labels, tags, and metadata, uppercase with wide tracking). The palette is Paper `#F7F7F5`, Forest `#1A3C2B`, and Grid `#3A3A38`, plus coral / mint / gold accents. The vertical-scroll structure runs through a fixed nav, a two-column hero with L-shaped hairline corner markers, a trust bar, a 2×2 bento "Feature Set 01" grid with colored left-border accents, a rotating network-topology graph, a three-column monospaced testimonials grid, a "Tell your CTO" CTA form with corner markers, and a footer. The hero image uses `mix-blend-mode: luminosity` and shifts to full color on hover.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
