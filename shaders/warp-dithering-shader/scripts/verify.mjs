// Headless, CLI-only verification for the warp-dithering-shader experiment.
//
// It boots the Vite dev server, drives a headless Chromium (software GL via
// SwiftShader) through the page, and asserts:
//   1. the page loads with no console / shader-compile errors,
//   2. the hero WebGL2 canvas paints non-blank pixels with tonal variation,
//   3. the console exposes all 7 shape + 4 dither controls,
//   4. selecting a shape rewires the hero (wordmark + aria-pressed update),
//   5. selecting a dither kernel updates its pressed state,
//   6. the shape-library tiles mount live shader canvases when scrolled in.
//
// Usage: node scripts/verify.mjs
import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import zlib from "node:zlib";
import { chromium } from "playwright";

// Minimal PNG decoder (8-bit, colour types 0/2/6, no interlace) so we can
// inspect a composited Playwright screenshot without extra dependencies. The
// component's GL context is not preserveDrawingBuffer, so an off-loop
// readPixels reads blank — a screenshot captures the real, composited frame.
function decodePng(buf) {
	const sig = [137, 80, 78, 71, 13, 10, 26, 10];
	for (let i = 0; i < 8; i++)
		if (buf[i] !== sig[i]) throw new Error("not a png");
	let pos = 8;
	let width = 0;
	let height = 0;
	let colorType = 0;
	let bitDepth = 0;
	const idat = [];
	while (pos < buf.length) {
		const len = buf.readUInt32BE(pos);
		const type = buf.toString("ascii", pos + 4, pos + 8);
		const data = buf.subarray(pos + 8, pos + 8 + len);
		pos += 12 + len;
		if (type === "IHDR") {
			width = data.readUInt32BE(0);
			height = data.readUInt32BE(4);
			bitDepth = data[8];
			colorType = data[9];
		} else if (type === "IDAT") {
			idat.push(data);
		} else if (type === "IEND") {
			break;
		}
	}
	if (bitDepth !== 8) throw new Error(`unsupported bit depth ${bitDepth}`);
	const channels =
		colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 0 ? 1 : 0;
	if (!channels) throw new Error(`unsupported colour type ${colorType}`);
	const raw = zlib.inflateSync(Buffer.concat(idat));
	const stride = width * channels;
	const out = Buffer.alloc(width * height * 4);
	let prev = Buffer.alloc(stride);
	let p = 0;
	for (let y = 0; y < height; y++) {
		const filter = raw[p++];
		const line = Buffer.from(raw.subarray(p, p + stride));
		p += stride;
		for (let i = 0; i < stride; i++) {
			const a = i >= channels ? line[i - channels] : 0;
			const b = prev[i];
			const c = i >= channels ? prev[i - channels] : 0;
			let v = line[i];
			if (filter === 1) v += a;
			else if (filter === 2) v += b;
			else if (filter === 3) v += (a + b) >> 1;
			else if (filter === 4) {
				const pa = Math.abs(b - c);
				const pb = Math.abs(a - c);
				const pc = Math.abs(a + b - 2 * c);
				v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
			}
			line[i] = v & 255;
		}
		prev = line;
		for (let x = 0; x < width; x++) {
			const si = x * channels;
			const di = (y * width + x) * 4;
			if (channels === 4) {
				out[di] = line[si];
				out[di + 1] = line[si + 1];
				out[di + 2] = line[si + 2];
				out[di + 3] = line[si + 3];
			} else if (channels === 3) {
				out[di] = line[si];
				out[di + 1] = line[si + 1];
				out[di + 2] = line[si + 2];
				out[di + 3] = 255;
			} else {
				out[di] = out[di + 1] = out[di + 2] = line[si];
				out[di + 3] = 255;
			}
		}
	}
	return { width, height, data: out };
}

const PORT = 5321;
const URL = `http://localhost:${PORT}/`;

// Resolve a Chromium binary from the Playwright browser cache. The managed
// download is unavailable offline, so we drive whichever full-chrome build is
// already present; if none is found we let Playwright use its default.
function resolveChromeExecutable() {
	const root = process.env.PLAYWRIGHT_BROWSERS_PATH;
	if (!root || !existsSync(root)) return undefined;
	const builds = readdirSync(root)
		.filter((d) => /^chromium-\d+$/.test(d))
		.sort();
	for (const build of builds) {
		const exe = path.join(root, build, "chrome-linux", "chrome");
		if (existsSync(exe)) return exe;
	}
	return undefined;
}

function startDev() {
	return spawn(
		"npm",
		["run", "dev", "--", "--port", String(PORT), "--strictPort"],
		{
			cwd: process.cwd(),
			stdio: ["ignore", "pipe", "pipe"],
		},
	);
}

async function waitForServer(timeoutMs = 30000) {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		try {
			const res = await fetch(URL);
			if (res.ok) return true;
		} catch {
			/* not up yet */
		}
		await sleep(400);
	}
	throw new Error("Dev server did not start in time");
}

const results = [];
const ok = (m) => results.push(`PASS  ${m}`);
const fail = (m) => {
	results.push(`FAIL  ${m}`);
	process.exitCode = 1;
};

const dev = startDev();
dev.stdout.on("data", () => {});
dev.stderr.on("data", () => {});

let browser;
try {
	await waitForServer();
	ok("dev server is reachable");

	browser = await chromium.launch({
		executablePath: resolveChromeExecutable(),
		args: [
			"--use-gl=angle",
			"--use-angle=swiftshader",
			"--ignore-gpu-blocklist",
			"--enable-unsafe-swiftshader",
		],
	});
	const page = await browser.newPage({
		viewport: { width: 1280, height: 800 },
	});

	const consoleErrors = [];
	page.on("console", (msg) => {
		if (msg.type() === "error") consoleErrors.push(msg.text());
	});
	page.on("pageerror", (err) => consoleErrors.push(String(err)));

	await page.goto(URL, { waitUntil: "networkidle" });
	await sleep(2500); // let the hero shader compile + paint a few frames

	// 1a. The hero mounts a real WebGL2 context.
	const ctxReport = await page.evaluate(() => {
		const canvas = document.querySelector("canvas");
		if (!canvas) return { error: "no canvas element" };
		const gl = canvas.getContext("webgl2");
		if (!gl) return { error: "no webgl2 context" };
		return { w: canvas.width, h: canvas.height };
	});
	if (ctxReport.error) fail(`hero canvas: ${ctxReport.error}`);
	else ok(`hero canvas is ${ctxReport.w}x${ctxReport.h} (WebGL2)`);

	// 1b. A composited screenshot proves the field actually paints — sample a
	//     grid and require tonal range plus visible orange foreground over navy.
	const shot = decodePng(
		await page.screenshot({ clip: { x: 0, y: 0, width: 1280, height: 700 } }),
	);
	let min = 255;
	let max = 0;
	let nonBlank = 0;
	let orange = 0;
	for (let gy = 0; gy < 20; gy++) {
		for (let gx = 0; gx < 32; gx++) {
			const x = Math.floor(((gx + 0.5) / 32) * shot.width);
			const y = Math.floor(((gy + 0.5) / 20) * shot.height);
			const di = (y * shot.width + x) * 4;
			const r = shot.data[di];
			const g = shot.data[di + 1];
			const b = shot.data[di + 2];
			const lum = (r + g + b) / 3;
			min = Math.min(min, lum);
			max = Math.max(max, lum);
			if (r + g + b > 12) nonBlank++;
			if (r > 120 && g > 20 && g < 190 && b < 150) orange++;
		}
	}
	if (nonBlank > 0) ok("hero shader paints non-blank pixels");
	else fail("hero shader output is entirely blank");
	if (max - min > 20)
		ok(`hero field has tonal range (Δlum ${Math.round(max - min)})`);
	else fail("hero field is flat / uniform");
	if (orange > 0)
		ok(`hero shows orange foreground over navy (${orange} samples)`);
	else
		fail(
			"no orange foreground detected — colours may not be reaching the shader",
		);

	// 2. Controls exist in the expected counts.
	const shapeButtons = page.locator('[data-control="shape"]');
	const typeButtons = page.locator('[data-control="type"]');
	const shapeCount = await shapeButtons.count();
	const typeCount = await typeButtons.count();
	if (shapeCount === 7) ok("console exposes 7 shape controls");
	else fail(`expected 7 shape controls, found ${shapeCount}`);
	if (typeCount === 4) ok("console exposes 4 dither controls");
	else fail(`expected 4 dither controls, found ${typeCount}`);

	// 3. Hero wordmark starts on the Warp default.
	const wordmark = page.locator("h1").first();
	const before = (await wordmark.innerText()).trim();
	if (/warp/i.test(before)) ok(`hero wordmark defaults to "${before}"`);
	else fail(`expected default wordmark "Warp", found "${before}"`);

	// 4. Selecting the Sphere shape rewires the hero.
	await page.locator('[data-control="shape"][data-value="sphere"]').click();
	await sleep(500);
	const after = (await wordmark.innerText()).trim();
	const pressed = await page
		.locator('[data-control="shape"][data-value="sphere"]')
		.getAttribute("aria-pressed");
	if (/sphere/i.test(after))
		ok(`shape control updates wordmark (${before} -> ${after})`);
	else fail(`wordmark did not update after shape click (got "${after}")`);
	if (pressed === "true") ok("selected shape reports aria-pressed=true");
	else fail("selected shape did not become aria-pressed");

	// 5. Selecting a dither kernel updates its pressed state.
	await page.locator('[data-control="type"][data-value="8x8"]').click();
	await sleep(300);
	const typePressed = await page
		.locator('[data-control="type"][data-value="8x8"]')
		.getAttribute("aria-pressed");
	if (typePressed === "true")
		ok("selected dither kernel reports aria-pressed=true");
	else fail("dither kernel did not become aria-pressed");

	// 6. Shape-library tiles mount live canvases once scrolled into view.
	await page.locator("[data-specimen]").first().scrollIntoViewIfNeeded();
	await sleep(2500);
	const specimenTiles = await page.locator("[data-specimen]").count();
	const canvasCount = await page.locator("canvas").count();
	if (specimenTiles === 7) ok("shape library renders 7 specimen tiles");
	else fail(`expected 7 specimen tiles, found ${specimenTiles}`);
	if (canvasCount >= 4) ok(`page renders ${canvasCount} live shader canvases`);
	else fail(`expected >= 4 live canvases, found ${canvasCount}`);

	// 7. No console / page errors throughout.
	if (consoleErrors.length === 0) ok("no console or page errors");
	else fail(`console errors: ${consoleErrors.slice(0, 3).join(" | ")}`);
} catch (err) {
	fail(`exception: ${err.message}`);
} finally {
	if (browser) await browser.close();
	dev.kill("SIGTERM");
}

console.log("\n=== warp-dithering-shader verification ===");
for (const r of results) console.log(r);
console.log(
	`\n${process.exitCode ? "VERIFICATION FAILED" : "ALL CHECKS PASSED"}\n`,
);
process.exit(process.exitCode || 0);
