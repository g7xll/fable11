/**
 * Headless verification for DITHER LAB.
 *
 * Builds the project, serves the Vite preview, drives Playwright's bundled
 * Chromium (WebGL2 via SwiftShader) against the built page, and asserts:
 *   1. No console / page errors (incl. shader compile/link failures).
 *   2. A single <canvas> with a live WebGL2 context and backing pixels.
 *   3. The shader actually paints a non-black field carrying the magenta front ink.
 *   4. The telemetry HUD renders an FPS readout and its clock advances.
 *   5. Selecting a different shape re-labels the hero (Wave -> Sphere).
 *   6. Changing the dithering matrix re-renders without error.
 *   7. "Freeze" halts the shader clock; the readout stops advancing.
 *
 * Usage: node scripts/verify.mjs   (builds first if dist/ is missing)
 */
import { chromium } from "playwright";
import { spawn, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import net from "node:net";

// This environment ships a pre-provisioned Chromium (PLAYWRIGHT_BROWSERS_PATH)
// that may not match the npm playwright revision, so launch it by path.
function resolveChromium() {
  const candidates = [
    process.env.PW_CHROMIUM,
    process.env.PLAYWRIGHT_BROWSERS_PATH && path.join(process.env.PLAYWRIGHT_BROWSERS_PATH, "chromium"),
    "/opt/pw-browsers/chromium",
  ].filter(Boolean);
  return candidates.find((p) => existsSync(p));
}

const PORT = Number(process.env.VERIFY_PORT) || 47621;
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
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  (" + detail + ")" : ""}`);
};

if (!existsSync("dist/index.html")) {
  console.log("• dist/ missing — building…");
  execSync("npm run build", { stdio: "inherit" });
}

console.log("• starting preview server…");
const server = spawn(
  "npx",
  ["vite", "preview", "--port", String(PORT), "--strictPort", "--host", "127.0.0.1"],
  { stdio: "ignore" },
);

let browser;
try {
  await waitForPort(PORT);

  const executablePath = resolveChromium();
  if (executablePath) console.log(`• using chromium at ${executablePath}`);
  browser = await chromium.launch(executablePath ? { executablePath } : {});
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("pageerror", (e) => consoleErrors.push(String(e)));

  await page.goto(BASE, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500); // let the shader render a few frames

  // 1. WebGL2 context + backing pixels.
  const gl = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    if (!c) return { ok: false, reason: "no canvas" };
    const ctx = c.getContext("webgl2");
    if (!ctx) return { ok: false, reason: "no webgl2 context" };
    return { ok: true, w: c.width, h: c.height, version: ctx.getParameter(ctx.VERSION) };
  });
  check("canvas + WebGL2 context present", gl.ok, gl.ok ? gl.version : gl.reason);
  check("canvas has backing pixels", gl.ok && gl.w > 0 && gl.h > 0, gl.ok ? `${gl.w}x${gl.h}` : "");

  // 2. The field paints, and the magenta front ink (#ff0088) is on screen.
  const paint = await page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => {
          const c = document.querySelector("canvas");
          const o = document.createElement("canvas");
          o.width = 220;
          o.height = 140;
          const ctx = o.getContext("2d");
          ctx.drawImage(c, 0, 0, o.width, o.height);
          const { data } = ctx.getImageData(0, 0, o.width, o.height);
          let lit = 0;
          let magenta = 0;
          let maxL = 0;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const l = r + g + b;
            if (l > 18) lit++;
            if (r > 120 && g < 90) magenta++;
            if (l > maxL) maxL = l;
          }
          resolve({ lit, magenta, maxL, total: data.length / 4 });
        });
      }),
  );
  check("shader paints a non-black field", paint.lit > 80 && paint.maxL > 40, `lit=${paint.lit} maxL=${paint.maxL}`);
  check("front ink (magenta) is rendered", paint.magenta > 30, `magentaPixels=${paint.magenta}`);

  // 3. Telemetry HUD: FPS label present + clock advances.
  const fpsLabel = await page.locator("text=/^fps$/i").count();
  check("telemetry HUD renders FPS readout", fpsLabel > 0);
  const clock1 = await page.locator("text=/\\d+\\.\\d+s/").first().textContent().catch(() => null);
  await page.waitForTimeout(900);
  const clock2 = await page.locator("text=/\\d+\\.\\d+s/").first().textContent().catch(() => null);
  check("shader clock advances", !!clock1 && !!clock2 && clock1 !== clock2, `${clock1} -> ${clock2}`);

  // 4. Shape selection re-labels the hero.
  const heroBefore = (await page.locator("h2").first().textContent())?.trim();
  await page.getByRole("button", { name: "Sphere" }).click();
  await page.waitForTimeout(400);
  const heroAfter = (await page.locator("h2").first().textContent())?.trim();
  check(
    "selecting a shape re-labels the hero",
    heroBefore === "Wave" && heroAfter === "Sphere",
    `${heroBefore} -> ${heroAfter}`,
  );

  // 5. Switching the dithering matrix keeps the field alive (no GL error).
  await page.getByRole("button", { name: /2×2/ }).click();
  await page.waitForTimeout(500);
  const aliveAfterMatrix = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    return !!c && c.width > 0;
  });
  check("dithering matrix switch keeps canvas alive", aliveAfterMatrix);

  // 6. Freeze halts the clock.
  await page.getByRole("button", { name: "Freeze" }).click();
  await page.waitForTimeout(250);
  const frozen1 = await page.locator("text=/\\d+\\.\\d+s/").first().textContent().catch(() => null);
  await page.waitForTimeout(800);
  const frozen2 = await page.locator("text=/\\d+\\.\\d+s/").first().textContent().catch(() => null);
  check("freeze halts the shader clock", !!frozen1 && frozen1 === frozen2, `${frozen1} == ${frozen2}`);

  // 7. No console / page errors throughout.
  check("no console or page errors", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | "));

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
