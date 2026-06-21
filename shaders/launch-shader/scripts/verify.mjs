// Headless WebGL2 verification for the LAUNCH shader integration.
//
// Drives Chrome-for-Testing (Playwright chromium + explicit executablePath, ANGLE
// SwiftShader for deterministic headless GL) against the running dev server and
// asserts the integration actually works end-to-end:
//   1. a <canvas> with a live WebGL2 context exists and the GLSL compiles + links
//      (any shader compile/link failure logs a console error → caught here);
//   2. the molten plume renders warm, non-black content (sampled from a real
//      screenshot — readPixels on an already-presented backbuffer reads zeros);
//   3. consecutive frames differ while BURNING (the loop animates);
//   4. the IGNITE/HOLD control freezes the GPU clock (held frames are identical)
//      and RESUME restarts it (frames differ again) — driving the shader's `paused`;
//   5. the host telemetry spans advance (iFrame / altitude sampled off the loop).
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const pwPath =
	process.env.PLAYWRIGHT_PATH ||
	"/home/user/claude-directory/scripts/record-demos/node_modules/playwright";
const { chromium } = require(pwPath);
// Optional pixel decode for the warm/non-black colour assertion. If pngjs is not
// installed the script falls back to a screenshot-size sanity check instead.
let PNG = null;
try {
	PNG = require(pwPath.replace(/[\\/]playwright$/, "/pngjs")).PNG;
} catch {
	try {
		PNG = require("pngjs").PNG;
	} catch {
		PNG = null;
	}
}

const URL = process.env.VERIFY_URL || "http://localhost:5210/";
const EXE = process.env.CHROME_EXE || "/opt/cft/chrome-linux64/chrome";

const errors = [];
const browser = await chromium.launch({
	executablePath: EXE,
	args: [
		"--use-gl=angle",
		"--use-angle=swiftshader",
		"--enable-unsafe-swiftshader",
		"--ignore-gpu-blocklist",
		"--no-sandbox",
	],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

page.on("console", (m) => {
	if (m.type() === "error" && !/favicon/i.test(m.text())) errors.push(m.text());
});
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

await page.goto(URL, { waitUntil: "load" });
await page.waitForTimeout(1600); // let the loop run + telemetry sample

// --- WebGL2 context present ---
const ctx = await page.evaluate(() => {
	const c = document.querySelector("canvas");
	if (!c) return { ok: false, reason: "no canvas" };
	const gl = c.getContext("webgl2");
	return {
		ok: !!gl,
		reason: gl ? "" : "no webgl2 context",
		w: c.width,
		h: c.height,
	};
});

// --- warm, non-black plume sampled from a real screenshot ---
const shot = () => page.locator("canvas").screenshot();
function pngStats(buf) {
	if (!PNG) return null;
	const img = PNG.sync.read(buf);
	let r = 0,
		g = 0,
		b = 0,
		nonBlack = 0,
		n = 0;
	const step = 4 * 53; // sparse stride over RGBA bytes
	for (let i = 0; i + 3 < img.data.length; i += step) {
		const pr = img.data[i],
			pg = img.data[i + 1],
			pb = img.data[i + 2];
		r += pr;
		g += pg;
		b += pb;
		if (pr + pg + pb > 18) nonBlack++;
		n++;
	}
	return {
		r: Math.round(r / n),
		g: Math.round(g / n),
		b: Math.round(b / n),
		nonBlack,
		n,
	};
}
// byte-level diff: cheap proxy for "did the rendered frame change?"
function diff(a, b) {
	let n = Math.min(a.length, b.length),
		d = 0;
	for (let i = 0; i < n; i += 997) if (a[i] !== b[i]) d++;
	return d;
}

const burnA = await shot();
await page.waitForTimeout(500);
const burnB = await shot();
const burnDiff = diff(burnA, burnB);
const stats = pngStats(burnA);

// --- HOLD freezes / RESUME restarts the GPU clock ---
const holdBtn = page.getByRole("button").first();
await holdBtn.click(); // HOLD IGNITION
await page.waitForTimeout(450);
const heldA = await shot();
await page.waitForTimeout(700);
const heldB = await shot();
const heldDiff = diff(heldA, heldB);
await holdBtn.click(); // RESUME BURN
await page.waitForTimeout(450);
const resA = await shot();
await page.waitForTimeout(500);
const resB = await shot();
const resDiff = diff(resA, resB);

// --- telemetry spans advance (read the numeric value spans, not labels) ---
const readHud = () =>
	page.evaluate(() => {
		const txt = document.body.innerText.replace(/\s+/g, " ");
		const num = (re) => {
			const m = txt.match(re);
			return m ? Number(m[1]) : null;
		};
		return {
			frame: num(/FRAME\s*([0-9]+)/),
			alt: num(/ALT\s*([0-9]+)/),
			fps: num(/FPS\s*([0-9]+)/),
		};
	});
const hud1 = await readHud();
await page.waitForTimeout(1100);
const hud2 = await readHud();

await page.screenshot({ path: "/tmp/launch-verify.png" });
await browser.close();

// ---------- assertions ----------
const checks = [];
const assert = (name, cond, detail) =>
	checks.push({ name, pass: !!cond, detail });

assert("canvas + webgl2 present", ctx.ok, ctx.reason);
assert(
	"no shader/console errors",
	errors.length === 0,
	errors.slice(0, 4).join(" | "),
);
if (stats) {
	assert(
		"plume renders non-black",
		stats.nonBlack > stats.n * 0.4,
		`${stats.nonBlack}/${stats.n} lit`,
	);
	assert(
		"plume is warm (R≥G≥B)",
		stats.r >= stats.g && stats.g >= stats.b && stats.r > 10,
		`avg=${JSON.stringify({ r: stats.r, g: stats.g, b: stats.b })}`,
	);
} else {
	assert(
		"plume render (pngjs absent → screenshot non-empty)",
		burnA.length > 5000,
		`${burnA.length} bytes`,
	);
}
assert("frames change while BURNING", burnDiff > 0, `diff=${burnDiff}`);
assert("HOLD freezes the GPU clock", heldDiff === 0, `held diff=${heldDiff}`);
assert("RESUME restarts the GPU clock", resDiff > 0, `resumed diff=${resDiff}`);
assert(
	"telemetry frame advances",
	hud2.frame != null && hud1.frame != null && hud2.frame > hud1.frame,
	`frame ${hud1.frame} -> ${hud2.frame}`,
);
assert(
	"altitude climbs",
	hud2.alt != null && hud1.alt != null && hud2.alt >= hud1.alt,
	`alt ${hud1.alt} -> ${hud2.alt} m`,
);

let allPass = true;
for (const c of checks) {
	const tag = c.pass ? "PASS" : "FAIL";
	if (!c.pass) allPass = false;
	console.log(`[${tag}] ${c.name}${c.detail ? "  — " + c.detail : ""}`);
}
console.log(allPass ? "\nALL CHECKS PASSED" : "\nSOME CHECKS FAILED");
process.exit(allPass ? 0 : 1);
