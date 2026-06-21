/* VERDE — interactions */
(function () {
	var P = window.PRODUCE;

	// ---- hero letter stagger ----
	var ht = document.getElementById("heroTitle");
	var word = ht.textContent.trim();
	ht.innerHTML = "";
	word.split("").forEach(function (ch, i) {
		var span = document.createElement("span");
		span.className = "ltr";
		var inner = document.createElement("i");
		inner.textContent = ch;
		inner.style.transitionDelay = i * 0.05 + "s";
		span.appendChild(inner);
		ht.appendChild(span);
	});
	requestAnimationFrame(function () {
		requestAnimationFrame(function () {
			document.body.classList.add("loaded");
		});
	});

	// ---- floating hero cards ----
	document.getElementById("hf1").innerHTML = P.citrus;
	document.getElementById("hf2").innerHTML = P.herbs;
	document.getElementById("hf3").innerHTML = P.berries;
	document.getElementById("storyImg").innerHTML = P.avocado;

	// ---- marquee ----
	var phrase = "";
	var words = [
		"Fresh Produce",
		"Seasonal",
		"Farm Direct",
		"Zero Waste",
		"Regenerative",
	];
	words.forEach(function (w) {
		phrase += w + ' <span class="star">✦</span> ';
	});
	document.getElementById("mq").innerHTML = phrase;
	document.getElementById("mq2").innerHTML = phrase;

	// ---- product grid ----
	var products = [
		{ name: "Valencia Oranges", price: "$6", art: P.citrus },
		{ name: "Heirloom Tomatoes", price: "$8", art: P.tomato },
		{ name: "Garden Herbs", price: "$4", art: P.herbs },
		{ name: "Wild Berries", price: "$9", art: P.berries },
		{ name: "Hass Avocados", price: "$7", art: P.avocado },
		{ name: "Sourdough Loaf", price: "$5", art: P.grain },
	];
	var grid = document.getElementById("grid");
	products.forEach(function (p, i) {
		var el = document.createElement("article");
		el.className = "card reveal";
		el.style.transitionDelay = (i % 3) * 0.08 + "s";
		el.innerHTML =
			'<div class="media">' +
			p.art +
			'<div class="ov"><button type="button">Quick Add</button></div></div>' +
			'<div class="info"><h3>' +
			p.name +
			'</h3><span class="price">' +
			p.price +
			"</span></div>";
		grid.appendChild(el);
	});

	// ---- reveal on scroll ----
	var io = new IntersectionObserver(
		function (entries) {
			entries.forEach(function (e) {
				if (e.isIntersecting) {
					e.target.classList.add("is-visible");
					io.unobserve(e.target);
				}
			});
		},
		{ threshold: 0.12 },
	);
	document.querySelectorAll(".reveal").forEach(function (el) {
		io.observe(el);
	});

	// ---- parallax floats ----
	var floats = Array.prototype.slice.call(document.querySelectorAll(".float"));
	var ticking = false;
	function onScroll() {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(function () {
			var y = window.scrollY;
			floats.forEach(function (f) {
				var s = parseFloat(f.getAttribute("data-speed")) || 0.05;
				f.style.translate = "0 " + y * s + "px";
			});
			ticking = false;
		});
	}
	window.addEventListener("scroll", onScroll, { passive: true });

	// ---- cart counter demo ----
	var count = document.querySelector(".cart .count");
	document.addEventListener("click", function (e) {
		if (e.target.matches(".ov button")) {
			count.textContent = parseInt(count.textContent, 10) + 1;
		}
	});
})();
