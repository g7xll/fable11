import { useEffect, useRef, Suspense } from "react";
import * as THREE from "three";

/**
 * Reads an `hsl(h s% l%)` design token off `:root` and returns a THREE.Color.
 *
 * The original prompt fed `new THREE.Color("hsl(var(--sky-300))")` — a string
 * THREE.Color cannot parse, so the mesh rendered black. We resolve the real
 * `--sky-300` HSL values (203 92% 53%) at runtime and build the color properly,
 * falling back to the literal swatch if the variable is unavailable (e.g. SSR).
 */
function tokenColor(varName: string, fallback: THREE.ColorRepresentation): THREE.Color {
  if (typeof window === "undefined") return new THREE.Color(fallback);
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  // Accept "203 92% 53%", "203, 92%, 53%", or "203deg 92% 53%".
  const m = raw.match(
    /(-?[\d.]+)(?:deg)?[ ,]+(-?[\d.]+)%[ ,]+(-?[\d.]+)%/,
  );
  if (!m) return new THREE.Color(fallback);
  const h = parseFloat(m[1]) / 360;
  const s = parseFloat(m[2]) / 100;
  const l = parseFloat(m[3]) / 100;
  return new THREE.Color().setHSL(h, s, l);
}

export interface GenerativeArtSceneProps {
  /**
   * Overall scale of the noise displacement applied to the icosahedron
   * (the prompt baked this at 0.2). Clamped to a sane range so the surface
   * stays a recognizable wireframe.
   */
  displacement?: number;
  /**
   * Strength of the fresnel rim glow added on top of the diffuse term
   * (the prompt baked this at 0.5).
   */
  glow?: number;
  /** Multiplier on the noise evolution + auto-rotation speed. */
  speed?: number;
  /** Freeze the simulation (clock + rotation) when true. */
  paused?: boolean;
  /**
   * Optional probe. Fired roughly 12×/s with the center-pixel luminance of the
   * rendered frame (0–1), so an external HUD can read the "anomaly energy"
   * straight off the GPU instead of guessing.
   */
  onSample?: (luminance: number) => void;
  className?: string;
}

export function GenerativeArtScene({
  displacement = 0.2,
  glow = 0.5,
  speed = 1,
  paused = false,
  onSample,
  className,
}: GenerativeArtSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<THREE.PointLight | null>(null);

  // Mutable mirrors so the rAF loop reads fresh props without rebuilding WebGL.
  const displacementRef = useRef(displacement);
  const glowRef = useRef(glow);
  const speedRef = useRef(speed);
  const pausedRef = useRef(paused);
  const sampleRef = useRef(onSample);
  displacementRef.current = displacement;
  glowRef.current = glow;
  speedRef.current = speed;
  pausedRef.current = paused;
  sampleRef.current = onSample;

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount || typeof THREE === "undefined") return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000,
    );
    camera.position.z = 3;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      // No WebGL — leave the (transparent) mount empty; the page reads as a
      // dark containment panel rather than throwing.
      return;
    }
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.display = "block";
    currentMount.appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(1.2, 64);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        // Reconciled uniform name: the JS updater (handleMouseMove) and the
        // fragment shader now agree on `pointLightPos`.
        pointLightPos: { value: new THREE.Vector3(0, 0, 5) },
        // Real color resolved from the --sky-300 token (203 92% 53%).
        color: { value: tokenColor("--sky-300", 0x38bdf8) },
        uDisplacement: { value: THREE.MathUtils.clamp(displacementRef.current, 0, 0.6) },
        uGlow: { value: Math.max(glowRef.current, 0) },
      },
      vertexShader: /* glsl */ `
        uniform float time;
        uniform float uDisplacement;
        varying vec3 vNormal;
        varying vec3 vPosition;

        // Perlin/Simplex noise function
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
          float displacement = snoise(position * 2.0 + time * 0.5) * uDisplacement;
          vec3 newPosition = position + normal * displacement;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 color;
        uniform vec3 pointLightPos;
        uniform float uGlow;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 lightDir = normalize(pointLightPos - vPosition);
          float diffuse = max(dot(normal, lightDir), 0.0);

          // Fresnel effect for the glow
          float fresnel = 1.0 - dot(normal, vec3(0.0, 0.0, 1.0));
          fresnel = pow(fresnel, 2.0);

          vec3 finalColor = color * diffuse + color * fresnel * uGlow;

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      wireframe: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 0, 5);
    lightRef.current = pointLight;
    scene.add(pointLight);

    // Probe state for the optional luminance callback.
    let lastSample = 0;
    const sampleBuffer = new Uint8Array(4);

    let frameId = 0;
    let lastT = 0;
    let simTime = 0;
    const animate = (t: number) => {
      const dt = lastT ? t - lastT : 16;
      lastT = t;

      if (!pausedRef.current) {
        // Accumulate scaled time so `speed` changes never make time jump.
        simTime += dt * speedRef.current;
        mesh.rotation.y += 0.0005 * speedRef.current;
        mesh.rotation.x += 0.0002 * speedRef.current;
      }
      material.uniforms.time.value = simTime * 0.0003;
      material.uniforms.uDisplacement.value = THREE.MathUtils.clamp(
        displacementRef.current,
        0,
        0.6,
      );
      material.uniforms.uGlow.value = Math.max(glowRef.current, 0);

      renderer.render(scene, camera);

      // Center-pixel luminance ~12×/s so a HUD can read real energy off the GPU.
      const probe = sampleRef.current;
      if (probe && t - lastSample > 80) {
        lastSample = t;
        const gl = renderer.getContext();
        const size = renderer.getDrawingBufferSize(new THREE.Vector2());
        gl.readPixels(
          Math.floor(size.x / 2),
          Math.floor(size.y / 2),
          1,
          1,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          sampleBuffer,
        );
        const lum =
          (0.2126 * sampleBuffer[0] +
            0.7152 * sampleBuffer[1] +
            0.0722 * sampleBuffer[2]) /
          255;
        probe(lum);
      }

      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      const vec = new THREE.Vector3(x, y, 0.5).unproject(camera);
      const dir = vec.sub(camera.position).normalize();
      const dist = -camera.position.z / dir.z;
      const pos = camera.position.clone().add(dir.multiplyScalar(dist));
      if (lightRef.current) lightRef.current.position.copy(pos);
      material.uniforms.pointLightPos.value = pos;
    };

    // Recover gracefully if the browser drops the WebGL context.
    const handleContextLost = (e: Event) => e.preventDefault();

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    renderer.domElement.addEventListener("webglcontextlost", handleContextLost);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      renderer.domElement.removeEventListener(
        "webglcontextlost",
        handleContextLost,
      );
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={className ?? "absolute inset-0 w-full h-full z-0"}
      aria-hidden
    />
  );
}

export interface AnomalousMatterHeroProps extends GenerativeArtSceneProps {
  title?: string;
  subtitle?: string;
  description?: string;
}

export function AnomalousMatterHero({
  title = "Observation Log: Anomaly 7",
  subtitle = "Matter in a state of constant, beautiful flux.",
  description = "A new form of digital existence has been observed. It responds to stimuli, changes form, and exudes an unknown energy. Further study is required.",
  ...sceneProps
}: AnomalousMatterHeroProps) {
  return (
    <section
      role="banner"
      className="relative w-full h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] overflow-hidden"
    >
      <Suspense
        fallback={<div className="w-full h-full bg-[hsl(var(--background))]" />}
      >
        <GenerativeArtScene {...sceneProps} />
      </Suspense>

      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--background))] via-[hsl(var(--background)/0.7)] to-transparent z-10" />

      <div className="relative z-20 flex flex-col items-center justify-end h-full pb-20 md:pb-32 text-center">
        <div className="max-w-3xl px-4 animate-fade-in-long">
          <h1 className="text-sm font-mono tracking-widest text-[hsl(var(--sky-300)/0.8)] uppercase">
            {title}
          </h1>
          <p className="mt-4 text-3xl md:text-5xl font-bold leading-tight">
            {subtitle}
          </p>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[hsl(var(--gray-300)/0.8)]">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}

export default AnomalousMatterHero;
