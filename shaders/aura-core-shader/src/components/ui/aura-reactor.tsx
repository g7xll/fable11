import { useEffect, useRef } from "react";

/**
 * AuraReactor — a typed, controllable sibling of the verbatim `AuraCore`
 * drop-in (see `./aura-core.tsx`). It runs the exact same inlined-OGL renderer
 * and the *verbatim* vertex/fragment GLSL from the integration brief, but lifts
 * the four shader parameters out into props so the surrounding containment
 * console can own them, and reports per-frame telemetry back out.
 *
 * The render path is byte-for-byte the original: full-screen `Triangle`,
 * `webgl2` context, the same HSV core / rotating rays / fbm particle field.
 * Nothing about the look changes — only *who holds the dials*.
 *
 * Props:
 *   - hue/power/focus/distortion : the brief's four uniforms, now controlled.
 *   - paused                     : freezes the shader clock in place.
 *   - onFrame                    : live telemetry (clock, fps, mouse, peak load).
 */

export interface ReactorTelemetry {
  /** Seconds elapsed on the shader clock (holds while paused). */
  time: number;
  /** Smoothed frames-per-second. */
  fps: number;
  /** Cursor X in shader space (aspect-corrected, ~[-1,1]). */
  mouseX: number;
  /** Cursor Y in shader space (~[-1,1]). */
  mouseY: number;
  /** Pointer proximity to the core center, 0 (far) → 1 (dead center). */
  proximity: number;
}

export interface AuraReactorProps {
  hue?: number;
  power?: number;
  focus?: number;
  distortion?: number;
  paused?: boolean;
  onFrame?: (telemetry: ReactorTelemetry) => void;
  className?: string;
}

// ─── Inlined OGL minimal layer (same primitives as the verbatim component) ───

class Vec2 extends Float32Array {
  constructor(x = 0, y = 0) {
    super(2);
    this[0] = x;
    this[1] = y;
  }
  set2(x: number, y: number) {
    this[0] = x;
    this[1] = y;
    return this;
  }
}

class Color3 extends Float32Array {
  constructor(r = 0, g = 0, b = 0) {
    super(3);
    this[0] = r;
    this[1] = g;
    this[2] = b;
  }
  set3(r: number, g: number, b: number) {
    this[0] = r;
    this[1] = g;
    this[2] = b;
    return this;
  }
}

type Uniforms = {
  uTime: { value: number };
  uResolution: { value: Vec2 };
  uMouse: { value: Vec2 };
  uColor: { value: Color3 };
  uPower: { value: number };
  uFocus: { value: number };
  uDistortion: { value: number };
};

// ─── Verbatim GLSL from the brief (unchanged) ───────────────────────────────

const fragmentShader = `
    precision highp float;

    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    uniform vec3 uColor;
    uniform float uPower;
    uniform float uFocus;
    uniform float uDistortion;

    varying vec2 vUv;

    vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }

    float random (vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    float noise (vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.y * u.x;
    }

    float fbm(vec2 st) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 5; i++) {
            value += amplitude * noise(st);
            st *= 2.0;
            amplitude *= 0.5;
        }
        return value;
    }

    void main() {
        vec2 uv = (vUv - 0.5) * uResolution / min(uResolution.x, uResolution.y);

        float mouseDist = distance(uv, uMouse);
        float mouseEffect = smoothstep(1.0, 0.0, mouseDist) * uPower;

        float dist = length(uv);
        float core = smoothstep(0.2, 0.18, dist);

        vec2 distortedUv = uv + vec2(
            fbm(uv * 2.0 + uTime * 0.1),
            fbm(uv * 2.0 - uTime * 0.1)
        ) * 0.1 * uDistortion;
        float coreTexture = fbm(distortedUv * 5.0 + uTime * 0.2);
        core *= coreTexture * (1.0 + mouseEffect);

        float angle = atan(uv.y, uv.x);
        float rays = 0.0;
        for(int i = 0; i < 10; i++){
            float angle_offset = float(i) * (3.14159 * 2.0 / 10.0);
            rays += pow(abs(sin(angle * 5.0 + uTime * 0.5 + angle_offset)), uFocus);
        }
        rays *= smoothstep(0.8, 0.0, dist) * (1.0 + mouseEffect * 2.0);

        float particles = fbm(uv * 4.0 + uTime * 0.1) * 0.2;
        particles *= smoothstep(0.6, 0.0, dist);

        float final_color = core + rays + particles;

        vec3 hsv = vec3(uColor.r, 0.7, final_color * (0.5 + mouseEffect));
        vec3 rgb = hsv2rgb(hsv);

        gl_FragColor = vec4(rgb, 1.0);
    }
`;

const vertexShader = `
    attribute vec2 uv;
    attribute vec2 position;
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = vec4(position, 0, 1);
    }
`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

const AuraReactor = ({
  hue = 210,
  power = 1.5,
  focus = 30,
  distortion = 1,
  paused = false,
  onFrame,
  className = "",
}: AuraReactorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const uniformsRef = useRef<Uniforms | null>(null);
  const paramRef = useRef({ hue, power, focus, distortion });
  const pausedRef = useRef(paused);
  const onFrameRef = useRef(onFrame);

  // Keep the latest controlled values available to the render loop without
  // tearing down the WebGL context.
  paramRef.current = { hue, power, focus, distortion };
  pausedRef.current = paused;
  onFrameRef.current = onFrame;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    const gl = canvas.getContext("webgl2", { antialias: true });
    if (!gl) {
      console.error("WebGL2 is not available in this browser.");
      return;
    }

    // Full-screen triangle (same vertices as the verbatim component).
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexShader));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentShader));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
    }
    gl.useProgram(program);

    const makeBuffer = (name: string, data: Float32Array) => {
      const loc = gl.getAttribLocation(program, name);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    };
    makeBuffer("position", new Float32Array([-1, -1, 3, -1, -1, 3]));
    makeBuffer("uv", new Float32Array([0, 0, 2, 0, 0, 2]));

    const uniforms: Uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new Vec2(canvas.width, canvas.height) },
      uMouse: { value: new Vec2() },
      uColor: { value: new Color3() },
      uPower: { value: 0 },
      uFocus: { value: 0 },
      uDistortion: { value: 0 },
    };
    uniformsRef.current = uniforms;

    const loc = {
      uTime: gl.getUniformLocation(program, "uTime"),
      uResolution: gl.getUniformLocation(program, "uResolution"),
      uMouse: gl.getUniformLocation(program, "uMouse"),
      uColor: gl.getUniformLocation(program, "uColor"),
      uPower: gl.getUniformLocation(program, "uPower"),
      uFocus: gl.getUniformLocation(program, "uFocus"),
      uDistortion: gl.getUniformLocation(program, "uDistortion"),
    };

    const handleResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      uniforms.uResolution.value.set2(canvas.width, canvas.height);
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      const aspect = rect.width / rect.height;
      mousePos.current = { x: nx * aspect, y: ny };
    };
    window.addEventListener("mousemove", handleMouseMove);

    let raf = 0;
    let clock = 0;
    let last = performance.now();
    let fps = 60;
    let lastReport = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!pausedRef.current) clock += dt;
      fps += ((1 / Math.max(dt, 1e-4)) - fps) * 0.1;

      const p = paramRef.current;
      uniforms.uTime.value = clock;
      uniforms.uMouse.value.set2(mousePos.current.x, mousePos.current.y);
      uniforms.uColor.value.set3(p.hue / 360, 1, 1);
      uniforms.uPower.value = p.power;
      uniforms.uFocus.value = p.focus;
      uniforms.uDistortion.value = p.distortion;

      gl.uniform1f(loc.uTime, uniforms.uTime.value);
      gl.uniform2fv(loc.uResolution, uniforms.uResolution.value);
      gl.uniform2fv(loc.uMouse, uniforms.uMouse.value);
      gl.uniform3fv(loc.uColor, uniforms.uColor.value);
      gl.uniform1f(loc.uPower, uniforms.uPower.value);
      gl.uniform1f(loc.uFocus, uniforms.uFocus.value);
      gl.uniform1f(loc.uDistortion, uniforms.uDistortion.value);

      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // Throttle telemetry to ~20Hz so React state updates stay cheap.
      if (onFrameRef.current && now - lastReport > 50) {
        lastReport = now;
        const mx = mousePos.current.x;
        const my = mousePos.current.y;
        const proximity = Math.max(0, 1 - Math.hypot(mx, my));
        onFrameRef.current({ time: clock, fps, mouseX: mx, mouseY: my, proximity });
      }
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      const ext = gl.getExtension("WEBGL_lose_context");
      ext?.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
};

export default AuraReactor;
