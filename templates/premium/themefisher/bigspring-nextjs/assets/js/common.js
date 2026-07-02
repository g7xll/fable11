/* Bigspring clone — shared interactive behavior (theme toggle, FAQ accordion, swiper carousels).
   Mobile nav + mega-menu dropdown are pure CSS (checkbox hack / group-hover), no JS required. */
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Theme toggle (sun/moon button) ---------- */
  var toggleBtn = document.querySelector('.theme-switcher button');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      var d = document.documentElement;
      var isDark = d.classList.contains('dark');
      d.classList.remove('light', 'dark');
      var next = isDark ? 'light' : 'dark';
      d.classList.add(next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* ---------- FAQ accordion ----------
     Source CSS keys everything off a single `.active` class on the `.accordion`
     wrapper: `.accordion.active .accordion-header` (teal fill), `.accordion.active
     .accordion-icon` (180deg rotate), `.accordion.active .accordion-content`
     (max-height: 0 -> 50vh). No inline styles needed — just toggle the class. */
  document.querySelectorAll('.accordion').forEach(function (item) {
    var header = item.querySelector('.accordion-header');
    if (!header) return;
    header.addEventListener('click', function () {
      var isOpen = item.classList.contains('active');
      var group = item.parentElement;
      if (group) {
        group.querySelectorAll('.accordion.active').forEach(function (openItem) {
          if (openItem !== item) openItem.classList.remove('active');
        });
      }
      item.classList.toggle('active', !isOpen);
    });
  });

  /* ---------- Swiper carousels (testimonials / logo strips) ---------- */
  if (window.Swiper) {
    document.querySelectorAll('.js-swiper').forEach(function (el) {
      var slidesPerView = parseInt(el.getAttribute('data-slides-desktop') || '2', 10);
      var slidesPerViewMobile = parseInt(el.getAttribute('data-slides-mobile') || '1', 10);
      new Swiper(el, {
        loop: true,
        autoplay: { delay: 3500, disableOnInteraction: false },
        pagination: {
          el: el.querySelector('.swiper-pagination'),
          clickable: true
        },
        breakpoints: {
          0: { slidesPerView: slidesPerViewMobile, spaceBetween: 20 },
          992: { slidesPerView: slidesPerView, spaceBetween: 30 }
        }
      });
    });
  }

});
