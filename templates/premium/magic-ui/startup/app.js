// Magic UI Startup clone — vanilla JS interactions.

// Sticky header background on scroll
const header = document.querySelector(".site-header");
if (header) {
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// Top announcement bar dismiss
const topbarClose = document.querySelector(".topbar .close");
if (topbarClose) {
  topbarClose.addEventListener("click", () => topbarClose.closest(".topbar").classList.add("hidden"));
}

// Mobile menu toggle
const hamburger = document.querySelector(".hamburger");
const mobileMenu = document.querySelector(".mobile-menu");
if (hamburger && mobileMenu) {
  hamburger.addEventListener("click", () => mobileMenu.classList.toggle("open"));
}

// Pricing annual/monthly toggle
const priceSwitch = document.querySelector(".switch");
if (priceSwitch) {
  const prices = {
    monthly: { basic: "10", premium: "20", enterprise: "50", ultimate: "80" },
    annual: { basic: "8", premium: "16", enterprise: "40", ultimate: "64" },
  };
  const apply = (mode) => {
    document.querySelectorAll("[data-price]").forEach((el) => {
      el.firstChild.nodeValue = "$" + prices[mode][el.dataset.price];
    });
  };
  priceSwitch.addEventListener("click", () => {
    const checked = priceSwitch.getAttribute("data-state") === "checked";
    const next = checked ? "unchecked" : "checked";
    priceSwitch.setAttribute("data-state", next);
    apply(next === "checked" ? "annual" : "monthly");
  });
}
