// Reveal-up scroll entrance via IntersectionObserver (0.15 threshold)
(() => {
	var items = document.querySelectorAll(".reveal-up");
	if (!("IntersectionObserver" in window)) {
		items.forEach((el) => {
			el.classList.add("is-visible");
		});
		return;
	}

	var observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("is-visible");
					observer.unobserve(entry.target);
				}
			});
		},
		{ threshold: 0.15 },
	);

	items.forEach((el) => {
		observer.observe(el);
	});
})();
