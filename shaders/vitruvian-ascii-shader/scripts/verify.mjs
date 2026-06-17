/**
 * CLI verification for the Vitruvian ASCII Shader hero.
 * Run a dev/preview server first, then: node scripts/verify.mjs
 *   (defaults to http://localhost:4173 — override with VERIFY_URL)
 *
 * Drives a headless Chromium and checks:
 *  - no uncaught page errors / console errors (desktop + mobile)
 *  - the ASCII canvas exists, fills the viewport, and paints non-black glyphs
 *  - the animation is actually live (the figure region changes over time)
 *  - all hero chrome from the prompt is present (wordmark, headline, buttons…)
 *  - the page is a single non-scrolling viewport
 *  - it is fully self-contained: NO requests to jsdelivr / unicorn.studio /
 *    Google Fonts (the offline ASCII shader replaces the blocked embed)
 *  - responsive: on mobile the canvas is hidden and the star backdrop shows
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

const browser = await chromium.launch({ headless: true });

// Track any request to hosts the original embed needed — there should be none.
const BLOCKED = /jsdelivr\.net|unicorn\.studio|fonts\.(googleapis|gstatic)\.com/;
const offenders = [];

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const pageErrors = [];
const consoleErrors = [];
page.on("pageerror", (e) => pageErrors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text());
});
page.on("request", (r) => {
  if (BLOCKED.test(r.url())) offenders.push(r.url());
});

await page.goto(BASE_URL, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

check("No uncaught page errors", pageErrors.length === 0, pageErrors.join("; "));
check("No console errors", consoleErrors.length === 0, consoleErrors.join("; "));

// ── Canvas present, visible, full-window ───────────────────────────────────
const canvas = page.locator("canvas");
check("ASCII canvas present", (await canvas.count()) === 1);
check("Canvas is visible on desktop", await canvas.first().isVisible());
check(
  "Canvas fills the viewport",
  await canvas.first().evaluate((el) => {
    const r = el.getBoundingClientRect();
    return r.width >= window.innerWidth - 2 && r.height >= window.innerHeight - 2;
  }),
);
check(
  "Canvas drawing buffer is sized (DPR-aware)",
  await canvas.first().evaluate((el) => el.width > 0 && el.height > 0),
);

// ── Canvas paints non-black glyphs, and the animation is live ──────────────
// Screenshot a region over the figure, decode it in-page, and measure pixels.
async function sample(clip) {
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
    let ink = 0;
    for (let i = 0; i < d.length; i += 4) {
      const m = Math.max(d[i], d[i + 1], d[i + 2]);
      lum += d[i] + d[i + 1] + d[i + 2];
      maxChan = Math.max(maxChan, m);
      if (m > 40) ink += 1;
    }
    return { lum, maxChan, ink };
  }, `data:image/png;base64,${b64}`);
}

const figureRegion = { x: 600, y: 320, width: 380, height: 420 };
const first = await sample(figureRegion);
check("Canvas paints bright glyphs (not a black void)", first.maxChan > 120 && first.ink > 200, JSON.stringify(first));

await page.waitForTimeout(1500);
const second = await sample(figureRegion);
check(
  "Animation is live (figure region changes over time)",
  Math.abs(first.lum - second.lum) > 1000 || Math.abs(first.ink - second.ink) > 40,
  `lum ${first.lum}→${second.lum}, ink ${first.ink}→${second.ink}`,
);

// ── Hero chrome from the prompt ────────────────────────────────────────────
for (const [label, text] of [
  ["wordmark UIMIX", "UIMIX"],
  ["headline PERFECT", "PERFECT"],
  ["headline PROPORTIONS", "PROPORTIONS"],
  ["tagline", "Da Vinci's vision of ideal form"],
  ["GET STARTED button", "GET STARTED"],
  ["LEARN MORE button", "LEARN MORE"],
  ["VITRUVIAN notation", "VITRUVIAN"],
  ["coordinates", "LAT: 37.7749°"],
  ["footer version", "V1.0.0"],
]) {
  check(`Chrome present: ${label}`, (await page.getByText(text, { exact: false }).count()) >= 1);
}

const buttons = page.getByRole("button");
check("Two CTA buttons", (await buttons.count()) === 2);

// ── Single non-scrolling viewport ──────────────────────────────────────────
check(
  "Page does not scroll (single viewport)",
  await page.evaluate(() => {
    const se = document.scrollingElement || document.documentElement;
    se.scrollTop = 600;
    const moved = se.scrollTop;
    se.scrollTop = 0;
    return moved === 0;
  }),
);

// ── Fully self-contained / offline (no blocked-host requests) ──────────────
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(500);
check("No CDN / hosted-scene / remote-font requests", offenders.length === 0, offenders.join("; "));

// ── Mobile: canvas hidden, star backdrop shown, no horizontal scroll ───────
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
const mobileErrors = [];
mobile.on("pageerror", (e) => mobileErrors.push(e.message));
await mobile.goto(BASE_URL, { waitUntil: "networkidle" });
await mobile.waitForTimeout(600);
check("Mobile: no page errors", mobileErrors.length === 0, mobileErrors.join("; "));
check("Mobile: ASCII canvas is hidden", !(await mobile.locator("canvas").first().isVisible()));
check("Mobile: star backdrop present", (await mobile.locator(".stars-bg").count()) >= 1);
check("Mobile: headline present", (await mobile.getByText("PROPORTIONS").count()) >= 1);
check(
  "Mobile: no horizontal scroll",
  await mobile.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
);

await browser.close();

console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);
