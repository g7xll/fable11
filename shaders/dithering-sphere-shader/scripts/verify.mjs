/**
 * Headless verification for the Dither Lab showcase.
 *
 * Builds the project, boots `vite preview`, drives a headless Chromium through
 * the page and asserts:
 *   1. no page/console errors and no failed requests,
 *   2. the WebGL canvas actually paints non-black, rose-dominant pixels,
 *   3. the live telemetry HUD advances (frame counter climbs),
 *   4. the control deck mutates the shared params (shape + dither readouts change).
 *
 * Usage: node scripts/verify.mjs   (this also runs the build).
 */
import { spawn } from "node:child_process";
import { inflateSync } from "node:zlib";
import { setTimeout as sleep } from "node:timers/promises";

import { chromium } from "playwright";

/** Average the RGB of an 8-bit, non-interlaced PNG (what Chromium emits). */
function averagePng(buf) {
	let pos = 8; // skip signature
	let width = 0;
	let height = 0;
	let colorType = 6;
	const idat = [];
	while (pos < buf.length) {
		const len = buf.readUInt32BE(pos);
		const type = buf.toString("ascii", pos + 4, pos + 8);
		const data = buf.subarray(pos + 8, pos + 8 + len);
		if (type === "IHDR") {
			width = data.readUInt32BE(0);
			height = data.readUInt32BE(4);
			colorType = data[9];
		} else if (type === "IDAT") {
			idat.push(data);
		} else if (type === "IEND") {
			break;
		}
		pos += 12 + len;
	}
	const channels = colorType === 6 ? 4 : 3;
	const raw = inflateSync(Buffer.concat(idat));
	const stride = width * channels;
	const cur = new Uint8Array(stride);
	const prev = new Uint8Array(stride);
	let rSum = 0;
	let gSum = 0;
	let bSum = 0;
	let count = 0;
	let p = 0;
	for (let y = 0; y < height; y++) {
		const filter = raw[p++];
		for (let x = 0; x < stride; x++) {
			const rawByte = raw[p++];
			const a = x >= channels ? cur[x - channels] : 0;
			const b = prev[x];
			const c = x >= channels ? prev[x - channels] : 0;
			let val = rawByte;
			if (filter === 1) val = rawByte + a;
			else if (filter === 2) val = rawByte + b;
			else if (filter === 3) val = rawByte + ((a + b) >> 1);
			else if (filter === 4) {
				const pa = Math.abs(b - c);
				const pb = Math.abs(a - c);
				const pc = Math.abs(a + b - 2 * c);
				const pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
				val = rawByte + pred;
			}
			cur[x] = val & 0xff;
		}
		for (let x = 0; x < width; x++) {
			rSum += cur[x * channels];
			gSum += cur[x * channels + 1];
			bSum += cur[x * channels + 2];
			count++;
		}
		prev.set(cur);
	}
	const r = Math.round(rSum / count);
	const g = Math.round(gSum / count);
	const bAvg = Math.round(bSum / count);
	return { r, g, b: bAvg, lum: Math.round(0.299 * r + 0.587 * g + 0.114 * bAvg) };
}

const PORT = 4322;
const URL = `http://localhost:${PORT}/`;

function run(cmd, args, opts = {}) {
	return new Promise((resolve, reject) => {
		const p = spawn(cmd, args, { stdio: "inherit", ...opts });
		p.on("exit", (code) =>
			code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`)),
		);
	});
}

async function waitForServer(url, tries = 60) {
	for (let i = 0; i < tries; i++) {
		try {
			const res = await fetch(url);
			if (res.ok) return true;
		} catch {
			/* not up yet */
		}
		await sleep(500);
	}
	throw new Error("preview server never came up");
}

async function main() {
	console.log("→ building...");
	await run("npm", ["run", "build"]);

	console.log("→ starting preview server...");
	const server = spawn(
		"npx",
		["vite", "preview", "--port", String(PORT), "--strictPort"],
		{ stdio: "ignore" },
	);

	const fail = (msg) => {
		console.error(`✗ ${msg}`);
		server.kill("SIGKILL");
		process.exit(1);
	};

	try {
		await waitForServer(URL);

		const browser = await chromium.launch();
		const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

		const errors = [];
		page.on("console", (m) => {
			if (m.type() === "error") errors.push(m.text());
		});
		page.on("pageerror", (e) => errors.push(String(e)));
		page.on("requestfailed", (r) =>
			errors.push(`request failed: ${r.url()} ${r.failure()?.errorText ?? ""}`),
		);

		await page.goto(URL, { waitUntil: "networkidle" });
		await sleep(1600); // let the shader animate a few frames

		// 1. no errors
		if (errors.length) fail(`console/page errors:\n  ${errors.join("\n  ")}`);
		console.log("✓ no console/page/request errors");

		// 2. canvas paints non-black, rose-dominant pixels. Screenshot the
		// composited hero and average a broad central block over the sphere.
		const hasCanvas = await page.evaluate(() => {
			const c = document.querySelector("canvas");
			return !!c && c.width > 0 && c.height > 0;
		});
		if (!hasCanvas) fail("no sized canvas in DOM");

		const png = await page.screenshot({
			clip: { x: 440, y: 250, width: 400, height: 300 },
		});
		const { r, g, b, lum } = averagePng(png);
		if (lum <= 8) fail(`canvas appears black (avg rgb ${r},${g},${b}, lum ${lum})`);
		if (r <= g + 4 || r <= b + 4)
			fail(`field is not rose/red-dominant (avg rgb ${r},${g},${b})`);
		console.log(`✓ canvas painting rose field (avg rgb ${r},${g},${b}, lum ${lum})`);

		// 3. telemetry frame counter climbs
		const readFrame = () =>
			page.getByTestId("hud-frame").innerText().catch(() => null);
		const f1 = Number(await readFrame());
		await sleep(900);
		const f2 = Number(await readFrame());
		if (!Number.isFinite(f1) || !Number.isFinite(f2) || f2 <= f1)
			fail(`telemetry frame counter did not advance (${f1} → ${f2})`);
		console.log(`✓ live telemetry advancing (frame ${f1} → ${f2})`);

		// 4. control deck mutates the shared params (shape + dither readouts)
		const shapeBefore = await page.getByTestId("hud-shape").innerText();
		await page.getByTestId("shape-warp").click();
		await sleep(250);
		const shapeAfter = await page.getByTestId("hud-shape").innerText();
		if (shapeBefore === shapeAfter || !/warp/i.test(shapeAfter))
			fail(`shape control did not update HUD (${shapeBefore} → ${shapeAfter})`);

		await page.getByTestId("type-4x4").click();
		await sleep(250);
		const typeAfter = await page.getByTestId("hud-type").innerText();
		if (!/4×4/.test(typeAfter))
			fail(`dither control did not update HUD (got "${typeAfter}")`);
		console.log(
			`✓ control deck live (shape ${shapeBefore} → ${shapeAfter}, dither → ${typeAfter})`,
		);

		await browser.close();
		server.kill("SIGKILL");
		console.log("\n✅ all checks passed");
		process.exit(0);
	} catch (err) {
		fail(err?.message ?? String(err));
	}
}

main();
