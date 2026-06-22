# Shared partials — copy verbatim into each marketing page

## `<head>` boot (no-flash theme) — put as FIRST element in <head>
```html
<script>(function(){try{var t=localStorage.getItem("plasma-theme");if(!t)t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.classList.toggle("light",t==="light");}catch(e){}})();</script>
```

## Stylesheets (in <head>)
```html
<link rel="stylesheet" href="assets/css/tokens.css">
<link rel="stylesheet" href="assets/css/styles.css">
```
(docs pages also add `assets/css/docs.css`)

## Script (before </body>)
```html
<script src="assets/js/app.js"></script>
```

## PROMO BANNER + HEADER + MOBILE MENU
```html
<div class="promo">
  <div class="container">
    <span>Purchase this theme on shadcnblocks.com</span>
    <a href="https://www.shadcnblocks.com/template/plasma" target="_blank" rel="noopener">Get Template</a>
  </div>
  <button class="promo-close" data-promo-close aria-label="Dismiss">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
  </button>
</div>

<header class="header">
  <div class="container">
    <a class="brand" href="index.html"><span class="brand-mark"></span>Plasma</a>
    <nav class="nav">
      <div class="nav-item">
        <button class="nav-trigger">Products
          <svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <div class="nav-menu">
          <a href="product.html"><strong>Observability</strong><span class="muted">Real-time metrics & logs</span></a>
          <a href="product.html"><strong>Automation</strong><span class="muted">Local-first workflows</span></a>
          <a href="docs.html"><strong>Documentation</strong><span class="muted">Guides & API reference</span></a>
        </div>
      </div>
      <a href="about.html">Company</a>
      <a href="pricing.html">Pricing</a>
      <a href="download.html">Download</a>
      <a href="docs.html">Docs</a>
      <a href="changelog.html">Changelog</a>
    </nav>
    <div class="header-actions">
      <button class="theme-toggle" data-theme-toggle aria-label="Toggle theme">
        <svg class="moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
        <svg class="sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
      </button>
      <a class="btn btn-ghost" href="signin.html">Log in</a>
      <a class="btn btn-primary" href="signup.html">Sign up</a>
      <button class="hamburger theme-toggle" data-mobile-open aria-label="Menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
      </button>
    </div>
  </div>
</header>

<div class="mobile-menu">
  <div class="mm-top">
    <a class="brand" href="index.html"><span class="brand-mark"></span>Plasma</a>
    <button class="theme-toggle" data-mobile-close aria-label="Close">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </button>
  </div>
  <a href="product.html">Products</a>
  <a href="about.html">Company</a>
  <a href="pricing.html">Pricing</a>
  <a href="download.html">Download</a>
  <a href="docs.html">Docs</a>
  <a href="changelog.html">Changelog</a>
  <a href="signin.html">Log in</a>
  <a href="signup.html">Sign up</a>
</div>
```

## FOOTER CTA BAND + FOOTER
```html
<section class="cta-band">
  <div class="container">
    <h2 class="h2">Install it. script it. <span class="plasma-text">forget it. forever.</span></h2>
    <div class="cta-row" style="display:flex;gap:.75rem;justify-content:center">
      <a class="btn btn-primary btn-lg" href="download.html">Get Started</a>
      <a class="btn btn-secondary btn-lg" href="docs.html">Read the Docs</a>
    </div>
  </div>
</section>

<footer class="footer">
  <div class="container">
    <div>
      <a class="brand" href="index.html"><span class="brand-mark"></span>Plasma</a>
      <p class="muted" style="margin-top:1rem;max-width:18rem;font-size:.9rem">Local-first automation engineered strictly for power users.</p>
      <div class="social">
        <a href="#" aria-label="X"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.6l-5.17-6.76L5.3 22H2.04l8.02-9.17L1.5 2h6.77l4.67 6.18L18.244 2Zm-1.16 18h1.83L7.01 3.9H5.05L17.084 20Z"/></svg></a>
        <a href="#" aria-label="Instagram"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a>
        <a href="#" aria-label="WhatsApp"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.1.2.6 1 1.3 1.6.9.8 1.6 1 1.9 1.2.2.1.4.1.5-.1l.6-.7c.2-.2.3-.2.5-.1l1.8.9c.2.1.4.2.5.3.1.2.1.7-.1 1.4Z"/></svg></a>
      </div>
    </div>
    <div>
      <h4>Product</h4>
      <ul>
        <li><a href="product.html">Observability</a></li>
        <li><a href="pricing.html">Pricing</a></li>
        <li><a href="download.html">Download</a></li>
        <li><a href="changelog.html">Changelog</a></li>
      </ul>
    </div>
    <div>
      <h4>Company</h4>
      <ul>
        <li><a href="about.html">About</a></li>
        <li><a href="docs.html">Docs</a></li>
        <li><a href="signin.html">Sign in</a></li>
        <li><a href="signup.html">Sign up</a></li>
      </ul>
    </div>
    <div>
      <h4>Resources</h4>
      <ul>
        <li><a href="docs.html">Documentation</a></li>
        <li><a href="docs-installation.html">Installation</a></li>
        <li><a href="docs-cli.html">CLI</a></li>
        <li><a href="docs-ai-prompts.html">AI Prompts</a></li>
      </ul>
    </div>
  </div>
</footer>
```

## Logo strip (used on home/about/pricing)
```html
<div class="logos reveal">
  <img src="assets/images/logos/aave.svg" alt="Aave">
  <img src="assets/images/logos/alchemy.svg" alt="Alchemy">
  <img src="assets/images/logos/atoms.svg" alt="Atoms">
  <img src="assets/images/logos/ae-studio.svg" alt="AE Studio">
  <img src="assets/images/logos/forbes.svg" alt="Forbes">
</div>
```
