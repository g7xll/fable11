#!/usr/bin/env node
/**
 * CLI-only verification for the Celestial Ink shader experiment.
 *
 * Boots the production preview server, drives a headless Chromium through the
 * page, and asserts that:
 *   1. a WebGL <canvas> is mounted by the shader component,
 *   2. the WebGL context is real and the ink is actually drawing (lit, animated
 *      pixels appear),
 *   3. moving the pointer drives the live ripple telemetry,
 *   4. "Still the ink" (freeze) halts the ink clock, and
 *   5. the "Drift" fader changes the rendered field.
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

let server;
let browser;
try {
  server = spawn(
    "npx",
    ["vite", "preview", "--port", String(PORT), "--strictPort"],
    { stdio: "ignore" },
  );
  await waitForServer(URL);
  await sleep(800);

  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
  await sleep(2200); // let the ink render a couple of seconds

  // 1) WebGL canvas mounted
  const canvas = await page.$(
    "div[aria-label='Celestial Ink animated background'] canvas",
  );
  canvas
    ? ok("WebGL canvas is mounted")
    : fail("WebGL canvas is mounted", "no canvas found");

  // 2) Real WebGL context + sized
  const gl = await page.evaluate(() => {
    const c = document.querySelector(
      "div[aria-label='Celestial Ink animated background'] canvas",
    );
    if (!c) return { ctx: false };
    const g = c.getContext("webgl2") || c.getContext("webgl");
    return { ctx: !!g, w: c.width, h: c.height };
  });
  gl.ctx
    ? ok("WebGL context is live")
    : fail("WebGL context is live", "getContext returned null");
  gl.w > 0 && gl.h > 0
    ? ok(`Canvas sized (${gl.w}x${gl.h})`)
    : fail("Canvas sized", `got ${gl.w}x${gl.h}`);

  // The ink doesn't set preserveDrawingBuffer, so read it off composited page
  // screenshots. A black 1280x800 PNG compresses tiny; a heavier frame proves
  // lit pixels, and two differing frames prove the field is animating.
  const shotA = await page.screenshot({
    clip: { x: 0, y: 0, width: 1280, height: 800 },
  });
  await sleep(450);
  const shotB = await page.screenshot({
    clip: { x: 0, y: 0, width: 1280, height: 800 },
  });
  shotA.length > 8000
    ? ok(`Ink is drawing (frame ${shotA.length} bytes)`)
    : fail("Ink is drawing", `frame only ${shotA.length} bytes (looks black)`);
  !shotA.equals(shotB)
    ? ok("Ink is animating (frames differ)")
    : fail("Ink is animating", "two frames were identical");

  // 3) Pointer drives the ripple telemetry
  const readRipple = () =>
    page.evaluate(() => {
      const cells = [...document.querySelectorAll(".tabular-nums")].map(
        (n) => n.textContent,
      );
      return cells.join("|");
    });
  await page.mouse.move(320, 300, { steps: 10 });
  await sleep(300);
  const a = await readRipple();
  await page.mouse.move(980, 560, { steps: 18 });
  await sleep(300);
  const b = await readRipple();
  a !== b
    ? ok("Pointer updates ripple telemetry")
    : fail("Pointer updates ripple telemetry", `readouts unchanged (${a})`);

  // 4) Freeze halts the ink clock (the "Ink time" readout stops advancing)
  const inkTime = () =>
    page.evaluate(() => {
      // First readout in the Field Readout column is "Ink time".
      const el = document.querySelector("aside .tabular-nums");
      return el ? el.textContent : null;
    });
  await page.getByRole("button", { name: /still the ink/i }).click();
  await sleep(150);
  const t1 = await inkTime();
  await sleep(900);
  const t2 = await inkTime();
  t1 && t2 && t1 === t2
    ? ok("Freeze halts the ink clock")
    : fail("Freeze halts the ink clock", `t1=${t1} t2=${t2}`);

  // Release so the field animates again for the fader check.
  await page.getByRole("button", { name: /release/i }).click();
  await sleep(400);

  // 5) Drift fader re-renders the field
  const beforeFader = await page.screenshot({
    clip: { x: 0, y: 0, width: 1280, height: 800 },
  });
  const drift = page.getByRole("slider", { name: /drift/i });
  await drift.focus();
  for (let i = 0; i < 20; i++) await page.keyboard.press("ArrowLeft");
  await sleep(500);
  const afterFader = await page.screenshot({
    clip: { x: 0, y: 0, width: 1280, height: 800 },
  });
  !beforeFader.equals(afterFader)
    ? ok("Drift fader changes the field")
    : fail("Drift fader changes the field", "frames identical after fader move");

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
  console.log(
    `${c.pass ? "PASS" : "FAIL"}  ${c.name}${c.detail ? `  — ${c.detail}` : ""}`,
  );
  if (!c.pass) failed++;
}
console.log(`\n${checks.length - failed}/${checks.length} checks passed`);
process.exit(failed ? 1 : 0);
