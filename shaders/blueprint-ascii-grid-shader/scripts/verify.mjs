#!/usr/bin/env node
/**
 * CLI-only verification for the Gridline shader showcase.
 *
 * No GUI / no clicking. It boots the Vite dev server, loads the page in a
 * headless Chromium with a software WebGL2 backend (SwiftShader), and asserts:
 *   1. WebGL2 is actually available in the headless context.
 *   2. The page paints at least one canvas with a non-zero drawing buffer.
 *   3. No console errors leak out — in particular no GLSL compile / link errors
 *      (the component logs "compile error" / "link error" via console.error).
 *   4. The render loop is live: the hero HUD's iTime advances and FPS > 0.
 *   5. The background canvas is a deep-navy field, not black and not the red
 *      error-fill (mean blue > mean red, with real brightness) — read back by
 *      drawing the WebGL canvas into a 2D canvas and sampling pixels.
 *
 * Usage: node scripts/verify.mjs [port]
 */
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const PORT = Number(process.argv[2]) || 5180;
const URL = `http://localhost:${PORT}/`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const pass = [];
const fail = [];
const check = (ok, msg) => (ok ? pass : fail).push(msg);

async function waitForServer(url, tries = 80) {
	for (let i = 0; i < tries; i++) {
		try {
			const res = await fetch(url);
			if (res.ok) return true;
		} catch {
			/* not up yet */
		}
		await sleep(500);
	}
	return false;
}

const dev = spawn("npx", ["vite", "--port", String(PORT), "--strictPort"], {
	stdio: ["ignore", "pipe", "pipe"],
});
let devLog = "";
dev.stdout.on("data", (d) => (devLog += d));
dev.stderr.on("data", (d) => (devLog += d));

let browser;
let exitCode = 0;
try {
	const up = await waitForServer(URL);
	if (!up) {
		console.error(`Dev server never came up.\n${devLog}`);
		process.exit(5);
	}

	browser = await chromium.launch({
		headless: true,
		// Allow pointing at a pre-provisioned Chromium when the Playwright CDN is
		// unreachable (e.g. CI / sandboxes). Falls back to the bundled browser.
		executablePath: process.env.PW_CHROMIUM_PATH || undefined,
		args: [
			"--no-sandbox",
			"--use-gl=angle",
			"--use-angle=swiftshader",
			"--enable-unsafe-swiftshader",
			"--ignore-gpu-blocklist",
			"--enable-webgl",
		],
	});
	const page = await browser.newPage({
		viewport: { width: 1280, height: 800 },
	});

	const errors = [];
	page.on("console", (m) => {
		if (m.type() === "error") errors.push(m.text());
	});
	page.on("pageerror", (e) => errors.push(String(e)));

	await page.goto(URL, { waitUntil: "load", timeout: 60000 });

	// 1. WebGL2 available in this headless backend.
	const hasWebGL2 = await page.evaluate(
		() => !!document.createElement("canvas").getContext("webgl2"),
	);
	check(hasWebGL2, "WebGL2 context is available (SwiftShader)");

	// Give the rAF loop time to compile, link and draw several frames.
	await sleep(2500);

	// 2. A canvas with a real drawing buffer exists.
	const canvasInfo = await page.evaluate(() => {
		const c = document.querySelector("canvas");
		return c ? { w: c.width, h: c.height } : null;
	});
	check(
		!!canvasInfo && canvasInfo.w > 0 && canvasInfo.h > 0,
		`Background canvas painted (${canvasInfo ? `${canvasInfo.w}×${canvasInfo.h}` : "missing"})`,
	);

	// 4. Render loop is live — iTime advances and FPS reads > 0.
	const num = (s) => {
		const m = (s || "").match(/-?\d+(?:\.\d+)?/);
		return m ? parseFloat(m[0]) : NaN;
	};
	const readHud = () =>
		page.evaluate(() => ({
			time:
				document.querySelector('[data-telemetry="time"]')?.textContent ?? "",
			fps: document.querySelector('[data-telemetry="fps"]')?.textContent ?? "",
		}));
	const t1 = await readHud();
	await sleep(1200);
	const t2 = await readHud();
	const time1 = num(t1.time);
	const time2 = num(t2.time);
	const fps = num(t2.fps);
	check(
		Number.isFinite(time1) && Number.isFinite(time2) && time2 > time1,
		`iTime advances (${time1} → ${time2})`,
	);
	check(Number.isFinite(fps) && fps > 0, `FPS reads positive (${fps})`);

	// 5. Pixel readback via a real screenshot of the canvas (works regardless of
	//    preserveDrawingBuffer — the screenshot is the composited, presented frame).
	const shot = await page.locator("canvas").first().screenshot();
	await page.screenshot({ path: "/tmp/gridline-hero.png" });
	const px = await page.evaluate(
		async (dataUrl) => {
			const img = new Image();
			await new Promise((res, rej) => {
				img.onload = () => res(null);
				img.onerror = rej;
				img.src = dataUrl;
			});
			const cv = document.createElement("canvas");
			cv.width = img.naturalWidth;
			cv.height = img.naturalHeight;
			const ctx = cv.getContext("2d");
			if (!ctx) return null;
			ctx.drawImage(img, 0, 0);
			let r = 0,
				g = 0,
				b = 0,
				n = 0;
			const pts = [
				[0.5, 0.5],
				[0.25, 0.3],
				[0.75, 0.7],
				[0.15, 0.8],
				[0.85, 0.2],
			];
			for (const [fx, fy] of pts) {
				const x = Math.floor(cv.width * fx);
				const y = Math.floor(cv.height * fy);
				const d = ctx.getImageData(x, y, 1, 1).data;
				r += d[0];
				g += d[1];
				b += d[2];
				n++;
			}
			return { r: r / n, g: g / n, b: b / n };
		},
		`data:image/png;base64,${shot.toString("base64")}`,
	);
	const bright = px ? (px.r + px.g + px.b) / 3 : 0;
	check(
		!!px && bright > 6,
		`Canvas is not black (mean rgb ≈ ${bright.toFixed(1)})`,
	);
	check(
		!!px && px.b >= px.r,
		`Field reads navy, not error-red (b=${px ? px.b.toFixed(0) : "?"} ≥ r=${px ? px.r.toFixed(0) : "?"})`,
	);

	// 3. No console / page errors (shader compile/link failures land here).
	const shaderErrs = errors.filter((e) =>
		/compile error|link error|webgl|shader/i.test(e),
	);
	check(
		shaderErrs.length === 0,
		`No shader compile/link errors${shaderErrs.length ? `: ${shaderErrs.join(" | ")}` : ""}`,
	);
	check(
		errors.length === 0,
		`No console errors${errors.length ? `: ${errors.slice(0, 3).join(" | ")}` : ""}`,
	);
} catch (e) {
	fail.push(`Threw: ${e?.message ?? String(e)}`);
	exitCode = 1;
} finally {
	if (browser) await browser.close();
	dev.kill("SIGTERM");
}

console.log("\n— Gridline shader verification —");
for (const p of pass) console.log(`  ✓ ${p}`);
for (const f of fail) console.log(`  ✗ ${f}`);
console.log(`\n${pass.length} passed, ${fail.length} failed.`);
process.exit(fail.length ? 1 : exitCode);
