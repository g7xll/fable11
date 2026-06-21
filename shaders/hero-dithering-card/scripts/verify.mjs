#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
/**
 * Headless verification for the Hero Dithering Card showcase.
 *
 * Boots the Vite dev server, drives a headless Chromium (WebGL forced on via
 * SwiftShader so the shader compiles in CI), and asserts:
 *   - the masthead + hero headline render
 *   - the hero dither <canvas> mounts with a live WebGL context and is actually
 *     painting ink (non-empty pixels when composited)
 *   - the live press telemetry advances (frame counter + uptime move)
 *   - the ink console is interactive: the speed fader sweeps 0.00× → 1.00× and a
 *     shape button latches aria-pressed
 *   - the paper/lights-out theme toggle flips `.dark` on <html>
 *   - the integration / source / API sections are present
 *   - no uncaught page errors or console errors fire along the way
 *
 * Exits non-zero on any failure so it can gate CI / pre-commit.
 */
import { chromium } from "playwright";

// Prefer Playwright's own managed browser, but fall back to a pre-installed
// Chromium when the matching build can't be downloaded (e.g. a sandboxed CI with
// no access to the Playwright CDN). Returns undefined to use the default.
function resolveExecutable() {
	const env = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
	if (env && existsSync(env)) return env;
	const root = "/opt/pw-browsers";
	if (!existsSync(root)) return undefined;
	const dirs = readdirSync(root);
	const pick = (prefix, leaf) =>
		dirs
			.filter((d) => d.startsWith(prefix))
			.sort()
			.reverse()
			.map((d) => `${root}/${d}/chrome-linux/${leaf}`)
			.find((p) => existsSync(p));
	// Full chromium first (WebGL via SwiftShader); headless shell as a fallback.
	return (
		pick("chromium-", "chrome") ??
		pick("chromium_headless_shell-", "headless_shell")
	);
}

const PORT = process.env.PORT || 5319;
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

const dev = startDev();
let browser;
try {
	await waitForServer();
	browser = await chromium.launch({
		headless: true,
		executablePath: resolveExecutable(),
		args: [
			"--use-gl=angle",
			"--use-angle=swiftshader",
			"--enable-unsafe-swiftshader",
			"--ignore-gpu-blocklist",
		],
	});
	const ctx = await browser.newContext({
		viewport: { width: 1280, height: 900 },
	});
	const page = await ctx.newPage();

	const pageErrors = [];
	const consoleErrors = [];
	page.on("pageerror", (e) => pageErrors.push(String(e)));
	page.on("console", (m) => {
		if (m.type() === "error") consoleErrors.push(m.text());
	});

	await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
	await sleep(1500); // let the lazy shader import + first frames land

	// 1. Masthead + hero headline
	const h1 = (await page.locator("h1").first().textContent())?.trim() ?? "";
	if (/components\/ui|pressed/i.test(h1))
		ok(`hero headline renders ("${h1.slice(0, 42)}…")`);
	else bad(`hero headline missing (got "${h1}")`);

	// 2. Canvases: hero (lazy) + console (eager). Wait for both to mount.
	let canvasCount = 0;
	for (let i = 0; i < 12; i++) {
		canvasCount = await page.locator("canvas").count();
		if (canvasCount >= 2) break;
		await sleep(400);
	}
	if (canvasCount >= 2) ok(`both dither canvases mounted (${canvasCount})`);
	else if (canvasCount === 1)
		ok(`one dither canvas mounted (lazy hero may still resolve)`);
	else bad("no dither canvas mounted");

	// 3a. Hero canvas exposes a live WebGL context
	const glLive = await page.evaluate(() => {
		const c = document.querySelector("section#top canvas");
		if (!c) return false;
		const gl =
			c.getContext("webgl2") ||
			c.getContext("webgl") ||
			c.getContext("experimental-webgl");
		return !!gl;
	});
	if (glLive) ok("hero canvas has a live WebGL context");
	else bad("hero canvas has no WebGL context");

	// 3b. Hero shader is actually rendering — screenshot a corner of the card
	// (away from the centered content, so only the dither shows) and confirm the
	// pixels change over time. Reading the composited surface this way is reliable
	// where drawImage of a non-preserved WebGL buffer is not.
	const cardBox = await page
		.locator("section#top canvas")
		.first()
		.boundingBox();
	let live = false;
	let info = "";
	if (cardBox && cardBox.width > 120 && cardBox.height > 120) {
		const clip = {
			x: cardBox.x + 24,
			y: cardBox.y + 24,
			width: 80,
			height: 80,
		};
		let prev = await page.screenshot({ clip });
		for (let i = 0; i < 6; i++) {
			await sleep(500);
			const cur = await page.screenshot({ clip });
			if (cur.length > 256 && !cur.equals(prev)) {
				live = true;
				info = `${prev.length}≠${cur.length} bytes`;
				break;
			}
			prev = cur;
		}
	}
	if (live) ok(`hero shader is rendering live (corner animates, ${info})`);
	else bad("hero shader corner is static — shader may not be painting");

	// 4. Telemetry advances — the frame counter + uptime live in the hero strip
	const snap1 = await page.locator("section#top").innerText();
	await sleep(1300);
	const snap2 = await page.locator("section#top").innerText();
	if (snap1 !== snap2) ok("press telemetry advances (frames/uptime moving)");
	else bad("press telemetry is frozen");

	// 5. Speed fader sweeps 0.00× -> 1.00×
	const fader = page.locator("#fader-speed");
	await fader.focus();
	await fader.press("Home");
	await sleep(250);
	const minTxt = await page.evaluate(
		() =>
			document.querySelector("#fader-speed")?.closest("div")?.textContent ?? "",
	);
	await fader.press("End");
	await sleep(250);
	const maxTxt = await page.evaluate(
		() =>
			document.querySelector("#fader-speed")?.closest("div")?.textContent ?? "",
	);
	if (/0\.00×/.test(minTxt) && /1\.00×/.test(maxTxt))
		ok("speed fader sweeps 0.00× → 1.00×");
	else bad(`speed fader did not sweep (min="${minTxt}" max="${maxTxt}")`);

	// 6. Shape button latches
	const dots = page.getByRole("button", { name: "dots", exact: true });
	await dots.click();
	await sleep(400);
	const pressed = await dots.getAttribute("aria-pressed");
	if (pressed === "true") ok('shape "dots" latches (aria-pressed)');
	else bad(`shape button did not latch (aria-pressed="${pressed}")`);

	// 7. Theme toggle flips .dark on <html>
	const toggle = page.locator('header button[aria-label^="Switch"]');
	await toggle.click();
	await sleep(200);
	const isDark = await page.evaluate(() =>
		document.documentElement.classList.contains("dark"),
	);
	await toggle.click();
	await sleep(200);
	const backToLight = await page.evaluate(
		() => !document.documentElement.classList.contains("dark"),
	);
	if (isDark && backToLight)
		ok("theme toggle flips paper ↔ lights-out (.dark)");
	else bad(`theme toggle failed (dark=${isDark} backToLight=${backToLight})`);

	// 8. Story sections present
	const body = await page.locator("body").innerText();
	const sections = ["integration", "source", "api", "ink console"];
	const missing = sections.filter((s) => !new RegExp(s, "i").test(body));
	if (missing.length === 0)
		ok("integration / source / api / console sections render");
	else bad(`missing sections: ${missing.join(", ")}`);

	// 9. Error hygiene
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
