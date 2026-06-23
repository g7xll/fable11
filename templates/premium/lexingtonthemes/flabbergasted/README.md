# Flabbergasted — Multi-Page SaaS AI Template Clone (Vanilla HTML/CSS/JS + Keen Slider + Fuse.js)

[![Watch Demo](./poster.jpg)](./demo.mp4)

Pixel-faithful clone of the **Flabbergasted** premium Astro/Tailwind template by Lexington Themes, rebuilt as a self-contained static site in plain HTML, CSS, and vanilla JavaScript — no build step required. The template presents a dark-themed SaaS product concept around AI voice cloning, featuring a full multi-page structure: home (hero, logo marquee, feature grid, voice pitch controls, testimonials carousel, pricing toggle, blog preview), blog (listing + 10 posts with Fuse.js search), sign-in/sign-up forms with decorative mosaic panels, integrations directory (19 integrations), and 6 customer case study pages. Design tokens (base and accent OKLCH color scales, mesh gradients, stripe pattern utilities, Inter Variable + InterDisplay + Geist Mono fonts) are extracted into a shared `styles.css`. The Keen Slider library powers the testimonials carousel and pricing toggle is implemented with vanilla JS. Generated with Claude Fable 5.

## Run

No build step. Serve from the project folder with any static server:

```sh
python3 -m http.server 8080
# then open http://localhost:8080
```

Or open `index.html` directly in a browser.

## Pages

| Page | File |
|------|------|
| Home | `index.html` |
| System → Overview | `system/overview.html` |
| System → Buttons | `system/buttons.html` |
| System → Links | `system/links.html` |
| System → Colors | `system/colors.html` |
| System → Typography | `system/typography.html` |
| Blog Home | `blog/home.html` |
| Blog Posts (10) | `blog/posts/1.html` – `blog/posts/10.html` |
| Sign In | `forms/sign-in.html` |
| Sign Up | `forms/sign-up.html` |
| Integrations Home | `integrations/home.html` |
| Integration Detail (19) | `integrations/1.html` – `integrations/20.html` |
| Customer Case Studies (6) | `customers/1.html` – `customers/6.html` |

See `prompt.md` for the full build spec and design token reference. `demo.mp4` shows the clone in motion.

## Credits

Faithful clone of an existing design, recreated for study/learning. All credit for the original design goes to its creators.

**Original:** Lexington Themes — <https://lexingtonthemes.com/viewports/flabbergasted>

---

Part of the [Templates](../) collection in the [claude-directory](../../) — an open-source gallery of AI-generated UI built with Claude Fable 5. [Browse the live gallery](https://pulkitxm.com/claude-directory).
