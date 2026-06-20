# flok — Gen-Z Neo-Brutalist Landing

An expressive, playful neo-brutalist landing page for a fictional Gen-Z social app, **flok**. The look is high-contrast and anti-corporate: a saturated tri-color palette (acid green `#CCFF00`, electric purple `#7000FF`, hot pink `#FF0099`) against deep black, mostly lowercase UI, 4px black borders, hard 6px offset shadows (no blur), and elements rotated ±3 degrees for a "placed" sticker feel.

Type is Space Grotesk for tight bold headlines and DM Sans for casual body. The asymmetrical, modular layout runs from a floating sticky nav pill, through an acid-green two-column hero with a gradient-text headline, a tilted brutalist phone mockup, and floating emoji stickers; a slanted black marquee; a 12-column bento feature grid with spanning cards and an embedded mini-dashboard; a brutalist `<details>` FAQ; a hot-pink giant CTA; and a footer with a `10vw` ghost wordmark.

Animations lean bouncy on `cubic-bezier(0.175, 0.885, 0.32, 1.275)`: press-into-shadow card/button hovers, a wobble-on-hover button, infinite floating stickers, the scrolling marquee, and staggered pop-in reveals. Fonts are vendored locally.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
