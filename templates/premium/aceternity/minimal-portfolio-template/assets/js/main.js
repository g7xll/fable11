document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var root = document.documentElement;
      var nowDark = root.classList.toggle("dark");
      try {
        localStorage.setItem("theme", nowDark ? "dark" : "light");
      } catch (e) {}
    });
  }

  var contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = contactForm.querySelector(".form-status");
      if (status) status.textContent = "Thanks! Your message has been sent.";
      contactForm.reset();
    });
  }

  var inlineForm = document.querySelector("[data-inline-contact-form]");
  if (inlineForm) {
    inlineForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = inlineForm.querySelector("button");
      if (btn) {
        var original = btn.textContent;
        btn.textContent = "Sent!";
        setTimeout(function () {
          btn.textContent = original;
        }, 2000);
      }
      inlineForm.reset();
    });
  }
});
