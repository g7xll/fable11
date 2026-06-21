// Render the "field captures" gallery stills, headless, from scripts/specimen.html
// (the same promoted-uniform GLSL as the live component). External photo CDNs are
// blocked in this build sandbox, so the gallery is sourced from the shader itself
// and vendored under public/assets/specimens/.
//
//   CHROME_PATH=/opt/pw-browsers/chromium/chrome-linux/chrome node scripts/capture-specimens.mjs
import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "public", "assets", "specimens");
mkdirSync(outDir, { recursive: true });
const htmlPath = join(here, "specimen.html");

// slug + preset (must match SPECIMENS in src/App.tsx); t picks the rotation phase.
const SPECIMENS = [
	{ slug: "origin", blades: 9, gain: 1.0, hue: 0.0, t: 2.0 },
	{ slug: "corona", blades: 6, gain: 1.6, hue: 0.6, t: 5.0 },
	{ slug: "iris", blades: 12, gain: 0.9, hue: 2.2, t: 8.0 },
	{ slug: "ember", blades: 4, gain: 1.35, hue: 4.4, t: 1.2 },
	{ slug: "halo", blades: 14, gain: 0.7, hue: 3.3, t: 11.0 },
	{ slug: "spectre", blades: 8, gain: 1.2, hue: 5.2, t: 3.5 },
];

const SIZE = 900;

const browser = await chromium.launch({
	executablePath: process.env.CHROME_PATH || undefined,
	args: [
		"--no-sandbox",
		"--use-gl=angle",
		"--use-angle=swiftshader",
		"--enable-unsafe-swiftshader",
		"--ignore-gpu-blocklist",
	],
});

let ok = 0;
for (const s of SPECIMENS) {
	const page = await browser.newPage({
		viewport: { width: SIZE + 20, height: SIZE + 20 },
	});
	const url = `file://${htmlPath}?blades=${s.blades}&gain=${s.gain}&hue=${s.hue}&t=${s.t}&size=${SIZE}`;
	await page.goto(url, { waitUntil: "load", timeout: 30000 });
	try {
		await page.waitForFunction(() => window.__ready === true, {
			timeout: 15000,
		});
	} catch {
		const err = await page.evaluate(
			() => window.__error || "timeout (no __ready)",
		);
		console.error(`FAIL ${s.slug}: ${err}`);
		await page.close();
		continue;
	}
	await page.waitForTimeout(120);
	const out = join(outDir, `${s.slug}.jpg`);
	await page.locator("#c").screenshot({ path: out, type: "jpeg", quality: 90 });
	console.log(
		`ok   ${s.slug}.jpg  (blades ${s.blades}, gain ${s.gain}, hue ${s.hue})`,
	);
	ok++;
	await page.close();
}

await browser.close();
console.log(
	`\n${ok}/${SPECIMENS.length} specimens written to public/assets/specimens/`,
);
if (ok !== SPECIMENS.length) process.exit(1);
