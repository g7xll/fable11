# Lumina — Editorial Portfolio

A high-end, premium portfolio template for a fictional design studio, **Lumina**, blending brutalist typography with luxury minimalism. It sits on a dark navy base (`#171E19`) with sage (`#B7C6C2`), cyan (`#D5F4F9`), and taupe (`#9F8D8B`) supporting tones, generous negative space, and high-contrast sections that alternate dark and light. The feel is editorial and cinematic.

Type uses Anton (uppercase, heavy, from 8xl up to 18vw) for all primary headings against Plus Jakarta Sans body. The layout runs a full-viewport hero with two floating blurred ambient orbs and a sage text-outline second line, an asymmetric 2-column masonry "Selected Works" grid (even cards pushed down 4rem), a featured project with an offset cyan square behind a grayscale image, a 12-column capabilities list with growing line prefixes, a charcoal testimonial carousel with a giant background quote glyph, and a massive "Let's Create" footer.

Signature mechanics: a `mix-blend-difference` fixed nav that inverts over light/dark sections, circular hover-reveal "VIEW" badges over portfolio cards, 1.1x image scales, and 1000ms scroll reveals — all on `cubic-bezier(0.16, 1, 0.3, 1)`. Fonts and imagery (hand-authored SVGs) are vendored locally.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
