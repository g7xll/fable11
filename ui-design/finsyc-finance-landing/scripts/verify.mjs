#!/usr/bin/env node
/**
 * Headless verification for the Finsyc finance landing page.
 *
 * CLI-only: boots nothing itself — expects a dev/preview server URL passed via
 * --url (default http://localhost:5199/). Drives the pre-installed Chromium
 * through Playwright to assert the page actually renders:
 *   - key section headings are present in the DOM,
 *   - every <img> has loaded (naturalWidth > 0) — catches broken vendored assets,
 *   - the hero <video> element mounts,
 *   - the page is tall (all 10 sections stacked, not a blank/crashed render),
 *   - no page errors / failed requests for local assets.
 *
 * Usage:
 *   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
 *   node scripts/verify.mjs --url http://localhost:5199/ \
 *     --chrome /opt/pw-browsers/chromium-1194/chrome-linux/chrome
 */
import { chromium } from "playwright";

const args = Object.fromEntries(
	process.argv.slice(2).reduce((acc, cur, i, arr) => {
		if (cur.startsWith("--")) acc.push([cur.slice(2), arr[i + 1]]);
		return acc;
	}, []),
);

const URL = args.url || "http://localhost:5199/";
const CHROME = args.chrome || process.env.CHROME_BIN || undefined;

const EXPECTED_TEXT = [
	"Control Your Money with",
	"Smarter financial setup for scaling",
	"Master Your Money",
	"Manage your finances",
	"Take full control of your financial growth",
	"Trusted by people",
	"Choose the",
	"Connect all your financial tools in",
	"Insights to help you",
	"Take full control of your",
	"Finsyc",
];

const fail = (msg) => {
	console.error("FAIL: " + msg);
	process.exitCode = 1;
};

const browser = await chromium.launch({
	headless: true,
	...(CHROME ? { executablePath: CHROME } : {}),
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const pageErrors = [];
const failedAssets = [];
page.on("pageerror", (e) => pageErrors.push(e.message));
page.on("requestfailed", (r) => {
	const u = r.url();
	const err = r.failure()?.errorText || "?";
	// Only consider LOCAL (same-origin) vendored assets; remote font/CDN requests
	// are expected to be blocked in this sandbox.
	const isLocal = u.startsWith("http://localhost") || u.startsWith(URL);
	if (!isLocal) return;
	// net::ERR_ABORTED on a media file is normal: the browser cancels in-flight
	// <video> range requests once it has what it needs / when the element unmounts.
	// The file itself serves fine (verified separately via curl 200/206), so this
	// is a headless false-positive, not a broken asset.
	const isMedia = /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(u);
	if (isMedia && /ERR_ABORTED/.test(err)) return;
	failedAssets.push(u + " (" + err + ")");
});

await page.goto(URL, { waitUntil: "load", timeout: 60000 });
try {
	await page.waitForLoadState("networkidle", { timeout: 8000 });
} catch {}
await page.waitForTimeout(1500);

// 1) Body text contains every expected heading fragment.
const bodyText = await page.evaluate(() => document.body.innerText);
let textOk = 0;
for (const t of EXPECTED_TEXT) {
	if (bodyText.includes(t)) textOk++;
	else fail("missing expected text: " + JSON.stringify(t));
}
console.log(`text check: ${textOk}/${EXPECTED_TEXT.length} fragments present`);

// 2) Scroll through so whileInView / lazy content mounts before image audit.
await page.evaluate(async () => {
	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
	const h = document.body.scrollHeight;
	for (let y = 0; y <= h; y += 600) {
		window.scrollTo(0, y);
		await sleep(60);
	}
	window.scrollTo(0, 0);
	await sleep(200);
});

// 3) Image audit — every <img> must have decoded (naturalWidth > 0).
const imgStats = await page.evaluate(() => {
	const imgs = Array.from(document.images);
	const broken = imgs
		.filter((im) => !im.complete || im.naturalWidth === 0)
		.map((im) => im.currentSrc || im.src);
	return { total: imgs.length, broken };
});
console.log(
	`image check: ${imgStats.total - imgStats.broken.length}/${imgStats.total} images decoded`,
);
if (imgStats.broken.length)
	fail("broken images:\n  " + imgStats.broken.join("\n  "));

// 4) Hero video element present.
const videoCount = await page.evaluate(
	() => document.querySelectorAll("video").length,
);
console.log(`video elements mounted: ${videoCount}`);
if (videoCount < 1) fail("no <video> element mounted");

// 5) Page is tall (all sections rendered).
const docHeight = await page.evaluate(() => document.body.scrollHeight);
console.log(`document height: ${docHeight}px`);
if (docHeight < 4000)
	fail(
		"page suspiciously short (" +
			docHeight +
			"px) — sections may not have rendered",
	);

// 6) No JS page errors / failed local assets.
if (pageErrors.length) fail("page errors:\n  " + pageErrors.join("\n  "));
else console.log("page errors: none");
if (failedAssets.length)
	fail("failed local assets:\n  " + failedAssets.join("\n  "));
else console.log("failed local assets: none");

await browser.close();

if (process.exitCode === 1) {
	console.error("\nVERIFY: FAILED");
} else {
	console.log("\nVERIFY: PASSED");
}
