import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Parameters that drive the parametric build of the plasma-grid shader. Each one
 * maps to a uniform, so changing it re-tints or re-shapes the field in real time
 * without recompiling the program. Defaults reproduce the original brief shader.
 */
export type ShaderParams = {
	/** Master animation speed multiplier (brief default: overallSpeed = 0.2). */
	speed: number;
	/** World scale — smaller zooms in, larger zooms out (brief default: 5.0). */
	scale: number;
	/** Vertical reach of the plasma lines (brief default: lineAmplitude = 1.0). */
	amplitude: number;
	/** Number of warping lines drawn per group, 1–16 (brief default: 16). */
	lineCount: number;
	/** Hue rotation applied to the violet line colour, in degrees (0 = original). */
	hue: number;
	/** Domain-warp strength — how much the field folds into itself (default 1.0). */
	warp: number;
};

export const DEFAULT_PARAMS: ShaderParams = {
	speed: 1,
	scale: 5,
	amplitude: 1,
	lineCount: 16,
	hue: 0,
	warp: 1,
};

/** Live readouts the running program reports back every frame. */
export type ShaderTelemetry = {
	/** Seconds since the program started (the `iTime` uniform). */
	time: number;
	/** Smoothed frames per second. */
	fps: number;
	/** Drawing-buffer width in device pixels. */
	width: number;
	/** Drawing-buffer height in device pixels. */
	height: number;
};

type ShaderBackgroundProProps = {
	params?: Partial<ShaderParams>;
	/** Called ~6×/sec with fresh telemetry from the WebGL context. */
	onTelemetry?: (t: ShaderTelemetry) => void;
	/** When false, the canvas is rendered without the fixed/full-screen layout. */
	fixed?: boolean;
	className?: string;
};

const vsSource = `
  attribute vec4 aVertexPosition;
  void main() {
    gl_Position = aVertexPosition;
  }
`;

/**
 * Parametric build of the brief's fragment shader. The constants that were baked
 * into the original (scale, speed, amplitude, line count, warp, line colour) are
 * promoted to uniforms, and a small hue-rotation matrix is applied to the violet
 * accent so the deck can recolour the field. Everything else is identical maths.
 */
const fsSource = `
  precision highp float;
  uniform vec2 iResolution;
  uniform float iTime;
  uniform float uSpeed;
  uniform float uScale;
  uniform float uAmplitude;
  uniform float uWarp;
  uniform float uHue;
  uniform int uLineCount;

  const float overallSpeed = 0.2;
  const float gridSmoothWidth = 0.015;
  const float minLineWidth = 0.01;
  const float maxLineWidth = 0.2;
  const float lineFrequency = 0.2;
  const float warpFrequency = 0.5;
  const float offsetFrequency = 0.5;
  const float minOffsetSpread = 0.6;
  const float maxOffsetSpread = 2.0;
  const int maxLines = 16;

  // Rotate an rgb colour around the YIQ chroma plane by angle a (radians).
  vec3 hueRotate(vec3 color, float a) {
    const mat3 toYIQ = mat3(0.299, 0.587, 0.114, 0.596, -0.274, -0.322, 0.211, -0.523, 0.312);
    const mat3 toRGB = mat3(1.0, 0.956, 0.621, 1.0, -0.272, -0.647, 1.0, -1.106, 1.703);
    vec3 yiq = toYIQ * color;
    float c = cos(a);
    float s = sin(a);
    yiq.yz = mat2(c, -s, s, c) * yiq.yz;
    return toRGB * yiq;
  }

  float random(float t) {
    return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) / 3.0;
  }

  #define drawCircle(pos, radius, coord) smoothstep(radius + gridSmoothWidth, radius, length(coord - (pos)))
  #define drawSmoothLine(pos, halfWidth, t) smoothstep(halfWidth, 0.0, abs(pos - (t)))
  #define drawCrispLine(pos, halfWidth, t) smoothstep(halfWidth + gridSmoothWidth, halfWidth, abs(pos - (t)))

  float getPlasmaY(float x, float horizontalFade, float offset, float lineSpeed) {
    return random(x * lineFrequency + iTime * lineSpeed) * horizontalFade * uAmplitude + offset;
  }

  void main() {
    float lineSpeed = 1.0 * overallSpeed * uSpeed;
    float warpSpeed = 0.2 * overallSpeed * uSpeed;
    float offsetSpeed = 1.33 * overallSpeed * uSpeed;

    vec2 fragCoord = gl_FragCoord.xy;
    vec4 fragColor;
    vec2 uv = fragCoord.xy / iResolution.xy;
    vec2 space = (fragCoord - iResolution.xy / 2.0) / iResolution.x * 2.0 * uScale;

    float horizontalFade = 1.0 - (cos(uv.x * 6.28) * 0.5 + 0.5);
    float verticalFade = 1.0 - (cos(uv.y * 6.28) * 0.5 + 0.5);

    space.y += random(space.x * warpFrequency + iTime * warpSpeed) * uWarp * (0.5 + horizontalFade);
    space.x += random(space.y * warpFrequency + iTime * warpSpeed + 2.0) * uWarp * horizontalFade;

    vec4 lineColor = vec4(hueRotate(vec4(0.4, 0.2, 0.8, 1.0).rgb, uHue), 1.0);

    vec4 lines = vec4(0.0);
    vec4 bgColor1 = vec4(0.1, 0.1, 0.3, 1.0);
    vec4 bgColor2 = vec4(0.3, 0.1, 0.5, 1.0);

    for (int l = 0; l < maxLines; l++) {
      if (l >= uLineCount) break;
      float normalizedLineIndex = float(l) / float(uLineCount);
      float offsetTime = iTime * offsetSpeed;
      float offsetPosition = float(l) + space.x * offsetFrequency;
      float rand = random(offsetPosition + offsetTime) * 0.5 + 0.5;
      float halfWidth = mix(minLineWidth, maxLineWidth, rand * horizontalFade) / 2.0;
      float offset = random(offsetPosition + offsetTime * (1.0 + normalizedLineIndex)) * mix(minOffsetSpread, maxOffsetSpread, horizontalFade);
      float linePosition = getPlasmaY(space.x, horizontalFade, offset, lineSpeed);
      float line = drawSmoothLine(linePosition, halfWidth, space.y) / 2.0 + drawCrispLine(linePosition, halfWidth * 0.15, space.y);

      float circleX = mod(float(l) + iTime * lineSpeed, 25.0) - 12.0;
      vec2 circlePosition = vec2(circleX, getPlasmaY(circleX, horizontalFade, offset, lineSpeed));
      float circle = drawCircle(circlePosition, 0.01, space) * 4.0;

      line = line + circle;
      lines += line * lineColor * rand;
    }

    fragColor = mix(bgColor1, bgColor2, uv.x);
    fragColor *= verticalFade;
    fragColor.a = 1.0;
    fragColor += lines;

    gl_FragColor = fragColor;
  }
`;

function compile(
	gl: WebGLRenderingContext,
	type: number,
	source: string,
): WebGLShader | null {
	const shader = gl.createShader(type);
	if (!shader) return null;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error("Shader compile error:", gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

/**
 * The interactive cousin of ShaderBackground. Same plasma-grid maths, but every
 * knob is a live uniform, and it streams `iTime`/FPS/resolution back through
 * `onTelemetry`. Used by the hero (as the page background) and by the control
 * deck (as a contained preview), both reading from a single shared params object.
 */
const ShaderBackgroundPro = ({
	params,
	onTelemetry,
	fixed = true,
	className,
}: ShaderBackgroundProProps) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	// Latest params live in a ref so the render loop reads them without re-running.
	const paramsRef = useRef<ShaderParams>({ ...DEFAULT_PARAMS, ...params });
	const telemetryRef = useRef(onTelemetry);

	paramsRef.current = { ...DEFAULT_PARAMS, ...params };
	telemetryRef.current = onTelemetry;

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const gl =
			canvas.getContext("webgl") ||
			(canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
		if (!gl) {
			console.warn("WebGL not supported.");
			return;
		}

		const vertexShader = compile(gl, gl.VERTEX_SHADER, vsSource);
		const fragmentShader = compile(gl, gl.FRAGMENT_SHADER, fsSource);
		if (!vertexShader || !fragmentShader) return;

		const program = gl.createProgram();
		if (!program) return;
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error("Program link error:", gl.getProgramInfoLog(program));
			return;
		}

		const positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
			gl.STATIC_DRAW,
		);

		const loc = {
			vertexPosition: gl.getAttribLocation(program, "aVertexPosition"),
			resolution: gl.getUniformLocation(program, "iResolution"),
			time: gl.getUniformLocation(program, "iTime"),
			speed: gl.getUniformLocation(program, "uSpeed"),
			scale: gl.getUniformLocation(program, "uScale"),
			amplitude: gl.getUniformLocation(program, "uAmplitude"),
			warp: gl.getUniformLocation(program, "uWarp"),
			hue: gl.getUniformLocation(program, "uHue"),
			lineCount: gl.getUniformLocation(program, "uLineCount"),
		};

		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const resize = () => {
			const rect = canvas.getBoundingClientRect();
			const w = Math.max(1, Math.round(rect.width * dpr));
			const h = Math.max(1, Math.round(rect.height * dpr));
			if (canvas.width !== w || canvas.height !== h) {
				canvas.width = w;
				canvas.height = h;
			}
			gl.viewport(0, 0, canvas.width, canvas.height);
		};

		const observer = new ResizeObserver(resize);
		observer.observe(canvas);
		window.addEventListener("resize", resize);
		resize();

		let frameId = 0;
		const start = performance.now();
		let fpsAccum = 0;
		let fpsFrames = 0;
		let lastFrame = start;
		let lastReport = start;
		let smoothedFps = 60;

		const render = () => {
			resize();
			const now = performance.now();
			const time = (now - start) / 1000;

			const dt = now - lastFrame;
			lastFrame = now;
			fpsAccum += dt;
			fpsFrames += 1;

			gl.clearColor(0, 0, 0, 1);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.useProgram(program);

			const p = paramsRef.current;
			gl.uniform2f(loc.resolution, canvas.width, canvas.height);
			gl.uniform1f(loc.time, time);
			gl.uniform1f(loc.speed, p.speed);
			gl.uniform1f(loc.scale, p.scale);
			gl.uniform1f(loc.amplitude, p.amplitude);
			gl.uniform1f(loc.warp, p.warp);
			gl.uniform1f(loc.hue, (p.hue * Math.PI) / 180);
			gl.uniform1i(loc.lineCount, Math.round(p.lineCount));

			gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
			gl.vertexAttribPointer(loc.vertexPosition, 2, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(loc.vertexPosition);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

			// Report telemetry ~6×/sec to keep React renders cheap.
			if (now - lastReport > 160) {
				if (fpsAccum > 0) {
					smoothedFps = smoothedFps * 0.6 + (fpsFrames / fpsAccum) * 1000 * 0.4;
				}
				fpsAccum = 0;
				fpsFrames = 0;
				lastReport = now;
				telemetryRef.current?.({
					time,
					fps: smoothedFps,
					width: canvas.width,
					height: canvas.height,
				});
			}

			frameId = requestAnimationFrame(render);
		};

		frameId = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(frameId);
			observer.disconnect();
			window.removeEventListener("resize", resize);
			gl.deleteProgram(program);
			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
			gl.deleteBuffer(positionBuffer);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className={cn(
				fixed ? "fixed inset-0 -z-10 h-full w-full" : "h-full w-full",
				className,
			)}
		/>
	);
};

export default ShaderBackgroundPro;
