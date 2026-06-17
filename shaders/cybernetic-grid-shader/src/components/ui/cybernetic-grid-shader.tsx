import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * CyberneticGridShader — the interactive Three.js "Cybernetic Grid" WebGL
 * background from the integration brief, dropped into the shadcn
 * `components/ui` folder.
 *
 * The renderer, orthographic camera, full-screen plane, and the verbatim
 * vertex/fragment GLSL are unchanged from the source component: a pulsing
 * cobalt grid with magenta energy crawling the lattice and a white glow that
 * warps the grid around the cursor. Two optional props are layered on top
 * WITHOUT touching the render path, so the surrounding instrument console can
 * stay in sync with the running shader:
 *   - `paused`   freezes the shader clock (the grid holds; pulses stop).
 *   - `onFrame`  reports per-frame telemetry (elapsed seconds, smoothed fps,
 *                and the normalized cursor position that drives the warp).
 * Both default to a no-op, so `<CyberneticGridShader />` behaves exactly like
 * the original drop-in background described in the prompt.
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

interface CyberneticGridShaderProps {
  /** When true, the animation clock holds and the lattice freezes. */
  paused?: boolean;
  /** Called once per rendered frame with live telemetry. */
  onFrame?: (telemetry: ShaderTelemetry) => void;
}

const CyberneticGridShader = ({ paused = false, onFrame }: CyberneticGridShaderProps) => {
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

    // 1) Renderer, Scene, Camera, Clock
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.error("WebGL not supported:", err);
      container.innerHTML =
        '<p style="color:#8aa0c8;font-family:monospace;text-align:center;padding:2rem;">WebGL is unavailable — the cybernetic grid cannot render.</p>';
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const clock = new THREE.Clock();

    // 2) GLSL Shaders (verbatim from the brief)
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
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233)))
                     * 43758.5453123);
      }

      void main() {
        // normalize coords around center
        vec2 uv    = (gl_FragCoord.xy - 0.5 * iResolution.xy)
                     / iResolution.y;
        vec2 mouse = (iMouse - 0.5 * iResolution.xy)
                     / iResolution.y;

        float t         = iTime * 0.2;
        float mouseDist = length(uv - mouse);

        // warp effect around mouse
        float warp = sin(mouseDist * 20.0 - t * 4.0) * 0.1;
        warp *= smoothstep(0.4, 0.0, mouseDist);
        uv += warp;

        // grid lines
        vec2 gridUv = abs(fract(uv * 10.0) - 0.5);
        float line  = pow(1.0 - min(gridUv.x, gridUv.y), 50.0);

        // base grid color pulsing
        vec3 gridColor = vec3(0.1, 0.5, 1.0);
        vec3 color     = gridColor
                       * line
                       * (0.5 + sin(t * 2.0) * 0.2);

        // energetic pulses along grid
        float energy = sin(uv.x * 20.0 + t * 5.0)
                     * sin(uv.y * 20.0 + t * 3.0);
        energy = smoothstep(0.8, 1.0, energy);
        color += vec3(1.0, 0.2, 0.8) * energy * line;

        // glow around mouse
        float glow = smoothstep(0.1, 0.0, mouseDist);
        color += vec3(1.0) * glow * 0.5;

        // subtle noise
        color += random(uv + t * 0.1) * 0.05;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // 3) Uniforms, Material, Mesh
    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2() },
      iMouse: {
        value: new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2),
      },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 4) Resize handler
    const onResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      uniforms.iResolution.value.set(width, height);
    };
    window.addEventListener("resize", onResize);
    onResize(); // set initial size

    // 5) Mouse handler — flip Y so (0,0) is bottom-left, matching the shader's
    //    gl_FragCoord space. A pointermove listener is added alongside the
    //    brief's mousemove so touch/pen and synthetic pointers also drive the
    //    warp.
    const onMouseMove = (e: { clientX: number; clientY: number }) => {
      uniforms.iMouse.value.set(e.clientX, container.clientHeight - e.clientY);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("pointermove", onMouseMove);

    // Pausing freezes the clock by holding the last elapsed value and offsetting
    // future deltas, so the lattice resumes seamlessly instead of jumping.
    let elapsed = 0;
    let lastFrame = performance.now();
    let fpsSmoothed = 60;

    // 6) Animation loop
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

    // 7) Cleanup on unmount
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("pointermove", onMouseMove);

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
      aria-label="Cybernetic Grid animated background"
    />
  );
};

export default CyberneticGridShader;
