#!/usr/bin/env node
/**
 * CLI-only verification for the Cybernetic Grid shader experiment.
 *
 * Boots the production preview server, drives a headless Chromium through the
 * page, and asserts that:
 *   1. a WebGL <canvas> is mounted by the shader component,
 *   2. the WebGL context is real and sized,
 *   3. the grid is actually drawing AND animating (composited frames are lit
 *      and differ over time),
 *   4. the cursor warp drives live telemetry (the Probe readouts change when
 *      the pointer moves), and
 *   5. the "Hold lattice" control freezes the field clock.
 *
 * Exits non-zero on any failure so it can gate the build.
 */
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const PORT = 4319;
const URL = `http://localhost:${PORT}/`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

const SEL = "div[aria-label='Cybernetic Grid animated background'] canvas";

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
	await sleep(2500); // let the grid render a few seconds

	// 1) WebGL canvas mounted
	const canvas = await page.$(SEL);
	canvas
		? ok("WebGL canvas is mounted")
		: fail("WebGL canvas is mounted", "no canvas found");

	// 2) Real WebGL context + sized
	const gl = await page.evaluate((sel) => {
		const c = document.querySelector(sel);
		if (!c) return { ctx: false };
		const g = c.getContext("webgl2") || c.getContext("webgl");
		return { ctx: !!g, w: c.width, h: c.height };
	}, SEL);
	gl.ctx
		? ok("WebGL context is live")
		: fail("WebGL context is live", "getContext returned null");
	gl.w > 0 && gl.h > 0
		? ok(`Canvas sized (${gl.w}x${gl.h})`)
		: fail("Canvas sized", `got ${gl.w}x${gl.h}`);

	// 3) The grid is drawing + animating, via composited page screenshots. (The
	// component doesn't set preserveDrawingBuffer, so reading the WebGL canvas
	// directly returns an empty buffer; the compositor screenshot captures the
	// real frame instead.) An all-black 1280x800 PNG compresses to a few hundred
	// bytes, so a frame heavier than that proves lit pixels exist, and a second
	// shot a moment later differing proves the field is animating.
	const shotA = await page.screenshot({
		clip: { x: 0, y: 0, width: 1280, height: 800 },
	});
	await sleep(500);
	const shotB = await page.screenshot({
		clip: { x: 0, y: 0, width: 1280, height: 800 },
	});
	shotA.length > 4000
		? ok(`Grid is drawing (frame ${shotA.length} bytes)`)
		: fail("Grid is drawing", `frame only ${shotA.length} bytes (looks black)`);
	!shotA.equals(shotB)
		? ok("Grid is animating (frames differ)")
		: fail("Grid is animating", "two frames were identical");

	// 4) Cursor warp drives telemetry (the Probe X/Y readouts change).
	const readProbe = () =>
		page.evaluate(() => {
			const cells = [...document.querySelectorAll(".tabular-nums")].map(
				(n) => n.textContent,
			);
			return cells.join("|");
		});
	await page.mouse.move(320, 300, { steps: 12 });
	await sleep(320);
	const a = await readProbe();
	await page.mouse.move(960, 560, { steps: 20 });
	await sleep(320);
	const b = await readProbe();
	a !== b
		? ok("Cursor warp updates telemetry")
		: fail("Cursor warp updates telemetry", `readouts unchanged (${a})`);

	// 5) "Hold lattice" halts the field clock (the uptime readout stops advancing).
	const uptime = () =>
		page.evaluate(() => {
			const els = [...document.querySelectorAll(".font-mono.tabular-nums")];
			// The field-uptime readout is the first mono/tabular value in the footer.
			return els.length ? els[0].textContent : null;
		});
	await page.getByRole("button", { name: /hold lattice/i }).click();
	await sleep(150);
	const t1 = await uptime();
	await sleep(900);
	const t2 = await uptime();
	t1 && t2 && t1 === t2
		? ok("Hold lattice freezes the field clock")
		: fail("Hold lattice freezes the field clock", `t1=${t1} t2=${t2}`);

	// No uncaught runtime errors
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
