// ---------- check icons in feature lists ----------
const CHECK =
	'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
document.querySelectorAll(".feat-list li").forEach((li) => {
	if (li.textContent.startsWith("%C"))
		li.innerHTML = CHECK + li.innerHTML.replace("%C", "");
});

// ---------- navbar scroll ----------
const nav = document.getElementById("nav");
addEventListener(
	"scroll",
	() => nav.classList.toggle("scrolled", scrollY > 20),
	{ passive: true },
);

// ---------- theme toggle ----------
const html = document.documentElement;
document.getElementById("theme-toggle").addEventListener("click", () => {
	html.dataset.theme = html.dataset.theme === "dark" ? "light" : "dark";
});

// ---------- logo cloud ----------
const logos = [
	"OpenAI",
	"Retool",
	"stripe",
	"wise",
	"loom",
	"Medium",
	"Cash App",
	"Linear",
];
document.getElementById("logo-grid").innerHTML = logos
	.map((n) => `<div class="logo-cell">${n}</div>`)
	.join("");

// ---------- hero tabs ----------
const tabs = document.querySelectorAll(".hero-tab");
tabs.forEach((t) =>
	t.addEventListener("click", () => {
		tabs.forEach((x) => x.classList.remove("active"));
		t.classList.add("active");
	}),
);

// ---------- terminal typewriter ----------
const termLines = [
	{ html: '<span class="prompt">$</span> npx codeforge clone repo', d: 30 },
	{ html: "Cloning repository<span class='ell'></span>", d: 18 },
	{ html: "Resolving deltas: <b>100%</b> (1234/1234), done.", d: 14 },
	{ html: "Analyzing codebase<span class='ell'></span>", d: 18 },
	{ html: "Setting up AI agent<span class='ell'></span>", d: 18 },
	{ html: "✓ Repository cloned successfully", d: 18 },
];
function runTerminal() {
	const body = document.getElementById("terminal-body");
	const status = document.getElementById("term-status");
	body.innerHTML = "";
	status.innerHTML =
		'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.2-8.5"/></svg> Cloning';
	let li = 0;
	function nextLine() {
		if (li >= termLines.length) {
			status.innerHTML =
				'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Cloned';
			setTimeout(runTerminal, 3500);
			return;
		}
		const div = document.createElement("div");
		body.appendChild(div);
		const line = termLines[li];
		const text = line.html;
		let i = 0;
		(function type() {
			// type char-by-char on the rendered string (skip tag chunks)
			div.innerHTML = text.slice(0, i) + '<span class="cursor"></span>';
			// advance past full tags to avoid broken markup
			if (text[i] === "<") {
				const close = text.indexOf(">", i);
				i = close + 1;
			} else {
				i++;
			}
			if (i <= text.length) {
				setTimeout(type, line.d);
			} else {
				div.innerHTML = text;
				li++;
				setTimeout(nextLine, 350);
			}
		})();
	}
	nextLine();
}
runTerminal();

// ---------- testimonials ----------
const testimonials = [
	{
		n: "Alex Rivera",
		r: "CTO at InnovateTech",
		q: "#CodeForge has revolutionized how our team ships code. We move 10x faster now.",
		a: "men-91",
	},
	{
		n: "Samantha Lee",
		r: "Marketing Director at NextGen Solutions",
		q: "The AI agents handle the boilerplate so our engineers focus on real product work.",
		a: "women-12",
	},
	{
		n: "Raj Patel",
		r: "Founder & CEO at StartUp Grid",
		q: "As a small team, CodeForge lets us punch way above our weight. Indispensable.",
		a: "men-45",
	},
	{
		n: "Emily Chen",
		r: "Product Manager at Digital Wave",
		q: "Code reviews that used to take hours now happen instantly with visual diffs.",
		a: "women-83",
	},
	{
		n: "Michael Brown",
		r: "Data Scientist at FinTech Innovations",
		q: "Parallel agents let me run experiments while shipping production features.",
		a: "men-1",
	},
	{
		n: "Linda Wu",
		r: "VP of Operations at LogiChain Solutions",
		q: "#LogiTech's supply chain optimization tools have drastically reduced our operational costs. Efficiency and accuracy in logistics have never been better.",
		a: "women-5",
	},
	{
		n: "Carlos Gomez",
		r: "Head of R&D at EcoInnovate",
		q: "By integrating #GreenTech's sustainable energy solutions, we've seen a significant reduction in carbon footprint. Leading the way in eco-friendly business practices.",
		a: "men-14",
	},
	{
		n: "Aisha Khan",
		r: "Chief Marketing Officer at Fashion Forward",
		q: "#TrendSetter's market analysis AI has transformed how we approach fashion trends. Our campaigns are now data-driven with higher customer engagement.",
		a: "women-56",
	},
	{
		n: "Tom Chen",
		r: "Director of IT at HealthTech Solutions",
		q: "Implementing #MediCareAI in our patient care systems has improved patient outcomes significantly. Technology and healthcare working hand in hand.",
		a: "men-18",
	},
	{
		n: "Sofia Patel",
		r: "CEO at EduTech Innovations",
		q: "#LearnSmart's AI-driven personalized learning plans have doubled student performance metrics. Education tailored to every learner's needs.",
		a: "women-73",
	},
	{
		n: "Jake Morrison",
		r: "CTO at SecureNet Tech",
		q: "With #CyberShield's AI-powered security systems, our data protection levels are unmatched. Redefining cybersecurity standards.",
		a: "men-25",
	},
	{
		n: "Nadia Ali",
		r: "Product Manager at Creative Solutions",
		q: "#DesignPro's AI has streamlined our creative process, enhancing productivity and innovation. A game-changer for creative industries.",
		a: "women-78",
	},
	{
		n: "Omar Farooq",
		r: "Founder at Startup Hub",
		q: "#VentureAI's insights into startup ecosystems have been invaluable for our growth and funding strategies. A catalyst for startup success.",
		a: "men-54",
	},
];
function card(t) {
	const q = t.q.replace(/(#\w+)/g, '<span class="hash">$1</span>');
	return `<div class="testi-card"><div class="testi-head"><img src="assets/avatars/${t.a}.jpg" alt="${t.n}"/><div><div class="nm">${t.n}</div><div class="rl">${t.r}</div></div></div><p>${q}</p></div>`;
}
const cols = [[], [], []];
testimonials.forEach((t, i) => cols[i % 3].push(t));
document.getElementById("testi-cols").innerHTML = cols
	.map((col, i) => {
		const dir = i === 1 ? "down" : "up";
		const inner = col.concat(col).map(card).join("");
		return `<div style="overflow:hidden"><div class="testi-col ${dir}">${inner}</div></div>`;
	})
	.join("");

// ---------- velocity scroll ----------
const vTrack = document.getElementById("velocity");
const phrase = [
	"Ship faster",
	"Build smarter",
	"Code with AI",
	"Scale instantly",
];
vTrack.innerHTML = phrase
	.concat(phrase, phrase)
	.map((p) => `<span>${p}</span><span>★</span>`)
	.join("");
let vx = 0;
let vBoost = 0;
let lastY = scrollY;
addEventListener(
	"scroll",
	() => {
		vBoost += Math.abs(scrollY - lastY) * 2;
		lastY = scrollY;
	},
	{ passive: true },
);
function vLoop() {
	vx -= 1 + vBoost;
	vBoost *= 0.9;
	if (vBoost < 0.1) vBoost = 0;
	const w = vTrack.scrollWidth / 3;
	if (-vx >= w) vx += w;
	vTrack.style.transform = `translateX(${vx}px) skewX(-6deg)`;
	requestAnimationFrame(vLoop);
}
vLoop();

// ---------- pricing toggle ----------
const ptoggle = document.getElementById("price-toggle");
ptoggle.querySelectorAll("button").forEach((b) =>
	b.addEventListener("click", () => {
		ptoggle
			.querySelectorAll("button")
			.forEach((x) => x.classList.remove("active"));
		b.classList.add("active");
		const mode = b.dataset.mode;
		document.querySelectorAll(".plan-price .amt").forEach((a) => {
			a.textContent = mode === "annual" ? a.dataset.annual : a.dataset.monthly;
		});
	}),
);

// ---------- FAQ ----------
const faqs = [
	[
		"What is an AI Agent?",
		"An AI Agent is an intelligent software program that can perform tasks autonomously, learn from interactions, and make decisions to help achieve specific goals. It combines artificial intelligence and machine learning to provide personalized assistance and automation.",
	],
	[
		"How does SkyAgent work?",
		"SkyAgent connects to your repositories and toolchain, analyzes your codebase, and uses large language models to write, review, and refactor code while you stay in control of every change.",
	],
	[
		"How secure is my data?",
		"Your data is encrypted in transit and at rest. Agents run in isolated environments and never train on your private code without explicit permission.",
	],
	[
		"Can I integrate my existing tools?",
		"Yes. Install MCP servers with one click and connect GitHub, databases, and any tool your team already uses.",
	],
	[
		"Is there a free trial available?",
		"Absolutely. Try free for 14 days with full access to all features — no credit card required.",
	],
	[
		"How does SkyAgent save me time?",
		"By handling boilerplate, automating reviews, and running parallel agents, SkyAgent lets your team focus on architecture and shipping features faster.",
	],
];
const faqList = document.getElementById("faq-list");
faqList.innerHTML = faqs
	.map(
		([q, a], i) => `
  <div class="faq-item${i === 0 ? " open" : ""}">
    <button class="faq-q">${q}
      <svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    <div class="faq-a"><p>${a}</p></div>
  </div>`,
	)
	.join("");
faqList.querySelectorAll(".faq-item").forEach((item) => {
	const a = item.querySelector(".faq-a");
	if (item.classList.contains("open"))
		a.style.maxHeight = a.scrollHeight + "px";
	item.querySelector(".faq-q").addEventListener("click", () => {
		const open = item.classList.contains("open");
		faqList.querySelectorAll(".faq-item").forEach((x) => {
			x.classList.remove("open");
			x.querySelector(".faq-a").style.maxHeight = null;
		});
		if (!open) {
			item.classList.add("open");
			a.style.maxHeight = a.scrollHeight + "px";
		}
	});
});

// ---------- world map dots ----------
(function worldmap() {
	const c = document.getElementById("worldmap");
	if (!c) return;
	const ctx = c.getContext("2d");
	const W = c.width,
		H = c.height,
		gap = 7,
		r = 1.3;
	// crude landmass mask using ellipses
	const blobs = [
		[120, 110, 70, 45],
		[110, 170, 55, 55],
		[300, 90, 55, 45],
		[300, 150, 50, 60],
		[350, 120, 35, 30],
		[470, 200, 45, 30],
		[200, 110, 40, 30],
	];
	function inLand(x, y) {
		return blobs.some(
			([cx, cy, rx, ry]) =>
				(x - cx) ** 2 / (rx * rx) + (y - cy) ** 2 / (ry * ry) <= 1,
		);
	}
	const style = getComputedStyle(document.body);
	function draw() {
		ctx.clearRect(0, 0, W, H);
		const col =
			document.documentElement.dataset.theme === "dark" ? "#3a3a3a" : "#d4d4d4";
		for (let y = 10; y < H - 10; y += gap)
			for (let x = 10; x < W - 10; x += gap)
				if (inLand(x, y)) {
					ctx.beginPath();
					ctx.arc(x, y, r, 0, Math.PI * 2);
					ctx.fillStyle = col;
					ctx.fill();
				}
	}
	draw();
	new MutationObserver(draw).observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["data-theme"],
	});
})();

// ---------- scroll reveal ----------
const io = new IntersectionObserver(
	(entries) =>
		entries.forEach(
			(e) =>
				e.isIntersecting &&
				(e.target.classList.add("in"), io.unobserve(e.target)),
		),
	{ threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
