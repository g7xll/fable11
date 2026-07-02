/* Optimize clone — shared behavior: mobile menu, nav "All Pages" dropdown (touch/click
   fallback for the source's lg:group-hover CSS dropdown), FAQ accordions, AOS init,
   theme toggle, and blog pagination (static, client-side). */
document.addEventListener('DOMContentLoaded', function () {
  // Mobile hamburger menu — mirrors source's #nav-toggle checkbox pattern.
  var toggle = document.getElementById('nav-toggle');
  var menu = document.getElementById('nav-menu');
  var showBtn = document.getElementById('show-button');
  if (toggle && menu) {
    toggle.addEventListener('change', function () {
      menu.classList.toggle('hidden', !toggle.checked);
      if (showBtn) showBtn.classList.toggle('active', toggle.checked);
    });
    menu.querySelectorAll('a.nav-dropdown-link, a.nav-link[href]').forEach(function (a) {
      a.addEventListener('click', function () {
        if (window.innerWidth < 1024) {
          toggle.checked = false;
          menu.classList.add('hidden');
        }
      });
    });
  }

  // "All Pages" dropdown — desktop uses CSS :hover already (group-hover classes carried
  // over from vendor-main.css); add click-to-toggle for touch devices, and click-outside
  // to close.
  document.querySelectorAll('.nav-dropdown').forEach(function (dd) {
    var trigger = dd.querySelector('.nav-link');
    var list = dd.querySelector('.nav-dropdown-list');
    if (!trigger || !list) return;
    trigger.addEventListener('click', function (e) {
      if (window.innerWidth < 1024) {
        e.preventDefault();
        var open = dd.classList.toggle('dropdown-open');
        list.classList.toggle('!grid', open);
        list.classList.toggle('!opacity-100', open);
        list.classList.toggle('!visible', open);
      }
    });
    document.addEventListener('click', function (e) {
      if (!dd.contains(e.target)) {
        dd.classList.remove('dropdown-open');
        list.classList.remove('!grid', '!opacity-100', '!visible');
      }
    });
  });

  // FAQ accordions
  document.querySelectorAll('.accordion').forEach(function (acc) {
    acc.querySelectorAll('.accordion-item').forEach(function (item) {
      var btn = item.querySelector('.accordion-trigger');
      var panel = item.querySelector('.accordion-panel');
      if (!btn || !panel) return;
      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');
        acc.querySelectorAll('.accordion-item.is-open').forEach(function (openItem) {
          if (openItem !== item) {
            openItem.classList.remove('is-open');
            var p = openItem.querySelector('.accordion-panel');
            if (p) p.style.maxHeight = null;
          }
        });
        item.classList.toggle('is-open', !isOpen);
        panel.style.maxHeight = !isOpen ? panel.scrollHeight + 'px' : null;
      });
    });
  });

  // Theme toggle
  var themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var root = document.documentElement;
      var isDark = root.classList.contains('dark');
      root.classList.remove('dark', 'light');
      root.classList.add(isDark ? 'light' : 'dark');
      try { localStorage.setItem('theme', isDark ? 'light' : 'dark'); } catch (e) {}
    });
  }

  // AOS
  if (window.AOS) {
    window.AOS.init({ offset: 120, duration: 600, easing: 'ease-out-cubic', once: true });
  }
});
