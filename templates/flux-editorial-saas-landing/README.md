# Flux

A bold, high-contrast editorial landing page for a fictional creator / small-business OS SaaS, **Flux**. The aesthetic is "brutalist-lite SaaS": massive Anton display type (uppercase, 0.9 line-height) paired with Satoshi body, a golden-yellow accent (`#FFE17C`) against charcoal (`#171E19`) and white, a 40px grid background, and a signature 15-degree rotated yellow highlight bar behind key headline words.

The page is a conversion funnel: a grid-pattern hero with a waitlist form and an abstract browser-style UI mockup, a high-contrast problem/solution split ("The Old Way" vs "The Flux Way"), a bento feature grid with spanning cards and embedded UI elements, a sticky-titled numbered "How It Works" section with giant fading numerals, alternating light/dark testimonial cards with oversized yellow stars, a high-energy yellow final CTA, and a charcoal footer.

Cards use `300ms cubic-bezier(0.4, 0, 0.2, 1)` lift-and-shadow hovers; a small amount of vanilla JS handles the interactions. Fonts are vendored locally for offline use.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
