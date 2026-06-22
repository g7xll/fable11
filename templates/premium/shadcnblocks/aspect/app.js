(function () {
  'use strict';
  var root = document.documentElement;

  /* ---------- Theme toggle ---------- */
  function setTheme(dark) {
    root.classList.toggle('dark', dark);
    root.style.colorScheme = dark ? 'dark' : 'light';
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
  }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    // theme toggle button: contains sun/moon lucide icon or "Toggle theme" sr text
    if (btn.querySelector('.lucide-sun, .lucide-moon') || /toggle theme/i.test(btn.textContent)) {
      // only treat as theme toggle if it's the round size-9 control (not feature icons)
      if (btn.classList.contains('size-9') || btn.querySelector('.lucide-sun')) {
        setTheme(!root.classList.contains('dark'));
        e.preventDefault();
        return;
      }
    }
  });

  /* ---------- Banner dismiss ---------- */
  document.addEventListener('click', function (e) {
    var c = e.target.closest('[aria-label="Close banner"]');
    if (c) {
      var banner = c.closest('div[class*="bg-"]') || c.parentElement;
      // climb to a top-level banner wrapper
      var node = c;
      for (var i = 0; i < 6 && node.parentElement; i++) { node = node.parentElement; if (/banner/i.test(node.className) || node.getAttribute('role') === 'banner') break; }
      (node || banner).style.display = 'none';
    }
  });

  /* ---------- Accordion (radix-style single) ---------- */
  document.querySelectorAll('button[aria-controls][aria-expanded]').forEach(function (btn) {
    if (btn.closest('nav') || /product/i.test(btn.textContent)) return; // nav dropdown handled separately
    var region = document.getElementById(btn.getAttribute('aria-controls'));
    if (!region || btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      // determine accordion group (siblings sharing same parent accordion root)
      var rootEl = btn.closest('[data-orientation="vertical"]') ? btn.closest('div[data-orientation="vertical"]').parentElement : document;
      // close siblings (single-type)
      var groupRoot = findGroupRoot(btn);
      if (groupRoot) {
        groupRoot.querySelectorAll('button[aria-controls][aria-expanded="true"]').forEach(function (other) {
          if (other !== btn) closeItem(other);
        });
      }
      open ? closeItem(btn) : openItem(btn);
    });
  });
  function findGroupRoot(btn) {
    var n = btn;
    for (var i = 0; i < 8 && n.parentElement; i++) {
      n = n.parentElement;
      if (n.querySelectorAll('button[aria-controls][aria-expanded]').length > 1) return n;
    }
    return null;
  }
  function setState(el, s) { if (el) el.setAttribute('data-state', s); }
  function openItem(btn) {
    btn.setAttribute('aria-expanded', 'true'); setState(btn, 'open');
    var region = document.getElementById(btn.getAttribute('aria-controls'));
    setState(region, 'open'); if (region) { region.hidden = false; region.style.height = 'auto'; }
    setState(btn.closest('h3'), 'open');
    var item = btn.closest('div[data-orientation="vertical"]'); setState(item, 'open');
  }
  function closeItem(btn) {
    btn.setAttribute('aria-expanded', 'false'); setState(btn, 'closed');
    var region = document.getElementById(btn.getAttribute('aria-controls'));
    setState(region, 'closed'); if (region) region.hidden = true;
    setState(btn.closest('h3'), 'closed');
    var item = btn.closest('div[data-orientation="vertical"]'); setState(item, 'closed');
  }

  /* ---------- Pricing billing toggle (monthly / annual) ---------- */
  document.querySelectorAll('[aria-label*="billing" i], [role="switch"]').forEach(function (sw) {
    var annual = sw.getAttribute('aria-checked') === 'true' || sw.getAttribute('data-state') === 'checked';
    function render() {
      document.querySelectorAll('[data-price-monthly]').forEach(function (el) {
        el.textContent = annual ? el.getAttribute('data-price-annual') : el.getAttribute('data-price-monthly');
      });
      document.querySelectorAll('[data-period]').forEach(function (el) {
        el.textContent = annual ? 'per user/annum' : 'per user/month';
      });
      sw.setAttribute('aria-checked', annual ? 'true' : 'false');
      sw.setAttribute('data-state', annual ? 'checked' : 'unchecked');
      var thumb = sw.querySelector('span'); if (thumb) thumb.setAttribute('data-state', annual ? 'checked' : 'unchecked');
    }
    sw.addEventListener('click', function () { annual = !annual; render(); });
  });

  /* ---------- Product mega-menu dropdown ---------- */
  (function () {
    var menu = document.querySelector('[data-product-menu]');
    if (!menu) return;
    var btn = [...document.querySelectorAll('nav button')].find(function (b) { return /product/i.test(b.textContent); });
    if (!btn) return;
    var open = false, hideTimer = null;
    // ensure the dropdown is positioned under the trigger with a real width
    var holder = menu.parentElement; // absolute top-full container
    if (holder) { holder.style.left = ''; holder.style.right = ''; }
    menu.style.position = 'absolute';
    menu.style.minWidth = '400px';
    menu.style.zIndex = '50';
    function toggle(v) {
      open = v; btn.setAttribute('data-state', v ? 'open' : 'closed'); btn.setAttribute('aria-expanded', v);
      menu.style.display = v ? 'block' : 'none';
      // align under the Product trigger
      if (v && holder) {
        var br = btn.getBoundingClientRect(), hr = holder.parentElement.getBoundingClientRect();
        holder.style.left = (br.left - hr.left) + 'px';
        holder.style.justifyContent = 'flex-start';
      }
    }
    function show() { clearTimeout(hideTimer); toggle(true); }
    function scheduleHide() { hideTimer = setTimeout(function () { toggle(false); }, 180); }
    btn.addEventListener('mouseenter', show);
    btn.addEventListener('click', function (e) { e.preventDefault(); open ? toggle(false) : show(); });
    btn.addEventListener('mouseleave', scheduleHide);
    menu.addEventListener('mouseenter', show);
    menu.addEventListener('mouseleave', scheduleHide);
  })();

  /* ---------- Feature tabs ---------- */
  document.querySelectorAll('[role="tablist"]').forEach(function (list) {
    var tabs = list.querySelectorAll('[role="tab"]');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) {
          var sel = t === tab;
          t.setAttribute('aria-selected', sel); t.setAttribute('data-state', sel ? 'active' : 'inactive');
          var panel = document.getElementById(t.getAttribute('aria-controls'));
          if (panel) { panel.hidden = !sel; panel.setAttribute('data-state', sel ? 'active' : 'inactive'); }
        });
      });
    });
  });

  /* ---------- Mobile menu (hamburger) ---------- */
  document.querySelectorAll('[data-mobile-trigger], button[aria-label*="menu" i]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = document.querySelector('[data-mobile-menu]');
      if (panel) { var open = panel.getAttribute('data-state') === 'open'; panel.setAttribute('data-state', open ? 'closed' : 'open'); panel.style.display = open ? 'none' : ''; }
    });
  });

  /* ---------- Scroll reveal (subtle, self-healing) ----------
     Reveal-on-enter, but never leave content invisible: a load fallback
     forces everything visible so the resting page is always faithful. */
  if ('IntersectionObserver' in window) {
    var revealEls = [];
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.style.opacity = '0'; el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity .6s cubic-bezier(0,0,.2,1), transform .6s cubic-bezier(0,0,.2,1)';
      revealEls.push(el);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.style.opacity = '1'; en.target.style.transform = 'none'; io.unobserve(en.target); } });
    }, { threshold: 0.05 });
    revealEls.forEach(function (el) { io.observe(el); });
    // safety: anything still hidden after 1.5s becomes visible
    setTimeout(function () { revealEls.forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; }); }, 1500);
  }
})();
