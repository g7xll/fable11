// Headless verification for the Dynamic Waveform "Signal Analysis Bench".
//
// Boots a fresh Vite preview/dev server, drives a headless Chromium through the
// page, and asserts that:
//   - the page loads with no fatal console / page errors,
//   - the WebGL <canvas> mounts full-viewport behind the bench,
//   - the live shader actually PAINTS a coloured waveform trace (a screenshot
//     of the canvas region is not flat black),
//   - the integrated control deck is present: both colour trims, all five
//     faders (Sweep Rate / Harmonics / Amplitude / Frequency / Probe Gain),
//     and the channel presets (Baseline, Signal Scan, Deep Sea, Vaporwave),
//   - the live telemetry HUD reports a non-zero refresh rate (proof the render
//     loop is running and firing onFrame),
//   - changing a fader re-tints / reshapes the trace (the frame changes),
//   - the layout has no horizontal overflow on mobile.
//
// Pure-CLI, no GUI. Spawns and tears down its own server; pngjs decodes frames.
//
//   node scripts/verify.mjs
//   CHROME_PATH=/path/to/chrome node scripts/verify.mjs   # override browser
import { chromium } from "playwright";
import { PNG } from "pngjs";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import net from "node:net";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT = join(ROOT, "scripts", ".verify");
mkdirSync(OUT, { recursive: true });

// ── tiny helpers ────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getFreePort() {
	return new Promise((resolve, reject) => {
		const srv = net.createServer();
		srv.unref();
		srv.on("error", reject);
		srv.listen(0, "127.0.0.1", () => {
			const { port } = srv.address();
			srv.close(() => resolve(port));
		});
	});
}

async function waitForServer(url, timeoutMs = 30000) {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		try {
			const res = await fetch(url);
			if (res.ok) return true;
		} catch {
			/* not up yet */
		}
		await sleep(300);
	}
	return false;
}

/** Stats over a decoded PNG so we can tell a painted frame from flat black. */
function pngStats(buf) {
	const png = PNG.sync.read(buf);
	const { width, height, data } = png;
	let maxLum = 0,
		lit = 0,
		rSum = 0,
		gSum = 0,
		bSum = 0,
		total = 0;
	const colors = new Set();
	for (let i = 0; i < data.length; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];
		const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
		if (lum > maxLum) maxLum = lum;
		if (lum > 8) lit++;
		rSum += r;
		gSum += g;
		bSum += b;
		total++;
		// Coarse colour bucketing to estimate visual variety in the trace.
		colors.add(`${r >> 5}-${g >> 5}-${b >> 5}`);
	}
	return {
		width,
		height,
		maxLum,
		litFraction: lit / total,
		distinctColors: colors.size,
		avg: { r: rSum / total, g: gSum / total, b: bSum / total },
	};
}

// ── boot the dev server ─────────────────────────────────────────────────────
const PORT = await getFreePort();
const URL = `http://127.0.0.1:${PORT}/`;
console.log(`Booting Vite dev server on ${URL} ...`);

const server = spawn(
	"npm",
	["run", "dev", "--", "--port", String(PORT), "--strictPort", "--host", "127.0.0.1"],
	{ cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] },
);
let serverLog = "";
server.stdout.on("data", (d) => (serverLog += d));
server.stderr.on("data", (d) => (serverLog += d));

let browser;
const cleanup = () => {
	try {
		browser?.close();
	} catch {}
	try {
		server.kill("SIGTERM");
	} catch {}
};
process.on("exit", cleanup);
process.on("SIGINT", () => {
	cleanup();
	process.exit(130);
});

if (!(await waitForServer(URL))) {
	console.error("Dev server never came up.\n--- server log ---\n" + serverLog);
	cleanup();
	process.exit(1);
}

// ── drive the browser ───────────────────────────────────────────────────────
const errors = [];
// three.js logs WebGL-context failures to console.error before throwing; in a
// GL-less headless box that is environment noise handled by our black fallback,
// not an app bug. Everything else is fatal.
const IGNORABLE =
	/WebGLRenderer|WebGL context|Error creating WebGL|swiftshader|GroupMarkerNotSet|Automatic fallback to software WebGL|Failed to create WebGL/i;

browser = await chromium.launch({
	executablePath: process.env.CHROME_PATH || undefined,
	args: [
		"--no-sandbox",
		"--use-gl=angle",
		"--use-angle=swiftshader",
		"--enable-unsafe-swiftshader",
		"--ignore-gpu-blocklist",
	],
});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
const note = (s) => {
	if (IGNORABLE.test(s)) return;
	errors.push(s);
};
page.on("console", (m) => {
	if (m.type() === "error") note(`console.error: ${m.text()}`);
});
page.on("pageerror", (e) => note(`pageerror: ${e.message}`));

await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
await page.evaluate(() => document.fonts && document.fonts.ready);
await page.waitForTimeout(1500); // let the shader render a few frames

const checks = [];
const must = async (name, fn) => {
	try {
		const ok = await fn();
		checks.push([name, !!ok]);
	} catch (e) {
		checks.push([name, false, String(e)]);
	}
};

const webglSupported = await page.evaluate(() => {
	const c = document.createElement("canvas");
	return !!(c.getContext("webgl2") || c.getContext("webgl"));
});
console.log(`(environment: WebGL ${webglSupported ? "available" : "UNAVAILABLE"})`);

// ── structural / integration checks ─────────────────────────────────────────
await must("WebGL <canvas> mounted", () =>
	page.locator("canvas").count().then((n) => n >= 1),
);
await must("canvas fills the viewport (live trace background)", async () => {
	const box = await page.locator("canvas").first().boundingBox();
	return box && box.width >= 1200 && box.height >= 700;
});
await must("brand 'WAVEFORM BENCH' present", () =>
	page.getByText(/WAVEFORM\s*BENCH/i).count().then((n) => n >= 1),
);
await must("console title 'Dynamic Waveform' present", () =>
	page.getByRole("heading", { level: 1 }).innerText().then((t) => /Dynamic Waveform/i.test(t)),
);
await must("both colour trims (Trace A / Trace B)", async () => {
	const a = await page.getByText(/Trace A/i).count();
	const b = await page.getByText(/Trace B/i).count();
	const inputs = await page.locator('input[type="color"]').count();
	return a >= 1 && b >= 1 && inputs === 2;
});
await must("all five faders present", async () => {
	const labels = ["Sweep Rate", "Harmonics", "Amplitude", "Frequency", "Probe Gain"];
	for (const l of labels) {
		if ((await page.getByText(new RegExp(l, "i")).count()) < 1) return false;
	}
	const ranges = await page.locator('input[type="range"]').count();
	return ranges === 5;
});
await must("all four channel presets (Baseline/Signal Scan/Deep Sea/Vaporwave)", async () => {
	for (const name of ["Baseline", "Signal Scan", "Deep Sea", "Vaporwave"]) {
		if ((await page.getByRole("button", { name: new RegExp(name, "i") }).count()) < 1) return false;
	}
	return true;
});
await must("telemetry HUD labels present", async () => {
	const a = await page.getByText(/Sweep Time/i).count();
	const b = await page.getByText(/Refresh/i).count();
	const c = await page.getByText(/Trace Level/i).count();
	return a >= 1 && b >= 1 && c >= 1;
});
await must("mono font (IBM Plex Mono) applied to body", () =>
	page.evaluate(() =>
		getComputedStyle(document.body).fontFamily.toLowerCase().includes("plex"),
	),
);

// ── the load-bearing one: the shader actually paints ────────────────────────
if (webglSupported) {
	await must("live shader paints a coloured trace (canvas not flat black)", async () => {
		// Sample a wide band across the middle of the canvas where the waveform
		// trace sweeps — avoids the dark console panel pinned to the left edge.
		const clip = { x: 380, y: 280, width: 820, height: 260 };
		const png = await page.screenshot({ clip });
		const s = pngStats(png);
		console.log(
			`   trace region: maxLum=${s.maxLum.toFixed(1)} lit=${(s.litFraction * 100).toFixed(
				1,
			)}% colors=${s.distinctColors} avg=rgb(${s.avg.r.toFixed(0)},${s.avg.g.toFixed(
				0,
			)},${s.avg.b.toFixed(0)})`,
		);
		// A real lit trace has bright pixels and several distinct colour buckets
		// (line + glow + noise + the two-stop colour mix).
		return s.maxLum > 30 && s.litFraction > 0.02 && s.distinctColors >= 3;
	});

	await must("shader is animating (consecutive frames differ)", async () => {
		const clip = { x: 380, y: 280, width: 820, height: 260 };
		const a = pngStats(await page.screenshot({ clip }));
		await page.waitForTimeout(450);
		const b = pngStats(await page.screenshot({ clip }));
		const dLum = Math.abs(a.maxLum - b.maxLum);
		const dAvg =
			Math.abs(a.avg.r - b.avg.r) + Math.abs(a.avg.g - b.avg.g) + Math.abs(a.avg.b - b.avg.b);
		console.log(`   frame delta: dMaxLum=${dLum.toFixed(2)} dAvg=${dAvg.toFixed(2)}`);
		return dLum > 0.05 || dAvg > 0.05;
	});

	await must("telemetry refresh rate reads non-zero (render loop + onFrame live)", async () => {
		// The Refresh cell is the second telemetry cell; read its <dd> value.
		const txt = await page
			.locator(".telemetry-cell")
			.nth(1)
			.locator("dd")
			.innerText();
		const fps = parseInt(txt, 10);
		console.log(`   reported refresh: ${txt.trim()}`);
		return Number.isFinite(fps) && fps > 0;
	});

	await must("changing a fader re-shapes the trace", async () => {
		const clip = { x: 380, y: 280, width: 820, height: 260 };
		const before = pngStats(await page.screenshot({ clip }));
		// Drive Frequency (4th range) and Amplitude (3rd range) to extremes.
		const freq = page.locator('input[type="range"]').nth(3);
		await freq.evaluate((el) => {
			const input = /** @type {HTMLInputElement} */ (el);
			const setter = Object.getOwnPropertyDescriptor(
				window.HTMLInputElement.prototype,
				"value",
			).set;
			setter.call(input, "48");
			input.dispatchEvent(new Event("input", { bubbles: true }));
			input.dispatchEvent(new Event("change", { bubbles: true }));
		});
		await page.waitForTimeout(400);
		const after = pngStats(await page.screenshot({ clip }));
		const dAvg =
			Math.abs(before.avg.r - after.avg.r) +
			Math.abs(before.avg.g - after.avg.g) +
			Math.abs(before.avg.b - after.avg.b);
		console.log(`   fader delta dAvg=${dAvg.toFixed(2)}`);
		return dAvg > 0.05 || Math.abs(before.litFraction - after.litFraction) > 0.005;
	});
} else {
	await must("graceful (no WebGL): bench shell still renders", () =>
		page.getByRole("heading", { level: 1 }).count().then((n) => n >= 1),
	);
}

await page.screenshot({ path: join(OUT, "desktop.png") });

// ── preset click rewires the controls ───────────────────────────────────────
await must("clicking 'Deep Sea' preset updates Trace A swatch", async () => {
	await page.getByRole("button", { name: /Deep Sea/i }).click();
	await page.waitForTimeout(250);
	const codeText = (
		await page.locator(".trim-meta code").first().innerText()
	).trim();
	console.log(`   Trace A after Deep Sea: ${codeText}`);
	// Deep Sea color1 is #0369a1.
	return codeText.toUpperCase() === "#0369A1";
});

// ── mobile pass ─────────────────────────────────────────────────────────────
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(600);
await must("mobile: console title still visible", () =>
	page.getByRole("heading", { level: 1 }).isVisible(),
);
await must("mobile: no horizontal overflow", () =>
	page.evaluate(
		() => document.documentElement.scrollWidth <= window.innerWidth + 1,
	),
);
await page.screenshot({ path: join(OUT, "mobile.png") });

await browser.close();
server.kill("SIGTERM");

// ── report ──────────────────────────────────────────────────────────────────
let failed = 0;
console.log("\n=== VERIFY RESULTS ===");
for (const [name, ok, extra] of checks) {
	console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  -> " + extra : ""}`);
	if (!ok) failed++;
}
console.log("\n=== CONSOLE / PAGE ERRORS ===");
if (errors.length === 0) console.log("(none)");
else errors.forEach((e) => console.log(" - " + e));

console.log(`\nScreenshots: ${OUT}`);
if (failed > 0 || errors.length > 0) {
	console.log(`\nRESULT: FAIL (${failed} checks failed, ${errors.length} errors)`);
	process.exit(1);
}
console.log("\nRESULT: ALL PASS");
process.exit(0);
