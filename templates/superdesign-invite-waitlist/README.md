# Superdesign — Cinematic Editorial Invite Waitlist

A minimalist, editorial invite-only waitlist page built to convey quiet confidence and exclusivity. The aesthetic is dark matte editorial: matte charcoal background (`#181818`), warm-beige text (`#EBDCC4`), muted-sage labels (`#B6A596`), coral-rust accent (`#DC9F85`), and deep-earth/burnt-umber borders. Display type is Clash Grotesk (bold, uppercase, `tracking-tight`, `leading-[0.85]`, 11.5vw desktop) with General Sans for body. A fixed fractal-noise SVG overlay at 0.03 opacity adds texture; corners are limited to 4px radius with 1px solid borders — no gradients, shadows, or pill shapes.

The layout is an absolute minimal nav, an oversized hero whose headline uses a layered depth effect (a 1px `#66473B` text-stroke copy offset 4px behind the solid beige front), and a 12-column bottom grid splitting an exclusivity statement (with a status dot) from a unified email-capture form. A 64px rotating SVG text-path badge ("WAITING LIST •") spins infinitely at 12s, and the form's JS swaps the button label to "JOINED ✓" on submit. The palette stays strictly within the six earthy tokens.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
