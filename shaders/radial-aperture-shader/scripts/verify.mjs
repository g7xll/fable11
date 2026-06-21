// Headless verification for the APERTURE radial-bloom showcase.
// Boots against a running dev server, asserts no fatal console/page errors,
// confirms the WebGL2 hero canvas paints a non-black bloom (decodes a real
// screenshot), checks the instrument UI, the vendored specimen gallery and the
// control deck, and captures desktop + mobile screenshots.
//
//   URL=http://localhost:5312/ CHROME_PATH=/opt/pw-browsers/chromium/chrome-linux/chrome \
//     node scripts/verify.mjs
import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { inflateSync } from "zlib";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

/** Decode a 24/32-bit PNG just enough to scan pixel stats (no deps). */
function pngStats(buf) {
	let pos = 8;
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
		} else if (type === "IDAT") idat.push(data);
		else if (type === "IEND") break;
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

const TARGET = process.env.URL || "http://localhost:5312/";
const OUT = join(dirname(fileURLToPath(import.meta.url)), ".verify");
mkdirSync(OUT, { recursive: true });

const errors = [];
const IGNORABLE =
	/WebGLRenderer|WebGL context|Error creating WebGL|swiftshader|GroupMarkerNotSet|Automatic fallback to software WebGL|Failed to load resource/i;
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
	if (!IGNORABLE.test(s)) errors.push(s);
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
		checks.push([name, !!(await fn())]);
	} catch (e) {
		checks.push([name, false, String(e)]);
	}
};

const webgl = await page.evaluate(() => {
	const c = document.createElement("canvas");
	return !!c.getContext("webgl2");
});
console.log(`(environment: WebGL2 ${webgl ? "available" : "UNAVAILABLE"})`);

await must("three live <canvas> layers mounted (hero, deck, drop-in)", () =>
	page
		.locator("canvas")
		.count()
		.then((n) => n >= 3),
);
await must("hero canvas is full-viewport", async () => {
	const box = await page.locator("canvas").first().boundingBox();
	return box && box.width >= 1200 && box.height >= 700;
});

if (webgl) {
	await must(
		"hero paints a non-black, colored bloom (decoded screenshot)",
		async () => {
			const clip = { x: 760, y: 170, width: 460, height: 420 };
			const s = pngStats(await page.screenshot({ clip }));
			if (!s) throw new Error("could not decode screenshot");
			console.log(
				`   hero region: maxLum=${s.maxLum.toFixed(1)} lit=${(s.litFraction * 100).toFixed(1)}% avg=rgb(${s.avg.r.toFixed(0)},${s.avg.g.toFixed(0)},${s.avg.b.toFixed(0)})`,
			);
			// The field is full-spectrum, so just require real, colored light (not flat black).
			return (
				s.maxLum > 18 && s.litFraction > 0.02 && s.avg.r + s.avg.g + s.avg.b > 5
			);
		},
	);
}

await must("brand 'APER·TURE' present", () =>
	page
		.getByText(/APER/)
		.first()
		.count()
		.then((n) => n >= 1),
);
await must("hero headline 'APERTURE'", () =>
	page
		.getByRole("heading", { level: 1 })
		.innerText()
		.then((t) => /APERTURE/i.test(t)),
);
await must("section: control deck", () =>
	page
		.getByText(/control deck/i)
		.count()
		.then((n) => n >= 1),
);
await must("section: anatomy", () =>
	page
		.getByText(/anatomy/i)
		.count()
		.then((n) => n >= 1),
);
await must("section: field captures", () =>
	page
		.getByText(/field captures/i)
		.count()
		.then((n) => n >= 1),
);
await must("section: integration", () =>
	page
		.getByText(/integration/i)
		.count()
		.then((n) => n >= 1),
);
await must("section: api", () =>
	page
		.getByText(/^api$/i)
		.count()
		.then((n) => n >= 1),
);

await must("4 control sliders present", () =>
	page
		.locator('input[type="range"]')
		.count()
		.then((n) => n === 4),
);
await must("5 presets present", () =>
	page
		.getByText(/^(ORIGIN|CORONA|IRIS|EMBER|HALO)$/)
		.count()
		.then((n) => n >= 5),
);
await must("'why components/ui' callout present", () =>
	page
		.getByText(/why components\/ui/i)
		.count()
		.then((n) => n >= 1),
);
await must("copyable import line present", () =>
	page
		.getByText(/@\/components\/ui\/raidal-2/)
		.first()
		.count()
		.then((n) => n >= 1),
);

await must("Space Grotesk applied to body", () =>
	page.evaluate(() =>
		getComputedStyle(document.body)
			.fontFamily.toLowerCase()
			.includes("space grotesk"),
	),
);

// Specimen gallery (lazy) — scroll in, then confirm all six decode.
await page.locator("#field").scrollIntoViewIfNeeded();
await page.waitForTimeout(900);
await must("6 specimen images decode (naturalWidth > 0)", () =>
	page.evaluate(() => {
		const imgs = Array.from(
			document.querySelectorAll('img[src*="/assets/specimens/"]'),
		);
		return (
			imgs.length === 6 && imgs.every((i) => i.complete && i.naturalWidth > 0)
		);
	}),
);

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);
await page.screenshot({ path: join(OUT, "desktop.png"), fullPage: false });

// Mobile pass
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(700);
await must("mobile: headline visible", () =>
	page.getByRole("heading", { level: 1 }).isVisible(),
);
await must("mobile: no horizontal overflow", () =>
	page.evaluate(
		() => document.documentElement.scrollWidth <= window.innerWidth + 1,
	),
);
await page.screenshot({ path: join(OUT, "mobile.png"), fullPage: false });

await browser.close();

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
