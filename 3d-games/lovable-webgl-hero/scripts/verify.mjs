// Headless verification: boots the page, waits for the CoreRenderer WebGL hero
// to initialize, and asserts the spec's content + a live WebGL canvas with no
// console errors. Run against an already-running dev/preview server URL.
import playwright from "/Volumes/Sandisk SSD/codingAndFun/samaan/fable/scripts/record-demos/node_modules/playwright/index.js";

const { chromium } = playwright;

const URL = process.env.VERIFY_URL || "http://localhost:3111/";

const errors = [];
const failed = [];

function check(name, cond) {
	if (cond) {
		console.log(`  PASS  ${name}`);
	} else {
		console.log(`  FAIL  ${name}`);
		failed.push(name);
	}
}

const browser = await chromium.launch({
	args: ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

page.on("console", (msg) => {
	if (msg.type() === "error") errors.push(msg.text());
});
page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));

await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });

// Give the shader runtime time to load scripts + init + paint.
await page.waitForTimeout(4000);

// 1. Hero text content
const h1 = (await page.locator("h1").first().textContent())?.trim();
check('H1 === "Build something Lovable"', h1 === "Build something Lovable");

const subtitle = await page
	.getByText("Create apps and websites by chatting with AI")
	.count();
check("Subtitle present", subtitle > 0);

const pill = await page
	.getByText("Better SEO – Apps built to be found")
	.count();
check('Announcement pill "Better SEO" present', pill > 0);

const newBadge = await page.getByText("New", { exact: true }).count();
check('"New" badge present', newBadge > 0);

// 2. Navbar
const nav = page.locator("nav").first();
const navBox = await nav.boundingBox();
check("Nav height === 70px", navBox && Math.round(navBox.height) === 70);
const openLovable = await page.getByText("Open Lovable").count();
check('"Open Lovable" button present', openLovable > 0);
for (const label of [
	"Solution",
	"Resources",
	"Community",
	"Enterprise",
	"Pricing",
	"Security",
]) {
	const c = await page
		.getByRole("button", { name: label, exact: true })
		.count();
	check(`Nav item "${label}" present`, c > 0);
}

// 3. WebGL hero canvas created by CoreRenderer
const heroCanvas = page.locator("#hero-canvas");
check("#hero-canvas mount present", (await heroCanvas.count()) > 0);
const canvasCount = await heroCanvas.locator("canvas").count();
check("CoreRenderer created a <canvas> inside #hero-canvas", canvasCount > 0);

// Confirm a real WebGL context exists on that canvas.
const webglInfo = await page.evaluate(() => {
	const host = document.querySelector("#hero-canvas");
	const canvas = host?.querySelector("canvas");
	if (!canvas) return { hasCanvas: false };
	const gl =
		canvas.getContext("webgl2") ||
		canvas.getContext("webgl") ||
		canvas.getContext("experimental-webgl");
	return {
		hasCanvas: true,
		hasGL: !!gl,
		w: canvas.width,
		h: canvas.height,
		coreRenderer: typeof window.CoreRenderer,
		heroData: typeof window._heroProjectData,
	};
});
check(
	"window.CoreRenderer is an object",
	webglInfo.coreRenderer === "object" || webglInfo.coreRenderer === "function",
);
check("window._heroProjectData loaded", webglInfo.heroData === "object");
check("Canvas has a live WebGL context", webglInfo.hasGL === true);
check(
	"Canvas has non-zero dimensions",
	webglInfo.hasCanvas && webglInfo.w > 0 && webglInfo.h > 0,
);

// 4. Hero shader faded in (opacity 1)
const heroOpacity = await heroCanvas.evaluate(
	(el) => getComputedStyle(el).opacity,
);
check("Hero shader faded in (opacity ~1)", parseFloat(heroOpacity) > 0.9);

// 5. Trusted-by section
const trusted = await page
	.getByText("Teams from top companies build with Lovable")
	.count();
check("Trusted-by heading present", trusted > 0);
const logoImgs = await page.locator('img[src*="/vendor/logo-"]').count();
check("Trusted-by logo images rendered (>= 12)", logoImgs >= 12);

// 6. Prompt input box size
const promptBox = await page.evaluate(() => {
	// the 160px-tall inner box
	const els = Array.from(document.querySelectorAll("div"));
	const box = els.find((d) => {
		const s = getComputedStyle(d);
		return (
			Math.round(parseFloat(s.height)) === 160 &&
			Math.round(parseFloat(s.borderTopLeftRadius)) === 30
		);
	});
	if (!box) return null;
	return { h: Math.round(box.getBoundingClientRect().height) };
});
check("Prompt box 160px tall present", promptBox && promptBox.h === 160);

// 7. Vendor assets all 200
const assetStatuses = await page.evaluate(async () => {
	const files = [
		"core-renderer.js",
		"hero-project.js",
		"back-gl-3.png",
		"back-gl.png",
		"back-gl-2.png",
		"logo.svg",
		"arrow-right.svg",
		"arrow-up.svg",
		"ai-select.svg",
		"dots.svg",
		"announcement.jpg",
		"logo-1.svg",
		"logo-2.svg",
		"logo-3.svg",
		"logo-4.svg",
		"logo-5.svg",
		"logo-6.svg",
	];
	const out = {};
	for (const f of files) {
		try {
			const r = await fetch(`/vendor/${f}`, { method: "GET" });
			out[f] = r.status;
		} catch (e) {
			out[f] = `ERR ${e.message}`;
		}
	}
	return out;
});
const bad = Object.entries(assetStatuses).filter(([, s]) => s !== 200);
check("All 17 vendor assets serve 200", bad.length === 0);
if (bad.length) console.log("    bad assets:", JSON.stringify(bad));

// 8. No console errors
check("No console errors", errors.length === 0);
if (errors.length)
	console.log(`    console errors:\n    - ${errors.join("\n    - ")}`);

await browser.close();

console.log("");
if (failed.length === 0) {
	console.log("ALL CHECKS PASSED");
	process.exit(0);
} else {
	console.log(`${failed.length} CHECK(S) FAILED: ${failed.join(", ")}`);
	process.exit(1);
}
