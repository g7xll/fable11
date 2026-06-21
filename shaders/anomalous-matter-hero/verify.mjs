// Headless verification for the Anomalous Matter hero.
// Confirms: WebGL canvas renders non-black, cyan-leaning content (the color
// fix), the GLSL compiles with no console/page errors (the uniform-name fix),
// the mouse-tracked light path runs clean, the prompt copy is present, and the
// `animate-fade-in-long` element actually resolves the `fadeIn` keyframes.
//
// Pixels are read from a COMPOSITED element screenshot of the <canvas> (decoded
// back inside the page via a data URL) rather than from the live WebGL drawing
// buffer: the renderer runs with THREE's default `preserveDrawingBuffer:false`,
// so an async `createImageBitmap`/`readPixels` of the backbuffer can come back
// black even when the canvas is painting correctly on screen. The screenshot is
// what the user (and the demo recorder) actually see.
import { chromium } from "playwright";

const URL = process.env.URL || "http://localhost:5247/";
const fail = (m) => {
	console.error("FAIL:", m);
	process.exitCode = 1;
};

const browser = await chromium.launch({
	headless: true,
	args: [
		"--use-gl=swiftshader",
		"--enable-unsafe-swiftshader",
		"--ignore-gpu-blocklist",
		"--enable-webgl",
	],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

const consoleErrors = [];
const pageErrors = [];
page.on("console", (m) => {
	if (m.type() === "error") consoleErrors.push(m.text());
});
page.on("pageerror", (e) => pageErrors.push(String(e)));

await page.goto(URL, { waitUntil: "networkidle" });
// Let the rAF loop run + noise evolve a bit.
await page.waitForTimeout(1500);

// 1) Canvas exists with real size.
const canvas = await page.evaluate(() => {
	const c = document.querySelector("canvas");
	if (!c) return null;
	return { w: c.width, h: c.height, cw: c.clientWidth, ch: c.clientHeight };
});
if (!canvas) fail("no <canvas> mounted");
else if (canvas.w < 2 || canvas.h < 2)
	fail(`canvas too small: ${JSON.stringify(canvas)}`);
else console.log("OK canvas:", JSON.stringify(canvas));

// 2) Move the mouse across the viewport (drives the point-light uniform path).
for (const [x, y] of [
	[200, 200],
	[640, 300],
	[1000, 500],
	[640, 420],
]) {
	await page.mouse.move(x, y);
	await page.waitForTimeout(120);
}
console.log("OK mouse-move sequence dispatched");

// 3) Pixel probe: screenshot the <canvas> element (composited output), decode it
//    back inside the page, and confirm the wireframe paints non-black,
//    cyan-leaning pixels somewhere (the color/light fix).
const canvasHandle = await page.$("canvas");
let pixelStats = { litPct: 0, cyanPct: 0, maxLum: 0, avgLum: 0, total: 0 };
if (!canvasHandle) {
	fail("no <canvas> to screenshot");
} else {
	const shot = await canvasHandle.screenshot(); // composited PNG buffer
	pixelStats = await page.evaluate(async (b64) => {
		const img = new Image();
		await new Promise((res, rej) => {
			img.onload = res;
			img.onerror = rej;
			img.src = "data:image/png;base64," + b64;
		});
		const off = document.createElement("canvas");
		off.width = img.naturalWidth;
		off.height = img.naturalHeight;
		const ctx = off.getContext("2d");
		ctx.drawImage(img, 0, 0);
		const { data } = ctx.getImageData(0, 0, off.width, off.height);
		let lit = 0;
		let cyanLeaning = 0;
		let maxLum = 0;
		let sumLum = 0;
		const total = data.length / 4;
		for (let i = 0; i < data.length; i += 4) {
			const r = data[i],
				g = data[i + 1],
				b = data[i + 2];
			const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
			sumLum += lum;
			if (lum > maxLum) maxLum = lum;
			if (lum > 18) lit++;
			// sky-300 (#38bdf8) is blue/green dominant — confirm hue, not gray noise.
			if (b > 40 && b >= r && g >= r) cyanLeaning++;
		}
		return {
			total,
			litPct: (lit / total) * 100,
			cyanPct: (cyanLeaning / total) * 100,
			maxLum: Math.round(maxLum),
			avgLum: +(sumLum / total).toFixed(2),
		};
	}, shot.toString("base64"));
}
console.log("OK pixels:", JSON.stringify(pixelStats));
if (pixelStats.litPct < 0.3)
	fail(
		`canvas appears black — only ${pixelStats.litPct.toFixed(3)}% lit pixels (color/light fix not working?)`,
	);
if (pixelStats.maxLum < 40)
	fail(`max luminance ${pixelStats.maxLum} too low — mesh likely unlit`);
if (pixelStats.cyanPct < 0.1)
	fail(`no cyan-leaning pixels — color uniform may not be the sky-300 swatch`);

// 4) Prompt copy present (overridden demo strings). innerText reflects CSS
//    `text-transform`, so the uppercased <h1> reads in caps — match
//    case-insensitively rather than against the source casing.
const copy = await page.evaluate(() => {
	const body = document.body.innerText.toLowerCase();
	const has = (s) => body.includes(s.toLowerCase());
	return {
		title: has("Launch Sequence: Anomaly 12"),
		subtitle: has("Energy dances along unseen frontiers."),
		description: has("override the default copy"),
		banner: !!document.querySelector('section[role="banner"]'),
	};
});
console.log("OK copy:", JSON.stringify(copy));
if (!copy.title || !copy.subtitle || !copy.description)
	fail("hero copy missing");
if (!copy.banner) fail('section[role="banner"] missing');

// 5) `animate-fade-in-long` element resolves the `fadeIn` keyframes.
const fade = await page.evaluate(() => {
	const el = document.querySelector(".animate-fade-in-long");
	if (!el) return { found: false };
	const cs = getComputedStyle(el);
	return {
		found: true,
		animationName: cs.animationName,
		duration: cs.animationDuration,
	};
});
console.log("OK fade-in:", JSON.stringify(fade));
if (!fade.found) fail(".animate-fade-in-long element not found");
else if (!fade.animationName || fade.animationName === "none")
	fail(
		`fadeIn keyframes not wired — animation-name is "${fade.animationName}"`,
	);

// 6) No console / page errors (covers GLSL compile + uniform issues).
if (pageErrors.length) fail("page errors:\n" + pageErrors.join("\n"));
// Filter benign noise (favicon, etc.); WebGL/THREE/shader errors must be empty.
const badConsole = consoleErrors.filter((e) =>
	/shader|three|glsl|webgl|uniform|compile|gl_|undefined/i.test(e),
);
if (badConsole.length)
	fail("shader/webgl console errors:\n" + badConsole.join("\n"));
console.log(
	`OK errors: ${pageErrors.length} pageerrors, ${consoleErrors.length} console errors (${badConsole.length} shader-related)`,
);
if (consoleErrors.length)
	console.log(
		"   (non-shader console errors:",
		JSON.stringify(consoleErrors),
		")",
	);

await browser.close();
console.log(
	process.exitCode
		? "\n=== VERIFICATION FAILED ==="
		: "\n=== VERIFICATION PASSED ===",
);
