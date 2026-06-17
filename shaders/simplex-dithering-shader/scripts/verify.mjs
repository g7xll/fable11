/**
 * CLI verification for the Simplex Dithering Shader bench.
 * Run: node scripts/verify.mjs   (expects a server on $VERIFY_URL or :4173)
 *
 * Drives a headless Chromium (GPU swiftshader fallback) and asserts:
 *  - no uncaught page errors / no shader compile or link errors in the console
 *  - the WebGL2 canvas exists, fills the viewport, and has a sized drawing buffer
 *  - the canvas actually paints non-black, colorful (amber/oxblood) pixels —
 *    checked both by readPixels off the live GL context and by a screenshot
 *  - the brief's centered "Simplex" lockup is present
 *  - the telemetry HUD ticks (fps + shader clock advance frame to frame)
 *  - Pause freezes the clock; Reset-to-brief restores the preset
 *  - swapping the dither Matrix and the Field changes the rendered pixels
 *  - the page is a single non-scrolling viewport; fonts are self-hosted
 *  - mobile viewport renders without errors or horizontal scroll
 *
 * Browser resolution: prefer a binary under PLAYWRIGHT_BROWSERS_PATH /
 * /opt/pw-browsers (pre-installed in CI), else Playwright's managed Chromium.
 */
import { chromium } from "playwright";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

const BASE_URL = process.env.VERIFY_URL ?? "http://localhost:4173";
let failures = 0;

function check(name, condition, detail = "") {
  const ok = Boolean(condition);
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok || !detail ? "" : ` — ${detail}`}`);
  return ok;
}

function resolveChromium() {
  const roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, "/opt/pw-browsers"].filter(Boolean);
  for (const root of roots) {
    if (!existsSync(root)) continue;
    let entries = [];
    try {
      entries = readdirSync(root);
    } catch {
      continue;
    }
    const dirs = entries
      .filter((e) => e.startsWith("chromium-") && !e.includes("headless"))
      .sort();
    for (const d of dirs) {
      const exe = path.join(root, d, "chrome-linux", "chrome");
      if (existsSync(exe)) return exe;
    }
  }
  return undefined; // fall back to Playwright's managed download
}

const executablePath = resolveChromium();
const browser = await chromium.launch({
  ...(executablePath ? { executablePath } : {}),
  args: [
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist",
    "--no-sandbox",
  ],
});
console.log(`# chromium: ${executablePath ?? "playwright-managed"}`);

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const pageErrors = [];
const consoleErrors = [];
page.on("pageerror", (e) => pageErrors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text());
});

await page.goto(BASE_URL, { waitUntil: "networkidle" });
await page.waitForTimeout(1600); // let the rAF loop warm up and the HUD tick

check("No uncaught page errors", pageErrors.length === 0, pageErrors.join("; "));
check(
  "No WebGL shader compile/link errors",
  !consoleErrors.some((e) => /shader|program|webgl|compil|link/i.test(e)),
  consoleErrors.join("; "),
);

// ── Canvas present, full-window, sized ──────────────────────────────────────
const canvas = page.locator("canvas");
check("WebGL canvas present", (await canvas.count()) >= 1);
check(
  "Canvas fills the viewport",
  await canvas.first().evaluate((el) => {
    const r = el.getBoundingClientRect();
    return r.width >= window.innerWidth - 2 && r.height >= window.innerHeight - 2;
  }),
);
const buf = await canvas.first().evaluate((el) => ({ w: el.width, h: el.height }));
check("Drawing buffer is sized (DPR-aware)", buf.w > 0 && buf.h > 0, JSON.stringify(buf));

// ── Canvas is a live WebGL2 context that paints non-black pixels ────────────
// preserveDrawingBuffer:true lets us readPixels directly off the context.
const glSample = await canvas.first().evaluate((el) => {
  const gl = el.getContext("webgl2");
  if (!gl) return { ok: false, reason: "no webgl2 context" };
  const w = el.width;
  const h = el.height;
  const px = new Uint8Array(4 * w * h);
  gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
  let lum = 0;
  let maxChan = 0;
  let nonBlack = 0;
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  const n = w * h;
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];
    lum += r + g + b;
    maxChan = Math.max(maxChan, r, g, b);
    if (r + g + b > 24) nonBlack += 1;
    rSum += r;
    gSum += g;
    bSum += b;
  }
  return {
    ok: true,
    maxChan,
    nonBlackFrac: nonBlack / n,
    avg: [Math.round(rSum / n), Math.round(gSum / n), Math.round(bSum / n)],
  };
});
check("Canvas exposes a live WebGL2 context", glSample.ok, glSample.reason || "");
check(
  "Canvas paints non-black pixels (readPixels)",
  glSample.ok && glSample.maxChan > 40 && glSample.nonBlackFrac > 0.02,
  JSON.stringify(glSample),
);
// The brief's palette is amber ink on oxblood: red channel should dominate blue.
check(
  "Render shows the brief's amber-on-oxblood palette",
  glSample.ok && glSample.avg[0] >= glSample.avg[2],
  `avg rgb ${JSON.stringify(glSample.avg)}`,
);

// Screenshot cross-check of what's actually composited on screen.
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
const screen = await sampleScreen({ x: 600, y: 180, width: 240, height: 240 });
check(
  "Composited frame is non-black & colorful (screenshot)",
  screen.lum > 0 && screen.maxChan > 60,
  JSON.stringify(screen),
);

// ── The brief's centered lockup ─────────────────────────────────────────────
const lockup = page.getByText("Simplex", { exact: true });
check("Centered 'Simplex' lockup present", (await lockup.count()) >= 1);

// ── Telemetry HUD ticks ─────────────────────────────────────────────────────
const timeText = () =>
  page.evaluate(() => {
    const labels = [...document.querySelectorAll("span")].filter(
      (n) => n.textContent.trim() === "time",
    );
    if (!labels.length) return "";
    const val = labels[0].nextElementSibling;
    return val ? val.textContent.trim() : "";
  });
const fpsPresent = await page.evaluate(
  () =>
    [...document.querySelectorAll("span")].some((n) => n.textContent.trim() === "fps"),
);
check("Telemetry FPS readout present", fpsPresent);
const t1 = await timeText();
await page.waitForTimeout(800);
const t2 = await timeText();
check("Shader clock advances (time HUD updates)", t1 !== "" && t1 !== t2, `${t1} -> ${t2}`);

// ── Pause freezes the clock ─────────────────────────────────────────────────
await page.getByRole("button", { name: /pause animation/i }).click();
await page.waitForTimeout(300);
const p1 = await timeText();
await page.waitForTimeout(650);
const p2 = await timeText();
check("Pause freezes the clock", p1 === p2 && p1 !== "", `${p1} -> ${p2}`);

// ── Matrix swap changes the rendered pixels (clock frozen for a fair diff) ──
const fieldRegion = { x: 980, y: 220, width: 220, height: 160 };
const beforeMatrix = await sampleScreen(fieldRegion);
await page.getByRole("button", { name: "8×8", exact: true }).click();
await page.waitForTimeout(350);
const afterMatrix = await sampleScreen(fieldRegion);
check(
  "Matrix swap changes the render",
  beforeMatrix.lum !== afterMatrix.lum,
  `lum ${beforeMatrix.lum} -> ${afterMatrix.lum}`,
);

// ── Field swap changes the rendered pixels ──────────────────────────────────
const beforeField = await sampleScreen(fieldRegion);
await page.getByRole("button", { name: "swirl", exact: true }).click();
await page.waitForTimeout(350);
const afterField = await sampleScreen(fieldRegion);
check(
  "Field swap changes the render",
  beforeField.lum !== afterField.lum,
  `lum ${beforeField.lum} -> ${afterField.lum}`,
);

// ── Reset-to-brief restores the preset (the active chip shows 2×2 & ripple) ─
await page.getByRole("button", { name: /reset to the brief preset/i }).click();
await page.waitForTimeout(200);
const briefRestored = await page.evaluate(() => {
  const pressed = [...document.querySelectorAll('button[aria-pressed="true"]')].map((b) =>
    b.textContent.trim(),
  );
  return pressed.includes("ripple") && pressed.includes("2×2");
});
check("Reset-to-brief restores ripple + 2×2", briefRestored);
// Reset-to-brief already un-pauses; only click resume if still paused.
const resumeBtn = page.getByRole("button", { name: /resume animation/i });
if (await resumeBtn.count()) await resumeBtn.click();

// ── No-scroll single viewport ───────────────────────────────────────────────
check(
  "Page does not scroll (single viewport)",
  await page.evaluate(() => document.body.scrollHeight <= window.innerHeight + 1),
);

// ── Fonts self-hosted ───────────────────────────────────────────────────────
const remoteFontReqs = [];
page.on("request", (r) => {
  if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) remoteFontReqs.push(r.url());
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
await mobile.waitForTimeout(900);
check("Mobile: no page errors", mobileErrors.length === 0, mobileErrors.join("; "));
check("Mobile: canvas present", (await mobile.locator("canvas").count()) >= 1);
check(
  "Mobile: no horizontal scroll",
  await mobile.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1,
  ),
);

await browser.close();

console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);
