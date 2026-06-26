# Minimal Portfolio Template — Personal Portfolio Website Clone (Vanilla HTML + CSS + JS)

[![Watch Demo](./poster.jpg)](./demo.mp4)

A pixel-faithful reproduction of the Aceternity Minimal Portfolio Template — a clean, typography-first personal portfolio for designers and engineers. The site ships eight self-contained HTML pages with no build step: a home page with a hero, featured project grid, and blog roll; an about page with a polaroid-style travel photo gallery and an achievement timeline; a full projects grid with tech-stack icon badges; a blog index listing seven posts; individual blog post pages; and a contact form. Dark and light modes are toggled via a floating pill navigation bar with a sun/moon icon, Inter (Google Fonts) handles all type, and decorative SVG dot-stripe borders frame the centered 896 px content column. Built entirely in plain HTML, CSS, and vanilla JS — no framework, no bundler, no compile step.

## Run

No build step is required. Serve the folder with any static file server:

```sh
cd templates/premium/aceternity/minimal-portfolio-template
python3 -m http.server 8080
```

Then open `http://localhost:8080` in a browser. All eight pages are reachable from the floating navigation.

## Pages

| File | Route |
|---|---|
| `index.html` | Home — hero, featured projects, recent posts, contact row |
| `about.html` | About — bio, polaroid travel gallery, achievement timeline |
| `projects.html` | Projects — full 6-project responsive grid with tech badges |
| `blog.html` | Blog — flat list of all posts |
| `contact.html` | Contact — enquiry form |
| `blog-advanced-css.html` | Post: Advanced CSS Techniques |
| `blog-intro-nextjs.html` | Post: Introduction to Next.js |
| `blog-react-hooks.html` | Post: Mastering React Hooks |

## Notes

- `tokens.css` holds all design tokens (palette for both themes, type scale, spacing, radius, shadow).
- `styles.css` builds on those tokens for layout, the floating pill nav, stripe borders, polaroid gallery, timeline, project cards, and the dark-mode overrides.
- The dark/light toggle writes a `dark` class to `<html>` and persists the preference to `localStorage`.
- `prompt.md` contains the full build specification and design reference.
- `demo.mp4` shows the finished template in motion (with `poster.jpg` as the preview frame).

## Credits

Faithful clone of an existing design, recreated for study/learning. All credit for the original design goes to its creators.

**Original:** Aceternity — <https://ui.aceternity.com/template-preview/minimal-portfolio-template>

---

Part of the [Templates](../../README.md) collection in the [claude-directory](../../../README.md). [Browse the live gallery](https://pulkitxm.com/claude-directory).
