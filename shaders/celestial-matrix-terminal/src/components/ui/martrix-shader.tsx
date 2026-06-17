import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Celestial Matrix Shader
 * -----------------------
 * The brief's Three.js component, ported to clean TypeScript. The GLSL is kept
 * verbatim — a blue→green field of "digital rain" bent around a cursor-driven
 * gravitational warp.
 *
 * Beyond the original, this version:
 *   - types the refs and the ShaderMaterial uniforms,
 *   - lets a parent drive the clock (`timeScale`, `frozen`) so a console UI can
 *     freeze / recalibrate the feed,
 *   - reports per-frame state through `onSample` so the page chrome can read
 *     telemetry (feed time, warp coordinates, render rate) straight off the GPU
 *     loop instead of guessing, and
 *   - degrades gracefully to a readable message when WebGL is unavailable.
 *
 * The default export with no props renders exactly the brief's fixed,
 * pointer-transparent full-viewport background.
 */

/** One reading lifted from the render loop, in shader space. */
export interface MatrixSample {
  /** Elapsed feed time in seconds (respects `timeScale` / `frozen`). */
  time: number;
  /** Warp center, normalized 0..1 across the canvas (origin bottom-left). */
  warp: { x: number; y: number };
  /** Smoothed frames per second. */
  fps: number;
}

export interface CelestialMatrixShaderProps {
  /** Extra classes merged onto the container (layout/positioning overrides). */
  className?: string;
  /** Inline style overrides merged onto the brief's defaults. */
  style?: React.CSSProperties;
  /** Multiplier on the feed clock. 1 = brief default. */
  timeScale?: number;
  /** Pause the feed clock without tearing down the GL context. */
  frozen?: boolean;
  /** Per-frame telemetry callback (throttled to ~10 Hz). */
  onSample?: (sample: MatrixSample) => void;
  /** ARIA label for the background region. */
  ariaLabel?: string;
}

interface MatrixUniforms {
  iTime: { value: number };
  iResolution: { value: THREE.Vector2 };
  iMouse: { value: THREE.Vector2 };
  [uniform: string]: THREE.IUniform;
}

const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform vec2 iResolution;
  uniform float iTime;
  uniform vec2 iMouse;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    // normalize coords by height
    vec2 uv = (gl_FragCoord.xy * 2.0 - iResolution.xy) / iResolution.y;
    vec2 mouse = (iMouse * 2.0 - iResolution) / iResolution.y;

    float dist = length(uv - mouse);
    float warp = smoothstep(0.5, 0.0, dist);
    uv += normalize(uv - mouse) * warp * 0.2;

    float gridSize = 30.0;
    vec2 gridUv = fract(uv * gridSize);
    vec2 gridId = floor(uv * gridSize);

    float t = iTime * 2.0;
    float rainSpeed = 0.5;
    float fall = fract(gridId.y * 0.1 - t * rainSpeed + random(gridId.xx) * 2.0);

    float character = random(gridId + floor(t * 5.0 * random(gridId.yx)));
    character = step(0.95, character);

    float glow = 1.0 - smoothstep(0.0, 0.8, gridUv.y);
    float intensity = character * glow * fall;

    vec3 color1 = vec3(0.1, 0.3, 0.9);
    vec3 color2 = vec3(0.1, 0.8, 0.5);
    vec3 finalColor = mix(color1, color2, random(gridId)) * intensity;
    finalColor *= (1.0 - random(gridId + t) * 0.2);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export default function CelestialMatrixShader({
  className,
  style,
  timeScale = 1,
  frozen = false,
  onSample,
  ariaLabel = "Celestial Matrix animated background",
}: CelestialMatrixShaderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Live mirrors so the loop sees the latest prop values without re-subscribing.
  const timeScaleRef = useRef(timeScale);
  const frozenRef = useRef(frozen);
  const onSampleRef = useRef(onSample);
  timeScaleRef.current = timeScale;
  frozenRef.current = frozen;
  onSampleRef.current = onSample;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1) Scene, camera, clock
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const clock = new THREE.Clock();

    // 2) Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.error("WebGL not supported:", err);
      container.innerHTML =
        '<p style="color:#9fb0cf;font-family:monospace;text-align:center;padding:2rem;">' +
        "FEED OFFLINE — this browser does not support WebGL." +
        "</p>";
      return;
    }

    // 3) Uniforms, material, mesh
    const uniforms: MatrixUniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2() },
      iMouse: { value: new THREE.Vector2() },
    };
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 4) Resize handler
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      uniforms.iResolution.value.set(w, h);
      // Re-center the warp if the cursor hasn't placed it yet.
      if (uniforms.iMouse.value.lengthSq() === 0) {
        uniforms.iMouse.value.set(w / 2, h / 2);
      }
    };
    window.addEventListener("resize", onResize);
    onResize();

    // 5) Pointer handler — warp follows the cursor. Tracked on window because
    // the brief's container is pointer-transparent (pointerEvents: none).
    const onPointerMove = (e: PointerEvent | MouseEvent) => {
      const rect = container.getBoundingClientRect();
      // flip Y so (0,0) is bottom-left, matching the shader's coordinate space
      uniforms.iMouse.value.set(e.clientX - rect.left, rect.height - (e.clientY - rect.top));
    };
    window.addEventListener("pointermove", onPointerMove);

    // 6) Feed clock decoupled from wall time so the parent can freeze / scale it.
    let feedTime = 0;
    let lastWall = clock.getElapsedTime();

    // Telemetry throttling + smoothed FPS.
    let smoothedFps = 60;
    let lastSampleAt = 0;
    let lastFrameWall = lastWall;

    // 7) Animation loop
    renderer.setAnimationLoop(() => {
      const wall = clock.getElapsedTime();
      const dt = wall - lastWall;
      lastWall = wall;

      if (!frozenRef.current) feedTime += dt * timeScaleRef.current;
      uniforms.iTime.value = feedTime;
      renderer.render(scene, camera);

      // FPS (exponential moving average over instantaneous frame delta)
      const frameDt = wall - lastFrameWall;
      lastFrameWall = wall;
      if (frameDt > 0) smoothedFps = smoothedFps * 0.9 + (1 / frameDt) * 0.1;

      // Report telemetry ~10x/sec so React re-renders stay cheap.
      const sampler = onSampleRef.current;
      if (sampler && wall - lastSampleAt > 0.1) {
        lastSampleAt = wall;
        const res = uniforms.iResolution.value;
        sampler({
          time: feedTime,
          warp: {
            x: res.x > 0 ? uniforms.iMouse.value.x / res.x : 0.5,
            y: res.y > 0 ? uniforms.iMouse.value.y / res.y : 0.5,
          },
          fps: smoothedFps,
        });
      }
    });

    // 8) Cleanup
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);

      renderer.setAnimationLoop(null);

      const canvas = renderer.domElement;
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }

      material.dispose();
      geometry.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none",
        ...style,
      }}
      aria-label={ariaLabel}
    />
  );
}
