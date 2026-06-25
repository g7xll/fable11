// ----- Theme toggle (next-themes style) -----
(function () {
	const stored = localStorage.getItem("theme");
	const root = document.documentElement;
	if (stored === "dark") {
		root.classList.remove("light");
		root.classList.add("dark");
	}
	window.__toggleTheme = function () {
		const dark = root.classList.toggle("dark");
		root.classList.toggle("light", !dark);
		localStorage.setItem("theme", dark ? "dark" : "light");
	};
})();

// ----- Animated gradient canvas banner -----
function initGradientCanvas(canvas) {
	if (!canvas) return;
	const ctx = canvas.getContext("2d");
	function resize() {
		canvas.width = canvas.offsetWidth * devicePixelRatio;
		canvas.height = canvas.offsetHeight * devicePixelRatio;
	}
	resize();
	window.addEventListener("resize", resize);
	let t = 0;
	function draw() {
		t += 0.004;
		const w = canvas.width,
			h = canvas.height;
		ctx.clearRect(0, 0, w, h);
		const dark = document.documentElement.classList.contains("dark");
		const stops = dark
			? ["#1d4ed8", "#7c3aed", "#0ea5e9", "#db2777"]
			: ["#60a5fa", "#a78bfa", "#38bdf8", "#f472b6"];
		const cx = (Math.sin(t) * 0.5 + 0.5) * w;
		const g = ctx.createLinearGradient(cx, 0, w - cx, h);
		stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
		ctx.globalAlpha = dark ? 0.4 : 0.28;
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, w, h);
		requestAnimationFrame(draw);
	}
	draw();
}

// ----- Home category filter -----
function initFilter() {
	const buttons = document.querySelectorAll(".filter-btn");
	const cards = document.querySelectorAll(".post-card");
	if (!buttons.length) return;
	function apply(cat) {
		cards.forEach((c) => {
			const cats = (c.dataset.cats || "").split("|");
			c.style.display = cat === "All" || cats.includes(cat) ? "" : "none";
		});
	}
	buttons.forEach((b) => {
		b.addEventListener("click", () => {
			buttons.forEach((x) => x.classList.remove("active"));
			b.classList.add("active");
			apply(b.dataset.cat);
			const ml = document.querySelector(".filters-mobile span");
			if (ml) ml.textContent = b.dataset.cat;
		});
	});
	// mobile dropdown
	const mob = document.querySelector(".filters-mobile");
	const list = document.querySelector(".filters-mobile-list");
	if (mob && list)
		mob.addEventListener("click", () => {
			list.style.display = list.style.display === "block" ? "none" : "block";
		});
}

// ----- Article TOC scroll-spy + smooth scroll + heading anchor copy -----
function initTOC() {
	const tocButtons = document.querySelectorAll(".toc-card button[data-target]");
	if (!tocButtons.length) return;
	const headings = [...tocButtons]
		.map((b) => document.getElementById(b.dataset.target))
		.filter(Boolean);
	tocButtons.forEach((b) =>
		b.addEventListener("click", () => {
			const el = document.getElementById(b.dataset.target);
			if (el)
				window.scrollTo({
					top: el.getBoundingClientRect().top + scrollY - 80,
					behavior: "smooth",
				});
		}),
	);
	function spy() {
		let active = headings[0];
		for (const h of headings) {
			if (h.getBoundingClientRect().top - 100 <= 0) active = h;
		}
		tocButtons.forEach((b) =>
			b.classList.toggle("active", b.dataset.target === (active && active.id)),
		);
	}
	document.addEventListener("scroll", spy, { passive: true });
	spy();
	// heading click-to-copy
	document.querySelectorAll(".prose h2[id]").forEach((h) =>
		h.addEventListener("click", () => {
			const url = location.origin + location.pathname + "#" + h.id;
			navigator.clipboard && navigator.clipboard.writeText(url);
		}),
	);
	// mobile FAB scrolls to top of TOC / toggles
	const fab = document.querySelector(".toc-fab");
	if (fab)
		fab.addEventListener("click", () =>
			window.scrollTo({ top: 0, behavior: "smooth" }),
		);
}

document.addEventListener("DOMContentLoaded", () => {
	initGradientCanvas(document.querySelector(".gradient-banner canvas"));
	initFilter();
	initTOC();
});
