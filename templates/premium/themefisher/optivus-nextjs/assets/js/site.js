// Optivus clone — shared interactions (mobile menu, accordions, theme, reveal-on-scroll)
(function () {
  "use strict";

  /* ---------- Mobile nav toggle ---------- */
  var toggleBtn = document.getElementById("nav-toggle-btn");
  var mobileMenu = document.getElementById("mobile-menu");
  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener("click", function () {
      mobileMenu.classList.toggle("hidden");
      var expanded = toggleBtn.getAttribute("aria-expanded") === "true";
      toggleBtn.setAttribute("aria-expanded", String(!expanded));
      toggleBtn.classList.toggle("active");
    });
    document.addEventListener("click", function (e) {
      if (!mobileMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
        mobileMenu.classList.add("hidden");
        toggleBtn.setAttribute("aria-expanded", "false");
        toggleBtn.classList.remove("active");
      }
    });
  }

  /* ---------- Sticky header shrink on scroll ---------- */
  var header = document.getElementById("main-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 40);
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Generic accordion / FAQ toggling ---------- */
  // Matches faq-item-v1 / faq-item-fix style items: click toggles an "open" class
  // on the clicked item, and its sibling max-h-0 panel expands via CSS transition.
  function closest(el, selector) {
    while (el && el !== document) {
      if (el.matches && el.matches(selector)) return el;
      el = el.parentElement;
    }
    return null;
  }

  document.addEventListener("click", function (e) {
    var item = closest(e.target, ".faq-item-v1, .faq-item-fix, [data-accordion-item]");
    if (!item) return;
    // Don't hijack real links/buttons that navigate elsewhere inside the item
    if (closest(e.target, "a[href^='http']")) return;

    var panel = item.querySelector(".faq-answer-v1, .faq-answer, [data-accordion-panel]");
    var isOpen = item.classList.contains("open");

    // Close sibling accordion items within the same group (single-open behaviour)
    var group = item.parentElement;
    if (group) {
      Array.prototype.forEach.call(group.children, function (sibling) {
        if (sibling !== item) {
          sibling.classList.remove("open");
          var sp = sibling.querySelector(".faq-answer-v1, .faq-answer, [data-accordion-panel]");
          if (sp) {
            sp.style.maxHeight = "";
            sp.classList.remove("opacity-100");
          }
        }
      });
    }

    item.classList.toggle("open", !isOpen);
    if (panel) {
      if (!isOpen) {
        panel.style.maxHeight = panel.scrollHeight + "px";
        panel.classList.add("opacity-100");
      } else {
        panel.style.maxHeight = "";
        panel.classList.remove("opacity-100");
      }
    }
  });

  /* ---------- Pricing monthly/yearly toggle ---------- */
  var pricingToggle = document.querySelector("[data-pricing-toggle]");
  if (pricingToggle) {
    pricingToggle.addEventListener("click", function () {
      document.body.classList.toggle("yearly-pricing");
      pricingToggle.classList.toggle("active");
    });
  }

  /* ---------- Reveal-on-scroll (AOS-style: fade/rise elements into view) ---------- */
  var revealTargets = document.querySelectorAll("[data-aos]");
  if (revealTargets.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("aos-animate");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach(function (el) {
      el.classList.add("aos-init");
      io.observe(el);
    });
  }

  /* ---------- Theme toggle (light/dark) ---------- */
  var THEME_KEY = "optivus-theme";
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var btn = document.getElementById("theme-toggle-btn");
    if (btn) btn.setAttribute("aria-pressed", String(theme === "light"));
  }
  var savedTheme = null;
  try {
    savedTheme = localStorage.getItem(THEME_KEY);
  } catch (e) {}
  var initialTheme =
    savedTheme || (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  applyTheme(initialTheme);

  var themeBtn = document.getElementById("theme-toggle-btn");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(current);
      try {
        localStorage.setItem(THEME_KEY, current);
      } catch (e) {}
    });
  }
})();
