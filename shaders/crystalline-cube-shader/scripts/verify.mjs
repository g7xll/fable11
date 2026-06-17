/* Headless CLI verification for the Crystalline Cube lapidary bench.
 * Expects a server already running (e.g. `npm run preview`); pass its base URL.
 * Usage: node scripts/verify.mjs [baseURL]   (default http://localhost:4173)
 */
import { chromium } from "playwright";

const BASE_URL = process.argv[2] ?? "http://localhost:4173";

let failures = 0;
const check = (name, ok, detail = "") => {
	console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
	if (!ok) failures += 1;
};
const norm = (s) => s.replace(/\s+/g, " ").trim();

const browser = await chromium.launch();
const page = await browser.newPage({
	viewport: { width: 1280, height: 800 },
	deviceScaleFactor: 1,
});

const consoleErrors = [];
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
page.on("pageerror", (e) => consoleErrors.push(String(e)));

await page.goto(BASE_URL, { waitUntil: "networkidle" });
await page.waitForTimeout(1400); // entrance reveal + a few shader frames

// ── Title + hero copy ──────────────────────────────────────────────────────
check("page title", (await page.title()).startsWith("Crystalline Cube"), await page.title());
check(
	'h1 reads "Crystalline Cube"',
	norm(await page.locator("h1").innerText()) === "Crystalline Cube",
	norm(await page.locator("h1").innerText()),
);

// ── Shader canvas (WebGL) ──────────────────────────────────────────────────
const canvas = page.locator("canvas").first();
check("shader canvas exists", (await page.locator("canvas").count()) === 1);
const info = await canvas.evaluate((c) => {
	const gl = c.getContext("webgl") || c.getContext("experimental-webgl");
	const box = c.getBoundingClientRect();
	return { hasGL: !!gl, w: box.width, h: box.height };
});
check("canvas has a WebGL context", info.hasGL);
check("canvas fills viewport width", info.w >= 1200, `${info.w}px`);
check("canvas fills viewport height", info.h >= 700, `${info.h}px`);

// The shader actually paints (not a black/empty frame). The backbuffer isn't
// preserved, so sample the composited center pixel from a real screenshot.
const shot = await page.screenshot({ type: "png" });
const { PNG } = await import("pngjs");
const png = PNG.sync.read(shot);
const ci = (png.width * Math.floor(png.height / 2) + Math.floor(png.width / 2)) * 4;
const center = [png.data[ci], png.data[ci + 1], png.data[ci + 2]];
check(
	"shader paints a lit specimen (center pixel not black)",
	center[0] + center[1] + center[2] > 40,
	`rgb(${center.join(",")})`,
);

// ── The four shader props are exposed as faders ────────────────────────────
for (const key of ["complexity", "colorShift", "lightIntensity", "mouseInfluence"]) {
	check(`fader #fader-${key} present`, (await page.locator(`#fader-${key}`).count()) === 1);
}

// ── Specimen catalog (presets) ─────────────────────────────────────────────
const presets = page.locator('nav[aria-label="Specimen catalog"] button');
check("specimen catalog has 4 presets", (await presets.count()) === 4, `${await presets.count()}`);

// ── Telemetry strip reflects live state ────────────────────────────────────
const clockCell = page.getByText("Bench clock").locator("xpath=following-sibling::div");
const clockA = norm(await clockCell.innerText());
check("bench clock formatted HH:MM:SS", /^\d{2}:\d{2}:\d{2}/.test(clockA), clockA);
await page.waitForTimeout(1300);
const clockB = norm(await clockCell.innerText());
check("bench clock advances over time", clockA !== clockB, `${clockA} -> ${clockB}`);

// ── Moving a fader detaches the active preset (props are live) ──────────────
const specimenLabel = page.locator("header .font-display").last();
check(
	'specimen reads a catalog name before tweaking',
	norm(await specimenLabel.innerText()) === "Aurora Quartz",
	norm(await specimenLabel.innerText()),
);
await page.locator("#fader-complexity").evaluate((el) => {
	const setter = Object.getOwnPropertyDescriptor(
		window.HTMLInputElement.prototype,
		"value",
	).set;
	setter.call(el, "7.3");
	el.dispatchEvent(new Event("input", { bubbles: true }));
});
await page.waitForTimeout(150);
check(
	'tweaking a fader switches the specimen to "Custom cut"',
	norm(await specimenLabel.innerText()) === "Custom cut",
	norm(await specimenLabel.innerText()),
);

// ── Fonts vendored locally (no remote Google Fonts) ────────────────────────
const fontReq = [];
page.on("request", (r) => {
	const u = r.url();
	if (u.includes("fonts.gstatic.com") || u.includes("fonts.googleapis.com")) fontReq.push(u);
});
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(400);
check("no remote Google Fonts requests (fonts vendored)", fontReq.length === 0, fontReq.slice(0, 2).join(" | "));

// ── Responsive: hero survives, catalog collapses on mobile ─────────────────
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(400);
check("h1 still visible on mobile", await page.locator("h1").isVisible());
check("faders still present on mobile", (await page.locator("#fader-complexity").count()) === 1);
check(
	"specimen catalog hidden on mobile",
	!(await page.locator('nav[aria-label="Specimen catalog"]').isVisible()),
);

check("no console/page errors", consoleErrors.length === 0, consoleErrors.join(" | ").slice(0, 300));

await browser.close();
console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
