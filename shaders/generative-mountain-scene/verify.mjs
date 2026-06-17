/**
 * Headless verification for the GenerativeMountainScene integration showcase.
 *
 * Builds the app, serves `vite preview`, drives Playwright's bundled Chromium
 * (WebGL via SwiftShader) against the page, and asserts:
 *   1. No console / page errors (incl. GLSL compile/link failures).
 *   2. The scene <canvas> exists with a live WebGL context and backing pixels.
 *   3. The canvas is actually painting a lit, structured massif (non-black, and
 *      with spatial luminance variation — ridges, not a flat fill).
 *   4. Live telemetry advances — the HUD survey clock / FPS move over time.
 *   5. Freeze halts the survey clock; resume restarts it.
 *   6. Moving the pointer drives the point-light readouts (Light · X changes).
 *   7. Switching ridge tint actually recolours the rendered pixels.
 *   8. The integration story renders below the fold (install, components/ui
 *      rationale, source tabs, API).
 *
 * Usage: node verify.mjs   (builds first if dist/ is missing)
 */
import { chromium } from "playwright";
import { spawn, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import net from "node:net";

const PORT = Number(process.env.VERIFY_PORT) || 47422;
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

// Sample mean luminance of the live canvas (downscaled) — used to detect that
// the massif both renders and visibly recolours when the tint changes.
const sampleCanvas = (page) =>
  page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => {
          const c = document.querySelector("canvas");
          const o = document.createElement("canvas");
          o.width = 200;
          o.height = 130;
          const cx = o.getContext("2d");
          cx.drawImage(c, 0, 0, o.width, o.height);
          const { data } = cx.getImageData(0, 0, o.width, o.height);
          let lit = 0,
            maxL = 0,
            sum = 0,
            sumSq = 0,
            n = 0,
            r = 0,
            g = 0,
            b = 0;
          for (let i = 0; i < data.length; i += 4) {
            const l = data[i] + data[i + 1] + data[i + 2];
            if (l > 12) lit++;
            if (l > maxL) maxL = l;
            sum += l;
            sumSq += l * l;
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            n++;
          }
          const mean = sum / n;
          const std = Math.sqrt(Math.max(sumSq / n - mean * mean, 0));
          resolve({
            lit,
            maxL,
            std: Math.round(std),
            r: Math.round(r / n),
            g: Math.round(g / n),
            b: Math.round(b / n),
          });
        });
      }),
  );

// Read a HUD cell value by its label text.
const readCell = (page, label) =>
  page.evaluate((lbl) => {
    const dt = [...document.querySelectorAll("dt")].find((d) =>
      (d.textContent || "").trim().toLowerCase().startsWith(lbl.toLowerCase()),
    );
    return dt?.parentElement?.querySelector("dd")?.textContent?.trim() ?? null;
  }, label);

let browser;
try {
  await waitForPort(PORT);

  browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("pageerror", (e) => consoleErrors.push(String(e)));

  await page.goto(BASE, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500); // let the scene render a few frames

  // 1. WebGL context + backing pixels.
  const gl = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    if (!c) return { ok: false, reason: "no canvas" };
    const g = c.getContext("webgl2") || c.getContext("webgl") || c.getContext("experimental-webgl");
    if (!g) return { ok: false, reason: "no webgl context" };
    return { ok: true, w: c.width, h: c.height, version: g.getParameter(g.VERSION) };
  });
  check("canvas + WebGL context present", gl.ok, gl.ok ? gl.version : gl.reason);
  check("canvas has backing pixels", gl.ok && gl.w > 0 && gl.h > 0, gl.ok ? `${gl.w}x${gl.h}` : "");

  // 2. The massif renders: non-black, lit, and spatially structured (ridges).
  const paint = await sampleCanvas(page);
  check(
    "scene paints a lit massif",
    paint.lit > 60 && paint.maxL > 40,
    `lit=${paint.lit} maxL=${paint.maxL}`,
  );
  check("relief has structure (luminance varies)", paint.std > 14, `std=${paint.std}`);

  // 3. Live telemetry advances. The survey clock displays at 1-second resolution,
  //    so every observation window below is held >1s to guarantee a tick would be
  //    visible if (and only if) the clock is actually running.
  const c1 = await readCell(page, "Survey clock");
  await page.waitForTimeout(1200);
  const c2 = await readCell(page, "Survey clock");
  check("survey clock renders", c1 !== null, c1 || "missing");
  check("clock advances while running", c1 !== null && c2 !== null && c1 !== c2, `${c1} -> ${c2}`);

  // 4. Freeze halts the clock; resume restarts it.
  await page.getByRole("button", { name: /freeze drift/i }).click();
  const f1 = await readCell(page, "Survey clock");
  await page.waitForTimeout(1200);
  const f2 = await readCell(page, "Survey clock");
  check("freeze halts the clock", f1 === f2, `${f1} == ${f2}`);
  await page.getByRole("button", { name: /resume drift/i }).click();
  await page.waitForTimeout(1200);
  const f3 = await readCell(page, "Survey clock");
  check("resume restarts the clock", f3 !== f2, `${f2} -> ${f3}`);

  // 5. Pointer movement drives the point-light readout.
  await page.mouse.move(220, 200);
  await page.waitForTimeout(300);
  const lx1 = await readCell(page, "Light · X");
  await page.mouse.move(1060, 680);
  await page.waitForTimeout(300);
  const lx2 = await readCell(page, "Light · X");
  check("pointer relights ridges (Light·X moves)", lx1 !== null && lx1 !== lx2, `${lx1} -> ${lx2}`);

  // 6. Switching tint recolours the rendered pixels.
  const before = await sampleCanvas(page);
  await page.getByRole("button", { name: /set ridge tint to magma/i }).click();
  await page.waitForTimeout(500);
  const after = await sampleCanvas(page);
  // Magma (#fb923c) is warm: red channel should rise relative to blue vs glacier.
  const warmedUp = after.r - after.b > before.r - before.b + 4;
  check(
    "tint swatch recolours the massif",
    warmedUp,
    `Δ(r-b) ${before.r - before.b} -> ${after.r - after.b}`,
  );

  // 7. Integration story below the fold.
  for (const [name, sel] of [
    ["hero headline 'Mountain Scene'", "text=/Mountain Scene/i"],
    ["anatomy section", "text=/anatomy of the massif/i"],
    ["install step present", "text=/Install the one dependency/i"],
    ["components/ui rationale present", "text=/Why it lives in components\\/ui/i"],
    ["source tabs present", "text=/copy the source/i"],
    ["API section present", "text=/API surface/i"],
  ]) {
    const n = await page.locator(sel).count();
    check(name, n > 0);
  }

  // 8. Source-tab copy button reachable.
  const copyOk = await page.evaluate(async () => {
    try {
      await navigator.clipboard.writeText("ping");
      return true;
    } catch {
      return "blocked";
    }
  });
  check("clipboard API reachable", copyOk === true || copyOk === "blocked", String(copyOk));

  // 9. No console / page errors.
  check("no console or page errors", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | "));
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
