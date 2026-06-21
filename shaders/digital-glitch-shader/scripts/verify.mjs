/* Headless CLI verification for the Digital Glitch CRT shader bench.
 * Boots a server externally (vite preview / dev); pass the base URL.
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
	viewport: { width: 1366, height: 860 },
	deviceScaleFactor: 1,
});

const consoleErrors = [];
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
page.on("pageerror", (e) => consoleErrors.push(String(e)));

// Track any remote font requests up-front (before navigation).
const fontRequests = [];
page.on("request", (r) => {
	const u = r.url();
	if (u.includes("fonts.gstatic.com") || u.includes("fonts.googleapis.com")) {
		fontRequests.push(u);
	}
});

await page.goto(BASE_URL, { waitUntil: "networkidle" });
await page.waitForTimeout(1400); // boot reveal + a few shader frames

// ── Title + brief structure ───────────────────────────────────────────────
check(
	"page title",
	(await page.title()).startsWith("Static Bureau"),
	await page.title(),
);
check("bench container present", (await page.locator(".bench").count()) === 1);
check("console present", (await page.locator(".console").count()) === 1);
check(
	"brand reads STATIC BUREAU",
	(await page.locator(".brand-name").innerText())
		.replace(/\s+/g, " ")
		.trim() === "STATIC BUREAU",
	await page.locator(".brand-name").innerText(),
);

// ── Shader canvas (WebGL) is the full-viewport feed ───────────────────────
const canvas = page.locator(".feed canvas");
check("shader canvas exists", (await canvas.count()) === 1);
const canvasInfo = await canvas.first().evaluate((c) => {
	const gl =
		c.getContext("webgl2") ||
		c.getContext("webgl") ||
		c.getContext("experimental-webgl");
	const box = c.getBoundingClientRect();
	// The canvas's direct parent is the shader's absolute inset-0 mount div;
	// the positioned feed layer is .feed (its grandparent).
	const feed = c.closest(".feed");
	return {
		hasGL: !!gl,
		w: box.width,
		h: box.height,
		parentPos: getComputedStyle(feed).position,
		parentZ: getComputedStyle(feed).zIndex,
	};
});
check("canvas has a WebGL context", canvasInfo.hasGL);
check("canvas fills viewport width", canvasInfo.w >= 1280, `${canvasInfo.w}px`);
check("canvas fills viewport height", canvasInfo.h >= 760, `${canvasInfo.h}px`);
check(
	"feed is fixed behind the console (z-index 0)",
	canvasInfo.parentPos === "fixed" && canvasInfo.parentZ === "0",
	`${canvasInfo.parentPos} / z=${canvasInfo.parentZ}`,
);

// The shader paints a non-empty frame: sample a real screenshot. The CRT pattern
// is a vertical RGB bar field, so most of the frame is lit, not pure black.
const shot = await page.screenshot({ type: "png" });
const { PNG } = await import("pngjs");
const png = PNG.sync.read(shot);
let lit = 0;
const total = png.width * png.height;
for (let i = 0; i < png.data.length; i += 4) {
	if (png.data[i] + png.data[i + 1] + png.data[i + 2] > 120) lit += 1;
}
const litRatio = lit / total;
check(
	"shader renders a lit raster (>12% of pixels lit)",
	litRatio > 0.12,
	`${(litRatio * 100).toFixed(1)}% lit`,
);

// ── All six brief controls present ────────────────────────────────────────
check(
	"carrier-tint colour input present",
	(await page.locator('input[type="color"]').count()) === 1,
);
const faderCount = await page.locator(".fader-input").count();
check("five trim faders present", faderCount === 5, `${faderCount} faders`);

// ── Presets / channels (brief presets + reset) ────────────────────────────
const channelCount = await page.locator(".channel-btn").count();
check(
	"four patch channels present",
	channelCount === 4,
	`${channelCount} channels`,
);
check(
	"reset control present",
	(await page.locator(".reset-btn").count()) === 1,
);

// ── A fader actually changes the shader uniform readout ───────────────────
const tearReadout = page
	.locator(".control--fader")
	.filter({ hasText: "Sync Tear" })
	.locator(".control-readout");
const tearBefore = (await tearReadout.innerText()).trim();
const tearInput = page
	.locator(".control--fader")
	.filter({ hasText: "Sync Tear" })
	.locator(".fader-input");
// Range inputs can't be set via fill(); drive the value through the native
// setter and dispatch an input event so React's controlled onChange fires.
await tearInput.evaluate((el) => {
	const setter = Object.getOwnPropertyDescriptor(
		window.HTMLInputElement.prototype,
		"value",
	).set;
	setter.call(el, "0.9");
	el.dispatchEvent(new Event("input", { bubbles: true }));
});
await page.waitForTimeout(120);
const tearAfter = (await tearReadout.innerText()).trim();
check(
	"moving Sync Tear fader updates its readout",
	tearBefore !== tearAfter && tearAfter.startsWith("0.90"),
	`${tearBefore} -> ${tearAfter}`,
);

// Channel becomes MANUAL after a manual trim.
check(
	"manual trim flips channel to MANUAL",
	(await page.locator(".spec-active").innerText()).includes("MANUAL"),
	await page.locator(".spec-active").innerText(),
);

// ── Patching a preset channel applies its settings ────────────────────────
await page.locator(".channel-btn", { hasText: "Damaged VCR" }).click();
await page.waitForTimeout(150);
check(
	"patching Damaged VCR activates that channel",
	(
		await page
			.locator(".channel-btn", { hasText: "Damaged VCR" })
			.getAttribute("class")
	)?.includes("is-active"),
);
const vcrTear = (await tearReadout.innerText()).trim();
check(
	"Damaged VCR sets Sync Tear to 1.00",
	vcrTear.startsWith("1.00"),
	vcrTear,
);
const vcrHex = (await page.locator(".swatch-hex").innerText()).trim();
check("Damaged VCR sets carrier tint to #FDE047", vcrHex === "#FDE047", vcrHex);

// ── Signal meter reflects degradation ─────────────────────────────────────
const signalVcr = parseInt(
	(await page.locator(".meter-value").innerText()).trim(),
	10,
);
await page.locator(".channel-btn", { hasText: "Subtle Interference" }).click();
await page.waitForTimeout(150);
const signalSubtle = parseInt(
	(await page.locator(".meter-value").innerText()).trim(),
	10,
);
check(
	"signal meter reads stronger on a cleaner channel",
	signalSubtle > signalVcr,
	`VCR ${signalVcr}% < Subtle ${signalSubtle}%`,
);

// ── Live SMPTE timecode advances (signature element) ──────────────────────
const tcA = await page.locator(".tc").innerText();
check("SMPTE timecode formatted", /^\d{2}:\d{2}:\d{2}:\d{2}$/.test(tcA), tcA);
await page.waitForTimeout(900);
const tcB = await page.locator(".tc").innerText();
check("SMPTE timecode advances over time", tcA !== tcB, `${tcA} -> ${tcB}`);

// Refresh FPS reported non-zero.
const fps = (
	await page.locator(".tele-cell").first().locator("dd").innerText()
).trim();
check("refresh fps reported (non-zero)", /[1-9]/.test(fps), fps);

// ── Reset returns to bench default ────────────────────────────────────────
await page.locator(".reset-btn").click();
await page.waitForTimeout(150);
check(
	"reset returns carrier tint to #FFFFFF",
	(await page.locator(".swatch-hex").innerText()).trim() === "#FFFFFF",
	await page.locator(".swatch-hex").innerText(),
);
check(
	"reset re-activates CH-00 Bench Default",
	(
		await page
			.locator(".channel-btn", { hasText: "Bench Default" })
			.getAttribute("class")
	)?.includes("is-active"),
);

// ── Fonts vendored locally ────────────────────────────────────────────────
check(
	"no remote Google Fonts requests (fonts vendored)",
	fontRequests.length === 0,
	fontRequests.slice(0, 2).join(" | "),
);
const headFont = await page
	.locator(".headline")
	.evaluate((el) => getComputedStyle(el).fontFamily);
check("display face is Archivo", headFont.includes("Archivo"), headFont);

// ── Responsive: rack stacks under the spine on mobile ─────────────────────
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(400);
check(
	"headline still visible on mobile",
	await page.locator(".headline").isVisible(),
);
const bodyCols = await page
	.locator(".body")
	.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
check(
	"body collapses to one column on mobile",
	bodyCols === 1,
	`${bodyCols} cols`,
);

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
