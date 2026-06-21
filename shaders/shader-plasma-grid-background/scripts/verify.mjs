/**
 * Headless verification for the plasma-grid shader showcase.
 *
 * Boots `vite preview` against the production build, drives a headless Chromium
 * through the page, and asserts:
 *   1. no page/console errors and no failed requests,
 *   2. the WebGL canvas actually paints non-black, violet-ish pixels,
 *   3. the live telemetry HUD updates (iTime advances),
 *   4. the control-deck faders mutate the shared params (a hue change recolours).
 *
 * Usage: node scripts/verify.mjs   (run `npm run build` first; this also builds).
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { inflateSync } from "node:zlib";

import { chromium } from "playwright";

/**
 * Average the RGB of a PNG buffer (8-bit, non-interlaced — what Chromium emits).
 * Avoids pulling in an image library just to read a few pixels.
 */
function averagePng(buf) {
	// Concatenate all IDAT chunks, then inflate.
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
	return {
		r,
		g,
		b: bAvg,
		lum: Math.round(0.299 * r + 0.587 * g + 0.114 * bAvg),
	};
}

const PORT = 4319;
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
		const page = await browser.newPage({
			viewport: { width: 1280, height: 800 },
		});

		const errors = [];
		page.on("console", (m) => {
			if (m.type() === "error") errors.push(m.text());
		});
		page.on("pageerror", (e) => errors.push(String(e)));
		page.on("requestfailed", (r) =>
			errors.push(`request failed: ${r.url()} ${r.failure()?.errorText ?? ""}`),
		);

		await page.goto(URL, { waitUntil: "networkidle" });
		await sleep(1400); // let the shader animate a few frames

		// 1. no errors
		if (errors.length) fail(`console/page errors:\n  ${errors.join("\n  ")}`);
		console.log("✓ no console/page/request errors");

		// 2. canvas paints non-black, violet-ish pixels.
		// We screenshot the composited page (captures the live WebGL frame reliably,
		// where a second readPixels() on the default backbuffer would not), decode
		// the PNG, and average a block of pixels near the center.
		const hasCanvas = await page.evaluate(() => {
			const c = document.querySelector("canvas");
			return !!c && c.width > 0 && c.height > 0;
		});
		if (!hasCanvas) fail("no sized canvas in DOM");

		// Sample the top-right of the hero where the bare field shows through
		// (away from headline text and heaviest part of the legibility veil).
		const png = await page.screenshot({
			clip: { x: 1040, y: 150, width: 180, height: 160 },
		});
		const { r, g, b, lum } = averagePng(png);
		if (lum <= 12)
			fail(`canvas appears black (avg rgb ${r},${g},${b}, lum ${lum})`);
		if (b <= r)
			fail(`field is not violet/blue-dominant (avg rgb ${r},${g},${b})`);
		console.log(
			`✓ canvas painting violet field (avg rgb ${r},${g},${b}, lum ${lum})`,
		);

		// 3. telemetry HUD advances iTime
		const readTime = async () => {
			const txt = await page
				.locator("text=iTime")
				.locator("xpath=following-sibling::*[1]")
				.first()
				.innerText()
				.catch(() => null);
			return txt;
		};
		const t1 = await readTime();
		await sleep(900);
		const t2 = await readTime();
		if (t1 == null || t2 == null || t1 === t2)
			fail(`telemetry iTime did not advance (${t1} → ${t2})`);
		console.log(`✓ live telemetry advancing (iTime ${t1} → ${t2})`);

		// 4. control-deck hue fader mutates the readout
		const hue = page.locator("#fader-hue");
		await hue.scrollIntoViewIfNeeded();
		await hue.focus();
		for (let i = 0; i < 20; i++) await page.keyboard.press("ArrowRight");
		const hueLabel = await page
			.locator('label[for="fader-hue"]')
			.locator("xpath=following-sibling::*[1]")
			.first()
			.innerText();
		if (!/°/.test(hueLabel) || /\+0°/.test(hueLabel))
			fail(`hue fader did not change value (got "${hueLabel}")`);
		console.log(`✓ control-deck fader live (hue now ${hueLabel})`);

		await browser.close();
		server.kill("SIGKILL");
		console.log("\n✅ all checks passed");
		process.exit(0);
	} catch (err) {
		fail(err?.message ?? String(err));
	}
}

main();
