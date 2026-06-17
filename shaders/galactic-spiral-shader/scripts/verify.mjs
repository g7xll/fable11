/* Headless CLI verification for Galactic Spiral Shader.
 * Boots a `vite preview`-style server externally; pass the base URL.
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

// Watch for any remote Google Fonts requests from the very first navigation.
const fontRequests = [];
page.on("request", (r) => {
	const u = r.url();
	if (u.includes("fonts.gstatic.com") || u.includes("fonts.googleapis.com")) {
		fontRequests.push(u);
	}
});

await page.goto(BASE_URL, { waitUntil: "networkidle" });
await page.waitForTimeout(1600); // let entrance reveal + a few shader frames run

// ── Title + required brief copy ────────────────────────────────────────────
check("page title", (await page.title()).startsWith("Galactic Spiral"), await page.title());
check(
	'h1 reads "Galactic Spiral"',
	(await page.locator("h1").innerText()).trim() === "Galactic Spiral",
	(await page.locator("h1").innerText()).trim(),
);
check(
	"eyebrow transmission line present",
	(await page.getByText("Transmission 04 — Neon Rainbow Spiral", { exact: true }).count()) === 1,
);
check(
	"subtitle present",
	(await page.getByText(/seven-band neon rainbow/i).count()) === 1,
);

// ── Shader canvas (WebGL) ──────────────────────────────────────────────────
const canvas = page.locator("canvas");
check("shader canvas exists", (await canvas.count()) === 1);
const canvasInfo = await canvas.first().evaluate((c) => {
	const gl =
		c.getContext("webgl2") || c.getContext("webgl") || c.getContext("experimental-webgl");
	const box = c.getBoundingClientRect();
	return { hasGL: !!gl, w: box.width, h: box.height };
});
check("canvas has a WebGL context", canvasInfo.hasGL);
check("canvas fills viewport width", canvasInfo.w >= 1200, `${canvasInfo.w}px`);
check("canvas fills viewport height", canvasInfo.h >= 700, `${canvasInfo.h}px`);

// The shader actually paints the neon rainbow (not a black/empty frame). The
// WebGL backbuffer isn't preserved, so sample the composited screenshot the
// browser shows. Walk a grid over the central region and confirm (a) a real
// fraction of samples land on lit arms and (b) both warm- and cool-dominant
// hues appear — i.e. it's a multi-colour spiral, not a flat wash.
const shot = await page.screenshot({ type: "png" });
const { PNG } = await import("pngjs");
const png = PNG.sync.read(shot);
let lit = 0;
let warm = 0;
let cool = 0;
let samples = 0;
for (let gy = 0.12; gy <= 0.88; gy += 0.04) {
	for (let gx = 0.12; gx <= 0.88; gx += 0.04) {
		const x = Math.floor(png.width * gx);
		const y = Math.floor(png.height * gy);
		const i = (png.width * y + x) * 4;
		const r = png.data[i];
		const g = png.data[i + 1];
		const b = png.data[i + 2];
		samples += 1;
		if (r + g + b > 150) {
			lit += 1;
			if (r > b + 30) warm += 1;
			if (b > r + 30) cool += 1;
		}
	}
}
const litFrac = lit / samples;
// Spiral arms are thin lines over a vignette, so a single-digit lit fraction is
// the expected signal of a live render; a black/failed frame reads ~0%.
check("shader paints lit arms across the frame", litFrac > 0.04, `${(litFrac * 100).toFixed(0)}% of ${samples} samples lit`);
check("spiral shows warm hues (red/orange/yellow)", warm > 0, `${warm} warm samples`);
check("spiral shows cool hues (blue/violet)", cool > 0, `${cool} cool samples`);

// ── Registration frame ─────────────────────────────────────────────────────
check("four registration corners present", (await page.locator(".reticle-corner").count()) === 4);

// ── Live telemetry HUD ─────────────────────────────────────────────────────
const clockA = (await page.locator(".telemetry-clock").innerText()).trim();
check("mission clock formatted", /^T\+\d{2}:\d{2}:\d{2}$/.test(clockA), clockA);
await page.waitForTimeout(1300);
const clockB = (await page.locator(".telemetry-clock").innerText()).trim();
check("mission clock advances over time", clockA !== clockB, `${clockA} -> ${clockB}`);

const fps = (await page.locator(".telemetry-fps").innerText()).trim();
check("render fps reported (non-zero)", /\d/.test(fps) && !/^0\s*fps/i.test(fps), fps);

// ── Fonts vendored locally + display face ──────────────────────────────────
check(
	"no remote Google Fonts requests (fonts vendored)",
	fontRequests.length === 0,
	fontRequests.slice(0, 2).join(" | "),
);
const heroFont = await page.locator("h1").evaluate((el) => getComputedStyle(el).fontFamily);
check("display face is Inter", heroFont.includes("Inter"), heroFont);

// ── Responsive: ledger collapses to the mobile mini-HUD ────────────────────
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(400);
check("h1 still visible on mobile", await page.locator("h1").isVisible());
check(
	"desktop telemetry ledger hidden on mobile",
	!(await page.locator(".telemetry-clock").isVisible()),
);
check(
	"mobile mini-ledger visible on mobile",
	await page.locator(".telemetry-clock-m").isVisible(),
);

check(
	"no console/page errors",
	consoleErrors.length === 0,
	consoleErrors.join(" | ").slice(0, 300),
);

await browser.close();
console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
