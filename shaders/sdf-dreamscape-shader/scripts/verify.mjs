/* Headless CLI verification for SDF Dreamscape.
 * Drives a real Chromium against a running dev/preview server.
 * Usage: node scripts/verify.mjs [baseURL]   (default http://localhost:4173)
 */
import { chromium } from "playwright";

const BASE_URL = process.argv[2] ?? "http://localhost:4173";

let failures = 0;
const check = (name, ok, detail = "") => {
	console.log(
		`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`,
	);
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

// Track remote Google Fonts requests from the very first navigation.
const fontRequests = [];
page.on("request", (r) => {
	const u = r.url();
	if (u.includes("fonts.gstatic.com") || u.includes("fonts.googleapis.com")) {
		fontRequests.push(u);
	}
});

await page.goto(BASE_URL, { waitUntil: "networkidle" });
await page.waitForTimeout(1700); // entrance reveal + a few shader frames

// ── Title + structure ──────────────────────────────────────────────────────
check(
	"page title",
	(await page.title()).startsWith("SDF Dreamscape"),
	await page.title(),
);
check(
	"recorder shell present",
	(await page.locator(".recorder").count()) === 1,
);
check(
	"console overlay present",
	(await page.locator(".console").count()) === 1,
);

// ── Brief copy ──────────────────────────────────────────────────────────────
// The hero is styled uppercase via CSS `text-transform`, so `innerText` reports
// the rendered casing. Read the source markup, turn the `<br>` line break into a
// space, and strip tags to recover the actual authored copy.
const h1 = (await page.locator("h1").innerHTML())
	.replace(/<br\s*\/?>/gi, " ")
	.replace(/<[^>]+>/g, "")
	.replace(/\s+/g, " ")
	.trim();
check('h1 reads "SDF Dreamscape"', h1 === "SDF Dreamscape", h1);

// ── Shader canvas (WebGL) ───────────────────────────────────────────────────
const canvas = page.locator(".dream-stage canvas");
check("shader canvas exists", (await canvas.count()) === 1);
const info = await canvas.first().evaluate((c) => {
	const gl =
		c.getContext("webgl2") ||
		c.getContext("webgl") ||
		c.getContext("experimental-webgl");
	const box = c.getBoundingClientRect();
	return { hasGL: !!gl, w: box.width, h: box.height };
});
check("canvas has a WebGL context", info.hasGL);
check("canvas fills viewport width", info.w >= 1200, `${Math.round(info.w)}px`);
check("canvas fills viewport height", info.h >= 700, `${Math.round(info.h)}px`);

// The shader actually paints something (not a black frame). preserveDrawingBuffer
// is false, so sample the composited frame from a real screenshot.
const shot = await page.screenshot({ type: "png" });
const { PNG } = await import("pngjs");
const png = PNG.sync.read(shot);
const sampleBright = (fx, fy) => {
	const x = Math.floor(png.width * fx);
	const y = Math.floor(png.height * fy);
	const i = (png.width * y + x) * 4;
	return png.data[i] + png.data[i + 1] + png.data[i + 2];
};
// Sample a ring of points around the center to find lit fractal pixels even if
// the dead-center happens to land on a dark fold.
const samples = [
	sampleBright(0.5, 0.5),
	sampleBright(0.42, 0.46),
	sampleBright(0.58, 0.46),
	sampleBright(0.5, 0.38),
	sampleBright(0.46, 0.56),
];
const maxBright = Math.max(...samples);
check(
	"shader renders lit fractal geometry (bright pixels present)",
	maxBright > 180,
	`peak rgb-sum ${maxBright}`,
);

// ── Controls (the four brief uniforms) ──────────────────────────────────────
const ranges = page.locator(".dial-range");
check(
	"four tuning dials present",
	(await ranges.count()) === 4,
	`${await ranges.count()}`,
);
for (const u of ["u_hue", "u_speed", "u_intensity", "u_complexity"]) {
	check(
		`dial wired to ${u}`,
		(await page.getByText(u, { exact: true }).count()) >= 1,
	);
}

// Moving the "Spectrum" (hue) dial repaints the shader: capture before/after.
const hueRange = ranges.nth(0);
const before = await page.screenshot({ type: "png" });
await hueRange.focus();
for (let i = 0; i < 40; i++) await page.keyboard.press("ArrowRight"); // push hue up
await page.waitForTimeout(700);
const after = await page.screenshot({ type: "png" });
const diffPixels = (a, b) => {
	const pa = PNG.sync.read(a);
	const pb = PNG.sync.read(b);
	let diff = 0;
	const step = 4 * 50; // sparse sample
	for (let i = 0; i < pa.data.length && i < pb.data.length; i += step) {
		if (Math.abs(pa.data[i] - pb.data[i]) > 18) diff += 1;
	}
	return diff;
};
check(
	"moving the Spectrum dial repaints the dream (uniform is live)",
	diffPixels(before, after) > 30,
	`${diffPixels(before, after)} changed samples`,
);

// ── Dream-state presets snap all four params ────────────────────────────────
const presets = page.locator(".preset");
check("dream-state presets present", (await presets.count()) === 4);
const lensBefore = await page
	.locator(".tcell")
	.nth(3)
	.locator("dd")
	.innerText();
await presets.filter({ hasText: "REM" }).click();
await page.waitForTimeout(400);
const lensAfter = await page.locator(".tcell").nth(3).locator("dd").innerText();
check(
	"REM preset re-snaps the Lens readout",
	lensBefore !== lensAfter,
	`${lensBefore} -> ${lensAfter}`,
);
check(
	"active preset is highlighted",
	(await page.locator(".preset.is-active").innerText()).trim() === "REM",
);

// ── Telemetry strip reflects live shader state ──────────────────────────────
const clockA = await page.locator(".tcell--clock dd").innerText();
check("dream clock formatted", /^\d{2}:\d{2}:\d{2}$/.test(clockA), clockA);
await page.waitForTimeout(1300);
const clockB = await page.locator(".tcell--clock dd").innerText();
check("dream clock advances", clockA !== clockB, `${clockA} -> ${clockB}`);
const renderCell = await page
	.locator(".tcell")
	.nth(1)
	.locator("dd")
	.innerText();
check("render fps reported (non-zero)", /[1-9]/.test(renderCell), renderCell);

// ── Frame reticle ───────────────────────────────────────────────────────────
check(
	"registration corners present",
	(await page.locator(".frame-corner").count()) === 4,
);

// ── Fonts vendored locally ──────────────────────────────────────────────────
check(
	"no remote Google Fonts requests (fonts vendored)",
	fontRequests.length === 0,
	fontRequests.slice(0, 2).join(" | "),
);
const heroFont = await page
	.locator("h1")
	.evaluate((el) => getComputedStyle(el).fontFamily);
check(
	"display face is Big Shoulders Display",
	heroFont.includes("Big Shoulders"),
	heroFont,
);

// ── Responsive: telemetry collapses on mobile ───────────────────────────────
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(400);
check("h1 still visible on mobile", await page.locator("h1").isVisible());
const cols = await page
	.locator(".telemetry")
	.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
check("telemetry grid collapses (<5 cols) on mobile", cols < 5, `${cols} cols`);

check(
	"no console/page errors",
	consoleErrors.length === 0,
	consoleErrors.join(" | ").slice(0, 300),
);

await browser.close();
console.log(
	failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
