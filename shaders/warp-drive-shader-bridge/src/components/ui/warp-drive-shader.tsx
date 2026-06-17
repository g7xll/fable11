import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * WarpDriveShader — a drop-in WebGL hyperspace tunnel background.
 *
 * This is the component from the integration brief, kept faithful to the
 * original: an orthographic full-screen quad runs a fragment shader that draws
 * an RGB-split light tunnel. `iTime` advances the warp; `iMouse` steers the
 * vanishing point; `iResolution` keeps it square. It mounts a fixed,
 * pointer-events-none canvas behind the page content (`zIndex: -1`).
 *
 * The TypeScript-friendly additions over the raw brief are purely additive and
 * optional, so existing usage like `<WarpDriveShader />` keeps working:
 *   - `onFrame`   — per-frame telemetry callback (time, mouse, fps, size), so a
 *                   host can render a live HUD without re-implementing the loop.
 *   - `warpSpeed` — multiplies the shader clock; 1 = the brief's default rate.
 *   - `className`/`style` — forwarded to the container for layout control.
 */

export interface WarpDriveFrame {
  /** Elapsed shader time fed to `iTime` (seconds). */
  time: number;
  /** Pointer position in shader pixels (origin bottom-left), as in `iMouse`. */
  mouse: { x: number; y: number };
  /** Drawing-buffer size in CSS pixels. */
  size: { width: number; height: number };
  /** Smoothed frames per second. */
  fps: number;
}

export interface WarpDriveShaderProps {
  /** Clock multiplier; 1 keeps the brief's `iTime * 0.5` cadence. */
  warpSpeed?: number;
  /** Per-frame telemetry, throttled to ~20 Hz. */
  onFrame?: (frame: WarpDriveFrame) => void;
  className?: string;
  style?: React.CSSProperties;
}

const WarpDriveShader: React.FC<WarpDriveShaderProps> = ({
  warpSpeed = 1,
  onFrame,
  className,
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep the latest props in refs so the effect can stay mounted once (matching
  // the brief's single-shot `useEffect([])`) while still seeing fresh values.
  const warpSpeedRef = useRef(warpSpeed);
  const onFrameRef = useRef(onFrame);
  warpSpeedRef.current = warpSpeed;
  onFrameRef.current = onFrame;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1) Renderer + Scene + Camera + Clock
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const clock = new THREE.Clock();

    // 2) GLSL shaders — verbatim from the brief.
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

      void main() {
        // Normalize to center, scale by height
        vec2 uv    = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
        vec2 mouse = (iMouse      - 0.5 * iResolution.xy) / iResolution.y;

        // Time warp
        float t = iTime * 0.5;
        uv -= mouse;

        float r = length(uv) * 0.8;

        // Tunnel effect
        vec3 finalColor = vec3(0.0);
        float offset = 0.01;
        finalColor.r = pow(fract(0.5 / length(uv + vec2(offset, 0.0)) + t * 2.0), 15.0);
        finalColor.g = pow(fract(0.5 / length(uv)                  + t * 2.0), 15.0);
        finalColor.b = pow(fract(0.5 / length(uv - vec2(offset, 0.0)) + t * 2.0), 15.0);

        float fade = smoothstep(0.0, 0.1, r);
        finalColor *= fade;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    // 3) Uniforms + Material + Mesh
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
    onResize(); // initialize size

    // 5) Mouse handler — flip Y so origin is bottom-left, as in the brief.
    const onMouseMove = (e: MouseEvent) => {
      uniforms.iMouse.value.set(e.clientX, container.clientHeight - e.clientY);
    };
    window.addEventListener("mousemove", onMouseMove);

    // 6) Animation loop. `iTime` is accumulated from per-frame deltas so the
    //    optional `warpSpeed` can rescale the cadence without snapping the
    //    visuals (default warpSpeed = 1 reproduces clock.getElapsedTime()).
    let warpTime = 0;
    let emitAt = 0;
    let fps = 60;
    renderer.setAnimationLoop(() => {
      const dt = clock.getDelta();
      warpTime += dt * warpSpeedRef.current;
      uniforms.iTime.value = warpTime;
      renderer.render(scene, camera);

      // Smooth the instantaneous fps for a steady readout.
      if (dt > 0) fps += ((1 / dt) - fps) * 0.1;

      const now = clock.elapsedTime;
      const cb = onFrameRef.current;
      if (cb && now - emitAt >= 0.05) {
        emitAt = now;
        cb({
          time: warpTime,
          mouse: { x: uniforms.iMouse.value.x, y: uniforms.iMouse.value.y },
          size: {
            width: uniforms.iResolution.value.x,
            height: uniforms.iResolution.value.y,
          },
          fps,
        });
      }
    });

    // 7) Cleanup on unmount
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);

      renderer.setAnimationLoop(null);

      const canvas = renderer.domElement;
      if (canvas && canvas.parentNode) {
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
      className={className ?? "shader-container"}
      style={
        style ?? {
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: -1,
          pointerEvents: "none",
        }
      }
      aria-label="Warp Drive animated background"
    />
  );
};

export default WarpDriveShader;
