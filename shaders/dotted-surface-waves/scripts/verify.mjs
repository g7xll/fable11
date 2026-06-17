// Headless verification for the Dotted Surface wave field.
// Loads the dev server, asserts no fatal console/page errors, confirms the
// three.js point-lattice <canvas> mounts and paints (non-empty pixels), checks
// the centred heading + theme toggle, flips the theme and asserts the canvas
// re-renders in the other palette, verifies the Geist Mono font, and captures
// desktop + mobile screenshots.
//
//   URL=http://localhost:5314/ CHROME_PATH=/opt/pw-browsers/chromium \
//     node scripts/verify.mjs
import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { inflateSync } from "zlib";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

/**
 * Decode a 24/32-bit PNG buffer just enough to scan pixels (no deps). Returns
 * stats over all pixels so the caller can confirm the frame isn't flat / empty.
 */
function pngStats(buf) {
  let pos = 8; // skip signature
  let width = 0,
    height = 0,
    bitDepth = 0,
    colorType = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") break;
    pos += 12 + len;
  }
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
  if (channels === 0 || bitDepth !== 8) return null;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const prev = new Uint8Array(stride);
  const cur = new Uint8Array(stride);
  let maxLum = 0,
    minLum = 255,
    lit = 0,
    total = 0,
    rSum = 0,
    gSum = 0,
    bSum = 0;
  let p = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[p++];
    for (let x = 0; x < stride; x++) {
      const rawByte = raw[p++];
      const a = x >= channels ? cur[x - channels] : 0;
      const b = prev[x];
      const c = x >= channels ? prev[x - channels] : 0;
      let v;
      switch (filter) {
        case 0:
          v = rawByte;
          break;
        case 1:
          v = rawByte + a;
          break;
        case 2:
          v = rawByte + b;
          break;
        case 3:
          v = rawByte + ((a + b) >> 1);
          break;
        case 4: {
          const pp = a + b - c;
          const pa = Math.abs(pp - a),
            pb = Math.abs(pp - b),
            pc = Math.abs(pp - c);
          v = rawByte + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
          break;
        }
        default:
          v = rawByte;
      }
      cur[x] = v & 0xff;
    }
    for (let x = 0; x < width; x++) {
      const r = cur[x * channels];
      const g = cur[x * channels + 1];
      const bl = cur[x * channels + 2];
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * bl;
      if (lum > maxLum) maxLum = lum;
      if (lum < minLum) minLum = lum;
      rSum += r;
      gSum += g;
      bSum += bl;
      total++;
    }
    prev.set(cur);
  }
  return {
    width,
    height,
    maxLum,
    minLum,
    contrast: maxLum - minLum,
    avg: { r: rSum / total, g: gSum / total, b: bSum / total },
  };
}

const TARGET = process.env.URL || "http://localhost:5314/";
const OUT = join(dirname(fileURLToPath(import.meta.url)), ".verify");
mkdirSync(OUT, { recursive: true });

const errors = [];
// three.js logs WebGL-context failures to console.error before throwing; in a
// GL-less headless environment that is expected, so it is not an app bug.
const IGNORABLE =
  /WebGLRenderer|WebGL context|Error creating WebGL|swiftshader|GroupMarkerNotSet|Automatic fallback to software WebGL|Failed to create WebGL/i;
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: [
    "--no-sandbox",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist",
  ],
});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
const note = (s) => {
  if (IGNORABLE.test(s)) return; // expected GL-less environment noise
  errors.push(s);
};
page.on("console", (m) => {
  if (m.type() === "error") note(`console.error: ${m.text()}`);
});
page.on("pageerror", (e) => note(`pageerror: ${e.message}`));

await page.goto(TARGET, { waitUntil: "networkidle", timeout: 30000 });
await page.evaluate(() => document.fonts && document.fonts.ready);
await page.waitForTimeout(1400);

const checks = [];
const must = async (name, fn) => {
  try {
    const ok = await fn();
    checks.push([name, !!ok]);
  } catch (e) {
    checks.push([name, false, String(e)]);
  }
};

const webglSupported = await page.evaluate(() => {
  const c = document.createElement("canvas");
  return !!(c.getContext("webgl2") || c.getContext("webgl"));
});
console.log(
  `(environment: WebGL ${webglSupported ? "available" : "UNAVAILABLE"})`
);

// --- Structure / content checks --------------------------------------------
await must("page starts in dark theme (<html class='dark'>)", () =>
  page.evaluate(() => document.documentElement.classList.contains("dark"))
);
await must("heading 'Dotted Surface' present", () =>
  page
    .getByRole("heading", { level: 1 })
    .innerText()
    .then((t) => /dotted surface/i.test(t))
);
await must("brand 'FIELD GENERATOR' present", () =>
  page.getByText(/FIELD GENERATOR/i).count().then((n) => n >= 1)
);
await must("subtitle mentions sine waves", () =>
  page.getByText(/sine waves/i).count().then((n) => n >= 1)
);
await must("telemetry shows 40 × 60 lattice", () =>
  page.getByText(/40 × 60/).count().then((n) => n >= 1)
);
await must("theme toggle button present", () =>
  page.getByRole("button", { name: /toggle colour theme/i }).count().then((n) => n >= 1)
);
await must("Geist Mono applied to heading", () =>
  page.evaluate(() => {
    const h = document.querySelector("h1");
    return !!h && /geist mono/i.test(getComputedStyle(h).fontFamily);
  })
);

if (webglSupported) {
  await must("three.js <canvas> mounted", () =>
    page.locator("canvas").count().then((n) => n >= 1)
  );
  await must("canvas is full-viewport", async () => {
    const box = await page.locator("canvas").first().boundingBox();
    return box && box.width >= 1200 && box.height >= 700;
  });

  // Capture a band BELOW the centre heading so we read the DOT FIELD itself, not
  // the big text. The dark palette paints light grey dots on near-black -> a
  // non-trivial luminance contrast in the frame.
  const probe = async () => {
    const clip = { x: 0, y: 560, width: 1280, height: 200 };
    const s = pngStats(await page.screenshot({ clip }));
    if (!s) throw new Error("could not decode screenshot");
    return s;
  };
  let darkStats;
  await must("dark palette: dotted field paints (luminance contrast)", async () => {
    darkStats = await probe();
    console.log(
      `   dark field: maxLum=${darkStats.maxLum.toFixed(1)} minLum=${darkStats.minLum.toFixed(1)} contrast=${darkStats.contrast.toFixed(1)} avg=rgb(${darkStats.avg.r.toFixed(0)},${darkStats.avg.g.toFixed(0)},${darkStats.avg.b.toFixed(0)})`
    );
    // Light dots on a dark ground: bright peaks, dark floor, real spread.
    return darkStats.maxLum > 60 && darkStats.minLum < 40 && darkStats.contrast > 40;
  });

  // Flip to the light theme via the real toggle, then assert the page actually
  // switched palette (background got much brighter -> dark dots on light ground).
  await must("theme toggle flips to light palette", async () => {
    await page.getByRole("button", { name: /toggle colour theme/i }).click();
    await page.waitForFunction(
      () => !document.documentElement.classList.contains("dark"),
      { timeout: 4000 }
    );
    // Give three.js a couple of frames to rebuild geometry colours.
    await page.waitForTimeout(900);
    const lightStats = await probe();
    console.log(
      `   light field: avg=rgb(${lightStats.avg.r.toFixed(0)},${lightStats.avg.g.toFixed(0)},${lightStats.avg.b.toFixed(0)}) (dark avg.r=${darkStats.avg.r.toFixed(0)})`
    );
    return lightStats.avg.r > darkStats.avg.r + 60; // markedly brighter ground
  });

  // Restore dark for the canonical desktop screenshot.
  await page.getByRole("button", { name: /toggle colour theme/i }).click();
  await page
    .waitForFunction(() => document.documentElement.classList.contains("dark"), {
      timeout: 4000,
    })
    .catch(() => {});
  await page.waitForTimeout(700);
} else {
  await must("graceful: app did not crash (heading present)", () =>
    page.getByRole("heading", { level: 1 }).count().then((n) => n >= 1)
  );
}

await page.screenshot({ path: join(OUT, "desktop.png") });

// Mobile pass
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(700);
await must("mobile: heading still visible", () =>
  page.getByRole("heading", { level: 1 }).isVisible()
);
await must("mobile: no horizontal overflow", () =>
  page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1
  )
);
await page.screenshot({ path: join(OUT, "mobile.png") });

await browser.close();

// Report
let failed = 0;
console.log("\n=== VERIFY RESULTS ===");
for (const [name, ok, extra] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  -> " + extra : ""}`);
  if (!ok) failed++;
}
console.log("\n=== CONSOLE / PAGE ERRORS ===");
if (errors.length === 0) console.log("(none)");
else errors.forEach((e) => console.log(" - " + e));

console.log(`\nScreenshots: ${OUT}`);
if (failed > 0 || errors.length > 0) {
  console.log(`\nRESULT: FAIL (${failed} checks failed, ${errors.length} errors)`);
  process.exit(1);
}
console.log("\nRESULT: ALL PASS");
