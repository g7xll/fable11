import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Telemetry emitted once per animation frame so a surrounding HUD can report the
 * scene's own live state — elapsed shader time, smoothed FPS, the device pixel
 * ratio, and the live world-space position of the mouse-driven point light.
 */
export interface MountainSceneFrame {
  /** Real (unpaused) seconds since mount — a true wall clock for the survey HUD. */
  elapsed: number;
  /** Raw value of the `time` uniform (the original `activeMs * 0.0003` drift). */
  time: number;
  /** Smoothed frames-per-second of the render loop. */
  fps: number;
  /** Device pixel ratio the renderer is sampling at (capped at 2). */
  pixelRatio: number;
  /** World-space position of the point light = the `pointLightPosition` uniform. */
  light: { x: number; y: number; z: number };
}

export interface GenerativeMountainSceneProps {
  /**
   * Ridge colour fed into the `color` uniform. The brief hard-codes `#7dd3fc`;
   * exposing it lets the showcase retint the whole massif without forking the
   * shader. Accepts any CSS colour string THREE.Color understands.
   */
  baseColor?: string;
  /**
   * When true the `time` uniform stops advancing, freezing the slow drift of the
   * terrain while the light can still be moved. The geometry stays solid.
   */
  paused?: boolean;
  /** Extra classes for the absolutely-positioned full-bleed mount. */
  className?: string;
  /** Per-frame telemetry callback (fires once per rendered frame). */
  onFrame?: (frame: MountainSceneFrame) => void;
}

/**
 * GenerativeMountainScene
 *
 * Renders a solid, undulating mountain landscape — a 128×128 PlaneGeometry laid
 * flat and displaced along its normal by two octaves of 3D simplex noise in a
 * custom GLSL vertex shader, then lit by a fresnel + diffuse fragment shader off
 * a single point light that tracks the pointer. "No gaps" (wireframe: false).
 *
 * Faithfully ported from the integration brief to TypeScript: the GLSL, the
 * geometry, the camera framing and the mouse→light mapping are unchanged. The
 * additions are typed refs, an `onFrame` telemetry tap, and `baseColor` /
 * `paused` props consumed live through refs so toggling them never re-runs the
 * WebGL bootstrap.
 */
export function GenerativeMountainScene({
  baseColor = "#7dd3fc",
  paused = false,
  className,
  onFrame,
}: GenerativeMountainSceneProps = {}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<THREE.PointLight | null>(null);

  // Latest prop values, mirrored into refs so the animation loop can read them
  // without the effect (and the whole WebGL context) tearing down on each change.
  const baseColorRef = useRef(baseColor);
  baseColorRef.current = baseColor;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // SCENE SETUP
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 1.5, 3);
    camera.rotation.x = -0.3;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (err) {
      console.error("WebGL not supported", err);
      return;
    }
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // GEOMETRY
    const geometry = new THREE.PlaneGeometry(12, 8, 128, 128);

    // SHADER MATERIAL
    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      wireframe: false, // solid surface — no gaps
      uniforms: {
        time: { value: 0 },
        pointLightPosition: { value: new THREE.Vector3(0, 0, 5) },
        color: { value: new THREE.Color(baseColorRef.current) },
      },
      vertexShader: /* glsl */ `
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;

        // --- PERLIN NOISE FUNCTIONS ---
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        float snoise(vec3 v) {
            const vec2 C = vec2(1.0/6.0, 1.0/3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
            vec3 i = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);
            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;
            i = mod289(i);
            vec4 p = permute(permute(permute(
                      i.z + vec4(0.0, i1.z, i2.z, 1.0))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
            float n_ = 0.142857142857;
            vec3 ns = n_ * D.wyz - D.xzx;
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);
            vec4 x = x_ * ns.x + ns.yyyy;
            vec4 y = y_ * ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            vec4 b0 = vec4(x.xy, y.xy);
            vec4 b1 = vec4(x.zw, y.zw);
            vec4 s0 = floor(b0) * 2.0 + 1.0;
            vec4 s1 = floor(b1) * 2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
            vec3 p0 = vec3(a0.xy, h.x);
            vec3 p1 = vec3(a0.zw, h.y);
            vec3 p2 = vec3(a1.xy, h.z);
            vec3 p3 = vec3(a1.zw, h.w);
            vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
            p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
            vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
            m = m * m;
            return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
        }

        void main() {
            vNormal = normal;
            vPosition = position;

            float noiseFreq = 0.8;
            float noiseAmp = 0.6;

            // Layer 1: Base shape
            float displacement = snoise(vec3(position.x * noiseFreq, position.y * noiseFreq - time * 0.2, 0.0)) * noiseAmp;

            // Layer 2: Detail
            displacement += snoise(vec3(position.x * noiseFreq * 2.0, position.y * noiseFreq * 2.0 - time * 0.2, 0.0)) * (noiseAmp * 0.5);

            vec3 newPosition = position + normal * displacement;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 color;
        uniform vec3 pointLightPosition;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
            vec3 normal = normalize(vNormal);
            vec3 lightDir = normalize(pointLightPosition - vPosition);

            float diffuse = max(dot(normal, lightDir), 0.0);

            float fresnel = 1.0 - dot(normal, vec3(0.0, 0.0, 1.0));
            fresnel = pow(fresnel, 2.0);

            vec3 finalColor = color * diffuse + color * fresnel * 0.5;

            gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 0, 5);
    lightRef.current = pointLight;
    scene.add(pointLight);

    // Animation loop, extended only with: a pause gate on the clock, a smoothed
    // FPS estimate, and the per-frame telemetry tap. Visuals are unchanged.
    let frameId = 0;
    let lastTs = performance.now();
    let smoothedFps = 60;
    // Accumulates *unpaused* wall-clock ms so freezing holds the terrain in place
    // instead of jumping forward by the paused duration when it resumes.
    let activeMs = 0;
    let prevT = 0;

    const animate = (t: number) => {
      const delta = t - prevT;
      prevT = t;
      if (!pausedRef.current) activeMs += delta;

      material.uniforms.time.value = activeMs * 0.0003;
      material.uniforms.color.value.set(baseColorRef.current);
      renderer.render(scene, camera);

      const now = performance.now();
      const dt = now - lastTs;
      lastTs = now;
      if (dt > 0) {
        const instant = 1000 / dt;
        smoothedFps = smoothedFps * 0.9 + instant * 0.1;
      }
      const lp = pointLight.position;
      onFrameRef.current?.({
        elapsed: activeMs / 1000,
        time: material.uniforms.time.value,
        fps: smoothedFps,
        pixelRatio: renderer.getPixelRatio(),
        light: { x: lp.x, y: lp.y, z: lp.z },
      });

      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      const lightX = x * 5;
      const pos = new THREE.Vector3(lightX, 2, 2 - y * 2);

      lightRef.current?.position.copy(pos);
      if (material.uniforms.pointLightPosition) {
        material.uniforms.pointLightPosition.value = pos;
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={className ?? "absolute inset-0 z-0 h-full w-full"}
      aria-label="Generative mountain scene animated background"
    />
  );
}

export default GenerativeMountainScene;
