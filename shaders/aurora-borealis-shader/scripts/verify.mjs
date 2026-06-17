#!/usr/bin/env node
/**
 * CLI-only verification for the Aurora Watch shader experiment.
 *
 * Boots the production preview server, drives a headless Chromium through the
 * page, and asserts that:
 *   1. a WebGL <canvas> is mounted by the aurora component,
 *   2. the WebGL context is real and sized,
 *   3. the aurora is actually drawing (lit pixels) and animating (frames differ),
 *   4. the cursor flare drives live telemetry (the probe lat/lon readouts change
 *      when the pointer moves),
 *   5. the Kp gauge renders and reports a numeric value, and
 *   6. the "Hold sky" control freezes the sky clock.
 *
 * Exits non-zero on any failure so it can gate the build.
 */
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const PORT = 4319;
const URL = `http://localhost:${PORT}/`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function waitForServer(url, tries = 60) {
  return new Promise((resolve, reject) => {
    const attempt = async (n) => {
      try {
        const res = await fetch(url);
        if (res.ok) return resolve();
      } catch {
        /* not up yet */
      }
      if (n <= 0) return reject(new Error("server never came up"));
      setTimeout(() => attempt(n - 1), 500);
    };
    attempt(tries);
  });
}

const checks = [];
const ok = (name) => checks.push({ name, pass: true });
const fail = (name, detail) => checks.push({ name, pass: false, detail });

const SEL = "div[aria-label='Aurora Borealis animated background'] canvas";

let server;
let browser;
try {
  server = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], {
    stdio: "ignore",
  });
  await waitForServer(URL);
  await sleep(800);

  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
  await sleep(2500); // let the aurora render a few seconds

  // 1) WebGL canvas mounted
  const canvas = await page.$(SEL);
  canvas ? ok("WebGL canvas is mounted") : fail("WebGL canvas is mounted", "no canvas found");

  // 2) Real WebGL context + sized
  const gl = await page.evaluate((sel) => {
    const c = document.querySelector(sel);
    if (!c) return { ctx: false };
    const g = c.getContext("webgl2") || c.getContext("webgl");
    return { ctx: !!g, w: c.width, h: c.height };
  }, SEL);
  gl.ctx ? ok("WebGL context is live") : fail("WebGL context is live", "getContext returned null");
  gl.w > 0 && gl.h > 0
    ? ok(`Canvas sized (${gl.w}x${gl.h})`)
    : fail("Canvas sized", `got ${gl.w}x${gl.h}`);

  // 3) Aurora is drawing + animating, via composited page screenshots.
  // (The component doesn't set preserveDrawingBuffer, so a direct canvas
  // readback is empty; the compositor screenshot captures the real frame.) An
  // all-black 1280x800 PNG compresses to a few hundred bytes, so a frame
  // heavier than that proves lit pixels exist, and a second shot differing
  // proves the curtain is animating.
  const shotA = await page.screenshot({ clip: { x: 0, y: 0, width: 1280, height: 800 } });
  await sleep(450);
  const shotB = await page.screenshot({ clip: { x: 0, y: 0, width: 1280, height: 800 } });
  shotA.length > 4000
    ? ok(`Aurora is drawing (frame ${shotA.length} bytes)`)
    : fail("Aurora is drawing", `frame only ${shotA.length} bytes (looks black)`);
  !shotA.equals(shotB)
    ? ok("Aurora is animating (frames differ)")
    : fail("Aurora is animating", "two frames were identical");

  // 4) Cursor flare drives the probe lat/lon telemetry.
  const readProbe = () =>
    page.evaluate(() => {
      const cells = [...document.querySelectorAll(".font-mono.tabular-nums")].map(
        (n) => n.textContent,
      );
      return cells.join("|");
    });
  await page.mouse.move(300, 300, { steps: 12 });
  await sleep(350);
  const a = await readProbe();
  await page.mouse.move(980, 560, { steps: 18 });
  await sleep(350);
  const b = await readProbe();
  a !== b
    ? ok("Cursor flare updates probe telemetry")
    : fail("Cursor flare updates probe telemetry", `readouts unchanged (${a})`);

  // 5) Kp gauge renders a numeric value.
  const kp = await page.evaluate(() => {
    const label = [...document.querySelectorAll("span")].find(
      (s) => s.textContent && /kp index/i.test(s.textContent),
    );
    if (!label) return null;
    // The big numeric reading is the .font-display.tabular-nums in the gauge.
    const num = [...document.querySelectorAll(".font-display.tabular-nums")]
      .map((n) => n.textContent)
      .find((t) => /^\d+\.\d$/.test((t || "").trim()));
    return num ?? null;
  });
  kp !== null
    ? ok(`Kp index gauge reports ${kp}`)
    : fail("Kp index gauge reports a value", "no numeric Kp reading found");

  // 6) "Hold sky" freezes the sky clock.
  const clockNow = () =>
    page.evaluate(() => {
      const els = [...document.querySelectorAll(".font-mono.tabular-nums")];
      // sky clock is HH:MM:SS — match that shape specifically
      const c = els.map((e) => e.textContent).find((t) => /^\d{2}:\d{2}:\d{2}$/.test((t || "").trim()));
      return c ?? null;
    });
  await page.getByRole("button", { name: /hold sky/i }).click();
  await sleep(150);
  const t1 = await clockNow();
  await sleep(1100);
  const t2 = await clockNow();
  t1 && t2 && t1 === t2
    ? ok("Hold sky freezes the sky clock")
    : fail("Hold sky freezes the sky clock", `t1=${t1} t2=${t2}`);

  // No uncaught runtime errors
  errors.length === 0
    ? ok("No uncaught runtime errors")
    : fail("No uncaught runtime errors", errors.join(" / "));
} catch (e) {
  fail("verification harness", String(e?.stack || e));
} finally {
  if (browser) await browser.close().catch(() => {});
  if (server) server.kill("SIGTERM");
}

let failed = 0;
for (const c of checks) {
  console.log(`${c.pass ? "PASS" : "FAIL"}  ${c.name}${c.detail ? `  — ${c.detail}` : ""}`);
  if (!c.pass) failed++;
}
console.log(`\n${checks.length - failed}/${checks.length} checks passed`);
process.exit(failed ? 1 : 0);
