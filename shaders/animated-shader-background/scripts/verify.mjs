// Headless verification for the AnoAI animated shader background.
// Loads the dev server, asserts no console/page errors, confirms the WebGL
// shader canvas mounts and renders non-black pixels, checks the hero UI and
// fonts, and captures desktop + mobile screenshots.
//
//   URL=http://localhost:5311/ CHROME_PATH=/opt/chromium-bin/chrome \
//     node scripts/verify.mjs
import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { inflateSync } from "zlib";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

/**
 * Decode a 24/32-bit PNG buffer just enough to scan pixels (no deps). Returns
 * stats over all pixels so the caller can confirm the frame isn't flat black.
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
			if (lum > 8) lit++;
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
		litFraction: lit / total,
		avg: { r: rSum / total, g: gSum / total, b: bSum / total },
	};
}

const TARGET = process.env.URL || "http://localhost:5311/";
const OUT = join(dirname(fileURLToPath(import.meta.url)), ".verify");
mkdirSync(OUT, { recursive: true });

const errors = [];
// three.js logs WebGL-context failures to console.error before throwing; in a
// GL-less headless environment that is expected and handled by our CSS fallback,
// so it is not an app bug. Everything else is fatal.
const IGNORABLE =
	/WebGLRenderer|WebGL context|Error creating WebGL|swiftshader|GroupMarkerNotSet|Automatic fallback to software WebGL/i;
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
const ctx = await browser.newContext({
	viewport: { width: 1280, height: 800 },
});
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
await page.waitForTimeout(1200);

const checks = [];
const must = async (name, fn) => {
	try {
		const ok = await fn();
		checks.push([name, !!ok]);
	} catch (e) {
		checks.push([name, false, String(e)]);
	}
};

// Probe WebGL support up front so checks adapt to the environment. In a browser
// WITH WebGL we assert the shader canvas mounts and paints; WITHOUT it we assert
// the CSS aurora fallback engaged (the app must never go flat-black or crash).
const webglSupported = await page.evaluate(() => {
	const c = document.createElement("canvas");
	return !!(c.getContext("webgl2") || c.getContext("webgl"));
});
console.log(
	`(environment: WebGL ${webglSupported ? "available" : "UNAVAILABLE -> CSS fallback path"})`,
);

if (webglSupported) {
	await must("WebGL <canvas> mounted", () =>
		page
			.locator("canvas")
			.count()
			.then((n) => n >= 1),
	);
	await must("canvas is full-viewport background", async () => {
		const box = await page.locator("canvas").first().boundingBox();
		return box && box.width >= 1200 && box.height >= 700;
	});
	await must(
		"shader paints visible aurora (screenshot is not flat black)",
		async () => {
			// Sample a top region that contains aurora but not the bright hero text,
			// so a pass means the SHADER itself is producing colored light.
			const clip = { x: 0, y: 90, width: 1280, height: 220 };
			const png = await page.screenshot({ clip });
			const s = pngStats(png);
			if (!s) throw new Error("could not decode screenshot");
			console.log(
				`   shader region: maxLum=${s.maxLum.toFixed(1)} lit=${(s.litFraction * 100).toFixed(1)}% avg=rgb(${s.avg.r.toFixed(0)},${s.avg.g.toFixed(0)},${s.avg.b.toFixed(0)})`,
			);
			// Aurora is teal/violet, so blue+green should dominate and a meaningful
			// fraction of pixels should be lit.
			return s.maxLum > 25 && s.litFraction > 0.05 && s.avg.b >= s.avg.r;
		},
	);
} else {
	await must("graceful fallback: app did NOT crash (hero present)", () =>
		page
			.getByRole("heading", { level: 1 })
			.count()
			.then((n) => n >= 1),
	);
	await must("CSS aurora fallback rendered (3 glow layers)", async () => {
		return await page.evaluate(() => {
			const layers = Array.from(
				document.querySelectorAll('div[class*="blur-"]'),
			).filter((el) => {
				const bg = getComputedStyle(el).backgroundImage || "";
				return bg.includes("radial-gradient");
			});
			return layers.length >= 3;
		});
	});
}

await must("headline 'unbounded.' present", () =>
	page
		.getByRole("heading", { level: 1 })
		.innerText()
		.then((t) => /unbounded/i.test(t)),
);
await must("brand 'AnoAI' present", () =>
	page
		.getByText(/Ano/)
		.first()
		.count()
		.then((n) => n >= 1),
);
await must("primary CTA present", () =>
	page
		.getByText(/Start building free/i)
		.count()
		.then((n) => n >= 1),
);
await must("'Watch the demo' (Play icon CTA)", () =>
	page
		.getByText(/Watch the demo/i)
		.count()
		.then((n) => n >= 1),
);
await must("feature chips (Reasoning/Ships/Private)", async () => {
	const a = await page.getByText(/Reasoning engine/i).count();
	const b = await page.getByText(/Ships in seconds/i).count();
	const c = await page.getByText(/Private by design/i).count();
	return a >= 1 && b >= 1 && c >= 1;
});
await must("4 avatars loaded (naturalWidth>0)", async () => {
	return await page.evaluate(() => {
		const imgs = Array.from(document.querySelectorAll('img[src*="avatar"]'));
		return (
			imgs.length === 4 && imgs.every((i) => i.complete && i.naturalWidth > 0)
		);
	});
});
await must("scroll cue present", () =>
	page
		.getByText(/^Scroll$/i)
		.count()
		.then((n) => n >= 1),
);
await must("Geist font applied to body", async () => {
	return await page.evaluate(() =>
		getComputedStyle(document.body).fontFamily.toLowerCase().includes("geist"),
	);
});
await must("divider element rendered", () =>
	page
		.locator(".divider")
		.count()
		.then((n) => n >= 1),
);

await page.screenshot({ path: join(OUT, "desktop.png") });

// Mobile pass
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(600);
await must("mobile: headline still visible", () =>
	page.getByRole("heading", { level: 1 }).isVisible(),
);
await must("mobile: no horizontal overflow", async () => {
	return await page.evaluate(
		() => document.documentElement.scrollWidth <= window.innerWidth + 1,
	);
});
await page.screenshot({ path: join(OUT, "mobile.png") });

await browser.close();

// Report
let failed = 0;
console.log("\n=== VERIFY RESULTS ===");
for (const [name, ok, extra] of checks) {
	console.log(
		`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  -> " + extra : ""}`,
	);
	if (!ok) failed++;
}
console.log("\n=== CONSOLE / PAGE ERRORS ===");
if (errors.length === 0) console.log("(none)");
else errors.forEach((e) => console.log(" - " + e));

console.log(`\nScreenshots: ${OUT}`);
if (failed > 0 || errors.length > 0) {
	console.log(
		`\nRESULT: FAIL (${failed} checks failed, ${errors.length} errors)`,
	);
	process.exit(1);
}
console.log("\nRESULT: ALL PASS");
