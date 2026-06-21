// Inline vendored lucide icons (replaces the Iconify CDN; fully offline).
// Usage: <i data-icon="menu"></i>  -> rendered as inline SVG inheriting currentColor.
const ICONS = {
	menu: '<path d="M4 5h16M4 12h16M4 19h16"/>',
	play: '<path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/>',
	cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9"/>',
	"pen-tool":
		'<path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z"/><path d="m18 13l-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18M2.3 2.3l7.286 7.286"/><circle cx="11" cy="11" r="2"/>',
	moon: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>',
	plus: '<path d="M5 12h14m-7-7v14"/>',
	instagram:
		'<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8A4 4 0 0 1 16 11.37m1.5-4.87h.01"/>',
	twitter:
		'<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6c2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4c-.9-4.2 4-6.6 7-3.8c1.1 0 3-1.2 3-1.2"/>',
};

function renderIcons() {
	document.querySelectorAll("i[data-icon]").forEach((el) => {
		const name = el.getAttribute("data-icon");
		const body = ICONS[name];
		if (!body) return;
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		svg.setAttribute("width", "1em");
		svg.setAttribute("height", "1em");
		svg.setAttribute("viewBox", "0 0 24 24");
		svg.setAttribute("fill", "none");
		svg.setAttribute("stroke", "currentColor");
		svg.setAttribute("stroke-width", "2");
		svg.setAttribute("stroke-linecap", "round");
		svg.setAttribute("stroke-linejoin", "round");
		svg.innerHTML = body;
		svg.style.display = "inline-block";
		svg.style.verticalAlign = "-0.125em";
		el.replaceWith(svg);
		// copy classes/inline transform onto the svg so FAQ rotation keeps working
		if (el.className) svg.setAttribute("class", el.className);
	});
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", renderIcons);
} else {
	renderIcons();
}
