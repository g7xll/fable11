# Lumina — Neo-Brutalist SaaS Landing

A vibrant neo-brutalist landing page for a fictional creator-OS SaaS, **Lumina**. It pairs a dominant yellow (`#FFE17C`) with deep charcoal (`#171E19`) and sage (`#B7C6C2`) accents, using high-contrast 2px black borders, hard offset shadows (no blur), a 32px radial dot pattern on yellow backgrounds, and bold geometric type — Cabinet Grotesk (extrabold/black) for headings, Satoshi for body.

The vertically stacked page moves through high-contrast transitions: a fixed yellow nav, a two-column hero (with a text-stroke "CHAOS" keyword and a browser-mockup dashboard plus a floating signup notification), a dark social-proof marquee, a problem-vs-solution card pair, a 3-column feature grid, a dark "How It Works" 3-step flow, a use-case personas bento, asymmetric-corner testimonial cards with gold stars, and a final CTA + footer.

The signature interaction is the neo-brutalist push button: it translates `4px, 4px` and drops its shadow on hover to simulate a physical press, on a bouncy `cubic-bezier(0.175, 0.885, 0.32, 1.275)`. All shadows have zero blur; branded sections stick strictly to the three brand hexes. Fonts are vendored locally.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
