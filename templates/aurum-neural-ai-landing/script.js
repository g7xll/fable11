/* ===== Aurum — interactions ===== */
(() => {
	/* Nav scroll state */
	const nav = document.getElementById("nav");
	const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
	onScroll();
	window.addEventListener("scroll", onScroll, { passive: true });

	/* Reveal on scroll */
	const io = new IntersectionObserver(
		(entries) => {
			entries.forEach((e) => {
				if (e.isIntersecting) {
					e.target.classList.add("in");
					io.unobserve(e.target);
				}
			});
		},
		{ threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
	);
	document.querySelectorAll(".reveal").forEach((el, i) => {
		el.style.transitionDelay = `${Math.min(i % 5, 4) * 70}ms`;
		io.observe(el);
	});

	/* Neural lines: bezier curves from each satellite to the central node */
	const stage = document.getElementById("stage");
	const net = document.getElementById("net");
	const VB_W = 1000,
		VB_H = 562;

	function drawNet() {
		if (!stage) return;
		const sr = stage.getBoundingClientRect();
		if (sr.width === 0) return;
		const toVB = (el) => {
			const r = el.getBoundingClientRect();
			const cx = ((r.left + r.width / 2 - sr.left) / sr.width) * VB_W;
			const cy = ((r.top + r.height / 2 - sr.top) / sr.height) * VB_H;
			return { x: cx, y: cy };
		};
		const central = stage.querySelector(".central");
		const c = toVB(central);

		// keep gradient def, wipe paths
		const defs = net.querySelector("defs");
		net.innerHTML = "";
		net.appendChild(defs);

		stage.querySelectorAll(".satellite").forEach((sat, i) => {
			const p = toVB(sat);
			const mx = (p.x + c.x) / 2;
			const my = (p.y + c.y) / 2;
			// control points bow the curve outward
			const dx = c.y - p.y,
				dy = p.x - c.x;
			const len = Math.hypot(dx, dy) || 1;
			const bow = 46 * (i % 2 ? 1 : -1);
			const cpx = mx + (dx / len) * bow;
			const cpy = my + (dy / len) * bow;
			const d = `M${p.x.toFixed(1)},${p.y.toFixed(1)} Q${cpx.toFixed(1)},${cpy.toFixed(1)} ${c.x.toFixed(1)},${c.y.toFixed(1)}`;

			const main = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"path",
			);
			main.setAttribute("class", "node-line");
			main.setAttribute("d", d);
			main.setAttribute("stroke", "url(#lineGrad)");
			main.style.animation = `pulsing-branch ${2.6 + i * 0.4}s ease-in-out ${i * 0.25}s infinite`;
			net.appendChild(main);

			const flow = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"path",
			);
			flow.setAttribute("class", "node-flow");
			flow.setAttribute("d", d);
			flow.style.animationDelay = `${i * 0.5}s`;
			net.appendChild(flow);

			// endpoint dots
			const dot = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"circle",
			);
			dot.setAttribute("cx", p.x.toFixed(1));
			dot.setAttribute("cy", p.y.toFixed(1));
			dot.setAttribute("r", "3");
			dot.setAttribute("fill", "#e8d5b7");
			dot.style.animation = `pulsing-branch ${2.6 + i * 0.4}s ease-in-out infinite`;
			net.appendChild(dot);
		});
	}
	drawNet();
	window.addEventListener("resize", drawNet, { passive: true });
	// redraw after fonts/layout settle
	setTimeout(drawNet, 250);
	if (document.fonts?.ready) document.fonts.ready.then(drawNet);

	/* Parallax drift on satellites + central reacting to pointer */
	let raf = null;
	stage?.addEventListener("mousemove", (e) => {
		if (raf) return;
		raf = requestAnimationFrame(() => {
			const r = stage.getBoundingClientRect();
			const nx = (e.clientX - r.left) / r.width - 0.5;
			const ny = (e.clientY - r.top) / r.height - 0.5;
			stage.querySelectorAll(".satellite").forEach((s, i) => {
				const depth = 14 + (i % 3) * 8;
				s.style.transform = `translate(${(-nx * depth).toFixed(1)}px, ${(-ny * depth).toFixed(1)}px)`;
			});
			const cen = stage.querySelector(".central");
			if (cen)
				cen.style.transform = `translate(calc(-50% + ${(nx * 10).toFixed(1)}px), calc(-50% + ${(ny * 10).toFixed(1)}px))`;
			drawNet();
			raf = null;
		});
	});
	stage?.addEventListener("mouseleave", () => {
		stage.querySelectorAll(".satellite").forEach((s) => {
			s.style.transform = "";
		});
		const cen = stage.querySelector(".central");
		if (cen) cen.style.transform = "translate(-50%, -50%)";
		drawNet();
	});

	/* Pricing toggle */
	const sw = document.getElementById("switch");
	const lblM = document.getElementById("lbl-m");
	const lblA = document.getElementById("lbl-a");
	let annual = false;
	const setPrices = () => {
		document.querySelectorAll(".amt").forEach((el) => {
			const v = annual ? el.dataset.a : el.dataset.m;
			el.textContent = `$${v}`;
		});
	};
	const toggle = () => {
		annual = !annual;
		sw.classList.toggle("annual", annual);
		sw.setAttribute("aria-checked", String(annual));
		lblM.classList.toggle("on", !annual);
		lblA.classList.toggle("on", annual);
		setPrices();
	};
	sw?.addEventListener("click", toggle);
	sw?.addEventListener("keydown", (e) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			toggle();
		}
	});

	/* Digest form */
	const form = document.getElementById("digest-form");
	form?.addEventListener("submit", (e) => {
		e.preventDefault();
		const input = form.querySelector("input");
		input.value = "";
		input.placeholder = "Welcome to the digest ✦";
	});
})();
