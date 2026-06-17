/* Headless CLI verification for Crystal Synthesis (Voronoi shader).
 * Boots an external server (vite dev/preview); pass the base URL.
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

// Track any remote Google Fonts hits from the very first navigation.
const fontRequests = [];
page.on("request", (r) => {
  const u = r.url();
  if (u.includes("fonts.gstatic.com") || u.includes("fonts.googleapis.com")) {
    fontRequests.push(u);
  }
});

await page.goto(BASE_URL, { waitUntil: "networkidle" });
await page.waitForTimeout(1800); // let entrance reveal + several shader frames run

// ── Title + brief copy ─────────────────────────────────────────────────────
check("page title", (await page.title()).startsWith("Crystal Synthesis"), await page.title());
const h1 = (await page.locator("h1").innerText()).replace(/\s+/g, " ").trim();
check('h1 reads "Crystal Synthesis"', h1 === "Crystal Synthesis", h1);
check(
  '"Calibration Deck" panel present',
  (await page.getByText("Calibration Deck", { exact: true }).count()) === 1,
);

// ── Shader canvas (WebGL) ──────────────────────────────────────────────────
const canvas = page.locator("canvas");
check("shader canvas exists", (await canvas.count()) === 1);
const info = await canvas.first().evaluate((c) => {
  const gl = c.getContext("webgl") || c.getContext("experimental-webgl");
  const box = c.getBoundingClientRect();
  const cs = getComputedStyle(c);
  return { hasGL: !!gl, w: box.width, h: box.height, pos: cs.position };
});
check("canvas has a WebGL context", info.hasGL);
check("canvas fills viewport width", info.w >= 1200, `${info.w}px`);
check("canvas fills viewport height", info.h >= 700, `${info.h}px`);
check("canvas is fixed (full-viewport background)", info.pos === "fixed", info.pos);

// The shader actually paints something — sample a strip of the screenshot and
// confirm there is real colour variance (not a flat/black frame).
const shot = await page.screenshot({ type: "png" });
const { PNG } = await import("pngjs");
const png = PNG.sync.read(shot);
let min = 255,
  max = 0,
  sum = 0,
  n = 0;
// Sample the upper third (clear of the hero text + bottom deck).
for (let y = 40; y < Math.floor(png.height / 3); y += 7) {
  for (let x = 80; x < png.width - 80; x += 11) {
    const i = (png.width * y + x) * 4;
    const lum = 0.2126 * png.data[i] + 0.7152 * png.data[i + 1] + 0.0722 * png.data[i + 2];
    min = Math.min(min, lum);
    max = Math.max(max, lum);
    sum += lum;
    n += 1;
  }
}
const avg = sum / n;
check("shader paints non-trivial pixels (avg luminance > 6)", avg > 6, `avg=${avg.toFixed(1)}`);
check("shader has visible cell contrast (max-min > 30)", max - min > 30, `range=${(max - min).toFixed(1)}`);

// ── Telemetry HUD reads live shader state ──────────────────────────────────
check("spectral cast swatch present", (await page.getByText("Spectral cast").count()) === 1);
const fpsText = await page.getByText(/\bfps\b/).first().innerText();
check("render fps reported (non-zero)", /[1-9]/.test(fpsText), fpsText.trim());
const cellsBefore = await page.getByText(/^≈/).first().innerText();

// ── Faders steer uniforms: bump cell density and confirm telemetry follows ─
const densityFader = page.getByLabel("Cell Density");
await densityFader.focus();
for (let i = 0; i < 30; i += 1) await page.keyboard.press("ArrowRight");
await page.waitForTimeout(400);
const cellsAfter = await page.getByText(/^≈/).first().innerText();
check("cell-density fader updates lattice read-out", cellsBefore !== cellsAfter, `${cellsBefore.trim()} -> ${cellsAfter.trim()}`);

// ── Reset control restores factory calibration ─────────────────────────────
await page.getByRole("button", { name: /reset/i }).click();
await page.waitForTimeout(300);
const densityVal = await page.getByLabel("Cell Density").inputValue();
check("reset restores cell density to 8.0", densityVal === "8" || densityVal === "8.0", densityVal);

// ── Signature: goniometer reticle SVG present ──────────────────────────────
check("goniometer reticle rendered", (await page.locator("main svg").count()) >= 1);
check("caliper corner brackets present", (await page.locator(".specimen-grain > div span[aria-hidden]").count()) >= 4 || (await page.locator("span[aria-hidden]").count()) >= 4);

// ── Fonts vendored locally ─────────────────────────────────────────────────
check(
  "no remote Google Fonts requests (fonts vendored)",
  fontRequests.length === 0,
  fontRequests.slice(0, 2).join(" | "),
);
const heroFont = await page.locator("h1").evaluate((el) => getComputedStyle(el).fontFamily);
check("display face is Fraunces", heroFont.includes("Fraunces"), heroFont);

// ── Responsive: deck stays usable on mobile ────────────────────────────────
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(400);
check("h1 still visible on mobile", await page.locator("h1").isVisible());
check("calibration deck still visible on mobile", await page.getByText("Calibration Deck", { exact: true }).isVisible());

check(
  "no console/page errors",
  consoleErrors.length === 0,
  consoleErrors.join(" | ").slice(0, 300),
);

await browser.close();
console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
