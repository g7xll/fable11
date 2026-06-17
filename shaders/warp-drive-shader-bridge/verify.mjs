/**
 * Headless verification for the Warp Drive shader integration.
 *
 * Boots the Vite preview server, drives Playwright's bundled Chromium (WebGL via
 * SwiftShader) against the built page, and asserts:
 *   1. No console errors / page errors (incl. shader compile/link failures).
 *   2. The shader <canvas> exists with a live WebGL context and backing pixels.
 *   3. The canvas is actually painting a non-black tunnel (lit + bright pixels).
 *   4. The live telemetry HUD advances (iTime readout increases over time).
 *   5. The warp throttle changes the warpSpeed prop readout.
 *   6. The integration story renders below the fold.
 *
 * Usage: node verify.mjs   (builds first if dist/ is missing).
 */
import { chromium } from "playwright";
import { spawn, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import net from "node:net";

const PORT = Number(process.env.VERIFY_PORT) || 47921;
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

  browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("pageerror", (e) => consoleErrors.push(String(e)));

  await page.goto(BASE, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500); // let the shader render a few frames

  // 1. WebGL context + canvas pixels.
  const gl = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    if (!c) return { ok: false, reason: "no canvas" };
    const ctx = c.getContext("webgl2") || c.getContext("webgl");
    if (!ctx) return { ok: false, reason: "no webgl context" };
    return { ok: true, w: c.width, h: c.height, version: ctx.getParameter(ctx.VERSION) };
  });
  check("shader canvas + WebGL context present", gl.ok, gl.ok ? gl.version : gl.reason);
  check("canvas has backing pixels", gl.ok && gl.w > 0 && gl.h > 0, gl.ok ? `${gl.w}x${gl.h}` : "");

  // 2. Canvas paints a non-black tunnel. Copy the live WebGL canvas into a 2D
  //    canvas during a frame and read it back.
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
            maxL = 0;
          for (let i = 0; i < data.length; i += 4) {
            const l = data[i] + data[i + 1] + data[i + 2];
            if (l > 18) lit++;
            if (l > maxL) maxL = l;
          }
          resolve({ lit, maxL });
        });
      }),
  );
  check(
    "shader paints a non-black tunnel",
    paint.lit > 40 && paint.maxL > 60,
    `lit=${paint.lit} maxL=${paint.maxL}`,
  );

  // 3. Live telemetry HUD advances (iTime readout, e.g. "12.34 s").
  const readTime = () =>
    page
      .locator("text=/\\d+\\.\\d+\\s*s/")
      .first()
      .textContent()
      .catch(() => null);
  const t1 = await readTime();
  await page.waitForTimeout(900);
  const t2 = await readTime();
  check("telemetry HUD renders iTime", !!t1, t1 || "no time readout");
  check("iTime advances over time", !!t1 && !!t2 && t1 !== t2, `${t1} -> ${t2}`);

  // 4. Warp throttle changes the warpSpeed readout. Match the warpSpeed value
  //    exactly ("×1.40") so it can't collide with the iResolution "1280×800".
  const speedReadout = () =>
    page
      .locator("text=/^×\\d+\\.\\d+$/")
      .first()
      .textContent()
      .catch(() => null);
  const s1 = await speedReadout();
  await page.getByRole("button", { name: "MAXIMUM" }).click();
  await page.waitForTimeout(300);
  const s2 = await speedReadout();
  check("warp throttle changes warpSpeed", !!s1 && !!s2 && s1 !== s2, `${s1} -> ${s2}`);

  // 5. Integration story below the fold.
  for (const [name, sel] of [
    ["headline 'WARP DRIVE' present", "h1:has-text('WARP')"],
    ["mission brief section present", "text=/One file in/i"],
    ["shadcn/Tailwind/TS setup present", "text=/shadcn .* Tailwind .* TypeScript hull/i"],
    ["/components/ui rationale present", "text=/Why .*components\\/ui/i"],
    ["props & uniforms API present", "text=/Props .* shader uniforms/i"],
  ]) {
    const n = await page.locator(sel).count();
    check(name, n > 0);
  }

  // 6. No console / page errors.
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
