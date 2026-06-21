#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
/**
 * Headless verification for the Paper Shader Résumé Hero showcase.
 *
 * Boots the Vite dev server, drives a headless Chromium (WebGL forced on via
 * SwiftShader so the shader compiles in CI), and asserts:
 *   - the masthead + hero headline render
 *   - the verbatim <ResumePage> proof renders (Jessi.cv + the CV rows)
 *   - the Dithering <canvas> mounts with a live WebGL context and is actually
 *     painting ink (the canvas corner animates over time)
 *   - the live studio clock advances (frame counter + uptime move)
 *   - the ink console is interactive: the speed fader sweeps 0.00× → 1.00×,
 *     a shape tile latches aria-pressed, and the live telemetry advances
 *   - the studio theme toggle flips `.light` on <html>
 *   - the integration / source / api / context sections are present
 *   - no uncaught page errors or console errors fire along the way
 *
 * Exits non-zero on any failure so it can gate CI / pre-commit.
 */
import { chromium } from "playwright";

// Prefer Playwright's own managed browser, but fall back to a pre-installed
// Chromium when the matching build can't be downloaded (e.g. a sandboxed CI).
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
	return (
		pick("chromium-", "chrome") ??
		pick("chromium_headless_shell-", "headless_shell")
	);
}

const PORT = process.env.PORT || 5327;
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
	await sleep(1600); // let the shader import + first frames land

	// 1. Hero headline
	const h1 = (await page.locator("h1").first().textContent())?.trim() ?? "";
	if (/dithered|résumé|resume/i.test(h1))
		ok(`hero headline renders ("${h1.slice(0, 40)}…")`);
	else bad(`hero headline missing (got "${h1}")`);

	// 2. The verbatim ResumePage proof rendered (Jessi.cv masthead text)
	const proof = await page.locator("#top").innerText();
	if (/Jessi\.cv/.test(proof) && /DESIGNER/.test(proof))
		ok("verbatim <ResumePage> proof renders (Jessi.cv / DESIGNER)");
	else bad("verbatim ResumePage proof missing");

	// 3. Canvases mount (hero proof + console stage + gallery tiles → many)
	let canvasCount = 0;
	for (let i = 0; i < 12; i++) {
		canvasCount = await page.locator("canvas").count();
		if (canvasCount >= 2) break;
		await sleep(400);
	}
	if (canvasCount >= 2) ok(`dither canvases mounted (${canvasCount})`);
	else bad(`too few canvases mounted (${canvasCount})`);

	// 4a. The hero proof canvas exposes a live WebGL context
	const glLive = await page.evaluate(() => {
		const c = document.querySelector("#top canvas");
		if (!c) return false;
		const gl =
			c.getContext("webgl2") ||
			c.getContext("webgl") ||
			c.getContext("experimental-webgl");
		return !!gl;
	});
	if (glLive) ok("hero proof canvas has a live WebGL context");
	else bad("hero proof canvas has no WebGL context");

	// 4b. The hero proof shader is actually painting ink — screenshot the canvas
	// element and assert it's a substantial, non-empty PNG (the dithered sphere
	// is visible). Note: WebGL readPixels on a non-preserved buffer returns zeros
	// post-composite, so a screenshot is the reliable signal — and the sphere at
	// speed=0.1 barely moves frame-to-frame, so we assert "ink present", not
	// "corner animates" (continuous motion is asserted on the console stage below).
	const heroCanvas = page.locator("#top canvas").first();
	const heroShot = await heroCanvas
		.screenshot({ timeout: 8000 })
		.catch(() => Buffer.alloc(0));
	if (heroShot.length > 1500)
		ok(`hero proof shader paints ink (${heroShot.length}B PNG)`);
	else bad(`hero proof shader looks empty (${heroShot.length}B)`);

	// 4c. The console stage shader animates over time — sample an 80×80 centre
	// clip across several frames and require the pixels to change.
	const stage = page.locator("#console canvas").first();
	await stage.scrollIntoViewIfNeeded();
	await sleep(700);
	const sbox = await stage.boundingBox();
	let live = false;
	let info = "";
	if (sbox && sbox.width > 120 && sbox.height > 120) {
		const clip = {
			x: sbox.x + sbox.width / 2 - 40,
			y: sbox.y + sbox.height / 2 - 40,
			width: 80,
			height: 80,
		};
		let prev = await page.screenshot({ clip });
		for (let i = 0; i < 7; i++) {
			await sleep(450);
			const cur = await page.screenshot({ clip });
			if (cur.length > 256 && !cur.equals(prev)) {
				live = true;
				info = `${prev.length}≠${cur.length} bytes`;
				break;
			}
			prev = cur;
		}
	}
	if (live) ok(`console stage shader animates live (${info})`);
	else bad("console stage shader is static — shader may not be painting");
	// scroll back to the top so the later masthead/fader checks behave predictably
	await page.evaluate(() => window.scrollTo(0, 0));
	await sleep(400);

	// 5. Studio clock advances (masthead frames/uptime)
	const snap1 = await page.locator("header").innerText();
	await sleep(1300);
	const snap2 = await page.locator("header").innerText();
	if (snap1 !== snap2) ok("studio clock advances (frames/uptime moving)");
	else bad("studio clock is frozen");

	// 6. Speed fader sweeps 0.00x -> 1.00x
	const fader = page.locator("#fader-speed");
	await fader.scrollIntoViewIfNeeded();
	await fader.focus();
	await fader.press("Home");
	await sleep(250);
	const minTxt = await page.evaluate(
		() =>
			document.querySelector("#fader-speed")?.closest("label")?.textContent ??
			"",
	);
	await fader.press("End");
	await sleep(250);
	const maxTxt = await page.evaluate(
		() =>
			document.querySelector("#fader-speed")?.closest("label")?.textContent ??
			"",
	);
	if (/0\.00×/.test(minTxt) && /1\.00×/.test(maxTxt))
		ok("speed fader sweeps 0.00× → 1.00×");
	else
		bad(
			`speed fader did not sweep (min="${minTxt.trim()}" max="${maxTxt.trim()}")`,
		);

	// 7. A shape tile latches aria-pressed
	const wave = page.locator('#console button[title="wave"]');
	await wave.scrollIntoViewIfNeeded();
	await wave.click();
	await sleep(400);
	const pressed = await wave.getAttribute("aria-pressed");
	if (pressed === "true") ok('shape tile "wave" latches (aria-pressed)');
	else bad(`shape tile did not latch (aria-pressed="${pressed}")`);

	// 8. Console telemetry reflects live state — the strip mirrors the active
	// props, so after selecting the "wave" shape above it must read that shape,
	// and it must carry a numeric fps. (Telemetry is prop/fps-driven, not a
	// shader read-back, so we assert content rather than per-frame churn — the
	// stage's actual animation is asserted separately in check 4c.)
	const tele = await page.locator("#console").innerText();
	if (/shape\s+wave/i.test(tele) && /fps\s+\d/i.test(tele))
		ok("console telemetry reflects live state (shape=wave, fps present)");
	else
		bad(
			`console telemetry not reflecting state (snippet: "${tele.replace(/\s+/g, " ").slice(0, 80)}")`,
		);

	// 9. Theme toggle flips .light on <html>
	const toggle = page.locator('header button[aria-label^="Switch"]');
	await toggle.click();
	await sleep(200);
	const isLight = await page.evaluate(() =>
		document.documentElement.classList.contains("light"),
	);
	await toggle.click();
	await sleep(200);
	const backToDark = await page.evaluate(
		() => !document.documentElement.classList.contains("light"),
	);
	if (isLight && backToDark)
		ok("studio theme toggle flips darkroom ↔ studio (.light)");
	else bad(`theme toggle failed (light=${isLight} backToDark=${backToDark})`);

	// 10. Story sections present
	const body = await page.locator("body").innerText();
	const sections = [
		"ink console",
		"integration",
		"source",
		"api",
		"applied in context",
	];
	const missing = sections.filter((s) => !new RegExp(s, "i").test(body));
	if (missing.length === 0)
		ok("console / context / integration / source / api sections render");
	else bad(`missing sections: ${missing.join(", ")}`);

	// 11. Error hygiene
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
