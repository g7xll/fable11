/* Headless CLI verification for Liquid Crystal — Polarized-Light Shader Bench.
 * Boots a `vite preview`-style server externally; pass the base URL.
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

const fontRequests = [];
page.on("request", (r) => {
	const u = r.url();
	if (u.includes("fonts.gstatic.com") || u.includes("fonts.googleapis.com")) {
		fontRequests.push(u);
	}
});

await page.goto(BASE_URL, { waitUntil: "networkidle" });
await page.waitForTimeout(1600); // let the entrance reveal + a few shader frames run

// ── Title ──────────────────────────────────────────────────────────────────
check(
	"page title",
	(await page.title()).startsWith("Liquid Crystal"),
	await page.title(),
);

// ── Shader canvas (raw WebGL, full-bleed quad) ──────────────────────────────
const canvas = page.locator("canvas");
check("shader canvas exists", (await canvas.count()) === 1);
const canvasInfo = await canvas.first().evaluate((c) => {
	const gl = c.getContext("webgl") || c.getContext("experimental-webgl");
	const box = c.getBoundingClientRect();
	return { hasGL: !!gl, w: box.width, h: box.height };
});
check("canvas has a WebGL context", canvasInfo.hasGL);
check("canvas fills viewport width", canvasInfo.w >= 1200, `${canvasInfo.w}px`);
check("canvas fills viewport height", canvasInfo.h >= 700, `${canvasInfo.h}px`);

// The shader actually paints lit interference bands (not a black frame). The
// WebGL backbuffer isn't preserved, so sample the composited result from a real
// screenshot, in a strip that clears the top-left ControlsPanel, the top-right
// instrument rail, and the centred reticle. Scan a row of points and require
// the brightest to be clearly lit.
const shot = await page.screenshot({ type: "png" });
const { PNG } = await import("pngjs");
const png = PNG.sync.read(shot);
let maxSum = 0;
const y = Math.floor(png.height * 0.7);
for (let fx = 0.3; fx <= 0.7; fx += 0.02) {
	const x = Math.floor(png.width * fx);
	const i = (png.width * y + x) * 4;
	maxSum = Math.max(maxSum, png.data[i] + png.data[i + 1] + png.data[i + 2]);
}
check(
	"shader renders lit bands (a bright pixel in the open field)",
	maxSum > 120,
	`max rgb sum ${maxSum}`,
);

// ── ControlsPanel — the prompt's six controlled uniforms ───────────────────
const keys = ["hue", "speed", "noise", "warp", "zoom", "brightness"];
for (const k of keys) {
	const input = page.locator(`input#${k}[type="range"]`);
	check(`control "${k}" slider present`, (await input.count()) === 1);
}
check(
	'ControlsPanel heading reads "Liquid Crystal"',
	(await page.locator("h1", { hasText: "Liquid Crystal" }).count()) >= 1,
);

// Driving a slider updates its label (controlled input round-trips through React).
await page.locator("input#hue").fill("300");
await page.waitForTimeout(150);
check(
	"hue slider drives its label",
	(await page.locator('label[for="hue"]').innerText()).includes("300"),
	(await page.locator('label[for="hue"]').innerText()).trim(),
);

// ── Live telemetry (instrument rail reads shader state per frame) ───────────
const rail = page.locator("aside");
check("instrument rail visible at desktop width", await rail.isVisible());
const railA = (await rail.innerText()).replace(/\s+/g, " ");
check("telemetry reports a frame rate", /fps/i.test(railA));
await page.waitForTimeout(1300);
const railB = (await rail.innerText()).replace(/\s+/g, " ");
check("telemetry uptime advances over time", railA !== railB);

// ── Integration docket (the shadcn integration story) ──────────────────────
const docketBtn = page.getByRole("button", {
	name: /Integration · @\/components\/ui\/liquid-crystal/,
});
check("integration docket toggle present", (await docketBtn.count()) === 1);
await docketBtn.click();
await page.waitForTimeout(250);
check(
	"docket opens to reveal usage snippet",
	(await docketBtn.getAttribute("aria-expanded")) === "true" &&
		(await page.getByText("InteractiveShader").count()) > 0,
);

// ── Fonts vendored locally (no remote Google Fonts) ────────────────────────
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(400);
check(
	"no remote Google Fonts requests (fonts vendored)",
	fontRequests.length === 0,
	fontRequests.slice(0, 2).join(" | "),
);

// ── Responsive — the desktop rail collapses on mobile ──────────────────────
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(400);
check("instrument rail hidden on mobile", !(await rail.isVisible()));
check(
	"ControlsPanel still present on mobile",
	(await page.locator("input#hue").count()) === 1,
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
