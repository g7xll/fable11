/* Browser-Core DevTools — interactions */
(function () {
  "use strict";

  /* ---- slide-up reveals (0.4s) staggered via IntersectionObserver ---- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var el = e.target;
          var sibs = Array.prototype.slice.call(
            el.parentNode.querySelectorAll(".reveal")
          );
          var idx = Math.max(0, sibs.indexOf(el));
          el.style.animationDelay = (idx * 60) + "ms";
          el.classList.add("in");
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- hero cursor demo: sync active card + inspector tooltip to the 9s loop ---- */
  var cards = Array.prototype.slice.call(document.querySelectorAll(".demo-body .card"));
  var tip = document.getElementById("tip");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  var props = [
    { sel: "div.card", w: "320px", r: "8px", bg: "#06b6d4" },
    { sel: "div.card", w: "168px", r: "8px", bg: "#8b5cf6" },
    { sel: "div.card", w: "240px", r: "9999px", bg: "#f59e0b" }
  ];

  function paintTip(i) {
    if (!tip) return;
    var p = props[i];
    tip.innerHTML =
      '<div class="sel">' + p.sel + '</div>' +
      '<div><span class="prop">width</span>: <span class="val">' + p.w + '</span>;</div>' +
      '<div><span class="prop">border-radius</span>: <span class="val">' + p.r + '</span>;</div>' +
      '<div><span class="prop">background</span>: <span class="val">' + p.bg + '</span>;</div>';
    // anchor the tip near the active card
    var card = cards[i];
    if (card) {
      tip.style.top = (card.offsetTop - 6) + "px";
    }
  }

  function setActive(i) {
    cards.forEach(function (c, k) { c.classList.toggle("is-active", k === i); });
    paintTip(i);
  }

  if (cards.length) {
    if (reduce) {
      setActive(0);
    } else {
      // 9s loop -> roughly 3s per card; offset to land while cursor hovers
      var seq = [0, 1, 2];
      var step = 0;
      setActive(0);
      setInterval(function () {
        step = (step + 1) % seq.length;
        setActive(seq[step]);
      }, 3000);
    }
  }

  /* ---- property inspector: toggle buttons ---- */
  Array.prototype.slice.call(document.querySelectorAll(".toggle-group")).forEach(function (g) {
    g.addEventListener("click", function (e) {
      var t = e.target.closest(".tg");
      if (!t) return;
      g.querySelectorAll(".tg").forEach(function (b) { b.classList.remove("on"); });
      t.classList.add("on");
    });
  });

  /* ---- stage tools: select / move / measure ---- */
  Array.prototype.slice.call(document.querySelectorAll(".stage-tools .t")).forEach(function (t) {
    t.addEventListener("click", function () {
      document.querySelectorAll(".stage-tools .t").forEach(function (b) { b.classList.remove("on"); });
      t.classList.add("on");
    });
  });

  /* ---- drag-to-resize on font-size style inputs ---- */
  Array.prototype.slice.call(document.querySelectorAll(".resize-input input")).forEach(function (inp) {
    var dragging = false, startX = 0, startVal = 0, unit = "px";
    function parse() {
      var m = /(-?\d*\.?\d+)\s*([a-z%]*)/i.exec(inp.value || "");
      if (!m) return null;
      unit = m[2] || "";
      return parseFloat(m[1]);
    }
    inp.addEventListener("mousedown", function (e) {
      // only initiate drag from the right "handle" zone
      var rect = inp.getBoundingClientRect();
      if (e.clientX < rect.right - 24) return;
      var v = parse();
      if (v === null) return;
      dragging = true; startX = e.clientX; startVal = v;
      document.body.style.cursor = "col-resize";
      e.preventDefault();
    });
    window.addEventListener("mousemove", function (e) {
      if (!dragging) return;
      var dv = Math.round((e.clientX - startX) / 2);
      var nv = startVal + dv;
      if (unit === "" && /leading|0\./.test(inp.value)) {
        nv = Math.max(0, (startVal + (e.clientX - startX) / 200));
        inp.value = nv.toFixed(2);
      } else {
        inp.value = Math.max(0, nv) + unit;
      }
    });
    window.addEventListener("mouseup", function () {
      if (dragging) { dragging = false; document.body.style.cursor = ""; }
    });
  });

  /* ---- copy install command ---- */
  Array.prototype.slice.call(document.querySelectorAll(".copybtn")).forEach(function (btn) {
    btn.addEventListener("click", function () {
      var txt = btn.getAttribute("data-copy") || "";
      var done = function () {
        var old = btn.textContent;
        btn.textContent = "Copied";
        setTimeout(function () { btn.textContent = old; }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(done).catch(done);
      } else { done(); }
    });
  });
})();
