#!/usr/bin/env node
/**
 * Headless verification for the Expandable Hero CTA (Nexus).
 *
 * Builds (if needed), serves the production build with `vite preview`, and drives
 * a headless Chromium with WebGL/SwiftShader forced on (so the @paper-design
 * shaders compile in CI). It asserts the whole interaction the prompt describes:
 *
 *   1. The hero renders — badge, headline, gradient sub-headline, paragraph, CTA —
 *      with no console / page errors.
 *   2. The GodRays background mounts a live WebGL canvas with backing pixels that
 *      actually paint light (the bloom).
 *   3. Clicking the CTA performs the shared-layout morph into the modal: a second
 *      canvas (MeshGradient) mounts, the "Ready to scale?" panel + "Get a Demo"
 *      form render, and body scroll locks.
 *   4. Filling and submitting the form reaches the "Request Received!" success state.
 *   5. "Return to Homepage" closes the modal, restores the CTA, and unlocks scroll.
 *
 * Exits non-zero on any failure so it can gate CI / pre-commit.
 *
 * Usage: node scripts/verify.mjs   (builds first if dist/ is missing)
 */
import { chromium } from "playwright";
import { spawn, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import net from "node:net";

const PORT = Number(process.env.VERIFY_PORT) || 47411;
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

  browser = await chromium.launch({
    headless: true,
    args: [
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
      "--ignore-gpu-blocklist",
    ],
  });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto(BASE, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1200); // let the GodRays shader render a few frames

  // 1. Hero content.
  for (const [name, sel] of [
    ["badge renders", "text=New: Q3 Enterprise Report"],
    ["headline renders", "text=/Orchestrate your entire/"],
    ["gradient sub-headline renders", "text=revenue engine"],
    ["sub-paragraph renders", "text=/Nexus provides the infrastructure/"],
    ["CTA button renders", "text=Start your journey"],
  ]) {
    check(name, (await page.locator(sel).count()) > 0);
  }

  // 2. GodRays WebGL canvas present + sized + painting.
  const heroCanvas = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    if (!c) return { ok: false, reason: "no canvas" };
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    return {
      ok: !!gl,
      w: c.width,
      h: c.height,
      ver: gl ? gl.getParameter(gl.VERSION) : null,
    };
  });
  check("GodRays canvas + WebGL context present", heroCanvas.ok, heroCanvas.ok ? heroCanvas.ver : heroCanvas.reason);
  check("GodRays canvas has backing pixels", heroCanvas.ok && heroCanvas.w > 0 && heroCanvas.h > 0, `${heroCanvas.w}x${heroCanvas.h}`);

  const paint = await page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => {
          const c = document.querySelector("canvas");
          const o = document.createElement("canvas");
          o.width = 200;
          o.height = 120;
          const x = o.getContext("2d");
          x.drawImage(c, 0, 0, o.width, o.height);
          const { data } = x.getImageData(0, 0, o.width, o.height);
          let lit = 0,
            maxL = 0;
          for (let i = 0; i < data.length; i += 4) {
            const l = data[i] + data[i + 1] + data[i + 2];
            if (l > 20) lit++;
            if (l > maxL) maxL = l;
          }
          resolve({ lit, maxL });
        });
      }),
  );
  check("GodRays paints light (bloom visible)", paint.lit > 20 && paint.maxL > 40, `lit=${paint.lit} maxL=${paint.maxL}`);

  const canvasesBefore = await page.locator("canvas").count();

  // 3. Expand the CTA -> shared-layout morph into the modal.
  await page.locator("text=Start your journey").click();
  let opened = false;
  try {
    await page.locator("text=Ready to scale?").waitFor({ timeout: 5000 });
    opened = true;
  } catch {}
  check("CTA expands into modal ('Ready to scale?')", opened);
  check("demo form renders ('Get a Demo')", (await page.locator("text=Get a Demo").count()) > 0);
  check(
    "form has Full Name + Work Email inputs",
    (await page.locator("#name").count()) > 0 && (await page.locator("#email").count()) > 0,
  );

  const canvasesAfter = await page.locator("canvas").count();
  check("MeshGradient canvas mounts in modal", canvasesAfter > canvasesBefore, `${canvasesBefore} -> ${canvasesAfter}`);

  const locked = await page.evaluate(() => document.body.style.overflow);
  check("body scroll locks while modal open", locked === "hidden", `overflow=${locked || "(empty)"}`);

  // 4. Fill + submit the form, reach the success state (1.5s simulated request).
  await page.fill("#name", "Jane Doe");
  await page.fill("#email", "jane@company.com");
  await page.fill("#company", "Acme Inc");
  await page.locator('button:has-text("Submit Request")').click();
  let success = false;
  try {
    await page.locator("text=Request Received!").waitFor({ timeout: 6000 });
    success = true;
  } catch {}
  check("form submit reaches 'Request Received!' success state", success);

  // 5. Close -> CTA restored, scroll unlocked.
  await page.locator("text=Return to Homepage").click();
  let closed = false;
  try {
    await page.locator("text=Start your journey").waitFor({ timeout: 5000 });
    closed = true;
  } catch {}
  check("modal closes and CTA is restored", closed);
  await page.waitForTimeout(700); // the component resets overflow on close
  const unlocked = await page.evaluate(() => document.body.style.overflow);
  check("body scroll unlocks after close", unlocked === "unset", `overflow=${unlocked || "(empty)"}`);

  // 6. No console / page errors anywhere in the flow.
  check("no console or page errors", errors.length === 0, errors.slice(0, 3).join(" | "));

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
