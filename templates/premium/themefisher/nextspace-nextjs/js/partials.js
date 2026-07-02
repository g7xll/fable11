// Shared header/footer markup, injected into #site-header / #site-footer placeholders.
// Keeping this in one place ensures every page shares identical chrome.

function nextspaceHeader() {
  return `
<header class="site-header">
  <nav class="navbar">
    <a class="navbar-brand" href="/index.html" aria-label="NextSpace home">
      <img src="/assets/images/logo.svg" alt="NextSpace - Architecture &amp; Interior Firm" width="200" height="40">
    </a>
    <input id="nav-toggle" type="checkbox">
    <label for="nav-toggle" class="nav-toggle-label" aria-label="Toggle menu">
      <svg id="show-button" viewBox="0 0 20 20" fill="currentColor"><path d="M0 3h20v2H0V3z m0 6h20v2H0V9z m0 6h20v2H0v-2z"></path></svg>
    </label>
    <ul id="nav-menu" class="navbar-nav">
      <li class="nav-item nav-dropdown">
        <span class="nav-link">All Pages <span class="arrow-icon"><svg viewBox="0 0 20 20" fill="currentColor"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"></path></svg></span></span>
        <div class="mega-menu-wrapper">
          <img src="/assets/images/menu.png" alt="Preview" width="180" height="180" loading="lazy" onerror="this.style.display='none'">
          <ul class="nav-dropdown-list">
            <li><a class="nav-dropdown-link" href="/index.html">Homepage</a></li>
            <li><a class="nav-dropdown-link" href="/about.html">About</a></li>
            <li><a class="nav-dropdown-link" href="/terms-and-conditions.html">Terms</a></li>
            <li><a class="nav-dropdown-link" href="/services.html">Services</a></li>
            <li><a class="nav-dropdown-link" href="/blog.html">Blog</a></li>
            <li><a class="nav-dropdown-link" href="/privacy-policy.html">Privacy</a></li>
            <li><a class="nav-dropdown-link" href="/reviews.html">Reviews</a></li>
            <li><a class="nav-dropdown-link" href="/blog/post-1.html">Blog Details</a></li>
            <li><a class="nav-dropdown-link" href="/faqs.html">FAQs</a></li>
            <li><a class="nav-dropdown-link" href="/projects.html">Projects</a></li>
            <li><a class="nav-dropdown-link" href="/gallery.html">Gallery</a></li>
            <li><a class="nav-dropdown-link" href="/contact.html">Contact</a></li>
            <li><a class="nav-dropdown-link" href="/projects/project-1.html">Project Details</a></li>
            <li><a class="nav-dropdown-link" href="/career.html">Career</a></li>
            <li><a class="nav-dropdown-link" href="/elements.html">Elements</a></li>
            <li><a class="nav-dropdown-link" href="/404.html">404</a></li>
          </ul>
        </div>
      </li>
      <li class="nav-item"><a class="nav-link" href="/projects.html">Works</a></li>
      <li class="nav-item"><a class="nav-link" href="/contact.html">Contact</a></li>
      <li class="mt-4 navbar-cta"><a class="btn btn-primary btn-sm" href="https://themefisher.com/products/nextspace-nextjs" target="_blank" rel="noopener">Get This Template</a></li>
    </ul>
    <div class="header-cta" style="display:flex;align-items:center;">
      <a class="btn btn-primary" href="https://themefisher.com/products/nextspace-nextjs" target="_blank" rel="noopener">Get This Template</a>
      <button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark mode" type="button">
        <svg id="theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg>
        <svg id="theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
      </button>
    </div>
  </nav>
</header>`;
}

function nextspaceFooter() {
  return `
<footer class="site-footer">
  <div class="container">
    <div class="row footer-cta" style="align-items:center;justify-content:space-between;">
      <div data-aos="fade-up-sm">
        <h2>Ready To Build Your Dream Project?</h2>
      </div>
      <div data-aos="fade-up-sm">
        <a class="btn btn-secondary" href="/contact.html">Get Started
          <svg width="18" height="18" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
        </a>
      </div>
    </div>
    <div class="footer-cols">
      <div class="footer-col" data-aos="fade-up-sm">
        <h5>Quick Links</h5>
        <ul>
          <li><a href="/projects.html">Projects</a></li>
          <li><a href="/about.html">About Us</a></li>
          <li><a href="/contact.html">Contact</a></li>
          <li><a href="/career.html">Career</a></li>
        </ul>
      </div>
      <div class="footer-col" data-aos="fade-up-sm">
        <h5>Legal &amp; Policy Links</h5>
        <ul>
          <li><a href="/privacy-policy.html">Privacy Policy</a></li>
          <li><a href="/terms-and-conditions.html">Terms of Service</a></li>
          <li><a href="/contact.html">Contact Us</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="footer-brand">
        <img src="/assets/images/logo-footer.svg" alt="NextSpace footer logo" width="215" height="52">
        <p>Develops conceptual design ideas, refines them into detailed plans.</p>
      </div>
      <div class="footer-contact">
        <ul>
          <li><a href="tel:123-456-7890">123-456-7890</a></li>
          <li><a href="mailto:info@nextspace.com">info@nextspace.com</a></li>
          <li><a href="https://www.google.com/maps?q=123%20Main%20Street%2C%20New%20York%2C%20NY%2010001" target="_blank" rel="noopener">123 Main Street, New York, NY 10001</a></li>
        </ul>
      </div>
      <ul class="footer-social">
        <li><a href="https://www.facebook.com/" target="_blank" rel="noopener">facebook</a></li>
        <li><a href="https://twitter.com/" target="_blank" rel="noopener">twitter</a></li>
        <li><a href="https://www.github.com/" target="_blank" rel="noopener">github</a></li>
        <li><a href="https://www.linkedin.com/" target="_blank" rel="noopener">linkedin</a></li>
      </ul>
    </div>
  </div>
</footer>`;
}

document.addEventListener("DOMContentLoaded", function () {
  var headerMount = document.getElementById("site-header");
  var footerMount = document.getElementById("site-footer");
  if (headerMount) headerMount.outerHTML = nextspaceHeader();
  if (footerMount) footerMount.outerHTML = nextspaceFooter();

  // Mark active nav link
  var path = window.location.pathname.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
  document.querySelectorAll(".nav-dropdown-link").forEach(function (a) {
    var href = a.getAttribute("href").replace(/\.html$/, "");
    if (href === path || (path === "/" && href === "/index")) a.classList.add("active");
  });

  // Theme toggle
  var toggle = document.getElementById("theme-toggle");
  var sun = document.getElementById("theme-icon-sun");
  var moon = document.getElementById("theme-icon-moon");
  function syncIcons() {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    if (sun) sun.style.display = dark ? "none" : "block";
    if (moon) moon.style.display = dark ? "block" : "none";
  }
  syncIcons();
  if (toggle) {
    toggle.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      var next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      syncIcons();
    });
  }

  // Mobile mega-menu toggle (tap "All Pages" to expand on mobile)
  document.querySelectorAll(".nav-dropdown > .nav-link").forEach(function (el) {
    el.addEventListener("click", function (e) {
      if (window.innerWidth <= 991) {
        e.preventDefault();
        el.parentElement.classList.toggle("active");
      }
    });
  });

  // Close mobile menu after clicking a link
  document.querySelectorAll("#nav-menu a").forEach(function (a) {
    a.addEventListener("click", function () {
      var navToggle = document.getElementById("nav-toggle");
      if (navToggle) navToggle.checked = false;
    });
  });

  // Scroll reveal (AOS-style)
  var revealEls = document.querySelectorAll("[data-aos]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("aos-animate");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) {
      var delay = el.getAttribute("data-aos-delay");
      if (delay) el.style.transitionDelay = delay + "ms";
      io.observe(el);
    });
    // Safety net: some elements (e.g. very tall sections, or automated
    // full-page screenshot tools that don't perform a real scroll) can
    // fail to cross the IntersectionObserver threshold. Never leave
    // content permanently invisible.
    window.setTimeout(function () {
      revealEls.forEach(function (el) { el.classList.add("aos-animate"); });
    }, 2500);
  } else {
    revealEls.forEach(function (el) { el.classList.add("aos-animate"); });
  }
});
