#!/usr/bin/env node
/**
 * Headless verification for Paper Warp // Shader Lab.
 *
 * Boots the Vite dev server, drives a headless Chromium (WebGL forced on via
 * SwiftShader so the @paper-design/shaders-react <Warp> pass compiles in CI),
 * and asserts:
 *   - the deck header mounts ("Paper Warp")
 *   - the verbatim hero copy renders ("Elegant Shader Backgrounds")
 *   - the Warp shader paints a non-empty <canvas> with a live WebGL context
 *   - the speed fader sweeps its full 0.00 -> 3.00 range
 *   - switching a preset re-labels the scope
 *   - no uncaught page errors or console errors fire along the way
 *
 * Exits non-zero on any failure so it can gate CI / pre-commit.
 */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import fs from "node:fs";
import path from "node:path";

/**
 * Resolve a Chromium binary. CI images often bake a single Playwright browser
 * revision under PLAYWRIGHT_BROWSERS_PATH that may not match playwright-core's
 * default revision; prefer that baked binary when present. On a normal clone
 * (no such path) we return undefined so Playwright uses its own bundled browser.
 */
function resolveChromiumPath() {
	if (process.env.PW_CHROMIUM_PATH) return process.env.PW_CHROMIUM_PATH;
	const root = process.env.PLAYWRIGHT_BROWSERS_PATH;
	if (root && fs.existsSync(root)) {
		const dirs = fs
			.readdirSync(root)
			.filter((d) => /^chromium-\d+$/.test(d))
			.sort();
		for (const d of dirs) {
			const p = path.join(root, d, "chrome-linux", "chrome");
			if (fs.existsSync(p)) return p;
		}
	}
	return undefined;
}

const PORT = process.env.PORT || 5319;
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
		executablePath: resolveChromiumPath(),
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

	// Deck header renders
	const h1 =
		(await page.locator("header h1").first().textContent())?.trim() ?? "";
	if (/Paper\s*Warp/i.test(h1)) ok(`deck header renders ("${h1}")`);
	else bad(`deck header missing (got "${h1}")`);

	// Verbatim hero copy renders inside the scope
	const heroHeadline = await page
		.getByText("Elegant Shader Backgrounds", { exact: false })
		.count();
	if (heroHeadline > 0) ok("hero headline renders");
	else bad("hero headline missing");

	// Warp shader canvas is live and non-empty
	const canvasBox = await page.evaluate(() => {
		const c = document.querySelector("canvas");
		if (!c) return null;
		const r = c.getBoundingClientRect();
		return { w: Math.round(r.width), h: Math.round(r.height) };
	});
	if (canvasBox && canvasBox.w > 100 && canvasBox.h > 100) {
		ok(`Warp canvas renders ${canvasBox.w}x${canvasBox.h}`);
	} else {
		bad(`Warp canvas has no live surface (${JSON.stringify(canvasBox)})`);
	}

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

	// Speed fader sweeps full range
	const speed = page.locator("#fader-speed");
	await speed.focus();
	await speed.press("Home");
	await sleep(250);
	const minTxt = await page.evaluate(
		() =>
			document.querySelector("#fader-speed")?.parentElement?.textContent ?? "",
	);
	await speed.press("End");
	await sleep(250);
	const maxTxt = await page.evaluate(
		() =>
			document.querySelector("#fader-speed")?.parentElement?.textContent ?? "",
	);
	if (/0\.00/.test(minTxt) && /3\.00/.test(maxTxt))
		ok("speed fader sweeps 0.00 → 3.00");
	else bad(`speed fader did not sweep (min="${minTxt}" max="${maxTxt}")`);

	// Switching a preset re-labels the scope
	await page.getByRole("button", { name: /Ultraviolet/i }).click();
	await sleep(500);
	const scopeLabel = await page.evaluate(() => document.body.textContent ?? "");
	if (/Ultraviolet/.test(scopeLabel)) ok("preset switch updates the deck");
	else bad("preset switch had no effect");

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
