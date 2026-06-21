// Season 04 — scroll reveal + cart counter micro-interaction
(() => {
	// Staggered reveal on scroll
	var reveals = document.querySelectorAll(".reveal");
	if ("IntersectionObserver" in window) {
		var io = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry, i) => {
					if (entry.isIntersecting) {
						var el = entry.target;
						setTimeout(
							() => {
								el.classList.add("in");
							},
							(i % 4) * 90,
						);
						io.unobserve(el);
					}
				});
			},
			{ threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
		);
		reveals.forEach((el) => {
			io.observe(el);
		});
	} else {
		reveals.forEach((el) => {
			el.classList.add("in");
		});
	}

	// Cart counter
	var cartBtn = document.querySelector('.nav__icons button[aria-label="Cart"]');
	var _count = 0;
	document.querySelectorAll(".product__media").forEach((m) => {
		m.addEventListener("click", (e) => {
			e.preventDefault();
			_count++;
			if (cartBtn) {
				cartBtn.style.color = "#31EF07";
				setTimeout(() => {
					cartBtn.style.color = "";
				}, 400);
			}
		});
	});

	// Newsletter feedback
	var form = document.querySelector(".news__form");
	if (form) {
		form.addEventListener("submit", () => {
			var btn = form.querySelector("button");
			var input = form.querySelector("input");
			if (input?.value.trim()) {
				btn.textContent = "Sent";
				input.value = "";
				setTimeout(() => {
					btn.textContent = "Send";
				}, 1800);
			}
		});
	}
})();
