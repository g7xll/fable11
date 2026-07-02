document.addEventListener("DOMContentLoaded", function () {
  // Theme toggle
  var toggle = document.querySelector(".theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var isDark = document.documentElement.getAttribute("data-theme") === "dark";
      if (isDark) {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("qd-theme", "light");
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("qd-theme", "dark");
      }
    });
  }

  // Sticky header shadow on scroll
  var header = document.querySelector(".site-header");
  if (header) {
    window.addEventListener("scroll", function () {
      header.classList.toggle("scrolled", window.scrollY > 8);
    });
  }

  // Mobile hamburger
  var hamburger = document.querySelector(".hamburger");
  var navLinks = document.querySelector(".nav-links");
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", function () {
      navLinks.classList.toggle("open");
    });
  }

  // Dropdown (touch/click fallback)
  document.querySelectorAll(".dropdown > a").forEach(function (trigger) {
    trigger.addEventListener("click", function (e) {
      var parent = trigger.parentElement;
      if (parent.querySelector(".dropdown-menu")) {
        e.preventDefault();
        parent.classList.toggle("open");
      }
    });
  });

  // Scroll reveal
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) { obs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  // Accordion (FAQ)
  document.querySelectorAll(".accordion-trigger").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".accordion-item");
      var panel = item.querySelector(".accordion-panel");
      var isOpen = item.classList.contains("open");
      item.parentElement.querySelectorAll(".accordion-item.open").forEach(function (openItem) {
        openItem.classList.remove("open");
        openItem.querySelector(".accordion-panel").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });

  // Pricing monthly/yearly switch
  var priceSwitch = document.querySelector(".switch");
  if (priceSwitch) {
    priceSwitch.addEventListener("click", function () {
      priceSwitch.classList.toggle("on");
      var yearly = priceSwitch.classList.contains("on");
      document.querySelectorAll("[data-monthly]").forEach(function (el) {
        el.textContent = yearly ? el.getAttribute("data-yearly") : el.getAttribute("data-monthly");
      });
    });
  }

  // Category filter chips (products page)
  document.querySelectorAll(".chip[data-filter]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      document.querySelectorAll(".chip[data-filter]").forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      var filter = chip.getAttribute("data-filter");
      document.querySelectorAll("[data-category]").forEach(function (card) {
        var show = filter === "all" || card.getAttribute("data-category") === filter;
        card.style.display = show ? "" : "none";
      });
    });
  });
});
