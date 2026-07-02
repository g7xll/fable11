(function () {
  "use strict";

  // AOS-style scroll reveal
  function initAOS() {
    var els = document.querySelectorAll("[data-aos]");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach(function (el) { el.classList.add("aos-animate"); });
      return;
    }
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
    els.forEach(function (el) {
      el.classList.add("aos-init");
      io.observe(el);
    });
  }

  // Sticky header on scroll
  function initStickyHeader() {
    var header = document.querySelector("header.header");
    if (!header) return;
    var toggle = function () {
      if (window.scrollY > 80) {
        header.classList.remove("non_sticky");
        header.classList.add("sticky_top");
      } else {
        header.classList.add("non_sticky");
        header.classList.remove("sticky_top");
      }
    };
    toggle();
    window.addEventListener("scroll", toggle, { passive: true });
  }

  // FAQ accordion
  function initFAQ() {
    var items = document.querySelectorAll("[data-faq-id]");
    items.forEach(function (item) {
      item.addEventListener("click", function () {
        var id = item.getAttribute("data-faq-id");
        var answer = document.getElementById("faq-answer-" + id);
        var icon = item.querySelector(".toggle-icon");
        var expanded = item.getAttribute("aria-expanded") === "true";
        if (!answer) return;

        if (expanded) {
          answer.style.maxHeight = "0px";
          answer.classList.remove("opacity-100");
          answer.classList.add("opacity-0");
          item.setAttribute("aria-expanded", "false");
          if (icon) {
            icon.classList.remove("rotate-180");
            icon.classList.add("rotate-0");
            icon.textContent = "+";
          }
        } else {
          answer.style.maxHeight = answer.scrollHeight + "px";
          answer.classList.remove("opacity-0");
          answer.classList.add("opacity-100");
          item.setAttribute("aria-expanded", "true");
          if (icon) {
            icon.classList.remove("rotate-0");
            icon.classList.add("rotate-180");
            icon.textContent = "−";
          }
        }
      });
    });
  }

  // Mobile nav-dropdown click support (touch devices, in addition to CSS hover)
  function initNavDropdown() {
    var dropdowns = document.querySelectorAll(".nav-dropdown > span");
    dropdowns.forEach(function (span) {
      span.addEventListener("click", function (e) {
        var parent = span.closest(".nav-dropdown");
        if (!parent) return;
        parent.classList.toggle("nav-dropdown-open");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initAOS();
    initStickyHeader();
    initFAQ();
    initNavDropdown();
  });
})();
