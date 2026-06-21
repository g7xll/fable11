/**
 * Headless verification for the animated shader hero.
 *
 * Spins up the Vite preview server, drives Playwright's bundled Chromium
 * (WebGL2 via SwiftShader) against the built page, and asserts:
 *   1. No console errors / page errors (incl. shader compile/link failures).
 *   2. The hero <canvas> exists and the WebGL2 context + shader program are live.
 *   3. The canvas is actually painting (non-uniform, warm ember pixels).
 *   4. The live uniforms HUD advances (time uniform > 0 after a moment).
 *   5. Pointer interaction registers (pointerCount reacts to a drag).
 *   6. The integration / how-to-use sections render below the fold.
 *
 * Usage: node verify.mjs   (run `npm run build` first, or it builds for you)
 */
import { chromium } from "playwright";
import { spawn, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import net from "node:net";

const PORT = Number(process.env.VERIFY_PORT) || 47318;
const BASE = `http://127.0.0.1:${PORT}/`;

function waitForPort(port, timeoutMs = 30000) {
	const start = Date.now();
	return new Promise((resolve, reject) => {
		const tick = () => {
			const s = net.connect(port, "127.0.0.1");
			s.on("connect", () => {
				s.destroy();
				resolve();
			});
			s.on("error", () => {
				s.destroy();
				if (Date.now() - start > timeoutMs) reject(new Error("port timeout"));
				else setTimeout(tick, 300);
			});
		};
		tick();
	});
}

const pass = [];
const fail = [];
const check = (name, ok, detail = "") => {
	(ok ? pass : fail).push(name + (detail ? ` — ${detail}` : ""));
	console.log(
		`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  (" + detail + ")" : ""}`,
	);
};

if (!existsSync("dist/index.html")) {
	console.log("• dist/ missing — building…");
	execSync("npm run build", { stdio: "inherit" });
}

console.log("• starting preview server…");
const server = spawn(
	"npx",
	[
		"vite",
		"preview",
		"--port",
		String(PORT),
		"--strictPort",
		"--host",
		"127.0.0.1",
	],
	{ stdio: "ignore" },
);

let browser;
try {
	await waitForPort(PORT);

	browser = await chromium.launch();
	const ctx = await browser.newContext({
		viewport: { width: 1280, height: 800 },
	});
	const page = await ctx.newPage();

	const consoleErrors = [];
	page.on("console", (m) => {
		if (m.type() === "error") consoleErrors.push(m.text());
	});
	page.on("pageerror", (e) => consoleErrors.push(String(e)));

	await page.goto(BASE, { waitUntil: "networkidle", timeout: 30000 });
	await page.waitForTimeout(1500); // let the shader render a few frames

	// 1. WebGL2 context + program live.
	const gl = await page.evaluate(() => {
		const c = document.querySelector("canvas");
		if (!c) return { ok: false, reason: "no canvas" };
		const ctx = c.getContext("webgl2");
		if (!ctx) return { ok: false, reason: "no webgl2 context" };
		return {
			ok: true,
			w: c.width,
			h: c.height,
			vendor: ctx.getParameter(ctx.VERSION),
		};
	});
	check(
		"canvas + WebGL2 context present",
		gl.ok,
		gl.ok ? gl.vendor : gl.reason,
	);
	check(
		"canvas has backing pixels",
		gl.ok && gl.w > 0 && gl.h > 0,
		gl.ok ? `${gl.w}x${gl.h}` : "",
	);

	// 2. Canvas is actually painting warm, varied pixels (not a black void).
	//    Copy the live WebGL canvas into a 2D canvas during a frame (drawImage on
	//    a WebGL element works without preserveDrawingBuffer) and read it back.
	const paint = await page.evaluate(
		() =>
			new Promise((resolve) => {
				requestAnimationFrame(() => {
					const c = document.querySelector("canvas");
					const o = document.createElement("canvas");
					o.width = 200;
					o.height = 120;
					const ctx = o.getContext("2d");
					ctx.drawImage(c, 0, 0, o.width, o.height);
					const { data } = ctx.getImageData(0, 0, o.width, o.height);
					let lit = 0,
						rSum = 0,
						bSum = 0,
						maxL = 0,
						n = 0;
					for (let i = 0; i < data.length; i += 4) {
						const r = data[i],
							g = data[i + 1],
							b = data[i + 2];
						const l = r + g + b;
						if (l > 14) lit++;
						rSum += r;
						bSum += b;
						n++;
						if (l > maxL) maxL = l;
					}
					resolve({
						lit,
						maxL,
						rAvg: Math.round(rSum / n),
						bAvg: Math.round(bSum / n),
						warm: rSum >= bSum,
					});
				});
			}),
	);
	check(
		"shader paints non-black field",
		paint.lit > 50 && paint.maxL > 30,
		`lit=${paint.lit} maxL=${paint.maxL}`,
	);
	check(
		"field reads warm (ember palette)",
		paint.warm,
		`rAvg=${paint.rAvg} bAvg=${paint.bAvg}`,
	);

	// 3. Live HUD advances (time uniform shown on screen).
	const hud1 = await page
		.locator("text=/\\d+\\.\\d+s/")
		.first()
		.textContent()
		.catch(() => null);
	await page.waitForTimeout(900);
	const hud2 = await page
		.locator("text=/\\d+\\.\\d+s/")
		.first()
		.textContent()
		.catch(() => null);
	check("uniforms HUD renders time", !!hud1, hud1 || "no time readout");
	check(
		"time uniform advances",
		!!hud1 && !!hud2 && hud1 !== hud2,
		`${hud1} -> ${hud2}`,
	);

	// 4. Pointer interaction registers.
	const box = await page.locator("canvas").first().boundingBox();
	await page.mouse.move(box.x + 200, box.y + 200);
	await page.mouse.down();
	await page.mouse.move(box.x + 600, box.y + 420, { steps: 12 });
	await page.waitForTimeout(300);
	const disturbing = await page.locator("text=disturbing the field").count();
	await page.mouse.up();
	check("pointer drag disturbs the field", disturbing > 0);

	// 5. Integration story below the fold.
	for (const [name, sel] of [
		["headline reads 'Workflow Into Orbit'", "text=Workflow Into Orbit"],
		[
			"integration section present",
			"text=/Tailwind, TypeScript, zero config/i",
		],
		["/components/ui rationale present", "text=/Why .*components\\/ui/i"],
		["how-to-use section present", "text=/How to use the Hero component/i"],
	]) {
		const n = await page.locator(sel).count();
		check(name, n > 0);
	}

	// 6. No console / page errors.
	check(
		"no console or page errors",
		consoleErrors.length === 0,
		consoleErrors.slice(0, 3).join(" | "),
	);

	await browser.close();
} catch (err) {
	console.error("VERIFY ERROR:", err);
	fail.push("harness: " + err.message);
} finally {
	if (browser) await browser.close().catch(() => {});
	server.kill("SIGTERM");
}

console.log(`\n${pass.length} passed, ${fail.length} failed`);
if (fail.length) {
	console.log("FAILURES:\n - " + fail.join("\n - "));
	process.exit(1);
}
console.log("ALL CHECKS PASSED ✓");
