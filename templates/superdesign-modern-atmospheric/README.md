# Superdesign — Modern Atmospheric

A single-page marketing landing site for the AI design tool Superdesign, built in the "Modern Atmospheric" design system: deep slate atmospheric backgrounds (`#0F172A`), clean off-white feature surfaces (`#F8F9FA`), glass panels with 12px blur, vibrant indigo accents (`#6366F1`), and animated glow gradients for a futuristic, premium feel.

Typography is a core pillar — Lora (serif) for large expressive headlines, Inter (sans) for UI and body, and Space Grotesk for the wordmark and technical accents. The page is a tiered vertical scroll: sticky nav, a 110vh atmospheric dark hero with a glowing "vibe input box," a floating glass integration bar, a light-mode feature scroll-spy (sticky sidebar tracked via intersection observer), a dark masonry glass testimonials grid, a light FAQ accordion, and a footer. Motion is subtle but intentional: a blinking typing cursor, a 180° logo rotation on hover, a multi-color outer glow that intensifies on focus, and 500ms sticky-nav state transitions.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
