#!/usr/bin/env node
/**
 * Headless verification for the Mesh Gradient Hero Studio.
 *
 * Boots the Vite dev server, drives a headless Chromium (with WebGL/SwiftShader
 * forced on so the shader compiles in CI), and asserts:
 *   - the root mounts and the brand header renders
 *   - the verbatim HeroSection mounts its <canvas> with a non-empty surface and
 *     a live WebGL context (the @paper-design/shaders-react MeshGradient)
 *   - the hero headline renders with the vendored Satoshi/Onest font family
 *   - selecting a palette preset re-tints the live shader (canvas pixels change)
 *   - the geometry faders update the live readout (speed sweeps 0.00 → 2.00)
 *   - the documentation dock switches tabs (Props API table appears)
 *   - no uncaught page errors or console errors fire along the way
 *
 * Exits non-zero on any failure so it can gate CI / pre-commit.
 */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const PORT = process.env.PORT || 5321;
const URL = `http://localhost:${PORT}/`;

function startDev() {
	const dev = spawn(
		"npm",
		["run", "dev", "--", "--port", String(PORT), "--strictPort"],
		{
			stdio: ["ignore", "pipe", "pipe"],
			env: { ...process.env },
		},
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

/**
 * Average colour of the live shader canvas. We screenshot the <canvas> element
 * (Playwright captures the *composited* pixels, which works even though the
 * WebGL context has no preserveDrawingBuffer), then decode the PNG back in the
 * page to read its mean RGB. This reflects what the shader is actually painting.
 */
async function canvasSignature(page) {
	const png = await page.locator("canvas").first().screenshot();
	const b64 = png.toString("base64");
	return page.evaluate(
		(data) =>
			new Promise((resolve) => {
				const img = new Image();
				img.onload = () => {
					const c = document.createElement("canvas");
					c.width = 24;
					c.height = 16;
					const ctx = c.getContext("2d");
					if (!ctx) return resolve(null);
					ctx.drawImage(img, 0, 0, c.width, c.height);
					const { data: d } = ctx.getImageData(0, 0, c.width, c.height);
					let r = 0,
						g = 0,
						b = 0,
						n = 0;
					for (let i = 0; i < d.length; i += 4) {
						r += d[i];
						g += d[i + 1];
						b += d[i + 2];
						n++;
					}
					resolve([Math.round(r / n), Math.round(g / n), Math.round(b / n)]);
				};
				img.onerror = () => resolve(null);
				img.src = "data:image/png;base64," + data;
			}),
		b64,
	);
}

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
		viewport: { width: 1366, height: 860 },
	});
	const page = await ctx.newPage();

	const pageErrors = [];
	const consoleErrors = [];
	page.on("pageerror", (e) => pageErrors.push(String(e)));
	page.on("console", (m) => {
		if (m.type() === "error") consoleErrors.push(m.text());
	});

	await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
	await sleep(1400);

	// Header renders
	const h1 =
		(await page.locator("header h1").first().textContent())?.trim() ?? "";
	if (/Mesh Gradient/i.test(h1)) ok(`header renders ("${h1}")`);
	else bad(`header missing (got "${h1}")`);

	// Hero headline renders with the vendored font family
	const heroFont = await page.evaluate(() => {
		const h = document.querySelector("section h1");
		return h ? getComputedStyle(h).fontFamily : "";
	});
	if (/satoshi/i.test(heroFont))
		ok(`hero headline uses vendored font ("${heroFont}")`);
	else bad(`hero font family unexpected ("${heroFont}")`);

	// Canvas present, non-empty
	const box = await page.evaluate(() => {
		const c = document.querySelector("canvas");
		if (!c) return null;
		const r = c.getBoundingClientRect();
		return { w: Math.round(r.width), h: Math.round(r.height) };
	});
	if (box && box.w > 300 && box.h > 300)
		ok(`MeshGradient canvas mounts ${box.w}x${box.h}`);
	else bad(`no live canvas (${JSON.stringify(box)})`);

	// Real WebGL context
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

	// Preset re-tints the shader: compare average canvas colour before/after.
	const before = await canvasSignature(page);
	await page.getByRole("button", { name: /Ember/ }).click();
	await sleep(1100);
	const after = await canvasSignature(page);
	if (before && after) {
		const delta =
			Math.abs(before[0] - after[0]) +
			Math.abs(before[1] - after[1]) +
			Math.abs(before[2] - after[2]);
		if (delta > 12)
			ok(`preset re-tints shader (Δrgb=${delta}, ${before} → ${after})`);
		else
			bad(
				`preset did not change shader pixels (Δrgb=${delta}, ${before} → ${after})`,
			);
	} else {
		bad(`could not sample canvas (before=${before}, after=${after})`);
	}

	// Speed fader sweeps 0.00 → 2.00 and updates the readout.
	const speed = page.locator("#fader-speed");
	await speed.focus();
	await speed.press("Home");
	await sleep(250);
	const minTxt = await page.evaluate(
		() =>
			document.querySelector("#fader-speed")?.closest(".group")?.textContent ??
			"",
	);
	await speed.press("End");
	await sleep(250);
	const maxTxt = await page.evaluate(
		() =>
			document.querySelector("#fader-speed")?.closest(".group")?.textContent ??
			"",
	);
	if (/0\.00/.test(minTxt) && /2\.00/.test(maxTxt))
		ok("speed fader sweeps 0.00 → 2.00");
	else
		bad(
			`speed fader did not sweep (min="${minTxt.trim()}" max="${maxTxt.trim()}")`,
		);

	// Documentation dock switches to the Props API table.
	await page.getByRole("tab", { name: /Props API/ }).click();
	await sleep(300);
	const hasPropsRow = await page.evaluate(() =>
		Array.from(document.querySelectorAll("td")).some(
			(td) => td.textContent?.trim() === "distortion",
		),
	);
	if (hasPropsRow) ok("docs dock renders the Props API table");
	else bad("Props API table did not render");

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
