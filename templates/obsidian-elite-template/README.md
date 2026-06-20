# Obsidian Elite

A minimalist, dark-themed "Modern Obsidian" editorial template for a fictional invite-only platform, **Obsidian** ("by invitation only") — a waitlist / beta-capture landing page. The palette is strictly monochromatic (`#080808` obsidian to pure white) with silver text and a 135° silver gradient, a 5%-opacity fractal-noise overlay, and depth built from borders and backdrop blur rather than box-shadows.

Type is a three-way system: DM Serif Display in italics for high-impact headlines (hero `clamp(42px, 10vw, 140px)`), Geist Mono for all technical labels and buttons, and Inter for body. Fluid 92vw widths maximize editorial impact. The vertical narrative runs: a nav with bordered glass links and a silver "JOIN" button, a frosted-glass hero with a silver-gradient italic span and a 3-column metadata bar, an editorial serif countdown with slash separators, a glass beta-capture form with a success state, a social-proof stat row, a bento feature grid (including a member-registry card with a 2x2 grayscale avatar grid), a value-proposition statement, testimonials, a final CTA, and a footer.

Signature components include the silver-gradient button, the serif-numeral countdown, and a floating mobile bottom-nav pill that appears only after the hero scrolls past. Entry animations slide up over 0.8s on `cubic-bezier(0.16, 1, 0.3, 1)`. Fonts and grayscale SVG avatars are vendored locally.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
