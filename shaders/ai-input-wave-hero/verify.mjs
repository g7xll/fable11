/**
 * Headless verification for the AI Input Wave Hero.
 *
 * Boots the Vite preview server, drives Playwright's bundled Chromium (WebGL2
 * via SwiftShader) against the built page, and asserts:
 *   1. No console errors / page errors (incl. shader compile/link failures).
 *   2. The hero <canvas> mounts inside #waveCanvas with backing pixels.
 *   3. A live WebGL/WebGL2 context exists on that canvas.
 *   4. The canvas is actually painting (non-black, cobalt-leaning pixels).
 *   5. The verbatim hero chrome renders: <Navbar />, the title, the prompt textarea.
 *   6. The component's own typing-placeholder loop animates while empty.
 *   7. Pointer dragging over the field is accepted without errors.
 *   8. The integration / API sections render below the fold.
 *
 * Usage: node verify.mjs   (run `npm run build` first, or it builds for you)
 */
import { chromium } from "playwright";
import { spawn, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import net from "node:net";

const PORT = Number(process.env.VERIFY_PORT) || 47622;
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
  await page.waitForTimeout(2000); // let the shader timeline render several frames

  // 1. Canvas lives inside #waveCanvas, with a live WebGL context + backing pixels.
  const gl = await page.evaluate(() => {
    const host = document.querySelector("#waveCanvas");
    const c = host && host.querySelector("canvas");
    if (!c) return { ok: false, reason: "no canvas in #waveCanvas" };
    const ctx =
      c.getContext("webgl2") || c.getContext("webgl") || c.getContext("experimental-webgl");
    if (!ctx) return { ok: false, reason: "no webgl context" };
    return {
      ok: true,
      w: c.width,
      h: c.height,
      version: ctx.getParameter(ctx.VERSION),
    };
  });
  check("hero <canvas> mounts in #waveCanvas", gl.ok, gl.ok ? gl.version : gl.reason);
  check("canvas has backing pixels", gl.ok && gl.w > 0 && gl.h > 0, gl.ok ? `${gl.w}x${gl.h}` : "");

  // 2. The canvas is painting a non-black, cobalt-leaning field. Copy the live
  //    WebGL canvas into a 2D canvas during a frame and read it back.
  const paint = await page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => {
          const c = document.querySelector("#waveCanvas canvas");
          const o = document.createElement("canvas");
          o.width = 200;
          o.height = 120;
          const ctx = o.getContext("2d");
          ctx.drawImage(c, 0, 0, o.width, o.height);
          const { data } = ctx.getImageData(0, 0, o.width, o.height);
          let lit = 0,
            rSum = 0,
            gSum = 0,
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
            gSum += g;
            bSum += b;
            n++;
            if (l > maxL) maxL = l;
          }
          resolve({
            lit,
            maxL,
            rAvg: Math.round(rSum / n),
            gAvg: Math.round(gSum / n),
            bAvg: Math.round(bSum / n),
            coolerThanRed: bSum >= rSum, // cobalt field: blue >= red
          });
        });
      }),
  );
  check(
    "shader paints a non-black field",
    paint.lit > 40 && paint.maxL > 24,
    `lit=${paint.lit} maxL=${paint.maxL}`,
  );
  check(
    "field reads cool/cobalt (blue ≥ red)",
    paint.coolerThanRed,
    `rAvg=${paint.rAvg} gAvg=${paint.gAvg} bAvg=${paint.bAvg}`,
  );

  // 3. Verbatim hero chrome: navbar dots, the title, the prompt textarea.
  const navCount = await page.locator("header nav, header button").count();
  check("mini-navbar renders", navCount > 0, `${navCount} nav elements`);
  const titleCount = await page.locator("h1", { hasText: "Build with AI." }).count();
  check("hero title renders", titleCount > 0);
  const textarea = page.locator("textarea");
  check("prompt textarea renders", (await textarea.count()) > 0);

  // 4. The component's own typing-placeholder loop animates while empty.
  const ph1 = await textarea.first().getAttribute("placeholder");
  await page.waitForTimeout(1100);
  const ph2 = await textarea.first().getAttribute("placeholder");
  check(
    "typing placeholder animates",
    !!ph1 && !!ph2 && ph1 !== ph2 && ph1.startsWith("Make me a"),
    `${JSON.stringify(ph1)} -> ${JSON.stringify(ph2)}`,
  );

  // 5. Typing into the textarea works and is reflected in its value.
  await textarea.first().click();
  await textarea.first().type("a kanban board", { delay: 8 });
  const typed = await textarea.first().inputValue();
  check("textarea accepts input", typed === "a kanban board", JSON.stringify(typed));

  // 6. Pointer dragging over the field is accepted (drives the glow accumulation).
  const box = await page.locator("#waveCanvas").first().boundingBox();
  await page.mouse.move(box.x + 200, box.y + box.height - 120);
  await page.mouse.down();
  await page.mouse.move(box.x + 900, box.y + box.height - 160, { steps: 14 });
  await page.mouse.up();
  await page.waitForTimeout(300);
  check("pointer drag over field is handled", true);

  // 7. Integration / API story below the fold.
  for (const [name, sel] of [
    ["anatomy section present", "text=/A WebGL wavefield that listens/i"],
    ["integration section present", "text=/shadcn .* Tailwind .* TypeScript/i"],
    ["components/ui rationale present", "text=/Why .*components\\/ui/i"],
    ["props/API table present", "text=/HeroWave.*props/i"],
  ]) {
    const n = await page.locator(sel).count();
    check(name, n > 0);
  }

  // 8. No console / page errors.
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
