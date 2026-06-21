/* Inline SVG produce illustrations — vendored, fully offline.
   Each returns an SVG string used as floating organic cards / product imagery. */
window.PRODUCE = (function () {
	const card = (bg, inner) =>
		`<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" role="img">
      <defs>
        <linearGradient id="g${inner.id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/>
        </linearGradient>
        <radialGradient id="sh${inner.id}" cx="0.5" cy="0.42" r="0.6">
          <stop offset="0" stop-color="rgba(255,255,255,0.18)"/><stop offset="1" stop-color="rgba(0,0,0,0)"/>
        </radialGradient>
      </defs>
      <rect width="400" height="500" fill="url(#g${inner.id})"/>
      <rect width="400" height="500" fill="url(#sh${inner.id})"/>
      ${inner.body}
    </svg>`;

	// ---- citrus (orange halves) ----
	const citrus = card(["#f0b429", "#d98324"], {
		id: "cit",
		body: `
    <g transform="translate(200 250)">
      <circle r="150" fill="#ffe08a"/>
      <circle r="150" fill="none" stroke="#c46a1d" stroke-width="14"/>
      <circle r="130" fill="#ffcf5c"/>
      <g fill="#ffe9b0" stroke="#f0b429" stroke-width="3">
        ${Array.from({ length: 12 }, (_, i) => {
					const a = (i * 30 * Math.PI) / 180;
					const x = Math.cos(a),
						y = Math.sin(a);
					return `<path d="M0 0 L${x * 118 - y * 30} ${y * 118 + x * 30} A118 118 0 0 0 ${x * 118 + y * 30} ${y * 118 - x * 30} Z" fill="#ffdf8a"/>`;
				}).join("")}
      </g>
      <circle r="30" fill="#fff3cf"/>
    </g>`,
	});

	// ---- leafy green / herbs ----
	const herbs = card(["#7fa356", "#3f6b2e"], {
		id: "hrb",
		body: `
    <g transform="translate(200 250)" stroke="#2f5722" stroke-width="6" fill="#83a95f">
      ${Array.from({ length: 9 }, (_, i) => {
				const a = ((-120 + i * 30) * Math.PI) / 180;
				return `<g transform="rotate(${-120 + i * 30})"><path d="M0 0 C 30 -50 30 -150 0 -210 C -30 -150 -30 -50 0 0 Z" fill="${i % 2 ? "#9bbf6e" : "#6f9650"}"/>
        <line x1="0" y1="0" x2="0" y2="-200"/></g>`;
			}).join("")}
      <circle r="20" fill="#3f6b2e" stroke="none"/>
    </g>`,
	});

	// ---- berries ----
	const berries = card(["#8e4b6e", "#5a2945"], {
		id: "ber",
		body: `
    <g transform="translate(200 250)">
      ${[
				[-70, -40, 70, "#7a2d52"],
				[60, -60, 60, "#923a63"],
				[-10, 40, 80, "#6b2547"],
				[90, 40, 52, "#a14573"],
				[-90, 60, 48, "#823255"],
			]
				.map(
					([x, y, r, c]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>
          <circle cx="${x - r * 0.3}" cy="${y - r * 0.35}" r="${r * 0.25}" fill="rgba(255,255,255,0.25)"/>
          <circle cx="${x}" cy="${y - r * 0.85}" r="${r * 0.14}" fill="#3aa35a"/>`,
				)
				.join("")}
    </g>`,
	});

	// ---- tomato ----
	const tomato = card(["#e3573c", "#a32d1c"], {
		id: "tom",
		body: `
    <g transform="translate(200 255)">
      <circle r="150" fill="#d83b27"/>
      <circle cx="-45" cy="-50" r="40" fill="rgba(255,255,255,0.22)"/>
      <g fill="#4e7d2f" transform="translate(0 -135)">
        ${Array.from({ length: 6 }, (_, i) => `<path d="M0 0 C 18 -22 12 -52 0 -60 C -12 -52 -18 -22 0 0Z" transform="rotate(${i * 60})"/>`).join("")}
        <circle r="16" fill="#3f6b2e"/>
      </g>
    </g>`,
	});

	// ---- avocado ----
	const avocado = card(["#a7c267", "#5f7d33"], {
		id: "avo",
		body: `
    <g transform="translate(200 250)">
      <ellipse rx="120" ry="160" fill="#41611f"/>
      <ellipse rx="100" ry="138" fill="#cfe39a"/>
      <ellipse rx="70" ry="96" fill="#e7f0c4"/>
      <circle r="46" fill="#7a4a25"/>
      <circle cx="-14" cy="-14" r="14" fill="rgba(255,255,255,0.25)"/>
    </g>`,
	});

	// ---- bread / grain loaf ----
	const grain = card(["#e7c48a", "#bd8b4e"], {
		id: "grn",
		body: `
    <g transform="translate(200 270)">
      <ellipse rx="160" ry="110" fill="#c98a4b"/>
      <ellipse rx="160" ry="110" fill="none" stroke="#9c6a33" stroke-width="8"/>
      <g stroke="#9c6a33" stroke-width="6" fill="none">
        <path d="M-120 -30 Q -60 -70 0 -30"/><path d="M-40 -10 Q 20 -50 80 -10"/><path d="M0 20 Q 70 -20 130 20"/>
      </g>
      <ellipse rx="150" ry="44" cy="-60" fill="#e7c48a"/>
    </g>`,
	});

	return { citrus, herbs, berries, tomato, avocado, grain };
})();
