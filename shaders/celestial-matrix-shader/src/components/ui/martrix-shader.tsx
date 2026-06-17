import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * CelestialMatrixShader — the interactive Three.js "Celestial Matrix" WebGL
 * background from the integration brief, dropped into the shadcn
 * `components/ui` folder.
 *
 * The scene, orthographic camera, full-screen plane, and the verbatim
 * vertex/fragment shaders are unchanged from the source component. Two optional
 * props are layered on top without touching the render path so the surrounding
 * console can stay in sync with the running shader:
 *   - `paused`   freezes the clock (the falling glyphs hold in place).
 *   - `onFrame`  reports per-frame telemetry (elapsed seconds, fps, and the
 *                normalized cursor position that drives the gravitational warp).
 * Both default to a no-op, so `<CelestialMatrixShader />` behaves exactly like
 * the original drop-in background.
 */

export interface ShaderTelemetry {
  /** Seconds elapsed on the shader clock. */
  time: number;
  /** Smoothed frames-per-second. */
  fps: number;
  /** Cursor X in [0,1] across the viewport. */
  mouseX: number;
  /** Cursor Y in [0,1] from the bottom of the viewport (shader space). */
  mouseY: number;
}

interface CelestialMatrixShaderProps {
  /** When true, the animation clock holds and the rain freezes. */
  paused?: boolean;
  /** Called once per rendered frame with live telemetry. */
  onFrame?: (telemetry: ShaderTelemetry) => void;
}

const CelestialMatrixShader = ({ paused = false, onFrame }: CelestialMatrixShaderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep the latest props in refs so the animation loop closure always reads
  // current values without re-running the (expensive) WebGL setup effect.
  const pausedRef = useRef(paused);
  const onFrameRef = useRef(onFrame);
  pausedRef.current = paused;
  onFrameRef.current = onFrame;

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
      renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.error("WebGL not supported:", err);
      container.innerHTML =
        '<p style="color:white;text-align:center;">Sorry, your browser does not support WebGL.</p>';
      return;
    }

    // 3) Shaders
    const vertexShader = `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
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

    // 4) Uniforms, material, mesh
    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2() },
      iMouse: { value: new THREE.Vector2() },
    };
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 5) Resize handler
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      uniforms.iResolution.value.set(w, h);
    };
    window.addEventListener("resize", onResize);
    onResize();

    // 6) Mouse handler
    const onMouseMove = (e: MouseEvent) => {
      // flip Y so (0,0) is bottom-left
      uniforms.iMouse.value.set(e.clientX, container.clientHeight - e.clientY);
    };
    window.addEventListener("mousemove", onMouseMove);

    // Pausing freezes the clock by holding the last elapsed value and offsetting
    // future deltas, so the rain resumes seamlessly instead of jumping.
    let elapsed = 0;
    let lastFrame = performance.now();
    let fpsSmoothed = 60;

    // 7) Animation loop
    renderer.setAnimationLoop(() => {
      const now = performance.now();
      const dt = (now - lastFrame) / 1000;
      lastFrame = now;
      if (dt > 0) fpsSmoothed += (1 / dt - fpsSmoothed) * 0.1;

      if (!pausedRef.current) elapsed += clock.getDelta();
      else clock.getDelta(); // keep the clock's internal delta drained while paused

      uniforms.iTime.value = elapsed;
      renderer.render(scene, camera);

      const cb = onFrameRef.current;
      if (cb) {
        const w = uniforms.iResolution.value.x || 1;
        const h = uniforms.iResolution.value.y || 1;
        cb({
          time: elapsed,
          fps: fpsSmoothed,
          mouseX: uniforms.iMouse.value.x / w,
          mouseY: uniforms.iMouse.value.y / h,
        });
      }
    });

    // 8) Cleanup
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);

      // stop the loop
      renderer.setAnimationLoop(null);

      // detach canvas safely via its parentNode
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
      className="shader-container"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none",
      }}
      aria-label="Celestial Matrix animated background"
    />
  );
};

export default CelestialMatrixShader;
