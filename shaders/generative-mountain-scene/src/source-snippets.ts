/**
 * Source strings shown verbatim in the integration docs tabs. Kept as plain
 * template literals (no build-time file read) so the panel is self-contained.
 * These mirror the shipped files; the canonical implementation lives in
 * `@/components/ui/mountain-scene.tsx`.
 */

export const INSTALL_CMD = `npm install three
npm install -D @types/three`;

export const DEMO_SOURCE = `import { Suspense } from "react";
import GenerativeMountainScene from "@/components/ui/mountain-scene";

export default function DemoOne() {
  return (
    <main className="relative w-full h-screen bg-[#0f172a] overflow-hidden text-slate-100">
      <Suspense fallback={<div className="w-full h-full bg-[#0f172a]" />}>
        <GenerativeMountainScene />
      </Suspense>
    </main>
  );
}`;

export const USAGE_SOURCE = `import { useState } from "react";
import GenerativeMountainScene, {
  type MountainSceneFrame,
} from "@/components/ui/mountain-scene";

export function Stage() {
  const [fps, setFps] = useState(0);

  return (
    <div className="relative h-screen w-full bg-[#0f172a]">
      <GenerativeMountainScene
        baseColor="#7dd3fc"
        onFrame={(f: MountainSceneFrame) => setFps(f.fps)}
      />
      <span className="absolute bottom-4 right-4 font-mono text-xs text-slate-300">
        {fps.toFixed(0)} fps
      </span>
    </div>
  );
}`;

export const COMPONENT_SOURCE = `import { useEffect, useRef } from "react";
import * as THREE from "three";

export interface MountainSceneFrame {
  elapsed: number;   // real unpaused seconds since mount (a wall clock)
  time: number;      // raw \`time\` uniform value (the slow drift)
  fps: number;
  pixelRatio: number;
  light: { x: number; y: number; z: number };
}

export interface GenerativeMountainSceneProps {
  baseColor?: string;   // ridge colour -> the \`color\` uniform (#7dd3fc)
  paused?: boolean;     // freeze the \`time\` uniform's drift
  className?: string;
  onFrame?: (frame: MountainSceneFrame) => void;
}

export function GenerativeMountainScene({
  baseColor = "#7dd3fc",
  paused = false,
  className,
  onFrame,
}: GenerativeMountainSceneProps = {}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<THREE.PointLight | null>(null);
  // ...refs mirror the latest props so the loop reads them live...

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 1.5, 3);
    camera.rotation.x = -0.3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // A 128x128 plane displaced along its normal by two octaves of 3D simplex
    // noise (snoise) in the vertex shader, lit by fresnel + diffuse off a single
    // point light in the fragment shader. wireframe: false -> solid, no gaps.
    const geometry = new THREE.PlaneGeometry(12, 8, 128, 128);
    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      wireframe: false,
      uniforms: {
        time: { value: 0 },
        pointLightPosition: { value: new THREE.Vector3(0, 0, 5) },
        color: { value: new THREE.Color(baseColor) },
      },
      vertexShader: /* glsl: snoise + normal displacement */,
      fragmentShader: /* glsl: diffuse + fresnel rim */,
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 0, 5);
    lightRef.current = pointLight;
    scene.add(pointLight);

    // animate(): advance \`time\`, render, emit telemetry via onFrame
    // handleMouseMove(): map pointer -> world point light position
    // ...resize + dispose cleanup...
  }, []);

  return <div ref={mountRef} className={className ?? "absolute inset-0 z-0 h-full w-full"} />;
}

export default GenerativeMountainScene;`;
