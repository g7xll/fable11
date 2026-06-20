# Superdesign Crimson Craft — Dark Luxury Service Landing

A premium, long-form landing page for a high-ticket classic/exotic car restoration studio, built on a "dark luxury" theme: crimson (`#E11D48`), off-black (`#121212`), and white. Headlines use Cal Sans (weight 700–900, tight tracking) with Poppins for body. Visual depth comes from deep glassmorphism (`backdrop-filter: blur(16px)`), subtle `rgba(255,255,255,0.08)` borders, and a crimson-to-dark-red gradient on major CTA sections. Reveal-on-scroll uses `cubic-bezier(0.4, 0, 0.2, 1)` with a 30px Y offset.

Sections run: a sticky glass header, a 95vh hero with an urgency badge and social-proof avatar stack, a four-column trust bar with hover tooltips, an asymmetric services grid (sticky left column + `<details>` accordion cards), a horizontal-scrolling portfolio of 50/50 before/after transformation cards with a floating glass ROI badge on hover, a three-column testimonials grid, and a high-impact gradient final CTA. A fixed floating status indicator uses a pulsing green dot. Reduced-motion is respected.

## Run

This is a static project — open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

See `prompt.md` for the full build spec; `demo.mp4` shows it in motion.
