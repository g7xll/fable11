/* Headless CLI verification for the Celestial Sphere shader integration.
 * Drive an already-running server (vite preview / dev). Pass the base URL.
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

// Catch any remote Google Fonts requests across the whole run.
const fontRequests = [];
page.on("request", (r) => {
	const u = r.url();
	if (u.includes("fonts.gstatic.com") || u.includes("fonts.googleapis.com")) {
		fontRequests.push(u);
	}
});

await page.goto(BASE_URL, { waitUntil: "networkidle" });
await page.waitForTimeout(1600); // entrance reveal + a few shader frames

// ── Title + structure ──────────────────────────────────────────────────────
check(
	"page title",
	(await page.title()).startsWith("Celestial Sphere"),
	await page.title(),
);
check(
	"app-container present",
	(await page.locator(".app-container").count()) === 1,
);
check("console present", (await page.locator(".console").count()) === 1);

// ── Required brief copy (verbatim) ──────────────────────────────────────────
check(
	'h1 reads "Celestial Sphere"',
	(await page.locator("h1").innerText()).trim() === "Celestial Sphere",
	(await page.locator("h1").innerText()).trim(),
);
check(
	'lede reads "An interactive WebGL shader component for React."',
	(await page
		.getByText("An interactive WebGL shader component for React.", {
			exact: true,
		})
		.count()) === 1,
);

// ── Shader canvas (WebGL) ───────────────────────────────────────────────────
const canvas = page.locator(".sphere-layer canvas");
check("shader canvas exists", (await canvas.count()) === 1);
const canvasInfo = await canvas.first().evaluate((c) => {
	const gl =
		c.getContext("webgl2") ||
		c.getContext("webgl") ||
		c.getContext("experimental-webgl");
	const box = c.getBoundingClientRect();
	return { hasGL: !!gl, w: box.width, h: box.height };
});
check("canvas has a WebGL context", canvasInfo.hasGL);
check("canvas fills viewport width", canvasInfo.w >= 1200, `${canvasInfo.w}px`);
check("canvas fills viewport height", canvasInfo.h >= 700, `${canvasInfo.h}px`);

// The shader actually paints a lit nebula (not a black/empty frame). Sample a
// composited pixel from a real screenshot — the backbuffer isn't preserved, so
// read what the browser shows rather than an undefined GL readback. The nebula
// brightens away from dead-center, so scan for the brightest sampled point.
const shot = await page.screenshot({ type: "png" });
const { PNG } = await import("pngjs");
const png = PNG.sync.read(shot);
let maxLum = 0;
for (let y = 40; y < png.height - 40; y += 9) {
	for (let x = 40; x < png.width - 40; x += 9) {
		const i = (png.width * y + x) * 4;
		const lum = png.data[i] + png.data[i + 1] + png.data[i + 2];
		if (lum > maxLum) maxLum = lum;
	}
}
check(
	"shader renders a lit nebula (bright pixels present)",
	maxLum > 220,
	`max rgb-sum ${maxLum}`,
);

// ── Live telemetry advances over time ───────────────────────────────────────
const clockA = await page.locator(".telemetry-cell--clock dd").innerText();
check(
	"feed clock formatted",
	/^T\+\d{2}:\d{2}\.\d$/.test(clockA.trim()),
	clockA,
);
await page.waitForTimeout(1300);
const clockB = await page.locator(".telemetry-cell--clock dd").innerText();
check(
	"feed clock advances over time",
	clockA !== clockB,
	`${clockA} -> ${clockB}`,
);

const fps = await page
	.locator(".telemetry-cell")
	.nth(1)
	.locator("dd")
	.innerText();
check("render fps reported (non-zero)", /[1-9]/.test(fps), fps);

const warp = await page.locator(".telemetry-cell--warp dd").innerText();
check(
	"warp readout present (signed x/y)",
	/[+−]\d\.\d{3}[\s\S]*[+−]\d\.\d{3}/.test(warp),
	warp.replace(/\s+/g, " ").trim(),
);

// ── Mouse warp moves the field (warp readout responds to pointer) ───────────
await page.mouse.move(120, 140);
await page.waitForTimeout(350);
const warpAfter = await page.locator(".telemetry-cell--warp dd").innerText();
check(
	"warp readout responds to cursor",
	warpAfter !== warp,
	`${warp} -> ${warpAfter}`,
);

// ── Faders drive the live uniform (hue readout follows the slider) ──────────
const hueBefore = await page
	.locator(".telemetry-cell")
	.nth(3)
	.locator("dd")
	.innerText();
await page.locator("#hue").focus();
for (let i = 0; i < 30; i++) await page.keyboard.press("ArrowLeft");
await page.waitForTimeout(350);
const hueAfter = await page
	.locator(".telemetry-cell")
	.nth(3)
	.locator("dd")
	.innerText();
check(
	"hue fader drives the live shader uniform",
	hueBefore !== hueAfter,
	`${hueBefore} -> ${hueAfter}`,
);

// ── Reset returns to the brief defaults ─────────────────────────────────────
await page.getByText("Reset to brief", { exact: true }).click();
await page.waitForTimeout(300);
const hueReset = (
	await page.locator(".telemetry-cell").nth(3).locator("dd").innerText()
)
	.replace(/\s+/g, "")
	.trim();
check("reset restores brief hue (210°)", hueReset === "210°", hueReset);

// ── Fonts vendored locally ──────────────────────────────────────────────────
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(500);
check(
	"no remote Google Fonts requests (fonts vendored)",
	fontRequests.length === 0,
	fontRequests.slice(0, 2).join(" | "),
);
const heroFont = await page
	.locator("h1")
	.evaluate((el) => getComputedStyle(el).fontFamily);
check(
	"display face is Space Grotesk",
	heroFont.includes("Space Grotesk"),
	heroFont,
);

// ── Responsive: deck collapses + reticle hidden on mobile ───────────────────
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(400);
check("h1 still visible on mobile", await page.locator("h1").isVisible());
const deckCols = await page
	.locator(".deck")
	.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
check(
	"deck collapses to one column on mobile",
	deckCols === 1,
	`${deckCols} col(s)`,
);
const reticleHidden = await page
	.locator(".cursor-reticle")
	.evaluate((el) => getComputedStyle(el).display === "none");
check("cursor reticle hidden on mobile", reticleHidden);

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
