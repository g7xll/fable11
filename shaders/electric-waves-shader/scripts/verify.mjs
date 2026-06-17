/**
 * CLI verification for ARCWAVE — the Electric Waves Shader integration.
 * Run: node scripts/verify.mjs   (expects `vite preview` on http://localhost:4173)
 *
 * Drives a headless Chromium (GPU swiftshader fallback) and checks:
 *  - no uncaught page errors / shader compile or link errors
 *  - the Three.js canvas exists, fills the viewport, has a sized drawing buffer
 *  - the canvas actually paints non-black, colorful pixels (the electric field)
 *  - the field is live: two frames ~0.6s apart differ
 *  - the prompt's five-slider control deck is present and wired (readout updates)
 *  - the telemetry HUD ticks (uptime advances frame to frame)
 *  - single non-scrolling viewport, no remote font requests (fonts are system)
 *  - mobile viewport: no errors, canvas present, no horizontal scroll
 */
import { chromium } from "playwright";

const BASE_URL = process.env.VERIFY_URL ?? "http://localhost:4173";
let failures = 0;

function check(name, condition, detail = "") {
  const ok = Boolean(condition);
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok || !detail ? "" : ` — ${detail}`}`);
  return ok;
}

const browser = await chromium.launch({
  // Honor a provisioned browser binary when set (CI / sandboxes); otherwise use
  // Playwright's own managed Chromium.
  executablePath: process.env.PW_EXECUTABLE_PATH || undefined,
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
await page.waitForTimeout(1500); // let the rAF loop warm up and the HUD tick

check("No uncaught page errors", pageErrors.length === 0, pageErrors.join("; "));
check(
  "No WebGL shader compile/link errors",
  !consoleErrors.some((e) => /shader|program|webgl|gl_/i.test(e)),
  consoleErrors.join("; "),
);

// ── Canvas present & full-window ───────────────────────────────────────────
const canvas = page.locator(
  'div[aria-label="Interactive electric waves background"] canvas',
);
check("Shader canvas present", (await canvas.count()) === 1);
check(
  "Canvas fills the viewport",
  await canvas.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return r.width >= window.innerWidth - 1 && r.height >= window.innerHeight - 1;
  }),
);
check(
  "Drawing buffer is sized (DPR-aware)",
  await canvas.evaluate((el) => el.width > 0 && el.height > 0),
);

// ── Canvas actually paints color (not a black void) ────────────────────────
// preserveDrawingBuffer is false (perf default), so we screenshot the composited
// page and decode that PNG inside the browser — measuring what's truly on screen.
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
    for (let i = 0; i < d.length; i += 4) {
      lum += d[i] + d[i + 1] + d[i + 2];
      maxChan = Math.max(maxChan, d[i], d[i + 1], d[i + 2]);
    }
    return { lum, maxChan, px: d.length / 4 };
  }, `data:image/png;base64,${b64}`);
}

// Sample a center-right region — away from the left hero lockup and the
// bottom-center control deck, so we're reading the raw shader field.
const region = { x: 760, y: 250, width: 560, height: 400 };
const paint = await sampleScreen(region);
check(
  "Canvas renders non-black, colorful pixels",
  paint.lum > 0 && paint.maxChan > 25,
  JSON.stringify(paint),
);

// ── Field is live (animation loop runs) ────────────────────────────────────
const f1 = await sampleScreen(region);
await page.waitForTimeout(650);
const f2 = await sampleScreen(region);
check("Electric field animates (frames differ)", f1.lum !== f2.lum, `${f1.lum} -> ${f2.lum}`);

// ── The prompt's five-slider control deck ──────────────────────────────────
const sliders = page.locator('input[type="range"]');
check("Five shader controls present", (await sliders.count()) === 5, `${await sliders.count()}`);

const waveValue = page
  .locator("span", { hasText: /^Wave Count$/ })
  .locator("xpath=following-sibling::span[1]");
const beforeVal = (await waveValue.count()) ? (await waveValue.first().textContent())?.trim() : "";
await sliders.first().fill("12");
await page.waitForTimeout(150);
const afterVal = (await waveValue.count()) ? (await waveValue.first().textContent())?.trim() : "";
check(
  "Wave Count slider drives the readout (control is wired)",
  beforeVal !== "" && beforeVal !== afterVal,
  `${beforeVal} -> ${afterVal}`,
);

// ── Telemetry HUD ticks (the signature element) ────────────────────────────
const hudText = (key) =>
  page.evaluate((k) => {
    const dt = [...document.querySelectorAll("dt")].find(
      (n) => n.textContent.trim() === k,
    );
    return dt ? dt.nextElementSibling.textContent.trim() : "";
  }, key);
check("Telemetry FPS readout present", (await hudText("fps")) !== "");
const u1 = await hudText("uptime");
await page.waitForTimeout(700);
const u2 = await hudText("uptime");
check("Telemetry uptime advances", u1 !== "" && u1 !== u2, `${u1} -> ${u2}`);

// ── No-scroll single viewport ──────────────────────────────────────────────
check(
  "Page does not scroll (single viewport)",
  await page.evaluate(() => document.body.scrollHeight <= window.innerHeight + 1),
);

// ── Fonts self-hosted (no fonts.googleapis / gstatic requests) ─────────────
const remoteFontReqs = [];
page.on("request", (r) => {
  if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) remoteFontReqs.push(r.url());
});
await page.reload({ waitUntil: "networkidle" });
check(
  "No remote font requests (system fonts)",
  remoteFontReqs.length === 0,
  remoteFontReqs.join("; "),
);

// ── Mobile viewport sanity ─────────────────────────────────────────────────
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
const mobileErrors = [];
mobile.on("pageerror", (e) => mobileErrors.push(e.message));
await mobile.goto(BASE_URL, { waitUntil: "networkidle" });
await mobile.waitForTimeout(800);
check("Mobile: no page errors", mobileErrors.length === 0, mobileErrors.join("; "));
check(
  "Mobile: canvas present",
  (await mobile
    .locator('div[aria-label="Interactive electric waves background"] canvas')
    .count()) === 1,
);
check(
  "Mobile: no horizontal scroll",
  await mobile.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1,
  ),
);

await browser.close();

console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);
