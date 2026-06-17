/* Headless CLI verification for the Gaming Vibe Shader (NENO RIG).
 * Boot a server externally (vite preview / dev) and pass the base URL.
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

// Track remote font requests across the whole session (must stay empty).
const fontRequests = [];
page.on("request", (r) => {
	const u = r.url();
	if (u.includes("fonts.gstatic.com") || u.includes("fonts.googleapis.com")) {
		fontRequests.push(u);
	}
});

await page.goto(BASE_URL, { waitUntil: "networkidle" });
await page.waitForTimeout(1600); // boot reveal + a few shader frames

// ── Title + structure ──────────────────────────────────────────────────────
check("page title", (await page.title()).startsWith("NENO RIG"), await page.title());
check("rig shell present", (await page.locator(".rig").count()) === 1);
check("rig screen present", (await page.locator(".rig-screen").count()) === 1);

// ── Brief's required copy ("Gaming vibe Shader") ────────────────────────────
const heroText = (await page.locator(".rig-title").innerText()).replace(/\s+/g, " ").trim();
check(
	'hero shows the brief text "Gaming vibe Shader"',
	heroText.toLowerCase() === "gaming vibe shader",
	heroText,
);

// ── Shader canvas (WebGL) ───────────────────────────────────────────────────
const canvas = page.locator(".rig-shader canvas");
check("shader canvas exists", (await canvas.count()) === 1);
const canvasInfo = await canvas.first().evaluate((c) => {
	const gl =
		c.getContext("webgl2") || c.getContext("webgl") || c.getContext("experimental-webgl");
	const box = c.getBoundingClientRect();
	return {
		hasGL: !!gl,
		w: box.width,
		h: box.height,
		layerZ: getComputedStyle(c.closest(".rig-shader")).zIndex,
		layerPos: getComputedStyle(c.closest(".rig-shader")).position,
	};
});
check("canvas has a WebGL context", canvasInfo.hasGL);
check("canvas fills viewport width", canvasInfo.w >= 1200, `${canvasInfo.w}px`);
check("canvas fills viewport height", canvasInfo.h >= 700, `${canvasInfo.h}px`);
check(
	"shader layer fixed behind UI (z-index -1)",
	canvasInfo.layerPos === "fixed" && canvasInfo.layerZ === "-1",
	`${canvasInfo.layerPos} / z=${canvasInfo.layerZ}`,
);

// The shader actually paints neon, not black. The backbuffer isn't preserved,
// so sample a real screenshot. Average a band of center pixels and require a
// clear blue/magenta bias (B + R noticeably above G).
const shot = await page.screenshot({ type: "png" });
const { PNG } = await import("pngjs");
const png = PNG.sync.read(shot);
let r = 0,
	g = 0,
	b = 0,
	n = 0;
const cy = Math.floor(png.height / 2);
for (let y = cy - 30; y <= cy + 30; y += 5) {
	for (let x = 80; x < png.width - 80; x += 12) {
		const i = (png.width * y + x) * 4;
		r += png.data[i];
		g += png.data[i + 1];
		b += png.data[i + 2];
		n += 1;
	}
}
r = Math.round(r / n);
g = Math.round(g / n);
b = Math.round(b / n);
check("shader paints non-black pixels", r + g + b > 60, `avg rgb(${r},${g},${b})`);
check(
	"neon ring palette present (blue/magenta bias over green)",
	r + b > g + 14,
	`avg rgb(${r},${g},${b})`,
);

// ── Telemetry HUD reflects live shader state ────────────────────────────────
const clockA = await page.locator(".tcell--clock dd").innerText();
check("session clock formatted MM:SS:CC", /^\d{2}:\d{2}:\d{2}$/.test(clockA), clockA);
await page.waitForTimeout(1200);
const clockB = await page.locator(".tcell--clock dd").innerText();
check("session clock advances over time", clockA !== clockB, `${clockA} -> ${clockB}`);

const fps = await page.locator(".deck-telemetry .tcell").nth(1).locator("dd").innerText();
check("frame rate reported (non-zero)", /\d/.test(fps) && !/^0\s*fps/i.test(fps), fps);

// ── Control deck drives the shader (faders + presets) ───────────────────────
check("four channel faders present", (await page.locator(".fader-input").count()) === 4);
check("three RGB profiles present", (await page.locator(".deck-preset").count()) === 3);

// Rings readout should track the Rings fader. Default profile is Cruise = 07.
const ringsBefore = (await page.locator(".deck-telemetry .tcell").nth(2).locator("dd").innerText()).trim();
check("rings readout starts at 07 (Cruise profile)", ringsBefore === "07", ringsBefore);

// Switch to Overclock — rings should jump to 11 and the active button flips.
await page.getByRole("button", { name: "Overclock" }).click();
await page.waitForTimeout(500);
const ringsAfter = (await page.locator(".deck-telemetry .tcell").nth(2).locator("dd").innerText()).trim();
check("Overclock profile drives rings to 11", ringsAfter === "11", ringsAfter);
check(
	"Overclock preset marked active",
	(await page.getByRole("button", { name: "Overclock" }).getAttribute("aria-pressed")) === "true",
);

// Warp lock readout reacts to pointer movement over the shader.
await page.mouse.move(320, 300);
await page.mouse.move(360, 340);
await page.waitForTimeout(900);
const warpReadout = (await page.locator(".tcell--warp dd").innerText()).trim();
check(
	"warp lock readout responds to pointer (leaves CENTER)",
	warpReadout !== "CENTER" && /-?\d/.test(warpReadout),
	warpReadout,
);

// ── Fonts vendored locally ──────────────────────────────────────────────────
const heroFont = await page.locator(".rig-title").evaluate((el) => getComputedStyle(el).fontFamily);
check("display face is Orbitron", heroFont.includes("Orbitron"), heroFont);
check(
	"no remote Google Fonts requests (fonts vendored)",
	fontRequests.length === 0,
	fontRequests.slice(0, 2).join(" | "),
);

// ── Responsive: faders collapse on mobile ───────────────────────────────────
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(400);
check("hero still visible on mobile", await page.locator(".rig-title").isVisible());
const faderCols = await page
	.locator(".deck-faders")
	.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
check("fader grid collapses to 1 column on mobile", faderCols === 1, `${faderCols} cols`);

check(
	"no console/page errors",
	consoleErrors.length === 0,
	consoleErrors.join(" | ").slice(0, 300),
);

await browser.close();
console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
