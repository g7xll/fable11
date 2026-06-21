#!/usr/bin/env node
/**
 * CLI-only verification for the Celestial Matrix shader experiment.
 *
 * Boots the production preview server, drives a headless Chromium through the
 * page, and asserts that:
 *   1. a WebGL <canvas> is mounted by the shader component,
 *   2. the WebGL context is real and the matrix is actually drawing (non-black
 *      pixels appear),
 *   3. the cursor warp drives live telemetry (the Warp readouts change when the
 *      pointer moves), and
 *   4. the freeze control pauses the feed clock.
 *
 * Exits non-zero on any failure so it can gate the build.
 */
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const PORT = 4317;
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
	await sleep(2500); // let the shader render a few seconds of matrix

	// 1) WebGL canvas mounted
	const canvas = await page.$(
		"div[aria-label='Celestial Matrix animated background'] canvas",
	);
	canvas
		? ok("WebGL canvas is mounted")
		: fail("WebGL canvas is mounted", "no canvas found");

	// 2) Real WebGL context + non-black output
	const gl = await page.evaluate(() => {
		const c = document.querySelector(
			"div[aria-label='Celestial Matrix animated background'] canvas",
		);
		if (!c) return { ctx: false };
		const g = c.getContext("webgl2") || c.getContext("webgl");
		return { ctx: !!g, w: c.width, h: c.height };
	});
	gl.ctx
		? ok("WebGL context is live")
		: fail("WebGL context is live", "getContext returned null");
	gl.w > 0 && gl.h > 0
		? ok(`Canvas sized (${gl.w}x${gl.h})`)
		: fail("Canvas sized", `got ${gl.w}x${gl.h}`);

	// Confirm the matrix is actually rendering, via composited page screenshots.
	// (Reading the WebGL canvas directly returns an empty buffer because the
	// component doesn't set preserveDrawingBuffer; the compositor screenshot
	// captures the real frame instead.) An all-black 1280x800 PNG compresses to a
	// few hundred bytes, so a frame heavier than that proves lit pixels exist, and
	// a second shot a moment later differing proves the rain is animating.
	const shotA = await page.screenshot({
		clip: { x: 0, y: 0, width: 1280, height: 800 },
	});
	await sleep(450);
	const shotB = await page.screenshot({
		clip: { x: 0, y: 0, width: 1280, height: 800 },
	});
	shotA.length > 4000
		? ok(`Matrix is drawing (frame ${shotA.length} bytes)`)
		: fail(
				"Matrix is drawing",
				`frame only ${shotA.length} bytes (looks black)`,
			);
	!shotA.equals(shotB)
		? ok("Matrix is animating (frames differ)")
		: fail("Matrix is animating", "two frames were identical");

	// 3) Cursor warp drives telemetry
	const readWarp = () =>
		page.evaluate(() => {
			const cells = [...document.querySelectorAll(".tabular-nums")].map(
				(n) => n.textContent,
			);
			return cells.join("|");
		});
	await page.mouse.move(300, 300, { steps: 10 });
	await sleep(300);
	const a = await readWarp();
	await page.mouse.move(950, 560, { steps: 18 });
	await sleep(300);
	const b = await readWarp();
	a !== b
		? ok("Cursor warp updates telemetry")
		: fail("Cursor warp updates telemetry", `readouts unchanged (${a})`);

	// 4) Freeze control halts the feed clock
	const timeNow = () =>
		page.evaluate(() => {
			const els = [...document.querySelectorAll(".font-mono.tabular-nums")];
			return els.length ? els[0].textContent : null;
		});
	await page.getByRole("button", { name: /freeze feed/i }).click();
	await sleep(150);
	const t1 = await timeNow();
	await sleep(900);
	const t2 = await timeNow();
	t1 && t2 && t1 === t2
		? ok("Freeze halts the feed clock")
		: fail("Freeze halts the feed clock", `t1=${t1} t2=${t2}`);

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
