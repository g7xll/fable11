import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Which color the wave field melts into. Mirrors the three branches of the
 * original fragment shader:
 *  - `neutral`  → the original grey field
 *  - `active`   → blue swell  (the original "active reminders" state)
 *  - `upcoming` → green forecast (the original "upcoming reminders" state)
 */
export type WaveMode = "neutral" | "active" | "upcoming";

export interface FlowingWavesShaderProps {
  /**
   * Drives the shader's color branch. Defaults to `"neutral"` — the original
   * component's resting state. Transitions are eased so mode changes
   * cross-fade instead of snapping.
   */
  mode?: WaveMode;
  /**
   * When `true`, the soft center dimming (the original `disableCenterDimming`)
   * is lifted so the field stays bright edge-to-edge. Defaults to `false`.
   */
  dimmingDisabled?: boolean;
  /**
   * Overall brightness of the wave field, 0–1. A natural extension of the
   * original (which was effectively fixed at `1`). Clamped; lower values calm
   * the field without changing its motion. Defaults to `1`.
   */
  intensity?: number;
  /**
   * Optional probe. Fired ~12×/s with the average luminance of three sampled
   * points of the rendered frame (0–1), so an external HUD can read the live
   * "sea state" straight off the GPU instead of guessing.
   */
  onSample?: (luminance: number) => void;
  /**
   * Optional probe for the normalized pointer position over the canvas
   * (0–1 in both axes, origin top-left). Mirrors the original `iMouse` wiring.
   */
  onPointer?: (x: number, y: number) => void;
  className?: string;
}

const modeToValue = (mode: WaveMode): number => {
  if (mode === "active") return 1;
  if (mode === "upcoming") return 2;
  return 0;
};

const FlowingWavesShader = ({
  mode = "neutral",
  dimmingDisabled = false,
  intensity = 1,
  onSample,
  onPointer,
  className,
}: FlowingWavesShaderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mutable mirrors of the latest props so the animation loop reads fresh
  // values without tearing down the WebGL context on every prop change.
  const modeRef = useRef<number>(modeToValue(mode));
  const dimRef = useRef<boolean>(dimmingDisabled);
  const intensityRef = useRef<number>(intensity);
  const sampleRef = useRef<FlowingWavesShaderProps["onSample"]>(onSample);
  const pointerRef = useRef<FlowingWavesShaderProps["onPointer"]>(onPointer);

  modeRef.current = modeToValue(mode);
  dimRef.current = dimmingDisabled;
  intensityRef.current = intensity;
  sampleRef.current = onSample;
  pointerRef.current = onPointer;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof THREE === "undefined") return;

    // 1) Renderer + scene + camera + clock
    let renderer: THREE.WebGLRenderer;
    try {
      // alpha:false for a standard opaque background (matches the original).
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
      renderer.domElement.style.display = "block";
    } catch (err) {
      console.error("WebGL not supported", err);
      container.innerHTML =
        '<p style="color:white;text-align:center;">Sorry, WebGL isn\'t available.</p>';
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const clock = new THREE.Clock();

    // 2) Shaders — the vertex pass forwards UVs; the fragment pass is the
    //    original flowing-waves field, with the three booleans collapsed into a
    //    single eased `colorMode` and an `intensity` brightness control.
    const vertexShader = /* glsl */ `
      varying vec2 vTextureCoord;
      void main() {
        vTextureCoord = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = /* glsl */ `
      precision mediump float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform vec2 iMouse;
      uniform float colorMode;       // 0 = neutral, 1 = active(blue), 2 = upcoming(green)
      uniform float disableDimming;  // 0 = dim center, 1 = no dimming
      uniform float intensity;       // 0..1 overall brightness
      varying vec2 vTextureCoord;

      void mainImage(out vec4 fragColor, in vec2 fragCoord) {
        vec2 uv = (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);

        // Distance from center, used to dim the middle of the field.
        vec2 center = iResolution.xy * 0.5;
        float dist = distance(fragCoord, center);
        float radius = min(iResolution.x, iResolution.y) * 0.5;
        float centerDim = disableDimming > 0.5
          ? 1.0
          : smoothstep(radius * 0.3, radius * 0.5, dist);

        // The flowing-waves displacement loop (unchanged from the original).
        for (float i = 1.0; i < 10.0; i++) {
          uv.x += 0.6 / i * cos(i * 2.5 * uv.y + iTime);
          uv.y += 0.6 / i * cos(i * 1.5 * uv.x + iTime);
        }

        // Color the field by mixing between the three branch tints, so toggles
        // cross-fade rather than snap. Blend weights are eased mode masks.
        vec3 neutralTint = vec3(0.1);
        vec3 activeTint  = vec3(0.1, 0.3, 0.6);
        vec3 upcomingTint = vec3(0.1, 0.5, 0.2);

        float wActive   = clamp(1.0 - abs(colorMode - 1.0), 0.0, 1.0);
        float wUpcoming = clamp(1.0 - abs(colorMode - 2.0), 0.0, 1.0);
        float wNeutral  = clamp(1.0 - wActive - wUpcoming, 0.0, 1.0);
        vec3 tint = neutralTint * wNeutral + activeTint * wActive + upcomingTint * wUpcoming;

        float band = abs(sin(iTime - uv.y - uv.x));
        fragColor = vec4(tint / band, 1.0);

        // Apply center dimming unless disabled.
        fragColor.rgb = mix(fragColor.rgb * 0.3, fragColor.rgb, centerDim);

        // Overall brightness control (original behaviour at intensity = 1).
        fragColor.rgb *= intensity;
      }

      void main() {
        vec4 color;
        mainImage(color, vTextureCoord * iResolution);
        gl_FragColor = color;
      }
    `;

    // 3) Material, geometry, mesh
    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2() },
      iMouse: { value: new THREE.Vector2() },
      colorMode: { value: modeRef.current },
      disableDimming: { value: dimRef.current ? 1 : 0 },
      intensity: { value: THREE.MathUtils.clamp(intensityRef.current, 0, 1) },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 4) Resize + pointer handlers
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      uniforms.iResolution.value.set(w, h);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      uniforms.iMouse.value.set(x, rect.height - y);
      const probe = pointerRef.current;
      if (probe && rect.width > 0 && rect.height > 0) {
        probe(
          THREE.MathUtils.clamp(x / rect.width, 0, 1),
          THREE.MathUtils.clamp(y / rect.height, 0, 1),
        );
      }
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove);
    onResize();

    // 5) Animation loop — ease the eased uniforms toward their targets, render,
    //    and probe a few pixels for an honest luminance reading.
    let lastSample = 0;
    const sampleBuffer = new Uint8Array(4);

    const luminanceAt = (gl: WebGLRenderingContext, x: number, y: number) => {
      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, sampleBuffer);
      return (
        (0.2126 * sampleBuffer[0] +
          0.7152 * sampleBuffer[1] +
          0.0722 * sampleBuffer[2]) /
        255
      );
    };

    renderer.setAnimationLoop(() => {
      uniforms.iTime.value = clock.getElapsedTime();

      // Smoothly ease toggleable uniforms so transitions cross-fade.
      uniforms.colorMode.value +=
        (modeRef.current - uniforms.colorMode.value) * 0.08;
      uniforms.disableDimming.value +=
        ((dimRef.current ? 1 : 0) - uniforms.disableDimming.value) * 0.1;
      uniforms.intensity.value +=
        (THREE.MathUtils.clamp(intensityRef.current, 0, 1) -
          uniforms.intensity.value) *
        0.1;

      renderer.render(scene, camera);

      const probe = sampleRef.current;
      if (probe) {
        const now = uniforms.iTime.value;
        if (now - lastSample > 0.08) {
          lastSample = now;
          const gl = renderer.getContext();
          const size = renderer.getDrawingBufferSize(new THREE.Vector2());
          const w = Math.max(1, Math.floor(size.x));
          const h = Math.max(1, Math.floor(size.y));
          // Average three points (center + two off-axis) for a stable read.
          const lum =
            (luminanceAt(gl, Math.floor(w / 2), Math.floor(h / 2)) +
              luminanceAt(gl, Math.floor(w * 0.25), Math.floor(h * 0.6)) +
              luminanceAt(gl, Math.floor(w * 0.75), Math.floor(h * 0.4))) /
            3;
          probe(lum);
        }
      }
    });

    // 6) Cleanup
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
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
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        backgroundColor: "#03070d",
      }}
      aria-label="Flowing waves animated background"
    />
  );
};

export default FlowingWavesShader;
