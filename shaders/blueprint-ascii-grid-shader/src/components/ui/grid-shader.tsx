"use client";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * GridShader — the parametric cousin of the brief's verbatim `asd.tsx` component.
 *
 * The original shader bakes its look into a wall of GLSL `const`s (GRID_SCALE,
 * MAJOR_STEP, MESH_AMT, ASCII_AMT, SCROLL_SPEED, …). This variant keeps the
 * EXACT same maths but promotes those knobs to uniforms, so the showcase can
 * re-shape and re-tint the whole field in real time without recompiling, and it
 * streams `iTime` / FPS / resolution back to React through `onTelemetry`.
 *
 * It is otherwise faithful to the brief's WebGL2 runtime: a single fullscreen
 * triangle, the same `iResolution/iTime/iFrame/iMouse` uniforms, the no-throw
 * compile/link helpers, the TDZ-safe cleanup, and the pointer wiring (the GLSL
 * does not consume `iMouse` yet, but the plumbing is kept for parity).
 */

export type GridParams = {
	/** Density of the thin grid (brief default GRID_SCALE = 18). */
	gridScale: number;
	/** Thin lines per major cell (brief default MAJOR_STEP = 4). */
	majorStep: number;
	/** Drift speed of the whole field (brief default SCROLL_SPEED = 0.02). */
	scrollSpeed: number;
	/** Mesh-gradient blend over the base navy wash (brief default MESH_AMT = 0.85). */
	meshAmt: number;
	/** ASCII-glyph stamp strength on the intersections (brief default ASCII_AMT = 0.23). */
	asciiAmt: number;
	/** ASCII glyph cell density (brief default ASCII_SCALE = 26). */
	asciiScale: number;
	/** Radial vignette darkening (brief default VIGNETTE_AMT = 0.28). */
	vignetteAmt: number;
	/** Value-noise grain over the frame (brief default NOISE_AMT = 0.030). */
	noiseAmt: number;
};

export const DEFAULT_GRID_PARAMS: GridParams = {
	gridScale: 18,
	majorStep: 4,
	scrollSpeed: 0.02,
	meshAmt: 0.85,
	asciiAmt: 0.23,
	asciiScale: 26,
	vignetteAmt: 0.28,
	noiseAmt: 0.03,
};

export type GridTelemetry = {
	/** Seconds since the program started (the `iTime` uniform). */
	time: number;
	/** Smoothed frames per second. */
	fps: number;
	/** Drawing-buffer width in device pixels. */
	width: number;
	/** Drawing-buffer height in device pixels. */
	height: number;
	/** Frame counter (the `iFrame` uniform). */
	frame: number;
	/** Pointer in device pixels with the shader's y-up convention: [x, y, left, right]. */
	mouse: [number, number, number, number];
};

type GridShaderProps = {
	params?: Partial<GridParams>;
	/** Called ~6×/sec with fresh telemetry from the WebGL2 context. */
	onTelemetry?: (t: GridTelemetry) => void;
	/** When false, the canvas drops the fixed/full-screen layout (for previews). */
	fixed?: boolean;
	className?: string;
};

/* ---- Fragment shader: the brief's maths, constants promoted to uniforms ---- */
const FRAG_SRC = `#version 300 es
precision highp float;

out vec4 fragColor;
in vec2 v_uv;

uniform vec3  iResolution;   // (w, h, dpr)
uniform float iTime;
uniform int   iFrame;
uniform vec4  iMouse;

// Promoted from the brief's GLSL consts -> live uniforms.
uniform float uGridScale;
uniform float uMajorStep;
uniform float uScrollSpeed;
uniform float uMeshAmt;
uniform float uAsciiAmt;
uniform float uAsciiScale;
uniform float uVignetteAmt;
uniform float uNoiseAmt;

// Kept as constants (unchanged from the brief).
const float THIN_WIDTH   = 0.010;
const float MAJOR_WIDTH  = 0.018;
const float DITHER_DARK  = 0.010;
const float DITHER_LIGHT = 0.004;
const float ASCII_EVERY  = 2.0;

// ordered dither 4×4
float bayer4(vec2 p){
  ivec2 ip = ivec2(int(mod(p.x,4.0)), int(mod(p.y,4.0)));
  int idx = ip.y*4 + ip.x;
  int m[16]; m[0]=0;m[1]=8;m[2]=2;m[3]=10;m[4]=12;m[5]=4;m[6]=14;m[7]=6;
  m[8]=3;m[9]=11;m[10]=1;m[11]=9;m[12]=15;m[13]=7;m[14]=13;m[15]=5;
  return float(m[idx]) / 15.0;
}

// hash + value noise
float hash21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  float a=hash21(i), b=hash21(i+vec2(1,0)), c=hash21(i+vec2(0,1)), d=hash21(i+vec2(1,1));
  vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}

float gridLineAA(vec2 uv, float scale, float width){
  vec2 g = abs(fract(uv*scale) - 0.5);
  float d = min(g.x, g.y);
  float aa = fwidth(d);
  return 1.0 - smoothstep(width, width + aa, d);
}
float majorGridAA(vec2 uv, float scale, float stepN, float width){
  float sMajor = max(1.0, scale/stepN);
  return gridLineAA(uv, sMajor, width);
}

// mesh-gradient: 4 deep-navy / cobalt points
vec3 meshGradient(vec2 uv){
  vec2 p0=vec2(-0.70,-0.45), p1=vec2(0.75,-0.35), p2=vec2(-0.65,0.65), p3=vec2(0.80,0.55);
  vec3 c0=vec3(0.05,0.10,0.26);  // deep navy
  vec3 c1=vec3(0.08,0.16,0.36);  // royal navy
  vec3 c2=vec3(0.03,0.09,0.22);  // abyss
  vec3 c3=vec3(0.10,0.20,0.40);  // cobalt
  float e=2.0;
  float w0=pow(1.0/(0.2+distance(uv,p0)),e);
  float w1=pow(1.0/(0.2+distance(uv,p1)),e);
  float w2=pow(1.0/(0.2+distance(uv,p2)),e);
  float w3=pow(1.0/(0.2+distance(uv,p3)),e);
  float ws=w0+w1+w2+w3;
  return (c0*w0+c1*w1+c2*w2+c3*w3)/ws;
}

float sdLineX(vec2 p, float w){ return 1.0 - smoothstep(w, w+fwidth(p.y), abs(p.y)); }
float sdLineY(vec2 p, float w){ return 1.0 - smoothstep(w, w+fwidth(p.x), abs(p.x)); }
float sdDiag1(vec2 p, float w){ float d=abs(p.x+p.y)/sqrt(2.0); return 1.0 - smoothstep(w, w+fwidth(d), d); }
float sdDiag2(vec2 p, float w){ float d=abs(p.x-p.y)/sqrt(2.0); return 1.0 - smoothstep(w, w+fwidth(d), d); }
float sdDot (vec2 p, float r){ float d=length(p); return 1.0 - smoothstep(r, r+fwidth(d), d); }

float asciiGlyph(vec2 cellUV, float level){
  vec2 p=cellUV; float w=0.11, r=0.10;
  float g0=sdDot(p,r), g1=sdLineX(p,w), g2=sdLineY(p,w),
        g3=max(sdLineX(p,w),sdLineY(p,w)),
        g4=sdDiag1(p,w), g5=sdDiag2(p,w),
        g6=max(sdDiag1(p,w),sdDiag2(p,w)),
        g7=max(sdLineX(p,w), max(sdLineY(p,w), g6));
  float m=0.;
  m=mix(m,g0, smoothstep(0.00,0.12,level)*(1.0-step(level,0.12)));
  m=mix(m,g1, smoothstep(0.12,0.28,level)*(1.0-step(level,0.28)));
  m=mix(m,g2, smoothstep(0.28,0.44,level)*(1.0-step(level,0.44)));
  m=mix(m,g3, smoothstep(0.44,0.60,level)*(1.0-step(level,0.60)));
  m=mix(m,g4, smoothstep(0.60,0.72,level)*(1.0-step(level,0.72)));
  m=mix(m,g5, smoothstep(0.72,0.84,level)*(1.0-step(level,0.84)));
  m=mix(m,g6, smoothstep(0.84,0.94,level)*(1.0-step(level,0.94)));
  m=mix(m,g7, smoothstep(0.94,1.00,level));
  return clamp(m,0.0,1.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
  vec2  R = iResolution.xy;
  float t = iTime;
  vec2 uv = (fragCoord - 0.5*R) / max(R.y, 1.0);

  vec3 baseDeep = vec3(0.03,0.06,0.12);
  vec3 baseTint = vec3(0.05,0.09,0.18);
  float vgrad   = smoothstep(-0.92, 0.55, -uv.y);
  vec3  bg      = mix(baseDeep, baseTint, vgrad);
  bg            = mix(bg, meshGradient(uv), uMeshAmt);
  float rad     = length(uv);
  float vig     = pow(1.0 - uVignetteAmt * rad, 1.0);
  bg           *= clamp(vig, 0.0, 1.0);

  vec2 scrollDir = normalize(vec2(1.0, -0.55));
  vec2 uvAnim    = uv + uScrollSpeed * t * scrollDir;

  float thin  = gridLineAA (uvAnim, uGridScale, THIN_WIDTH);
  float major = majorGridAA(uvAnim, uGridScale, uMajorStep, MAJOR_WIDTH);

  vec3 lineThin  = vec3(0.58,0.66,0.95);
  vec3 lineMajor = vec3(0.78,0.84,1.00);

  vec3 col = bg
           + lineThin  * thin  * 0.25
           + lineMajor * major * 0.52;

  vec2 uMajor = uvAnim * (uGridScale / uMajorStep);
  vec2 idx    = floor(uMajor + 0.5);
  float selX = 1.0 - step(0.001, abs(fract(idx.x / ASCII_EVERY)));
  float selY = 1.0 - step(0.001, abs(fract(idx.y / ASCII_EVERY)));
  float asciiLineSel = max(selX, selY);

  if (uAsciiAmt > 0.001) {
    vec2 aUV   = uv * uAsciiScale;
    vec2 cellF = fract(aUV) - 0.5;
    float lvl  = clamp(dot(col, vec3(0.2126,0.7152,0.0722)), 0.0, 1.0);
    float glyph = asciiGlyph(cellF, lvl);

    float nearMajor = major;
    float asciiMask = asciiLineSel * nearMajor;
    vec3 asciiColor = mix(vec3(0.50,0.70,1.0), meshGradient(uv), 0.25);

    col = mix(col, col + asciiColor * glyph * 0.30, uAsciiAmt * asciiMask);
  }

  float n = vnoise(fragCoord*0.6 + vec2(t*12.0, -t*9.0));
  col += (n - 0.5) * uNoiseAmt;

  // ---- ordered dither (Bayer 4×4) ----
  float luma = dot(col, vec3(0.2126,0.7152,0.0722));
  float dAmt = mix(DITHER_DARK, DITHER_LIGHT, luma);
  col += (bayer4(fragCoord) - 0.5) * dAmt;

  col = tanh(col);
  fragColor = vec4(col, 1.0);
}

void main(){ mainImage(fragColor, gl_FragCoord.xy); }
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

export default function GridShader({
	params,
	onTelemetry,
	fixed = true,
	className,
}: GridShaderProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	// Latest params live in a ref so the render loop reads them without re-running.
	const paramsRef = useRef<GridParams>({ ...DEFAULT_GRID_PARAMS, ...params });
	const telemetryRef = useRef(onTelemetry);

	paramsRef.current = { ...DEFAULT_GRID_PARAMS, ...params };
	telemetryRef.current = onTelemetry;

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const gl = canvas.getContext("webgl2", { premultipliedAlpha: false });
		if (!gl) {
			console.warn("WebGL2 not supported.");
			return;
		}

		let disposed = false;
		let vao: WebGLVertexArrayObject | null = null;
		let vbo: WebGLBuffer | null = null;
		let program: WebGLProgram | null = null;
		let ro: ResizeObserver | null = null;
		let resizeScheduled = false;

		const mouse = { x: 0, y: 0, l: 0, r: 0 };

		const onMove = (e: MouseEvent) => {
			const rect = canvas.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			mouse.x = Math.max(0, Math.min(x, rect.width));
			mouse.y = Math.max(0, Math.min(rect.height - y, rect.height));
		};
		const onDown = (e: MouseEvent) => {
			if (e.button === 0) mouse.l = 1;
			if (e.button === 2) mouse.r = 1;
		};
		const onUp = (e: MouseEvent) => {
			if (e.button === 0) mouse.l = 0;
			if (e.button === 2) mouse.r = 0;
		};
		const onCtxMenu = (e: Event) => e.preventDefault();

		const getDpr = () => {
			const sys = window.devicePixelRatio || 1;
			return Math.max(1, Math.min(2, sys));
		};

		function applySize() {
			resizeScheduled = false;
			if (disposed || !canvas) return;
			const dpr = getDpr();
			const cssW = Math.max(1, canvas.clientWidth | 0);
			const cssH = Math.max(1, canvas.clientHeight | 0);
			const w = Math.max(1, Math.floor(cssW * dpr));
			const h = Math.max(1, Math.floor(cssH * dpr));
			if (canvas.width !== w || canvas.height !== h) {
				canvas.width = w;
				canvas.height = h;
				gl!.viewport(0, 0, w, h);
			}
		}
		function scheduleSize() {
			if (resizeScheduled) return;
			resizeScheduled = true;
			requestAnimationFrame(applySize);
		}

		// Geometry — single fullscreen triangle.
		vao = gl.createVertexArray();
		vbo = gl.createBuffer();
		if (!vao || !vbo) {
			drawError(gl, "Failed to create VAO/VBO");
			return;
		}
		gl.bindVertexArray(vao);
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([-1, -1, 3, -1, -1, 3]),
			gl.STATIC_DRAW,
		);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

		// Shaders
		const { shader: vs, log: vsLog } = safeCompile(gl, gl.VERTEX_SHADER, VERT_SRC);
		if (!vs) {
			drawError(gl, `Vertex compile error:\n${vsLog}`);
			return;
		}
		const { shader: fs, log: fsLog } = safeCompile(
			gl,
			gl.FRAGMENT_SHADER,
			FRAG_SRC,
		);
		if (!fs) {
			drawError(gl, `Fragment compile error:\n${fsLog}`);
			gl.deleteShader(vs);
			return;
		}
		const linked = safeLink(gl, vs, fs);
		gl.deleteShader(vs);
		gl.deleteShader(fs);
		if (!linked.program) {
			drawError(gl, `Program link error:\n${linked.log}`);
			return;
		}
		program = linked.program;

		const loc = {
			resolution: gl.getUniformLocation(program, "iResolution"),
			time: gl.getUniformLocation(program, "iTime"),
			frame: gl.getUniformLocation(program, "iFrame"),
			mouse: gl.getUniformLocation(program, "iMouse"),
			gridScale: gl.getUniformLocation(program, "uGridScale"),
			majorStep: gl.getUniformLocation(program, "uMajorStep"),
			scrollSpeed: gl.getUniformLocation(program, "uScrollSpeed"),
			meshAmt: gl.getUniformLocation(program, "uMeshAmt"),
			asciiAmt: gl.getUniformLocation(program, "uAsciiAmt"),
			asciiScale: gl.getUniformLocation(program, "uAsciiScale"),
			vignetteAmt: gl.getUniformLocation(program, "uVignetteAmt"),
			noiseAmt: gl.getUniformLocation(program, "uNoiseAmt"),
		};

		ro = new ResizeObserver(scheduleSize);
		ro.observe(canvas);
		scheduleSize();

		canvas.addEventListener("mousemove", onMove);
		canvas.addEventListener("mousedown", onDown);
		canvas.addEventListener("mouseup", onUp);
		canvas.addEventListener("contextmenu", onCtxMenu);

		let frameId = 0;
		let frame = 0;
		const start = performance.now();
		let fpsAccum = 0;
		let fpsFrames = 0;
		let lastFrame = start;
		let lastReport = start;
		let smoothedFps = 60;

		const render = () => {
			if (disposed) return;
			if (gl.isContextLost()) {
				frameId = requestAnimationFrame(render);
				return;
			}
			if (resizeScheduled) applySize();

			const now = performance.now();
			const time = (now - start) / 1000;
			frame += 1;

			const dt = now - lastFrame;
			lastFrame = now;
			fpsAccum += dt;
			fpsFrames += 1;

			gl.clearColor(0, 0, 0, 1);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.useProgram(program);

			const p = paramsRef.current;
			const dpr = getDpr();
			gl.uniform3f(loc.resolution, canvas.width, canvas.height, dpr);
			gl.uniform1f(loc.time, time);
			gl.uniform1i(loc.frame, frame);
			gl.uniform4f(loc.mouse, mouse.x * dpr, mouse.y * dpr, mouse.l, mouse.r);
			gl.uniform1f(loc.gridScale, p.gridScale);
			gl.uniform1f(loc.majorStep, Math.max(1, p.majorStep));
			gl.uniform1f(loc.scrollSpeed, p.scrollSpeed);
			gl.uniform1f(loc.meshAmt, p.meshAmt);
			gl.uniform1f(loc.asciiAmt, p.asciiAmt);
			gl.uniform1f(loc.asciiScale, p.asciiScale);
			gl.uniform1f(loc.vignetteAmt, p.vignetteAmt);
			gl.uniform1f(loc.noiseAmt, p.noiseAmt);

			gl.bindVertexArray(vao);
			gl.drawArrays(gl.TRIANGLES, 0, 3);

			if (now - lastReport > 160) {
				if (fpsAccum > 0) {
					smoothedFps =
						smoothedFps * 0.6 + (fpsFrames / fpsAccum) * 1000 * 0.4;
				}
				fpsAccum = 0;
				fpsFrames = 0;
				lastReport = now;
				telemetryRef.current?.({
					time,
					fps: smoothedFps,
					width: canvas.width,
					height: canvas.height,
					frame,
					mouse: [mouse.x * dpr, mouse.y * dpr, mouse.l, mouse.r],
				});
			}

			frameId = requestAnimationFrame(render);
		};
		frameId = requestAnimationFrame(render);

		return () => {
			disposed = true;
			cancelAnimationFrame(frameId);
			canvas.removeEventListener("mousemove", onMove);
			canvas.removeEventListener("mousedown", onDown);
			canvas.removeEventListener("mouseup", onUp);
			canvas.removeEventListener("contextmenu", onCtxMenu);
			if (ro) {
				try {
					ro.disconnect();
				} catch {
					/* noop */
				}
				ro = null;
			}
			try {
				if (vbo) gl.deleteBuffer(vbo);
			} catch {
				/* noop */
			}
			try {
				if (vao) gl.deleteVertexArray(vao);
			} catch {
				/* noop */
			}
			try {
				if (program) gl.deleteProgram(program);
			} catch {
				/* noop */
			}
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			aria-hidden="true"
			className={cn(
				fixed ? "fixed inset-0 -z-10 h-full w-full" : "h-full w-full",
				className,
			)}
		/>
	);
}
