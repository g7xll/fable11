/* Headless CLI verification for the Living Nebula Shader.
 * Drives a running server (vite preview / dev) with headless Chromium.
 * Usage: node scripts/verify.mjs [baseURL]   (default http://localhost:4173)
 */
import { chromium } from "playwright";

const BASE_URL = process.argv[2] ?? "http://localhost:4173";

let failures = 0;
const check = (name, ok, detail = "") => {
	console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
	if (!ok) failures += 1;
};

const browser = await chromium.launch();
const page = await browser.newPage({
	viewport: { width: 1280, height: 800 },
	deviceScaleFactor: 1,
});

const consoleErrors = [];
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
page.on("pageerror", (e) => consoleErrors.push(String(e)));

// Track remote font requests across the whole session.
const fontRequests = [];
page.on("request", (r) => {
	const u = r.url();
	if (u.includes("fonts.gstatic.com") || u.includes("fonts.googleapis.com")) {
		fontRequests.push(u);
	}
});

await page.goto(BASE_URL, { waitUntil: "networkidle" });
await page.waitForTimeout(1700); // entrance cascade + several shader frames

// ── Title + brief structure ───────────────────────────────────────────────
check("page title", (await page.title()).startsWith("Living Nebula"), await page.title());
check("app-container present", (await page.locator(".app-container").count()) === 1);
check("overlay-content present", (await page.locator(".overlay-content").count()) === 1);

// ── Required brief copy (demo.tsx) ─────────────────────────────────────────
check(
	'h1.title reads "Living Nebula"',
	(await page.locator("h1.title").innerText()).trim() === "Living Nebula",
	(await page.locator("h1.title").innerText()).trim(),
);
// Compare DOM text (textContent), not innerText — the copy is verbatim from the
// brief; CSS `text-transform: uppercase` only changes the rendered glyphs.
const descText = (await page.locator(".description").textContent())?.trim();
check(
	'.description reads "An Interactive WebGL Shader" (verbatim from brief)',
	descText === "An Interactive WebGL Shader",
	descText,
);

// ── Shader canvas (WebGL) ──────────────────────────────────────────────────
const canvas = page.locator(".nebula-feed canvas");
check("shader canvas exists", (await canvas.count()) === 1);
const canvasInfo = await canvas.first().evaluate((c) => {
	const gl =
		c.getContext("webgl2") || c.getContext("webgl") || c.getContext("experimental-webgl");
	const box = c.getBoundingClientRect();
	const cs = getComputedStyle(c.parentElement);
	return { hasGL: !!gl, w: box.width, h: box.height, parentZ: cs.zIndex, parentPos: cs.position };
});
check("canvas has a WebGL context", canvasInfo.hasGL);
check("canvas fills viewport width", canvasInfo.w >= 1200, `${canvasInfo.w}px`);
check("canvas fills viewport height", canvasInfo.h >= 700, `${canvasInfo.h}px`);
check(
	"feed container fixed at z-index -1 (per brief)",
	canvasInfo.parentPos === "fixed" && canvasInfo.parentZ === "-1",
	`${canvasInfo.parentPos} / z=${canvasInfo.parentZ}`,
);

// The shader actually paints colored gas (not a black/empty frame). The WebGL
// backbuffer isn't preserved, so sample the composited result the browser shows.
const shot = await page.screenshot({ type: "png" });
const { PNG } = await import("pngjs");
const png = PNG.sync.read(shot);
let lit = 0;
let colored = 0;
const samples = 240;
for (let i = 0; i < samples; i++) {
	const x = Math.floor(Math.random() * png.width);
	const y = Math.floor(Math.random() * png.height);
	const idx = (png.width * y + x) * 4;
	const r = png.data[idx];
	const g = png.data[idx + 1];
	const b = png.data[idx + 2];
	if (r + g + b > 60) lit++;
	// magenta-ish or blue-ish gas pixels
	if ((r > 70 && b > 50 && g < r) || (b > 90 && b > r)) colored++;
}
check("shader paints lit pixels (not black)", lit > samples * 0.2, `${lit}/${samples} lit`);
check("shader renders nebula gas color", colored > 4, `${colored}/${samples} colored`);

// ── Cursor warp: moving the pointer changes the rendered feed ──────────────
const before = await page.screenshot({ type: "png" });
await page.mouse.move(360, 400, { steps: 6 });
await page.waitForTimeout(700);
const after = await page.screenshot({ type: "png" });
const a = PNG.sync.read(before);
const b = PNG.sync.read(after);
let diff = 0;
const n = Math.min(a.data.length, b.data.length);
for (let i = 0; i < n; i += 4) {
	if (Math.abs(a.data[i] - b.data[i]) > 14) diff++;
}
check("feed is animated / cursor-reactive (frames differ)", diff > 500, `${diff} differing px`);

// ── Telemetry HUD reads the shader's own per-frame state ───────────────────
const clockA = await page.locator(".telemetry__cell--clock dd").innerText();
check("feed clock formatted T+HH:MM:SS", /^T\+\d{2}:\d{2}:\d{2}$/.test(clockA), clockA);
await page.waitForTimeout(1300);
const clockB = await page.locator(".telemetry__cell--clock dd").innerText();
check("feed clock advances over time", clockA !== clockB, `${clockA} -> ${clockB}`);

const fps = await page.locator(".telemetry__cell").nth(1).locator("dd").innerText();
check("render rate reported (non-zero)", /\d/.test(fps) && !/^0\s*fps/.test(fps), fps);

// Warp coordinates update live with the cursor (reads iMouse off the GPU loop).
await page.mouse.move(900, 300, { steps: 4 });
await page.waitForTimeout(400);
const warp = await page.locator(".telemetry__cell--warp dd").innerText();
check("warp center is live coordinates", /[+-]\d\.\d{3}\s*,\s*[+-]?\d\.\d{3}/.test(warp), warp);

// ── Cursor reticle (the brief's cursor-aura, kept) ─────────────────────────
check("cursor reticle present", (await page.locator(".cursor-aura").count()) === 1);
check("reticle has 4 ticks", (await page.locator(".cursor-aura__tick").count()) === 4);

// ── Console framing ────────────────────────────────────────────────────────
check("console brackets present (4 corners)", (await page.locator(".console__bracket").count()) === 4);

// ── Fonts vendored locally (no remote gstatic/gfonts requests) ─────────────
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(500);
check(
	"no remote Google Fonts requests (fonts vendored)",
	fontRequests.length === 0,
	fontRequests.slice(0, 2).join(" | "),
);
const heroFont = await page.locator("h1.title").evaluate((el) => getComputedStyle(el).fontFamily);
check("display face is Space Grotesk", heroFont.includes("Space Grotesk"), heroFont);

// ── Responsive: telemetry collapses on mobile ──────────────────────────────
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(400);
check("h1 still visible on mobile", await page.locator("h1.title").isVisible());
const gridCols = await page
	.locator(".telemetry")
	.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
check("telemetry grid collapses (<5 cols) on mobile", gridCols < 5, `${gridCols} cols`);

check(
	"no console/page errors",
	consoleErrors.length === 0,
	consoleErrors.join(" | ").slice(0, 300),
);

await browser.close();
console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
