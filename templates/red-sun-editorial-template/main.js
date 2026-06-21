// Red Sun — interactions
(() => {
	// Glass-on-scroll nav
	var nav = document.getElementById("nav");
	function onScroll() {
		if (!nav) return;
		if (window.scrollY > 24) nav.classList.add("scrolled");
		else nav.classList.remove("scrolled");
	}
	window.addEventListener("scroll", onScroll, { passive: true });
	onScroll();

	// Scroll-reveal fade-up (with 2deg start rotation handled in CSS)
	var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	var els = document.querySelectorAll("[data-reveal]");
	if (reduce || !("IntersectionObserver" in window)) {
		els.forEach((el) => {
			el.classList.add("in-view");
		});
	} else {
		var io = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.isIntersecting) {
						e.target.classList.add("in-view");
						io.unobserve(e.target);
					}
				});
			},
			{ threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
		);
		els.forEach((el) => {
			io.observe(el);
		});
	}
})();
