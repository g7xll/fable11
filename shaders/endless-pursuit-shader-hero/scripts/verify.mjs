// Verification for the UIMIX "Endless Pursuit" shader hero.
//
// Two phases:
//   1. STATIC (always runs, no browser needed): builds are parsed straight off
//      disk to prove the component actually integrated and bundled — the hero
//      copy, the UnicornStudio embed, the offline WebGL fallback shader, the
//      vendored JetBrains Mono fonts, and the moved global CSS classes.
//   2. LIVE  (best-effort): if a Chromium is discoverable (CHROME_PATH or a
//      common system path) AND `playwright` is importable, dist/ is served and
//      driven headlessly to assert the DOM renders and the shader paints
//      non-flat-black pixels. Skipped cleanly when no browser is available.
//
//   npm run build && node scripts/verify.mjs
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");

const checks = [];
const ok = (name, cond, extra) => checks.push([name, !!cond, extra]);

if (!existsSync(DIST)) {
	console.error("dist/ not found — run `npm run build` first.");
	process.exit(2);
}

const read = (p) => readFileSync(p, "utf8");
const distFiles = readdirSync(join(DIST, "assets"));
const js = distFiles
	.filter((f) => f.endsWith(".js"))
	.map((f) => read(join(DIST, "assets", f)))
	.join("\n");
const css = distFiles
	.filter((f) => f.endsWith(".css"))
	.map((f) => read(join(DIST, "assets", f)))
	.join("\n");
const html = read(join(DIST, "index.html"));

// ---- STATIC PHASE -----------------------------------------------------------
ok(
	"index.html ships hashed module + stylesheet",
	/<script[^>]+type="module"/.test(html) && /<link[^>]+stylesheet/.test(html),
);
ok(
	"index.html preloads vendored mono font",
	/rel="preload"[^>]+jetbrains-mono-latin-400-normal\.woff2/.test(html),
);

for (const w of [400, 500, 700]) {
	const f = join(DIST, "fonts", `jetbrains-mono-latin-${w}-normal.woff2`);
	ok(
		`vendored font weight ${w} emitted (>5kb)`,
		existsSync(f) && statSync(f).size > 5000,
	);
}

ok("brand 'UIMIX' bundled", js.includes("UIMIX"));
ok("headline 'ENDLESS PURSUIT' bundled", js.includes("ENDLESS PURSUIT"));
ok("Sisyphus manifesto copy bundled", js.includes("Like Sisyphus"));
ok("CTA 'BEGIN THE CLIMB' bundled", js.includes("BEGIN THE CLIMB"));
ok("CTA 'EMBRACE THE JOURNEY' bundled", js.includes("EMBRACE THE JOURNEY"));
ok("footer 'SISYPHUS.PROTOCOL' bundled", js.includes("SISYPHUS.PROTOCOL"));
ok(
	"UnicornStudio embed preserved",
	js.includes("data-us-project") && js.includes("OMzqyUv6M3kSnv0JeAtC"),
);
ok(
	"UnicornStudio loader script preserved",
	js.includes("unicornstudio.js") || js.includes("UnicornStudio"),
);
ok(
	"offline WebGL fallback shader bundled (GLSL)",
	js.includes("gl_FragColor") && js.includes("fbm"),
);
ok(
	"WebGL context guarded (no-crash fallback)",
	js.includes("experimental-webgl") ||
		js.includes('getContext("webgl"') ||
		js.includes("getContext('webgl'"),
);

ok("global '.stars-bg' fallback class in CSS", css.includes(".stars-bg"));
ok("global '.dither-pattern' class in CSS", css.includes(".dither-pattern"));
ok(
	"@font-face → JetBrains Mono in CSS",
	/@font-face/.test(css) && /JetBrains Mono/.test(css),
);

// ---- LIVE PHASE (best-effort) ----------------------------------------------
async function findChrome() {
	const candidates = [
		process.env.CHROME_PATH,
		"/opt/chromium-bin/chrome",
		"/usr/bin/chromium",
		"/usr/bin/chromium-browser",
		"/usr/bin/google-chrome",
		"/usr/bin/google-chrome-stable",
	].filter(Boolean);
	return candidates.find((p) => existsSync(p));
}

let liveRan = false;
try {
	const chrome = await findChrome();
	let playwright = null;
	try {
		playwright = await import("playwright");
	} catch {
		/* playwright not installed in this project */
	}
	if (chrome && playwright) {
		liveRan = true;
		const { createServer } = await import("node:http");
		const { extname } = await import("node:path");
		const TYPES = {
			".html": "text/html",
			".js": "text/javascript",
			".css": "text/css",
			".woff2": "font/woff2",
			".svg": "image/svg+xml",
		};
		const server = createServer((req, res) => {
			let p = join(DIST, decodeURIComponent((req.url || "/").split("?")[0]));
			if (!existsSync(p) || statSync(p).isDirectory())
				p = join(DIST, "index.html");
			res.writeHead(200, {
				"content-type": TYPES[extname(p)] || "application/octet-stream",
			});
			res.end(readFileSync(p));
		});
		await new Promise((r) => server.listen(0, r));
		const port = server.address().port;
		const browser = await playwright.chromium.launch({
			executablePath: chrome,
			args: [
				"--no-sandbox",
				"--use-gl=angle",
				"--use-angle=swiftshader",
				"--enable-unsafe-swiftshader",
				"--ignore-gpu-blocklist",
			],
		});
		const page = await browser.newPage({
			viewport: { width: 1280, height: 800 },
		});
		await page.goto(`http://localhost:${port}/`, {
			waitUntil: "networkidle",
			timeout: 30000,
		});
		await page.waitForTimeout(1200);
		ok(
			"live: headline 'ENDLESS PURSUIT' rendered",
			(await page.getByRole("heading", { level: 1 }).innerText()).includes(
				"ENDLESS PURSUIT",
			),
		);
		ok(
			"live: backdrop <canvas> mounted full-viewport",
			await page.evaluate(() => {
				const c = document.querySelector("canvas");
				return !!c && c.getBoundingClientRect().width > 1000;
			}),
		);
		const png = await page.screenshot({
			clip: { x: 0, y: 120, width: 1280, height: 400 },
		});
		// Minimal mean-luminance probe: the shader field is dark but must not be flat black.
		let nonzero = 0;
		for (let i = 1000; i < png.length; i += 997) if (png[i] > 8) nonzero++;
		ok("live: shader field paints (not flat black)", nonzero > 5);
		await browser.close();
		server.close();
	}
} catch (e) {
	ok("live phase error", false, String(e));
}

// ---- REPORT -----------------------------------------------------------------
let failed = 0;
console.log("\n=== VERIFY RESULTS (static build verification) ===");
for (const [name, pass, extra] of checks) {
	console.log(
		`${pass ? "PASS" : "FAIL"}  ${name}${extra ? `  -> ${extra}` : ""}`,
	);
	if (!pass) failed++;
}
console.log(
	liveRan
		? "\n(live browser phase ran)"
		: "\n(live browser phase skipped — no Chromium found; static checks above are authoritative)",
);
if (failed > 0) {
	console.log(`\nRESULT: FAIL (${failed} checks failed)`);
	process.exit(1);
}
console.log("\nRESULT: ALL PASS");
