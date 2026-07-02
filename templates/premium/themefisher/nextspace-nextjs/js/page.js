// Shared page-specific interaction scripts. Append new init*() functions at the end;
// each is guarded by a DOM-existence check so this single file can safely serve every page.

// ---- FAQ / accordion (faqs.html, and any other page using .accordion markup) ----
function initFaqAccordion() {
  document.querySelectorAll(".accordion").forEach(function (acc) {
    var header = acc.querySelector(".accordion-header");
    var panel = acc.querySelector(".accordion-panel");
    if (!header || !panel) return;
    var inner = panel.firstElementChild;
    header.addEventListener("click", function () {
      var isOpen = header.getAttribute("aria-expanded") === "true";
      // close any sibling accordions in the same list (single-open behavior, matches source)
      var list = acc.closest(".faq-list, .faqs-list") || acc.parentElement.parentElement;
      if (list) {
        list.querySelectorAll(".accordion").forEach(function (other) {
          if (other === acc) return;
          var oh = other.querySelector(".accordion-header");
          var op = other.querySelector(".accordion-panel");
          if (oh && op) {
            oh.setAttribute("aria-expanded", "false");
            op.style.height = "0px";
          }
        });
      }
      if (isOpen) {
        header.setAttribute("aria-expanded", "false");
        panel.style.height = "0px";
      } else {
        header.setAttribute("aria-expanded", "true");
        panel.style.height = inner ? inner.offsetHeight + "px" : "auto";
      }
    });
  });
}

// ---- Gallery lightbox (gallery.html) ----
function initGalleryLightbox() {
  var overlay = document.querySelector(".lightbox-overlay");
  var overlayImg = overlay ? overlay.querySelector("img") : null;
  if (!overlay || !overlayImg) return;

  function open(src, alt) {
    overlayImg.src = src;
    overlayImg.alt = alt || "";
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function close() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".gallery-item").forEach(function (item) {
    item.addEventListener("click", function () {
      var img = item.querySelector("img");
      if (img) open(img.src, img.alt);
    });
  });

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay || e.target.classList.contains("lightbox-close")) close();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });
}

// ---- Contact form validation (contact.html) ----
function initContactForm() {
  var form = document.querySelector("form.contact-form-card");
  if (!form) return;
  var success = form.querySelector(".form-success");

  function fieldError(field) {
    return field.closest(".form-group").querySelector(".form-error");
  }

  function validateField(field) {
    var err = fieldError(field);
    var value = field.value.trim();
    var message = "";
    if (field.required && !value) {
      message = "This field is required.";
    } else if (field.type === "email" && value) {
      var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(value)) message = "Enter a valid email address.";
    }
    field.classList.toggle("invalid", !!message);
    if (err) err.textContent = message;
    return !message;
  }

  form.querySelectorAll(".form-input").forEach(function (field) {
    field.addEventListener("blur", function () { validateField(field); });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var fields = Array.prototype.slice.call(form.querySelectorAll(".form-input"));
    var valid = fields.reduce(function (ok, field) { return validateField(field) && ok; }, true);
    if (!valid) return;
    if (success) success.classList.add("show");
    form.reset();
    fields.forEach(function (field) { field.classList.remove("invalid"); });
  });
}

// ---- Reviews slider controls (reviews.html) ----
function initReviewSlider() {
  var track = document.querySelector(".review-slider-section .review-track, .review-slider-section .review-slider-track");
  if (!track) return;
  var prev = document.querySelector(".review-slider-section .review-nav .prev, .review-slider-section .review-slider-controls .prev");
  var next = document.querySelector(".review-slider-section .review-nav .next, .review-slider-section .review-slider-controls .next");
  function step(dir) {
    var slide = track.querySelector(".review-slide");
    var amount = slide ? slide.getBoundingClientRect().width + 24 : 320;
    track.scrollBy({ left: dir * amount, behavior: "smooth" });
  }
  if (prev) prev.addEventListener("click", function () { step(-1); });
  if (next) next.addEventListener("click", function () { step(1); });
}

document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector(".accordion")) initFaqAccordion();
  if (document.querySelector(".gallery-item")) initGalleryLightbox();
  if (document.querySelector("form.contact-form-card")) initContactForm();
  if (document.querySelector(".review-slider-section")) initReviewSlider();
});
