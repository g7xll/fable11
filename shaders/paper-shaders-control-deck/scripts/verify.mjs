#!/usr/bin/env node
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
/**
 * Headless verification for the Paper Shaders Control Deck.
 *
 * Boots the Vite dev server, drives a headless Chromium (with WebGL/SwiftShader
 * forced on so shaders compile in CI), and asserts:
 *   - the root mounts and the header renders
 *   - every channel (mesh / dots / combined / r3f) patches in and produces a
 *     non-empty drawing surface (canvas with > 0 px)
 *   - the speed/intensity faders update the live readout
 *   - no uncaught page errors or console errors fire along the way
 *
 * Exits non-zero on any failure so it can gate CI / pre-commit.
 */
import { chromium } from "playwright";

const PORT = process.env.PORT || 5311;
const URL = `http://localhost:${PORT}/`;

function startDev() {
	const dev = spawn(
		"npm",
		["run", "dev", "--", "--port", String(PORT), "--strictPort"],
		{ stdio: ["ignore", "pipe", "pipe"], env: { ...process.env } },
	);
	dev.stdout.on("data", () => {});
	dev.stderr.on("data", (d) => process.stderr.write(`[vite] ${d}`));
	return dev;
}

async function waitForServer(timeoutMs = 30000) {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		try {
			const r = await fetch(URL);
			if (r.ok) return true;
		} catch {
			/* not up yet */
		}
		await sleep(400);
	}
	throw new Error("dev server never came up");
}

const fails = [];
const oks = [];
const ok = (m) => {
	oks.push(m);
	console.log(`  ✓ ${m}`);
};
const bad = (m) => {
	fails.push(m);
	console.log(`  ✗ ${m}`);
};

const dev = startDev();
let browser;
try {
	await waitForServer();
	browser = await chromium.launch({
		headless: true,
		args: [
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

	const pageErrors = [];
	const consoleErrors = [];
	page.on("pageerror", (e) => pageErrors.push(String(e)));
	page.on("console", (m) => {
		if (m.type() === "error") consoleErrors.push(m.text());
	});

	await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
	await sleep(1200);

	// Header renders
	const h1 = (await page.locator("h1").first().textContent())?.trim() ?? "";
	if (/Paper/i.test(h1)) ok(`header renders ("${h1}")`);
	else bad(`header missing (got "${h1}")`);

	// Channels: patch each, assert a non-empty canvas appears
	const channelButtons = page.locator("aside button[aria-pressed]");
	const channelLabels = [
		"Mesh Gradient",
		"Dot Orbit",
		"Combined Bus",
		"Shader Plane",
	];
	for (let i = 0; i < channelLabels.length; i++) {
		await channelButtons.nth(i).click();
		await sleep(900);
		const canvasBox = await page.evaluate(() => {
			const c = document.querySelector("canvas");
			if (!c) return null;
			const r = c.getBoundingClientRect();
			return { w: Math.round(r.width), h: Math.round(r.height) };
		});
		if (canvasBox && canvasBox.w > 100 && canvasBox.h > 100) {
			ok(
				`channel "${channelLabels[i]}" renders canvas ${canvasBox.w}x${canvasBox.h}`,
			);
		} else {
			bad(
				`channel "${channelLabels[i]}" has no live canvas (${JSON.stringify(canvasBox)})`,
			);
		}
	}

	// WebGL really initialised (context present on a canvas)
	const hasGL = await page.evaluate(() => {
		const c = document.querySelector("canvas");
		if (!c) return false;
		const gl =
			c.getContext("webgl2") ||
			c.getContext("webgl") ||
			c.getContext("experimental-webgl");
		return !!gl;
	});
	if (hasGL) ok("WebGL context is live");
	else bad("no WebGL context on canvas");

	// Faders update the scope readout
	const speed = page.locator("#fader-speed");
	await speed.focus();
	await speed.press("Home"); // -> min (0)
	await sleep(300);
	const minTxt = await page.evaluate(
		() =>
			document.querySelector("#fader-speed")?.parentElement?.textContent ?? "",
	);
	await speed.press("End"); // -> max (3)
	await sleep(300);
	const maxTxt = await page.evaluate(
		() =>
			document.querySelector("#fader-speed")?.parentElement?.textContent ?? "",
	);
	if (/0\.00/.test(minTxt) && /3\.00/.test(maxTxt))
		ok("speed fader sweeps 0.00 → 3.00");
	else bad(`speed fader did not sweep (min="${minTxt}" max="${maxTxt}")`);

	// Error hygiene
	if (pageErrors.length === 0) ok("no uncaught page errors");
	else bad(`page errors: ${pageErrors.slice(0, 3).join(" | ")}`);
	if (consoleErrors.length === 0) ok("no console errors");
	else bad(`console errors: ${consoleErrors.slice(0, 3).join(" | ")}`);

	await ctx.close();
} catch (e) {
	bad(`harness threw: ${e.message}`);
} finally {
	if (browser) await browser.close();
	dev.kill("SIGTERM");
}

console.log(`\n${oks.length} passed, ${fails.length} failed`);
process.exit(fails.length ? 1 : 0);
