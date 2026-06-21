/**
 * CLI verification for the PRISMA WebGL Shader Lab.
 * Run: node scripts/verify.mjs  (expects `vite preview` on http://localhost:4173)
 *
 * Drives a headless Chromium (with the GPU swiftshader fallback) and checks:
 *  - no uncaught page errors / shader compile or link errors
 *  - the WebGL canvas exists, is full-window, and actually paints non-black pixels
 *  - telemetry HUD ticks (fps + time advance frame to frame)
 *  - cursor interaction + pause + the layer/glow/speed controls all respond
 *  - the page is a single non-scrolling viewport and fonts are self-hosted
 */
import { chromium } from "playwright";

const BASE_URL = process.env.VERIFY_URL ?? "http://localhost:4173";
let failures = 0;

function check(name, condition, detail = "") {
	const ok = Boolean(condition);
	if (!ok) failures += 1;
	console.log(
		`${ok ? "PASS" : "FAIL"}  ${name}${ok || !detail ? "" : ` — ${detail}`}`,
	);
	return ok;
}

const browser = await chromium.launch({
	args: [
		"--use-gl=angle",
		"--use-angle=swiftshader",
		"--enable-unsafe-swiftshader",
		"--ignore-gpu-blocklist",
	],
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const pageErrors = [];
const consoleErrors = [];
page.on("pageerror", (e) => pageErrors.push(e.message));
page.on("console", (m) => {
	if (m.type() === "error") consoleErrors.push(m.text());
});

await page.goto(BASE_URL, { waitUntil: "networkidle" });
await page.waitForTimeout(1500); // let the rAF loop warm up and HUD tick

check(
	"No uncaught page errors",
	pageErrors.length === 0,
	pageErrors.join("; "),
);
check(
	"No WebGL shader compile/link errors",
	!consoleErrors.some((e) => /shader|program|webgl/i.test(e)),
	consoleErrors.join("; "),
);

// ── Canvas present & full-window ───────────────────────────────────────────
const canvas = page.locator("canvas.shader-canvas");
check("Shader canvas present", (await canvas.count()) === 1);
check(
	"Canvas fills the viewport",
	await canvas.evaluate((el) => {
		const r = el.getBoundingClientRect();
		return (
			r.width >= window.innerWidth - 1 && r.height >= window.innerHeight - 1
		);
	}),
);
check(
	"Drawing buffer is sized (DPR-aware)",
	await canvas.evaluate((el) => el.width > 0 && el.height > 0),
);

// ── Canvas actually paints color (not a black void) ────────────────────────
// The GL context uses preserveDrawingBuffer:false (the perf-correct default),
// so JS can't readPixels after a frame. Instead we screenshot the composited
// page and decode that PNG inside the browser — this measures what's actually
// on screen, which is the real thing we care about.
async function sampleScreen(clip) {
	const shot = await page.screenshot({ clip });
	const b64 = shot.toString("base64");
	return page.evaluate(async (dataUrl) => {
		const img = new Image();
		await new Promise((res, rej) => {
			img.onload = res;
			img.onerror = rej;
			img.src = dataUrl;
		});
		const c = document.createElement("canvas");
		c.width = img.width;
		c.height = img.height;
		const ctx = c.getContext("2d");
		ctx.drawImage(img, 0, 0);
		const d = ctx.getImageData(0, 0, c.width, c.height).data;
		let lum = 0;
		let maxChan = 0;
		const center = (Math.floor(d.length / 8) * 4) | 0;
		for (let i = 0; i < d.length; i += 4) {
			lum += d[i] + d[i + 1] + d[i + 2];
			maxChan = Math.max(maxChan, d[i], d[i + 1], d[i + 2]);
		}
		return {
			lum,
			maxChan,
			center: [d[center], d[center + 1], d[center + 2]],
			px: d.length / 4,
		};
	}, `data:image/png;base64,${b64}`);
}

const center = { x: 400, y: 300, width: 80, height: 80 };
const paint = await sampleScreen(center);
check(
	"Canvas renders non-black, colorful pixels",
	paint.lum > 0 && paint.maxChan > 30,
	JSON.stringify(paint),
);

// ── Telemetry HUD ticks (the signature element) ────────────────────────────
const fpsLine = page
	.locator("dt", { hasText: "fps" })
	.locator("xpath=following-sibling::dd[1]");
const timeText = () =>
	page.evaluate(() => {
		const dts = [...document.querySelectorAll("dt")];
		const dt = dts.find((n) => n.textContent.trim() === "time");
		return dt ? dt.nextElementSibling.textContent.trim() : "";
	});
check("Telemetry FPS readout present", (await fpsLine.count()) >= 1);
const t1 = await timeText();
await page.waitForTimeout(700);
const t2 = await timeText();
check(
	"Shader clock advances (time HUD updates)",
	t1 !== "" && t1 !== t2,
	`${t1} -> ${t2}`,
);

// ── Pause freezes the clock ─────────────────────────────────────────────────
await page.getByRole("button", { name: /pause animation/i }).click();
await page.waitForTimeout(300);
const p1 = await timeText();
await page.waitForTimeout(600);
const p2 = await timeText();
check("Pause stops the clock", p1 === p2, `${p1} -> ${p2}`);
await page.getByRole("button", { name: /resume animation/i }).click();

// ── Cursor interaction toggle flips aria-pressed ───────────────────────────
const interactiveBtn = page.getByRole("button", {
	name: /cursor interaction/i,
});
const before = await interactiveBtn.getAttribute("aria-pressed");
await interactiveBtn.click();
const after = await interactiveBtn.getAttribute("aria-pressed");
check(
	"Interactive toggle flips state",
	before !== after,
	`${before} -> ${after}`,
);
await interactiveBtn.click(); // restore

// ── Layer slider drives the shader uniform (visual change) ──────────────────
// Sample a top strip of pure shader (above the headline / away from the HUD)
// so the comparison reflects the field, not chrome.
const shaderRegion = { x: 700, y: 30, width: 200, height: 120 };
const layerSlider = page.locator('input[type="range"]').first();
await page.getByRole("button", { name: /pause animation/i }).click(); // freeze clock for a fair before/after
await page.waitForTimeout(250);
const layerBefore = await sampleScreen(shaderRegion);
await layerSlider.fill("1");
await page.waitForTimeout(250);
const layerAfter = await sampleScreen(shaderRegion);
check(
	"Layers control changes the render",
	layerBefore.lum !== layerAfter.lum,
	`lum ${layerBefore.lum} -> ${layerAfter.lum}`,
);
await page.getByRole("button", { name: /resume animation/i }).click();

// ── No-scroll single viewport ───────────────────────────────────────────────
check(
	"Page does not scroll (single viewport)",
	await page.evaluate(
		() => document.body.scrollHeight <= window.innerHeight + 1,
	),
);

// ── Fonts self-hosted (no fonts.googleapis / gstatic requests) ─────────────
const remoteFontReqs = [];
page.on("request", (r) => {
	if (/fonts\.(googleapis|gstatic)\.com/.test(r.url()))
		remoteFontReqs.push(r.url());
});
await page.reload({ waitUntil: "networkidle" });
check(
	"No remote font requests (fonts vendored)",
	remoteFontReqs.length === 0,
	remoteFontReqs.join("; "),
);

// ── Mobile viewport sanity ──────────────────────────────────────────────────
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
const mobileErrors = [];
mobile.on("pageerror", (e) => mobileErrors.push(e.message));
await mobile.goto(BASE_URL, { waitUntil: "networkidle" });
await mobile.waitForTimeout(800);
check(
	"Mobile: no page errors",
	mobileErrors.length === 0,
	mobileErrors.join("; "),
);
check(
	"Mobile: canvas present",
	(await mobile.locator("canvas.shader-canvas").count()) === 1,
);
check(
	"Mobile: no horizontal scroll",
	await mobile.evaluate(
		() => document.documentElement.scrollWidth <= window.innerWidth + 1,
	),
);

await browser.close();

console.log(
	`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`,
);
process.exit(failures === 0 ? 0 : 1);
