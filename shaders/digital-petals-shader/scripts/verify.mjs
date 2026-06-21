#!/usr/bin/env node
/**
 * CLI-only verification for the Digital Petals shader experiment.
 *
 * Boots the production preview server, drives a headless Chromium through the
 * page, and asserts that:
 *   1. a WebGL <canvas> is mounted by the shader component (under the brief's
 *      exact aria-label),
 *   2. the WebGL context is real and the bloom is actually drawing (lit,
 *      animating pixels appear),
 *   3. the cursor bloom drives live telemetry (the Bloom index changes when the
 *      pointer moves toward the plate center), and
 *   4. the "Press specimen" control freezes the growth clock.
 *
 * Exits non-zero on any failure so it can gate the build.
 */
import { execSync, spawn } from "node:child_process";
import { chromium } from "playwright";

const PORT = 4319;
const URL = `http://localhost:${PORT}/`;
const SHADER = "div[aria-label='Digital Petals animated background']";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Free the port up front so a leftover preview server from a prior run can't
// make this invocation fail spuriously (vite preview can hold the port briefly
// after SIGTERM). Best-effort: ignore if nothing is listening.
function freePort(port) {
	try {
		const pids = execSync(`lsof -ti :${port} 2>/dev/null || true`)
			.toString()
			.trim();
		if (pids) {
			for (const pid of pids.split(/\s+/)) {
				try {
					process.kill(Number(pid), "SIGKILL");
				} catch {
					/* already gone */
				}
			}
		}
	} catch {
		/* lsof unavailable — fall through, strictPort will surface a clear error */
	}
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

// Read the textual "Growth clock" value (mm:ss) from the cultivation log.
const readClock = (page) =>
	page.evaluate(() => {
		const cells = [...document.querySelectorAll(".font-mono.tabular-nums")];
		const clock = cells.find((c) =>
			/^\d{2}:\d{2}$/.test((c.textContent || "").trim()),
		);
		return clock ? clock.textContent.trim() : null;
	});

// Read the "Bloom index" percentage from the cultivation log.
const readBloom = (page) =>
	page.evaluate(() => {
		const nodes = [...document.querySelectorAll("div")];
		const label = nodes.find(
			(n) => (n.textContent || "").trim() === "Bloom index",
		);
		if (!label) return null;
		// value lives in the sibling .font-display node within the same card
		const card = label.closest(".glass") || label.parentElement?.parentElement;
		const val = card?.querySelector(".font-display");
		return val ? val.textContent.trim() : null;
	});

let server;
let browser;
try {
	freePort(PORT);
	await sleep(400);
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
	await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 });

	// Wait for React to actually mount the tree before asserting. `vite preview`
	// serves a production build with an empty #root until the JS hydrates it, and
	// the long-lived WebGL RAF loop can keep "networkidle" from being a reliable
	// proxy for "rendered" — so we explicitly wait for the elements we test.
	await page.waitForSelector(`${SHADER} canvas`, { timeout: 30000 });
	await page.waitForSelector("button", { timeout: 30000 });
	await sleep(2500); // let the bloom render a few seconds

	// 1) WebGL canvas mounted under the brief's aria-label
	const canvas = await page.$(`${SHADER} canvas`);
	canvas
		? ok("WebGL canvas is mounted")
		: fail("WebGL canvas is mounted", "no canvas found");

	// 2) Real WebGL context + sized canvas
	const gl = await page.evaluate((sel) => {
		const c = document.querySelector(`${sel} canvas`);
		if (!c) return { ctx: false };
		const g = c.getContext("webgl2") || c.getContext("webgl");
		return { ctx: !!g, w: c.width, h: c.height };
	}, SHADER);
	gl.ctx
		? ok("WebGL context is live")
		: fail("WebGL context is live", "getContext returned null");
	gl.w > 0 && gl.h > 0
		? ok(`Canvas sized (${gl.w}x${gl.h})`)
		: fail("Canvas sized", `got ${gl.w}x${gl.h}`);

	// Confirm the bloom is actually rendering via composited screenshots. (The
	// component doesn't set preserveDrawingBuffer, so reading the WebGL buffer
	// directly returns empty; the compositor screenshot captures the real frame.)
	// An all-black 1280x800 PNG compresses tiny, so a heavy frame proves lit
	// pixels exist, and a second shot differing proves the corolla is animating.
	const shotA = await page.screenshot({
		clip: { x: 0, y: 0, width: 1280, height: 800 },
	});
	await sleep(450);
	const shotB = await page.screenshot({
		clip: { x: 0, y: 0, width: 1280, height: 800 },
	});
	shotA.length > 4000
		? ok(`Bloom is drawing (frame ${shotA.length} bytes)`)
		: fail(
				"Bloom is drawing",
				`frame only ${shotA.length} bytes (looks black)`,
			);
	!shotA.equals(shotB)
		? ok("Corolla is animating (frames differ)")
		: fail("Corolla is animating", "two frames were identical");

	// 3) Cursor bloom drives live telemetry. Move pointer to a far corner, read
	// the bloom index, then move to the plate center and read it again — the
	// shader's `bloom = smoothstep(0.4, 0.0, dist)` peaks at center, so the
	// readout must change.
	await page.mouse.move(40, 40, { steps: 8 });
	await sleep(350);
	const bloomCorner = await readBloom(page);
	await page.mouse.move(640, 400, { steps: 18 });
	await sleep(400);
	const bloomCenter = await readBloom(page);
	bloomCorner !== null && bloomCenter !== null && bloomCorner !== bloomCenter
		? ok(`Cursor seeds bloom (corner ${bloomCorner} → center ${bloomCenter})`)
		: fail("Cursor seeds bloom", `corner=${bloomCorner} center=${bloomCenter}`);

	// 4) "Press specimen" freezes the growth clock
	await page.getByRole("button", { name: /press specimen/i }).click();
	await sleep(150);
	const t1 = await readClock(page);
	await sleep(1100);
	const t2 = await readClock(page);
	t1 && t2 && t1 === t2
		? ok(`Press specimen freezes the growth clock (held at ${t1})`)
		: fail("Press specimen freezes the growth clock", `t1=${t1} t2=${t2}`);

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
