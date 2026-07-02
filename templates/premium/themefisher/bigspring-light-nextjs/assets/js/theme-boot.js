(function () {
  try {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    document.documentElement.classList.toggle("dark", mq.matches);
  } catch (e) {}
})();
