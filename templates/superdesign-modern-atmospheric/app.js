/* ===== Superdesign — Modern Atmospheric ===== */
(function () {
	"use strict";

	/* ---------- inline SVG icon helpers ---------- */
	const svg = (vb, body, cls) =>
		`<svg viewBox="${vb}" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="${cls || ""}">${body}</svg>`;

	const ICONS = {
		react: svg(
			"-11.5 -10.23 23 20.46",
			'<circle r="2.05" fill="currentColor"/><g stroke="currentColor" stroke-width="1" fill="none"><ellipse rx="11" ry="4.2"/><ellipse rx="11" ry="4.2" transform="rotate(60)"/><ellipse rx="11" ry="4.2" transform="rotate(120)"/></g>',
		),
		vue: svg("0 0 24 24", '<path d="M2 3h4l6 10L18 3h4L12 21 2 3Z"/>'),
		svelte: svg(
			"0 0 24 24",
			'<path d="M5 13c-1.6-2.6-.6-6 2-7.5l4-2.4c2.6-1.6 6-.6 7.5 2 1.2 2 .9 4.4-.5 6 .2.7.3 1.4.3 2.1.2 1.9-.7 3.8-2.4 4.8l-4 2.4c-2.6 1.6-6 .6-7.5-2-1.2-2-.9-4.4.5-6-.2-.7-.3-1.4-.3-2.1Zm3 4.7c.8 1.4 2.6 1.9 4 1l4-2.4c.9-.5 1.2-1.7.6-2.6-.7-1.1-1-1.1-3.6.4l-1.2.7c-2 1.2-4.6.6-5.8-1.4-.4 1.4 0 2.9 2 4.3Z"/>',
		),
		angular: svg(
			"0 0 24 24",
			'<path d="M12 2 2 5.6l1.6 13.2L12 22l8.4-3.2L22 5.6 12 2Zm0 2.2 6.2 14h-2.3l-1.3-3.1H9.4L8.1 18.2H5.8L12 4.2Zm0 4-1.9 4.6h3.8L12 8.2Z"/>',
		),
		nextjs: svg(
			"0 0 24 24",
			'<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 8v8M8 8l8 9M16 8v6"/>',
		),

		figma: svg(
			"0 0 24 24",
			'<path d="M8 2h4v4H8a2 2 0 1 1 0-4Zm4 0h0a2 2 0 1 1 0 4h0V2Zm0 6h0a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm-4 0h4v4H8a2 2 0 1 1 0-4Zm0 6h4v2a2 2 0 1 1-4 0v-2Z"/>',
		),
		github: svg(
			"0 0 24 24",
			'<path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/>',
		),
		slack: svg(
			"0 0 24 24",
			'<path d="M6 14a2 2 0 1 1-2-2h2v2Zm1 0a2 2 0 1 1 4 0v5a2 2 0 1 1-4 0v-5Zm3-8a2 2 0 1 1 2 2h-2V6Zm0 1a2 2 0 1 1 0 4H5a2 2 0 1 1 0-4h5Zm8 3a2 2 0 1 1 2 2h-2v-2Zm-1 0a2 2 0 1 1-4 0V5a2 2 0 1 1 4 0v5Zm-3 8a2 2 0 1 1-2-2h2v2Zm0-1a2 2 0 1 1 0-4h5a2 2 0 1 1 0 4h-5Z"/>',
		),
		linear: svg(
			"0 0 24 24",
			'<path d="M2.5 13.4 10.6 21.5a10 10 0 0 1-8.1-8.1ZM2.1 10.3 13.7 21.9c.9-.2 1.7-.4 2.5-.8L2.9 7.8c-.4.8-.6 1.6-.8 2.5ZM3.9 5.6 18.4 20.1c.6-.4 1.1-.9 1.6-1.4L5.3 4c-.5.5-1 1-1.4 1.6ZM7.4 2.5l14.1 14.1a10 10 0 0 0-14.1-14Z"/>',
		),
		notion: svg(
			"0 0 24 24",
			'<path d="M4 4.5 14.5 3.7l6 .5v14.3l-3.4 2.3L5 19.6V5.2L4 4.5Zm3 2v11.8l8 .8V8L9.6 7.8 13 13v-5l2 .2v8.6l-2-.2-3.5-5.6V12l-1-.1V6.8L7 6.5Z"/>',
		),
		storybook: svg(
			"0 0 24 24",
			'<path d="M4 3.5 19 2.6 20 21l-15 .8L4 3.5Zm8.5 3.2c-1.7 0-2.8.9-2.8 2.3 0 2.4 3.3 1.9 3.3 3.2 0 .4-.4.6-.9.6-.7 0-1-.4-1-1.2l-1.7.1c0 1.5 1 2.4 2.8 2.4 1.7 0 2.8-.9 2.8-2.4 0-2.5-3.3-2-3.3-3.2 0-.4.3-.5.7-.5.6 0 .8.4.8 1l1.7-.1c-.1-1.5-1-2.2-2.7-2.2Z"/>',
		),
		vercel: svg("0 0 24 24", '<path d="M12 3 22 20H2L12 3Z"/>'),
	};

	/* ---------- frameworks + integrations ---------- */
	const fwHTML = ["react", "nextjs", "vue", "svelte", "angular"]
		.map((k) => `<a href="#features" aria-label="${k}">${ICONS[k]}</a>`)
		.join("");
	document.getElementById("frameworks").innerHTML = fwHTML;

	const intList = [
		"figma",
		"github",
		"slack",
		"linear",
		"notion",
		"storybook",
		"vercel",
	];
	const intHTML = intList
		.map((k) => `<span class="ico" aria-label="${k}">${ICONS[k]}</span>`)
		.join("");
	document.getElementById("integrations").innerHTML = intHTML + intHTML; // doubled for seamless loop

	/* ---------- typing animation ---------- */
	const phrases = [
		"watch it appear.",
		"and ship it today.",
		"no mockups required.",
		"in real time.",
	];
	const typed = document.getElementById("typed");
	let pi = 0,
		ci = 0,
		deleting = false;
	function tick() {
		const word = phrases[pi];
		if (!deleting) {
			typed.textContent = word.slice(0, ++ci);
			if (ci === word.length) {
				deleting = true;
				return setTimeout(tick, 1600);
			}
		} else {
			typed.textContent = word.slice(0, --ci);
			if (ci === 0) {
				deleting = false;
				pi = (pi + 1) % phrases.length;
			}
		}
		setTimeout(tick, deleting ? 38 : 70);
	}
	tick();

	/* ---------- vibe input focus glow ---------- */
	const vibe = document.querySelector(".vibe");
	const ta = document.getElementById("vibeInput");
	ta.addEventListener("focus", () => vibe.classList.add("focused"));
	ta.addEventListener("blur", () => vibe.classList.remove("focused"));

	/* ---------- nav scroll state ---------- */
	const nav = document.getElementById("nav");
	const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
	onScroll();
	window.addEventListener("scroll", onScroll, { passive: true });

	/* ---------- feature scroll-spy ---------- */
	const spyLinks = [...document.querySelectorAll("#spyNav a")];
	const feats = [...document.querySelectorAll(".feat")];
	const spyObserver = new IntersectionObserver(
		(entries) => {
			entries.forEach((e) => {
				if (e.isIntersecting) {
					const id = e.target.id;
					spyLinks.forEach((l) =>
						l.classList.toggle("active", l.dataset.target === id),
					);
				}
			});
		},
		{ rootMargin: "-45% 0px -45% 0px", threshold: 0 },
	);
	feats.forEach((f) => spyObserver.observe(f));
	spyLinks[0] && spyLinks[0].classList.add("active");

	/* ---------- testimonials ---------- */
	const testimonials = [
		{
			n: "Maya Tanaka",
			h: "@mayatanaka",
			c: ["#6366f1", "#a855f7"],
			q: "I described a settings page in one sentence and got a layout I would have spent an afternoon on. Superdesign just gets the vibe.",
		},
		{
			n: "Dev Okonkwo",
			h: "@devo",
			c: ["#ec4899", "#f97316"],
			q: "The exported code is shockingly clean. No div soup. My team merged it with almost zero edits.",
		},
		{
			n: "Priya Nair",
			h: "@priyabuilds",
			c: ["#10b981", "#06b6d4"],
			q: "It designs on top of our real app, so everything inherits our tokens. Feels less like a tool and more like a teammate.",
		},
		{
			n: "Leo Brandt",
			h: "@leobrandt",
			c: ["#8b5cf6", "#ec4899"],
			q: "The glassy hero blocks are gorgeous out of the box. Honestly the fastest path from idea to something investors can see.",
		},
		{
			n: "Sofia Reyes",
			h: "@sofiareyes",
			c: ["#f59e0b", "#ef4444"],
			q: "I prototyped three pricing variations before my coffee got cold. The flow state is real.",
		},
		{
			n: "Aaron Quinn",
			h: "@aq",
			c: ["#3b82f6", "#6366f1"],
			q: "Design tokens that actually stay in sync across every screen. This is the part I never get to in side projects.",
		},
		{
			n: "Hana Köhler",
			h: "@hanakohler",
			c: ["#14b8a6", "#22c55e"],
			q: "The motion is subtle but intentional — exactly the premium feel I want and never have time to build.",
		},
		{
			n: "Marcus Bell",
			h: "@marcusb",
			c: ["#a855f7", "#6366f1"],
			q: "Went from a vague idea to a shippable landing page in a single session. The blueprint visuals sold my PM instantly.",
		},
		{
			n: "Yara Haddad",
			h: "@yarah",
			c: ["#ec4899", "#8b5cf6"],
			q: "It feels like designing at the speed of thought. The typing cursor on the hero is a tiny detail I now obsess over.",
		},
	];
	document.getElementById("masonry").innerHTML = testimonials
		.map(
			(t) => `
    <div class="tcard">
      <div class="tcard-top">
        <span class="tcard-av" style="background:linear-gradient(135deg,${t.c[0]},${t.c[1]})">${t.n
					.split(" ")
					.map((w) => w[0])
					.join("")
					.slice(0, 2)}</span>
        <span><span class="tcard-name">${t.n}</span><br><span class="tcard-handle">${t.h}</span></span>
      </div>
      <p class="tcard-q">${t.q}</p>
    </div>`,
		)
		.join("");

	/* ---------- FAQ ---------- */
	const faqs = [
		{
			q: "What exactly does Superdesign generate?",
			a: "A full, responsive interface — semantic markup and composable styles — from a plain-language description. You get a working screen, not a static mockup.",
		},
		{
			q: "Do I own the code it produces?",
			a: "Yes. Everything you generate is yours to export, edit, and ship. The output is clean, accessible, and framework-friendly.",
		},
		{
			q: "Can it work with my existing product?",
			a: "Absolutely. Point Superdesign at your live app and it inherits your real data shape, spacing, and design tokens, so new screens slot right in.",
		},
		{
			q: "How do design tokens stay in sync?",
			a: "Colors, type, and spacing live as a single source of truth. Change a token once and every generated screen updates to match — your design system, enforced automatically.",
		},
		{
			q: "Is there a free tier?",
			a: "You can start designing for free with generous monthly generations. Paid plans add team workspaces, version history, and live-app context scanning.",
		},
	];
	document.getElementById("faqList").innerHTML = faqs
		.map(
			(f) => `
    <div class="faq-item">
      <button class="faq-q" type="button">
        ${f.q}
        <span class="faq-chev">${svg("0 0 24 24", '<path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>')}</span>
      </button>
      <div class="faq-a"><p>${f.a}</p></div>
    </div>`,
		)
		.join("");

	document.querySelectorAll(".faq-item").forEach((item) => {
		const btn = item.querySelector(".faq-q");
		const panel = item.querySelector(".faq-a");
		btn.addEventListener("click", () => {
			const isOpen = item.classList.contains("open");
			document.querySelectorAll(".faq-item.open").forEach((o) => {
				o.classList.remove("open");
				o.querySelector(".faq-a").style.maxHeight = null;
			});
			if (!isOpen) {
				item.classList.add("open");
				panel.style.maxHeight = panel.scrollHeight + "px";
			}
		});
	});

	/* ---------- footer ---------- */
	const cols = [
		{ h: "Product", l: ["Features", "Templates", "Pricing", "Changelog"] },
		{ h: "Company", l: ["About", "Careers", "Blog", "Press"] },
		{ h: "Resources", l: ["Docs", "Guides", "Community", "Status"] },
		{ h: "Legal", l: ["Privacy", "Terms", "Security", "Cookies"] },
	];
	document.getElementById("footerCols").innerHTML = cols
		.map(
			(c) => `
    <div class="footer-col"><h4>${c.h}</h4>${c.l.map((x) => `<a href="#top">${x}</a>`).join("")}</div>`,
		)
		.join("");
	document.getElementById("footerSocial").innerHTML = [
		"github",
		"linear",
		"figma",
	]
		.map((k) => `<a href="#top" aria-label="${k}">${ICONS[k]}</a>`)
		.join("");
})();
