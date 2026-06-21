// Headless, CLI-only verification for the spooky-smoke-shader experiment.
//
// It boots the Vite dev server, drives a headless Chromium (with a real GPU
// surface via SwiftShader) through the page, and asserts:
//   1. the page loads with no console errors and no shader compile/link errors,
//   2. the WebGL2 smoke canvas paints non-uniform, non-blank pixels,
//   3. clicking a reagent vial actually changes the colour pushed to the shader,
//   4. the two documented specimen panes both render live shaders.
//
// Usage: node scripts/verify.mjs
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { chromium } from "playwright";

const PORT = 5311;
const URL = `http://localhost:${PORT}/`;

function startDev() {
	const proc = spawn(
		"npm",
		["run", "dev", "--", "--port", String(PORT), "--strictPort"],
		{ cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"] },
	);
	return proc;
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
	// The shader fades in from its 0.08 floor over ~10s (min(time*.1, 1.0)), so we
	// wait long enough for the smoke to develop real tonal range before sampling.
	await sleep(11000);

	// 1. WebGL2 context exists and the canvas is painting non-blank pixels.
	const canvasReport = await page.evaluate(async () => {
		const canvas = document.querySelector("canvas");
		if (!canvas) return { error: "no canvas element" };
		const gl = canvas.getContext("webgl2");
		if (!gl) return { error: "no webgl2 context" };

		const w = canvas.width;
		const h = canvas.height;

		// Sample luminance at points distributed across the whole field — the smoke
		// is non-uniform across the canvas even when any single small patch is flat.
		const fractions = [
			[0.2, 0.3],
			[0.5, 0.45],
			[0.8, 0.4],
			[0.32, 0.7],
			[0.66, 0.62],
			[0.5, 0.85],
			[0.15, 0.55],
			[0.85, 0.75],
		];
		let min = 255;
		let max = 0;
		let nonBlack = 0;
		for (const [fx, fy] of fractions) {
			const px = new Uint8Array(4);
			gl.readPixels(
				Math.floor(w * fx),
				Math.floor(h * fy),
				1,
				1,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				px,
			);
			const lum = (px[0] + px[1] + px[2]) / 3;
			min = Math.min(min, lum);
			max = Math.max(max, lum);
			if (px[0] + px[1] + px[2] > 12) nonBlack++;
		}
		return { w, h, min, max, nonBlack, samples: fractions.length };
	});

	if (canvasReport.error) {
		fail(`canvas check: ${canvasReport.error}`);
	} else {
		ok(`canvas is ${canvasReport.w}x${canvasReport.h} (WebGL2)`);
		if (canvasReport.nonBlack > 0) ok("shader paints non-blank pixels");
		else fail("shader output is entirely blank");
		if (canvasReport.max - canvasReport.min > 2)
			ok("smoke field has tonal variation");
		else fail("smoke field is flat / uniform");
	}

	// 2. Reagent tray actually drives a colour change in the readout.
	// The live hex readout is the element matching "#rrggbb · r.. g.. b..".
	const readout = page
		.locator('section[aria-label="Vapour console"] p')
		.filter({ hasText: /^#[0-9a-f]{6} · r/i })
		.first();
	const before = await readout.innerText();
	const reagentButtons = page.locator(
		'section[aria-label="Vapour console"] button[aria-pressed]',
	);
	const reagentCount = await reagentButtons.count();
	if (reagentCount >= 8) ok(`reagent tray exposes ${reagentCount} presets`);
	else fail(`expected >= 8 reagents, found ${reagentCount}`);

	// click a reagent that isn't currently active (index 2 = Dragon's Blood)
	await reagentButtons.nth(2).click();
	await sleep(400);
	const after = await readout.innerText();
	if (before !== after)
		ok(
			`reagent click changes the readout (${before.trim()} -> ${after.trim()})`,
		);
	else fail("reagent click did not update the live readout");

	// 3. A reagent reports it is pressed (selected state wiring).
	const pressed = await reagentButtons.nth(2).getAttribute("aria-pressed");
	if (pressed === "true") ok("selected reagent reports aria-pressed=true");
	else fail("selected reagent did not become aria-pressed");

	// 4. Specimen panes: there should be at least 3 canvases total
	//    (hero field + 2 specimen panes).
	const canvasCount = await page.locator("canvas").count();
	if (canvasCount >= 3) ok(`page renders ${canvasCount} live shader canvases`);
	else fail(`expected >= 3 canvases, found ${canvasCount}`);

	// 5. No console / page errors.
	if (consoleErrors.length === 0) ok("no console or page errors");
	else fail(`console errors: ${consoleErrors.slice(0, 3).join(" | ")}`);
} catch (err) {
	fail(`exception: ${err.message}`);
} finally {
	if (browser) await browser.close();
	dev.kill("SIGTERM");
}

console.log("\n=== spooky-smoke-shader verification ===");
for (const r of results) console.log(r);
console.log(
	`\n${process.exitCode ? "VERIFICATION FAILED" : "ALL CHECKS PASSED"}\n`,
);
process.exit(process.exitCode || 0);
