import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
	type DitheringShape,
	DitheringShapes,
	type DitheringType,
	DitheringTypes,
} from "@/components/ui/dithering-shader";
import { cn } from "@/lib/utils";

/**
 * Live telemetry the dithering stage reports each animation frame so the lab
 * HUD can read exactly what the GPU is doing.
 */
export interface DitherTelemetry {
	/** Frames per second, smoothed over a rolling half-second window. */
	fps: number;
	/** Seconds on the shader clock (the `u_time` uniform). */
	time: number;
	/** Drawing-buffer resolution in device pixels. */
	width: number;
	height: number;
	/** Pixel-cell grid the dithering resolves to (canvasPx / pxSize). */
	cols: number;
	rows: number;
}

export interface DitherStageProps {
	shape: DitheringShape;
	type: DitheringType;
	colorBack: string;
	colorFront: string;
	/** Cell size of the pixelization, in CSS px. */
	pxSize: number;
	/** Clock multiplier applied to `u_time`. */
	speed: number;
	/** Freeze the clock without tearing down the GL context. */
	paused?: boolean;
	onTelemetry?: (t: DitherTelemetry) => void;
	className?: string;
}

/* ───────────────────────────────────────────────────────────────────────────
   GLSL — identical math to the prompt's `DitheringShader` (WebGL2 / GLSL ES
   3.00): the same simplex/hash helpers, the same 2×2/4×4/8×8 Bayer tables, the
   same 7 shapes and 4 dithering branches. The only change vs. the drop-in is
   structural, so this engine can fill the viewport, stay DPR-aware, expose live
   telemetry, and freeze on pause — without touching the copy-pasted component.
   ───────────────────────────────────────────────────────────────────────── */

const declarePI = `
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
`;

const proceduralHash11 = `
  float hash11(float p) {
    p = fract(p * 0.3183099) + 0.1;
    p *= p + 19.19;
    return fract(p * p);
  }
`;

const proceduralHash21 = `
  float hash21(vec2 p) {
    p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
  }
`;

const simplexNoise = `
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;

const VERTEX_SHADER = `#version 300 es
precision mediump float;

layout(location = 0) in vec4 a_position;

void main() {
  gl_Position = a_position;
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec4 u_colorBack;
uniform vec4 u_colorFront;
uniform float u_shape;
uniform float u_type;
uniform float u_pxSize;

out vec4 fragColor;

${simplexNoise}
${declarePI}
${proceduralHash11}
${proceduralHash21}

float getSimplexNoise(vec2 uv, float t) {
  float noise = .5 * snoise(uv - vec2(0., .3 * t));
  noise += .5 * snoise(2. * uv + vec2(0., .32 * t));
  return noise;
}

const int bayer2x2[4] = int[4](0, 2, 3, 1);
const int bayer4x4[16] = int[16](
  0,  8,  2, 10,
 12,  4, 14,  6,
  3, 11,  1,  9,
 15,  7, 13,  5
);

const int bayer8x8[64] = int[64](
   0, 32,  8, 40,  2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44,  4, 36, 14, 46,  6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
   3, 35, 11, 43,  1, 33,  9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47,  7, 39, 13, 45,  5, 37,
  63, 31, 55, 23, 61, 29, 53, 21
);

float getBayerValue(vec2 uv, int size) {
  ivec2 pos = ivec2(mod(uv, float(size)));
  int index = pos.y * size + pos.x;

  if (size == 2) {
    return float(bayer2x2[index]) / 4.0;
  } else if (size == 4) {
    return float(bayer4x4[index]) / 16.0;
  } else if (size == 8) {
    return float(bayer8x8[index]) / 64.0;
  }
  return 0.0;
}

void main() {
  float t = .5 * u_time;
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv -= .5;

  // Apply pixelization
  float pxSize = u_pxSize;
  vec2 pxSizeUv = gl_FragCoord.xy;
  pxSizeUv -= .5 * u_resolution;
  pxSizeUv /= pxSize;
  vec2 pixelizedUv = floor(pxSizeUv) * pxSize / u_resolution.xy;
  pixelizedUv += .5;
  pixelizedUv -= .5;

  vec2 shape_uv = pixelizedUv;
  vec2 dithering_uv = pxSizeUv;
  vec2 ditheringNoise_uv = uv * u_resolution;

  float shape = 0.;
  if (u_shape < 1.5) {
    // Simplex noise
    shape_uv *= .001;
    shape = 0.5 + 0.5 * getSimplexNoise(shape_uv, t);
    shape = smoothstep(0.3, 0.9, shape);

  } else if (u_shape < 2.5) {
    // Warp
    shape_uv *= .003;
    for (float i = 1.0; i < 6.0; i++) {
      shape_uv.x += 0.6 / i * cos(i * 2.5 * shape_uv.y + t);
      shape_uv.y += 0.6 / i * cos(i * 1.5 * shape_uv.x + t);
    }
    shape = .15 / abs(sin(t - shape_uv.y - shape_uv.x));
    shape = smoothstep(0.02, 1., shape);

  } else if (u_shape < 3.5) {
    // Dots
    shape_uv *= .05;
    float stripeIdx = floor(2. * shape_uv.x / TWO_PI);
    float rand = hash11(stripeIdx * 10.);
    rand = sign(rand - .5) * pow(.1 + abs(rand), .4);
    shape = sin(shape_uv.x) * cos(shape_uv.y - 5. * rand * t);
    shape = pow(abs(shape), 6.);

  } else if (u_shape < 4.5) {
    // Sine wave
    shape_uv *= 4.;
    float wave = cos(.5 * shape_uv.x - 2. * t) * sin(1.5 * shape_uv.x + t) * (.75 + .25 * cos(3. * t));
    shape = 1. - smoothstep(-1., 1., shape_uv.y + wave);

  } else if (u_shape < 5.5) {
    // Ripple
    float dist = length(shape_uv);
    float waves = sin(pow(dist, 1.7) * 7. - 3. * t) * .5 + .5;
    shape = waves;

  } else if (u_shape < 6.5) {
    // Swirl
    float l = length(shape_uv);
    float angle = 6. * atan(shape_uv.y, shape_uv.x) + 4. * t;
    float twist = 1.2;
    float offset = pow(l, -twist) + angle / TWO_PI;
    float mid = smoothstep(0., 1., pow(l, twist));
    shape = mix(0., fract(offset), mid);

  } else {
    // Sphere
    shape_uv *= 2.;
    float d = 1. - pow(length(shape_uv), 2.);
    vec3 pos = vec3(shape_uv, sqrt(d));
    vec3 lightPos = normalize(vec3(cos(1.5 * t), .8, sin(1.25 * t)));
    shape = .5 + .5 * dot(lightPos, pos);
    shape *= step(0., d);
  }

  int type = int(floor(u_type));
  float dithering = 0.0;

  switch (type) {
    case 1: {
      dithering = step(hash21(ditheringNoise_uv), shape);
    } break;
    case 2:
      dithering = getBayerValue(dithering_uv, 2);
      break;
    case 3:
      dithering = getBayerValue(dithering_uv, 4);
      break;
    default:
      dithering = getBayerValue(dithering_uv, 8);
      break;
  }

  dithering -= .5;
  float res = step(.5, shape + dithering);

  vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
  float fgOpacity = u_colorFront.a;
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  float bgOpacity = u_colorBack.a;

  vec3 color = fgColor * res;
  float opacity = fgOpacity * res;

  color += bgColor * (1. - opacity);
  opacity += bgOpacity * (1. - opacity);

  fragColor = vec4(color, opacity);
}
`;

function hexToRgba(hex: string): [number, number, number, number] {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!result) return [0, 0, 0, 1];
	return [
		parseInt(result[1], 16) / 255,
		parseInt(result[2], 16) / 255,
		parseInt(result[3], 16) / 255,
		1,
	];
}

function createShader(
	gl: WebGL2RenderingContext,
	type: number,
	source: string,
): WebGLShader | null {
	const shader = gl.createShader(type);
	if (!shader) return null;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error(`Shader compile error: ${gl.getShaderInfoLog(shader)}`);
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

function createProgram(gl: WebGL2RenderingContext): WebGLProgram | null {
	const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
	const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
	if (!vs || !fs) return null;
	const program = gl.createProgram();
	if (!program) return null;
	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error(`Program link error: ${gl.getProgramInfoLog(program)}`);
		gl.deleteProgram(program);
		return null;
	}
	gl.deleteShader(vs);
	gl.deleteShader(fs);
	return program;
}

/**
 * Full-window dithering stage. The GL program is built once; shape, dithering
 * type, colors, pixel size and speed are pushed as live uniforms every frame,
 * so dragging a fader re-tints/re-shapes the field with zero recompiles.
 */
const DitherStage: React.FC<DitherStageProps> = ({
	shape,
	type,
	colorBack,
	colorFront,
	pxSize,
	speed,
	paused = false,
	onTelemetry,
	className,
}) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const rafRef = useRef<number | null>(null);
	const [glError, setGlError] = useState(false);

	// Live prop mirror read inside the rAF loop without re-subscribing the effect.
	const live = useRef({
		shape,
		type,
		colorBack,
		colorFront,
		pxSize,
		speed,
		paused,
		onTelemetry,
	});
	live.current = {
		shape,
		type,
		colorBack,
		colorFront,
		pxSize,
		speed,
		paused,
		onTelemetry,
	};

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const gl = canvas.getContext("webgl2", { antialias: false });
		if (!gl) {
			console.error("WebGL2 not supported");
			setGlError(true);
			return;
		}

		const program = createProgram(gl);
		if (!program) {
			setGlError(true);
			return;
		}

		const u = {
			time: gl.getUniformLocation(program, "u_time"),
			resolution: gl.getUniformLocation(program, "u_resolution"),
			colorBack: gl.getUniformLocation(program, "u_colorBack"),
			colorFront: gl.getUniformLocation(program, "u_colorFront"),
			shape: gl.getUniformLocation(program, "u_shape"),
			type: gl.getUniformLocation(program, "u_type"),
			pxSize: gl.getUniformLocation(program, "u_pxSize"),
		};

		const loc = gl.getAttribLocation(program, "a_position");
		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
			gl.STATIC_DRAW,
		);
		gl.enableVertexAttribArray(loc);
		gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

		let dpr = 1;
		const sizeTo = () => {
			dpr = Math.min(window.devicePixelRatio || 1, 2);
			const rect = canvas.getBoundingClientRect();
			const w = Math.max(
				1,
				Math.round((rect.width || window.innerWidth) * dpr),
			);
			const h = Math.max(
				1,
				Math.round((rect.height || window.innerHeight) * dpr),
			);
			if (canvas.width !== w || canvas.height !== h) {
				canvas.width = w;
				canvas.height = h;
				gl.viewport(0, 0, w, h);
			}
		};
		sizeTo();
		window.addEventListener("resize", sizeTo);

		// Clock that can be frozen on pause (no GL tear-down, just stop advancing).
		let clock = 0;
		let last = performance.now();
		let frames = 0;
		let fpsWindowStart = performance.now();
		let fps = 0;

		gl.useProgram(program);

		const render = () => {
			const now = performance.now();
			const dt = (now - last) / 1000;
			last = now;

			const s = live.current;
			// pxSize is in CSS px; the drawing buffer is DPR-scaled, so scale to match
			// the visual cell size the user dialed in.
			const pxBuffer = Math.max(1, s.pxSize * dpr);
			if (!s.paused) clock += dt * s.speed;

			frames += 1;
			if (now - fpsWindowStart >= 500) {
				fps = Math.round((frames * 1000) / (now - fpsWindowStart));
				frames = 0;
				fpsWindowStart = now;
			}

			sizeTo();
			gl.clear(gl.COLOR_BUFFER_BIT);

			gl.uniform1f(u.time, clock);
			gl.uniform2f(u.resolution, canvas.width, canvas.height);
			gl.uniform4fv(u.colorBack, hexToRgba(s.colorBack));
			gl.uniform4fv(u.colorFront, hexToRgba(s.colorFront));
			gl.uniform1f(u.shape, DitheringShapes[s.shape]);
			gl.uniform1f(u.type, DitheringTypes[s.type]);
			gl.uniform1f(u.pxSize, pxBuffer);

			gl.drawArrays(gl.TRIANGLES, 0, 6);

			s.onTelemetry?.({
				fps,
				time: clock,
				width: canvas.width,
				height: canvas.height,
				cols: Math.round(canvas.width / pxBuffer),
				rows: Math.round(canvas.height / pxBuffer),
			});

			rafRef.current = requestAnimationFrame(render);
		};
		render();

		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
			window.removeEventListener("resize", sizeTo);
			gl.deleteProgram(program);
			gl.deleteBuffer(buffer);
		};
	}, []);

	return (
		<div className={cn("absolute inset-0 overflow-hidden", className)}>
			<canvas ref={canvasRef} className="dither-canvas block h-full w-full" />
			{glError && (
				<div className="absolute inset-0 grid place-items-center px-6 text-center">
					<p className="font-mono text-sm text-ash">
						WebGL2 is unavailable in this browser, so the dithering shader
						can&rsquo;t run.
					</p>
				</div>
			)}
		</div>
	);
};

export default DitherStage;
