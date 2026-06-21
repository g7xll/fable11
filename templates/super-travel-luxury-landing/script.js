// Reveal-up scroll entrance via IntersectionObserver (0.15 threshold)
(function () {
	var items = document.querySelectorAll(".reveal-up");
	if (!("IntersectionObserver" in window)) {
		items.forEach(function (el) {
			el.classList.add("is-visible");
		});
		return;
	}

	var observer = new IntersectionObserver(
		function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add("is-visible");
					observer.unobserve(entry.target);
				}
			});
		},
		{ threshold: 0.15 },
	);

	items.forEach(function (el) {
		observer.observe(el);
	});
})();
