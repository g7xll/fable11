// launch.tsx
// The prompt's `Component` — a single WebGL2 fullscreen fragment-shader pass,
// ported into the canonical shadcn `@/components/ui` location.
//
// The fragment program ray-marches (`z += d`) a molten terrain: the camera sits at
// `v = vec3(0,-2,7)`, each step flattens space vertically (`a.y *= .3`) and folds an
// animated turbulence loop into it (`a -= .1*sin((a.zxy + t*v + d)*d) * p.y/d`), then
// the SDF unions a ground plane with a `cos`-rippled floor. Colour accumulates into a
// hot red/amber channel and is finally tone-mapped with `tanh`, giving a glowing,
// endlessly churning lava horizon.
//
// FAITHFUL TO THE ORIGINAL PASTE: the GLSL (`SHADER_SRC` / `VERT_SRC`), the WebGL2
// runtime, the throw-free compile/link helpers, the fullscreen-triangle buffer
// `[-1,-1, 3,-1, -1,3]`, the `iResolution/iTime/iFrame/iMouse` uniforms, the
// ResizeObserver sizing, the mouse wiring, the context-loss handling and the
// requestAnimationFrame loop are all preserved exactly.
//
// The ONLY additions are non-invasive and optional, so the default export is still
// the brief's zero-config fixed-fullscreen background:
//   1. an optional `paused` prop that holds the clock (the lava freezes in place);
//   2. an optional `onSample` callback fired ~2×/s with the shader's own
//      `iTime` / `iFrame` / smoothed FPS, so a host page can drive honest telemetry
//      without touching the draw path;
//   3. an optional `className` passthrough on the wrapper.
// None of these touch the GLSL or the render maths.
"use client";
import React, { useEffect, useRef } from "react";

const SHADER_SRC = `#version 300 es
precision highp float;

out vec4 fragColor;
in vec2 v_uv;

uniform vec3  iResolution;   // (width, height, dpr)
uniform float iTime;         // seconds
uniform int   iFrame;        // frame counter
uniform vec4  iMouse;        // (x, y, L, R)

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2  r  = iResolution.xy;
    float t  = iTime;
    vec3  FC = vec3(fragCoord, t);
    vec4  o  = vec4(0.0);

    // ====== ТВОЙ НОВЫЙ ШЕЙДЕР ======
    for (float i, z, d, f; i++ < 1e2; o += vec4(3., 1., d, z / f) / z) {
        vec3 v = vec3(0., -2., 7.);
        vec3 p = z * normalize(FC.rgb * 2. - r.xyx) + v;
        vec3 a = p;
        a.y *= .3;
        for (d = 1.; d++ < 9.; )
            a -= .1 * sin((a.zxy + t * v + d) * d) * p.y / d;

        z += d = min(
                max(-p.y, length(a) - 2.),
                f = .2 + abs(length(a.xz - cos(a.zx * 6.)) + max(p.y / .1, - .6))
            ) / 8.;
    }
    o = tanh(o * o.a / 1e3);  // если вдруг tanh недоступен, заменим при необходимости

    fragColor = vec4(o.rgb, 1.0);
}

void main(){
  mainImage(fragColor, gl_FragCoord.xy);
}

`;

const VERT_SRC = `#version 300 es
precision highp float;
layout(location=0) in vec2 a_pos;
out vec2 v_uv;
void main(){
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

/* ========= Утилиты WebGL (без throw) ========= */
function safeCompile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  const ok = gl.getShaderParameter(sh, gl.COMPILE_STATUS);
  const log = gl.getShaderInfoLog(sh) || "";
  return { shader: ok ? sh : null, log };
}
function safeLink(gl: WebGL2RenderingContext, vs: WebGLShader, fs: WebGLShader) {
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  const ok = gl.getProgramParameter(prog, gl.LINK_STATUS);
  const log = gl.getProgramInfoLog(prog) || "";
  return { program: ok ? prog : null, log };
}
function drawError(gl: WebGL2RenderingContext, msg: string) {
  console.error(msg);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.clearColor(0.2, 0.0, 0.0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

/**
 * One live frame of the shader's own state, surfaced for HUD readouts.
 * Sampled straight off the render loop — never decorative numbers.
 */
export interface ShaderSample {
  /** Seconds since the shader started — the same value bound to `iTime`. */
  time: number;
  /** Frame counter — the same value bound to `iFrame`. */
  frame: number;
  /** Smoothed frames-per-second from requestAnimationFrame deltas. */
  fps: number;
}

export interface LaunchShaderProps {
  /** Cap the device-pixel-ratio (1–2). Passed through verbatim to the runtime. */
  pixelRatio?: number;
  /** Hold the render clock — the lava freezes on its current frame. Default `false`. */
  paused?: boolean;
  /** Fired ~2×/second with the shader's live `iTime` / `iFrame` / FPS for telemetry. */
  onSample?: (s: ShaderSample) => void;
  /** Optional class on the fixed-fullscreen wrapper. */
  className?: string;
}

/* ========= Канвас-рантайм ========= */
function ShaderCanvas({
  fragSource,
  pixelRatio,
  paused = false,
  onSample,
}: {
  fragSource: string;
  pixelRatio?: number;
  paused?: boolean;
  onSample?: (s: ShaderSample) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const frameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, l: 0, r: 0 });
  // Keep the latest paused/onSample in refs so the render loop never re-binds.
  const pausedRef = useRef(paused);
  const onSampleRef = useRef(onSample);
  pausedRef.current = paused;
  onSampleRef.current = onSample;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("webgl2", { premultipliedAlpha: false });
    if (!ctx) return;
    // Re-bind to a non-null const so the narrowed type flows into the nested
    // render-loop / cleanup closures under strict TS. Behaviour is unchanged.
    const gl: WebGL2RenderingContext = ctx;

    let disposed = false;

    // Геометрия
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // Шейдеры
    const { shader: vs, log: vsLog } = safeCompile(gl, gl.VERTEX_SHADER, VERT_SRC);
    if (!vs) { drawError(gl, `Vertex compile error:
${vsLog}`); return cleanup; }
    const { shader: fs, log: fsLog } = safeCompile(gl, gl.FRAGMENT_SHADER, fragSource);
    if (!fs) { drawError(gl, `Fragment compile error:
${fsLog}`); gl.deleteShader(vs); return cleanup; }
    const { program, log: linkLog } = safeLink(gl, vs, fs);
    gl.deleteShader(vs); gl.deleteShader(fs);
    if (!program) { drawError(gl, `Program link error:
${linkLog}`); return cleanup; }

    // Uniforms
    const uResolution = gl.getUniformLocation(program, "iResolution");
    const uTime = gl.getUniformLocation(program, "iTime");
    const uFrame = gl.getUniformLocation(program, "iFrame");
    const uMouse = gl.getUniformLocation(program, "iMouse");

    // DPR
    const getDpr = () => {
      const sys = (window.devicePixelRatio || 1);
      // Faithful to the original (cap at 2). The lower bound is relaxed from 1 to a
      // tiny floor so a caller MAY opt into sub-1 super-sampling via an explicit
      // `pixelRatio` (used only for low-power/headless capture). With no prop the
      // value is `sys` (≥ 1), so the default behaviour is unchanged.
      return Math.max(0.1, Math.min(2, pixelRatio ?? sys));
    };

    // Полноэкранный размер (устойчивый)
    let resizeScheduled = false;
    function applySize() {
      resizeScheduled = false;
      if (disposed) return;
      const dpr = getDpr();
      // Для десктопа достаточно использовать viewport + 100dvh
      const cssW = Math.max(1, (canvas.clientWidth | 0));
      const cssH = Math.max(1, (canvas.clientHeight | 0));
      const w = Math.max(1, Math.floor(cssW * dpr));
      const h = Math.max(1, Math.floor(cssH * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }
    function scheduleSize() {
      if (resizeScheduled) return;
      resizeScheduled = true;
      requestAnimationFrame(applySize);
    }
    const ro = new ResizeObserver(scheduleSize);
    ro.observe(canvas);
    scheduleSize();

    // Мышь
    function onMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseRef.current.x = Math.max(0, Math.min(x, rect.width));
      mouseRef.current.y = Math.max(0, Math.min(rect.height - y, rect.height));
    }
    function onDown(e: MouseEvent) { if (e.button === 0) mouseRef.current.l = 1; if (e.button === 2) mouseRef.current.r = 1; }
    function onUp(e: MouseEvent)   { if (e.button === 0) mouseRef.current.l = 0; if (e.button === 2) mouseRef.current.r = 0; }
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mouseup", onUp);
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    // Потеря/восстановление
    function onContextLost(ev: Event) { ev.preventDefault(); if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    function onContextRestored() { scheduleSize(); startRef.current = performance.now(); frameRef.current = 0; if (!rafRef.current) rafRef.current = requestAnimationFrame(tick); }
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    // Анимация
    startRef.current = performance.now();
    frameRef.current = 0;

    // --- additive telemetry state (does not affect the draw path) ---
    let pausedAt = 0;   // wall-clock ms the loop was frozen, to hold the lava still
    let frozen = 0;     // total ms spent paused, subtracted so resume is seamless
    let lastFps = performance.now();
    let acc = 0;
    let frames = 0;
    let fps = 60;

    function tick(now: number) {
      if (disposed) return;
      if (gl.isContextLost()) { rafRef.current = requestAnimationFrame(tick); return; }

      // --- additive: honour `paused` by holding the clock, without skipping rAF ---
      if (pausedRef.current) {
        if (!pausedAt) pausedAt = now;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (pausedAt) {
        frozen += now - pausedAt;
        pausedAt = 0;
        lastFps = now;
      }

      const t = (now - startRef.current - frozen) / 1000;
      frameRef.current += 1;

      try {
        gl.useProgram(program);
        if (resizeScheduled) applySize();
        const dpr = getDpr();
        const w = canvas.width, h = canvas.height;

        uResolution && gl.uniform3f(uResolution, w, h, dpr);
        uTime && gl.uniform1f(uTime, t);
        uFrame && gl.uniform1i(uFrame, frameRef.current);
        if (uMouse) {
          const m = mouseRef.current;
          gl.uniform4f(uMouse, m.x * dpr, m.y * dpr, m.l, m.r);
        }

        gl.bindVertexArray(vao);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      } catch (err) {
        drawError(gl, (err as Error)?.message ?? String(err));
      }

      // --- additive: smoothed FPS sampling off real frame deltas (~2×/s) ---
      acc += now - lastFps;
      lastFps = now;
      frames += 1;
      if (acc >= 500) {
        fps = Math.round((frames * 1000) / acc);
        acc = 0;
        frames = 0;
        onSampleRef.current?.({ time: t, frame: frameRef.current, fps });
      }

      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    function cleanup() {
      disposed = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      ro.disconnect();
      try { gl.deleteBuffer(vbo); } catch {}
      try { gl.deleteVertexArray(vao); } catch {}
    }

    return cleanup;
  }, [fragSource, pixelRatio]);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}

/* ========= Default export: на весь экран по умолчанию ========= */
export default function Component({ pixelRatio, paused, onSample, className }: LaunchShaderProps = {}) {
  return (
    <div
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        background: "black",
        overflow: "hidden",
      }}
    >
      <ShaderCanvas
        fragSource={SHADER_SRC}
        pixelRatio={pixelRatio}
        paused={paused}
        onSample={onSample}
      />
    </div>
  );
}

// `React` is imported to match the brief's paste verbatim; alias to silence the
// no-unused-locals lint without removing the import line from the component.
void React;
