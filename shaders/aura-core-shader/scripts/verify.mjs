#!/usr/bin/env node
/**
 * CLI-only verification for the Aura Core containment-console experiment.
 *
 * Boots the production preview server, drives a headless Chromium through the
 * page, and asserts that:
 *   1. the shader <canvas> is mounted by the AuraReactor component,
 *   2. the WebGL2 context is real and the core is actually drawing (the
 *      composited frame is heavier than an all-black page),
 *   3. the core is animating (two frames a moment apart differ),
 *   4. the field faders re-drive the shader (changing Hue repaints the frame),
 *   5. the cursor excites the field (telemetry "Excitation" climbs on move),
 *   6. the Freeze control halts the shader clock, and
 *   7. no uncaught runtime errors fire.
 *
 * Exits non-zero on any failure so it can gate the build.
 */
import { spawn, execSync } from "node:child_process";
import { chromium } from "playwright";

const PORT = 4319;
const URL = `http://localhost:${PORT}/`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Free the port up front so a leftover preview from a prior run can't hold it.
try {
	const pids = execSync(`lsof -ti tcp:${PORT} || true`).toString().trim();
	if (pids) execSync(`kill -9 ${pids.split("\n").join(" ")}`);
} catch {
	/* nothing listening — fine */
}

function waitForServer(url, tries = 60) {
	return new Promise((resolve, reject) => {
		const attempt = async (n) => {
			try {
				const res = await fetch(url);
				if (res.ok) return resolve();
			} catch {
				/* not up yet */
			}
			if (n <= 0) return reject(new Error("server never came up"));
			setTimeout(() => attempt(n - 1), 500);
		};
		attempt(tries);
	});
}

const checks = [];
const ok = (name) => checks.push({ name, pass: true });
const fail = (name, detail) => checks.push({ name, pass: false, detail });

let server;
let browser;
try {
	server = spawn(
		"npx",
		["vite", "preview", "--port", String(PORT), "--strictPort"],
		{
			stdio: "ignore",
		},
	);
	await waitForServer(URL);
	await sleep(800);

	browser = await chromium.launch({ headless: true });
	const page = await browser.newPage({
		viewport: { width: 1280, height: 800 },
	});
	const errors = [];
	page.on("pageerror", (e) => errors.push(String(e)));
	await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
	await sleep(2200); // let the core render a couple seconds

	// 1) Shader canvas mounted
	const canvas = await page.$("section canvas");
	canvas
		? ok("Shader canvas is mounted")
		: fail("Shader canvas is mounted", "no canvas found");

	// 2) Real WebGL2 context + sized
	const gl = await page.evaluate(() => {
		const c = document.querySelector("section canvas");
		if (!c) return { ctx: false };
		const g = c.getContext("webgl2");
		return { ctx: !!g, w: c.width, h: c.height };
	});
	gl.ctx
		? ok("WebGL2 context is live")
		: fail("WebGL2 context is live", "getContext returned null");
	gl.w > 0 && gl.h > 0
		? ok(`Canvas sized (${gl.w}x${gl.h})`)
		: fail("Canvas sized", `got ${gl.w}x${gl.h}`);

	// 3) Core is drawing + animating (composited screenshots; the canvas has no
	// preserveDrawingBuffer, so the compositor shot captures the real frame).
	const shotA = await page.screenshot({
		clip: { x: 0, y: 0, width: 1280, height: 800 },
	});
	await sleep(450);
	const shotB = await page.screenshot({
		clip: { x: 0, y: 0, width: 1280, height: 800 },
	});
	shotA.length > 8000
		? ok(`Core is drawing (frame ${shotA.length} bytes)`)
		: fail("Core is drawing", `frame only ${shotA.length} bytes (looks black)`);
	!shotA.equals(shotB)
		? ok("Core is animating (frames differ)")
		: fail("Core is animating", "two frames were identical");

	// 4) Field faders re-drive the shader — move the Hue slider and confirm the
	// painted frame changes.
	const before = await page.screenshot({
		clip: { x: 0, y: 0, width: 900, height: 800 },
	});
	const hue = page.getByLabel("Hue", { exact: true });
	await hue.focus();
	for (let i = 0; i < 30; i++) await page.keyboard.press("ArrowRight");
	await sleep(500);
	const after = await page.screenshot({
		clip: { x: 0, y: 0, width: 900, height: 800 },
	});
	!before.equals(after)
		? ok("Hue fader re-drives the shader")
		: fail(
				"Hue fader re-drives the shader",
				"frame unchanged after moving Hue",
			);

	// 5) Cursor excites the field — telemetry Excitation readout climbs when the
	// pointer moves toward the core center.
	const readExcite = () =>
		page.evaluate(() => {
			const labels = [...document.querySelectorAll(".uppercase")];
			const el = labels.find((n) => n.textContent?.trim() === "Excitation");
			const val = el?.parentElement?.querySelector(".tabular-nums");
			return val?.textContent?.trim() ?? null;
		});
	await page.mouse.move(200, 700, { steps: 6 });
	await sleep(250);
	const lo = await readExcite();
	await page.mouse.move(450, 400, { steps: 24 }); // toward the core in the viewport
	await sleep(350);
	const hi = await readExcite();
	lo !== null && hi !== null && lo !== hi
		? ok(`Cursor excites the field (${lo} → ${hi})`)
		: fail("Cursor excites the field", `excitation unchanged (${lo} / ${hi})`);

	// 6) Freeze halts the shader clock (the CLK readout stops advancing).
	const readClock = () =>
		page.evaluate(() => {
			const el = [...document.querySelectorAll(".tabular-nums")].find((n) =>
				/^\d{2}:\d{2}:\d{2}\.\d{2}$/.test(n.textContent?.trim() ?? ""),
			);
			return el?.textContent?.trim() ?? null;
		});
	await page.getByRole("button", { name: /freeze/i }).click();
	await sleep(150);
	const t1 = await readClock();
	await sleep(900);
	const t2 = await readClock();
	t1 && t2 && t1 === t2
		? ok("Freeze halts the shader clock")
		: fail("Freeze halts the shader clock", `t1=${t1} t2=${t2}`);

	// 7) No uncaught runtime errors
	errors.length === 0
		? ok("No uncaught runtime errors")
		: fail("No uncaught runtime errors", errors.join(" / "));
} catch (e) {
	fail("verification harness", String(e?.stack || e));
} finally {
	if (browser) await browser.close().catch(() => {});
	if (server) server.kill("SIGTERM");
}

let failed = 0;
for (const c of checks) {
	console.log(
		`${c.pass ? "PASS" : "FAIL"}  ${c.name}${c.detail ? `  — ${c.detail}` : ""}`,
	);
	if (!c.pass) failed++;
}
console.log(`\n${checks.length - failed}/${checks.length} checks passed`);
process.exit(failed ? 1 : 0);
