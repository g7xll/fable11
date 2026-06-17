/* Headless CLI verification for Celestial Bloom Shader.
 * Boots `vite preview`-style server externally; pass the base URL.
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

await page.goto(BASE_URL, { waitUntil: "networkidle" });
await page.waitForTimeout(1600); // let entrance reveal + a few shader frames run

// ── Title + brief structure ───────────────────────────────────────────────
check(
	"page title",
	(await page.title()).startsWith("Celestial Bloom"),
	await page.title(),
);
check("app-container present", (await page.locator(".app-container").count()) === 1);
check(
	"content-overlay present",
	(await page.locator(".content-overlay").count()) === 1,
);

// ── Required brief copy ────────────────────────────────────────────────────
check(
	'h1 reads "Celestial Bloom"',
	(await page.locator("h1").innerText()).trim() === "Celestial Bloom",
	(await page.locator("h1").innerText()).trim(),
);
check(
	'subtitle reads "A Procedural Shader Animation"',
	(await page.getByText("A Procedural Shader Animation", { exact: true }).count()) === 1,
);

// ── Shader canvas (WebGL) ──────────────────────────────────────────────────
const canvas = page.locator(".app-container canvas");
check("shader canvas exists", (await canvas.count()) === 1);
const canvasInfo = await canvas.first().evaluate((c) => {
	const gl =
		c.getContext("webgl2") || c.getContext("webgl") || c.getContext("experimental-webgl");
	const box = c.getBoundingClientRect();
	return {
		hasGL: !!gl,
		w: box.width,
		h: box.height,
		parentZ: getComputedStyle(c.parentElement).zIndex,
		parentPos: getComputedStyle(c.parentElement).position,
	};
});
check("canvas has a WebGL context", canvasInfo.hasGL);
check("canvas fills viewport width", canvasInfo.w >= 1200, `${canvasInfo.w}px`);
check("canvas fills viewport height", canvasInfo.h >= 700, `${canvasInfo.h}px`);
check(
	"shader container fixed at z-index -1",
	canvasInfo.parentPos === "fixed" && canvasInfo.parentZ === "-1",
	`${canvasInfo.parentPos} / z=${canvasInfo.parentZ}`,
);

// The shader actually paints something (not a black/empty frame). Sample the
// composited center pixel from a real screenshot — the WebGL backbuffer isn't
// preserved (preserveDrawingBuffer:false), so we read the painted result the
// browser actually shows rather than an undefined GL readback.
const shot = await page.screenshot({ type: "png" });
const { PNG } = await import("pngjs");
const png = PNG.sync.read(shot);
const cx = Math.floor(png.width / 2);
const cy = Math.floor(png.height / 2);
const ci = (png.width * cy + cx) * 4;
const centerPixel = [png.data[ci], png.data[ci + 1], png.data[ci + 2]];
check(
	"shader renders a lit core (center pixel is bright)",
	centerPixel[0] + centerPixel[1] + centerPixel[2] > 200,
	`rgb(${centerPixel.join(",")})`,
);

// ── Telemetry HUD (signature element) reflects live shader state ───────────
const clockA = await page.locator(".telemetry-cell--clock dd").innerText();
check("mission clock formatted", /^T\+\d{2}:\d{2}:\d{2}$/.test(clockA), clockA);
await page.waitForTimeout(1300);
const clockB = await page.locator(".telemetry-cell--clock dd").innerText();
check("mission clock advances over time", clockA !== clockB, `${clockA} -> ${clockB}`);

const fps = await page.locator(".plate-bar--bottom .telemetry-cell").nth(1).locator("dd").innerText();
check("render fps reported (non-zero)", /\d/.test(fps) && !fps.startsWith("0fps"), fps);

const petals = await page.locator(".plate-bar--bottom .telemetry-cell").nth(2).locator("dd").innerText();
check("petals readout is 05", petals.trim() === "05", petals.trim());

// ── Reticle frame ──────────────────────────────────────────────────────────
check("reticle corners present", (await page.locator(".reticle-corner").count()) === 4);

// ── Fonts vendored locally (no remote gstatic/gfonts requests) ─────────────
const fontRequests = [];
page.on("request", (r) => {
	const u = r.url();
	if (u.includes("fonts.gstatic.com") || u.includes("fonts.googleapis.com")) {
		fontRequests.push(u);
	}
});
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(500);
check(
	"no remote Google Fonts requests (fonts vendored)",
	fontRequests.length === 0,
	fontRequests.slice(0, 2).join(" | "),
);
const heroFont = await page.locator("h1").evaluate((el) => getComputedStyle(el).fontFamily);
check("display face is Fraunces", heroFont.includes("Fraunces"), heroFont);

// ── Responsive: telemetry collapses on mobile ──────────────────────────────
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(400);
check(
	"h1 still visible on mobile",
	await page.locator("h1").isVisible(),
);
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
