import {
	ArrowUpRight,
	Infinity as InfinityIcon,
	LoaderCircle,
	Mountain,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* ===========================================================================
   ShaderBackdrop
   ---------------------------------------------------------------------------
   A self-contained, dependency-free WebGL fragment-shader field — a slowly
   drifting cosmic nebula, a faint rotating "endless orbit" arc, and three
   parallax twinkling star layers, all kept dark so the white UI reads on top.

   Why it exists: the prompt's component renders its background from a remote
   UnicornStudio scene (loaded by project id from UnicornStudio's servers). That
   scene is a license-locked, server-hosted resource that cannot be vendored, so
   the hero would go flat-black wherever that CDN is unreachable (offline, CI,
   locked-down networks). This backdrop is the always-available base layer: when
   the remote scene DOES load it fades out behind it; when it can't, the hero is
   still alive. WebGL is fully guarded — if a context can't be created the pure
   CSS `.stars-bg` layer underneath shows instead, so it never crashes.
   =========================================================================== */
const VERT = `
  attribute vec2 aPos;
  void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
  precision highp float;
  uniform float iTime;
  uniform vec2 iResolution;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
    return v;
  }

  // Sparse twinkling stars on a hashed grid.
  float stars(vec2 uv, float density, float gain) {
    vec2 g = uv * density;
    vec2 id = floor(g);
    float h = hash21(id);
    vec2 f = fract(g) - 0.5;
    float d = length(f);
    float tw = 0.5 + 0.5 * sin(iTime * (1.5 + h * 3.0) + h * 40.0);
    return (1.0 - smoothstep(0.0, 0.08, d)) * step(0.972, h) * tw * gain;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / max(iResolution.y, 1.0);
    float t = iTime * 0.02;
    float rad = length(uv);

    // Near-black base.
    vec3 col = vec3(0.02, 0.025, 0.04);

    // Drifting cool nebula (subtle).
    vec2 q = uv * 1.4 + vec2(t * 0.6, t * 0.2);
    float n = fbm(q + fbm(q * 0.7 + t));
    col += smoothstep(0.45, 1.05, n) * vec3(0.05, 0.07, 0.12) * 0.9;

    // Slow rotating faint arc — the "endless" orbit.
    float ang = atan(uv.y, uv.x);
    float ring = 1.0 - smoothstep(0.0, 0.012, abs(rad - (0.62 + 0.03 * sin(ang * 2.0 + iTime * 0.25))));
    col += ring * vec3(0.10, 0.12, 0.16) * (0.35 + 0.25 * sin(iTime * 0.4));

    // Parallax star layers.
    float s = 0.0;
    s += stars(uv + vec2(t * 0.4, 0.0), 14.0, 1.0);
    s += stars(uv * 1.7 + vec2(-t * 0.6, t * 0.2), 26.0, 0.6);
    s += stars(uv * 2.6 + vec2(t * 0.9, -t * 0.1), 40.0, 0.4);
    col += vec3(0.9, 0.93, 1.0) * s;

    // Vignette + edge darkening so the UI stays legible.
    col *= mix(0.55, 1.0, 1.0 - smoothstep(0.25, 1.25, rad));
    col *= 1.0 - 0.25 * smoothstep(0.42, 0.62, abs(uv.y));

    gl_FragColor = vec4(col, 1.0);
  }
`;

function ShaderBackdrop({ dimmed }: { dimmed: boolean }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		// Guard context creation: locked-down browsers / headless-without-GL must
		// not throw out of the effect (that would crash the tree). On any failure we
		// simply bail and let the CSS `.stars-bg` layer underneath show through.
		const gl = (canvas.getContext("webgl", { antialias: true, alpha: true }) ||
			canvas.getContext("experimental-webgl", {
				antialias: true,
				alpha: true,
			})) as WebGLRenderingContext | null;
		if (!gl) return;

		const compile = (type: number, src: string) => {
			const sh = gl.createShader(type);
			if (!sh) return null;
			gl.shaderSource(sh, src);
			gl.compileShader(sh);
			if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
				gl.deleteShader(sh);
				return null;
			}
			return sh;
		};

		const vs = compile(gl.VERTEX_SHADER, VERT);
		const fs = compile(gl.FRAGMENT_SHADER, FRAG);
		if (!vs || !fs) return;

		const program = gl.createProgram();
		if (!program) return;
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
		gl.useProgram(program);

		// Full-screen triangle.
		const buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buf);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([-1, -1, 3, -1, -1, 3]),
			gl.STATIC_DRAW,
		);
		const aPos = gl.getAttribLocation(program, "aPos");
		gl.enableVertexAttribArray(aPos);
		gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

		const uTime = gl.getUniformLocation(program, "iTime");
		const uRes = gl.getUniformLocation(program, "iResolution");

		const resize = () => {
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
			const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
			if (canvas.width !== w || canvas.height !== h) {
				canvas.width = w;
				canvas.height = h;
			}
			gl.viewport(0, 0, canvas.width, canvas.height);
		};

		const reduce = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		// Worst-case backdrop is opaque black, never a flash of white.
		gl.clearColor(0, 0, 0, 1);

		// Draw one frame at virtual time `t`. Returns false (and draws nothing) until
		// the canvas has a real laid-out size — guarding against a 0x0 first frame
		// feeding iResolution=(0,0) into the shader (which would divide to NaN and
		// paint the whole canvas white).
		const draw = (t: number) => {
			resize();
			if (canvas.clientWidth === 0 || canvas.clientHeight === 0) return false;
			gl.uniform1f(uTime, t);
			gl.uniform2f(uRes, canvas.width, canvas.height);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.drawArrays(gl.TRIANGLES, 0, 3);
			return true;
		};

		let raf = 0;
		let painted = false;
		const start = performance.now();
		const loop = (now: number) => {
			if (reduce) {
				// Static: paint one good frame as soon as the canvas is sized, then idle.
				painted = painted || draw(6.0);
				if (!painted) raf = requestAnimationFrame(loop);
				return;
			}
			draw((now - start) / 1000);
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);

		const onResize = () => {
			if (reduce) draw(6.0);
		};
		window.addEventListener("resize", onResize);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("resize", onResize);
			gl.deleteBuffer(buf);
			gl.deleteProgram(program);
			gl.deleteShader(vs);
			gl.deleteShader(fs);
			gl.getExtension("WEBGL_lose_context")?.loseContext();
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			aria-hidden
			className={cn(
				"absolute inset-0 h-full w-full transition-opacity duration-700",
				dimmed ? "opacity-0" : "opacity-100",
			)}
		/>
	);
}

export default function HeroAsciiOne() {
	// True once the remote UnicornStudio scene has actually mounted a canvas, so
	// we can fade the offline backdrop out behind it.
	const [unicornActive, setUnicornActive] = useState(false);

	useEffect(() => {
		const embedScript = document.createElement("script");
		embedScript.type = "text/javascript";
		embedScript.textContent = `
      !function(){
        if(!window.UnicornStudio){
          window.UnicornStudio={isInitialized:!1};
          var i=document.createElement("script");
          i.src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.33/dist/unicornStudio.umd.js";
          i.onload=function(){
            window.UnicornStudio.isInitialized||(UnicornStudio.init(),window.UnicornStudio.isInitialized=!0)
          };
          (document.head || document.body).appendChild(i)
        }
      }();
    `;
		document.head.appendChild(embedScript);

		// Add CSS to hide branding elements and crop canvas
		const style = document.createElement("style");
		style.textContent = `
      [data-us-project] {
        position: relative !important;
        overflow: hidden !important;
      }

      [data-us-project] canvas {
        clip-path: inset(0 0 10% 0) !important;
      }

      [data-us-project] * {
        pointer-events: none !important;
      }
      [data-us-project] a[href*="unicorn"],
      [data-us-project] button[title*="unicorn"],
      [data-us-project] div[title*="Made with"],
      [data-us-project] .unicorn-brand,
      [data-us-project] [class*="brand"],
      [data-us-project] [class*="credit"],
      [data-us-project] [class*="watermark"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        position: absolute !important;
        left: -9999px !important;
        top: -9999px !important;
      }
    `;
		document.head.appendChild(style);

		// Function to aggressively hide branding (and detect when the remote scene
		// has actually mounted a canvas so the offline backdrop can fade out).
		const hideBranding = () => {
			const selectors = [
				"[data-us-project]",
				'[data-us-project="OMzqyUv6M3kSnv0JeAtC"]',
				".unicorn-studio-container",
				'canvas[aria-label*="Unicorn"]',
			];

			selectors.forEach((selector) => {
				const containers = document.querySelectorAll(selector);
				containers.forEach((container) => {
					const allElements = container.querySelectorAll<HTMLElement>("*");
					allElements.forEach((el) => {
						const text = (el.textContent || "").toLowerCase();
						const title = (el.getAttribute("title") || "").toLowerCase();
						const href = (el.getAttribute("href") || "").toLowerCase();

						if (
							text.includes("made with") ||
							text.includes("unicorn") ||
							title.includes("made with") ||
							title.includes("unicorn") ||
							href.includes("unicorn.studio")
						) {
							el.style.display = "none";
							el.style.visibility = "hidden";
							el.style.opacity = "0";
							el.style.pointerEvents = "none";
							el.style.position = "absolute";
							el.style.left = "-9999px";
							el.style.top = "-9999px";
							try {
								el.remove();
							} catch {
								/* element already detached */
							}
						}
					});
				});
			});

			// Once the scene paints a sized canvas, reveal it by fading our backdrop.
			const usCanvas = document.querySelector<HTMLCanvasElement>(
				"[data-us-project] canvas",
			);
			if (usCanvas && usCanvas.clientWidth > 0) setUnicornActive(true);
		};

		hideBranding();
		const interval = window.setInterval(hideBranding, 50);

		// Also try after delays.
		const timeouts = [500, 1000, 2000, 5000, 10000].map((ms) =>
			window.setTimeout(hideBranding, ms),
		);

		return () => {
			window.clearInterval(interval);
			timeouts.forEach((id) => window.clearTimeout(id));
			// Guard removals: under React StrictMode the effect mounts twice, and the
			// nodes may already be detached.
			if (embedScript.parentNode)
				embedScript.parentNode.removeChild(embedScript);
			if (style.parentNode) style.parentNode.removeChild(style);
		};
	}, []);

	return (
		<main className="relative min-h-screen overflow-hidden bg-black">
			{/* Base fallback: pure-CSS starfield, shown if WebGL is unavailable. */}
			<div
				className="absolute inset-0 h-full w-full stars-bg"
				aria-hidden
			></div>

			{/* Offline WebGL shader field — covers the CSS fallback when GL is available. */}
			<ShaderBackdrop dimmed={unicornActive} />

			{/* Remote UnicornStudio scene (desktop) — fades in over the field when it loads online. */}
			<div className="absolute inset-0 w-full h-full hidden lg:block">
				<div
					data-us-project="OMzqyUv6M3kSnv0JeAtC"
					style={{ width: "100%", height: "100%", minHeight: "100vh" }}
				/>
			</div>

			{/* Top Header */}
			<div className="absolute top-0 left-0 right-0 z-20 border-b border-white/20">
				<div className="container mx-auto px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between">
					<div className="flex items-center gap-2 lg:gap-4">
						<div className="font-mono text-white text-xl lg:text-2xl font-bold tracking-widest italic transform -skew-x-12">
							UIMIX
						</div>
						<div className="h-3 lg:h-4 w-px bg-white/40"></div>
						<span className="text-white/60 text-[8px] lg:text-[10px] font-mono">
							EST. 2025
						</span>
					</div>

					<div className="hidden lg:flex items-center gap-3 text-[10px] font-mono text-white/60">
						<span>LAT: 37.7749°</span>
						<div className="w-1 h-1 bg-white/40 rounded-full"></div>
						<span>LONG: 122.4194°</span>
					</div>
				</div>
			</div>

			{/* Corner Frame Accents */}
			<div className="absolute top-0 left-0 w-8 h-8 lg:w-12 lg:h-12 border-t-2 border-l-2 border-white/30 z-20"></div>
			<div className="absolute top-0 right-0 w-8 h-8 lg:w-12 lg:h-12 border-t-2 border-r-2 border-white/30 z-20"></div>
			<div
				className="absolute left-0 w-8 h-8 lg:w-12 lg:h-12 border-b-2 border-l-2 border-white/30 z-20"
				style={{ bottom: "5vh" }}
			></div>
			<div
				className="absolute right-0 w-8 h-8 lg:w-12 lg:h-12 border-b-2 border-r-2 border-white/30 z-20"
				style={{ bottom: "5vh" }}
			></div>

			{/* CTA Content */}
			<div
				className="relative z-10 flex min-h-screen items-center justify-end pt-16 lg:pt-0"
				style={{ marginTop: "5vh" }}
			>
				<div className="w-full lg:w-1/2 px-6 lg:px-16 lg:pr-[10%]">
					<div className="max-w-lg relative lg:ml-auto">
						{/* Top decorative line */}
						<div className="flex items-center gap-2 mb-3 opacity-60">
							<div className="w-8 h-px bg-white"></div>
							<InfinityIcon className="h-3 w-3 text-white" strokeWidth={1.5} />
							<div className="flex-1 h-px bg-white"></div>
						</div>

						{/* Title with dithered accent */}
						<div className="relative">
							<div className="hidden lg:block absolute -right-3 top-0 bottom-0 w-1 dither-pattern opacity-40"></div>
							<h1
								className="text-2xl lg:text-5xl font-bold text-white mb-3 lg:mb-4 leading-tight font-mono tracking-wider whitespace-nowrap lg:-ml-[5%]"
								style={{ letterSpacing: "0.1em" }}
							>
								ENDLESS PURSUIT
							</h1>
						</div>

						{/* Decorative dots pattern - desktop only */}
						<div className="hidden lg:flex gap-1 mb-3 opacity-40">
							{Array.from({ length: 40 }).map((_, i) => (
								<div
									key={i}
									className="w-0.5 h-0.5 bg-white rounded-full"
								></div>
							))}
						</div>

						{/* Description with subtle grid pattern */}
						<div className="relative">
							<p className="text-xs lg:text-base text-gray-300 mb-5 lg:mb-6 leading-relaxed font-mono opacity-80">
								Like Sisyphus, we push forward — not despite the struggle, but
								because of it. Every iteration, every pixel, every line of code
								is our boulder.
							</p>

							{/* Technical corner accent - desktop only */}
							<div
								className="hidden lg:block absolute -left-4 top-1/2 w-3 h-3 border border-white opacity-30"
								style={{ transform: "translateY(-50%)" }}
							>
								<div
									className="absolute top-1/2 left-1/2 w-1 h-1 bg-white"
									style={{ transform: "translate(-50%, -50%)" }}
								></div>
							</div>
						</div>

						{/* Buttons with technical accents */}
						<div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
							<button className="relative flex items-center justify-center gap-2 px-5 lg:px-6 py-2 lg:py-2.5 bg-transparent text-white font-mono text-xs lg:text-sm border border-white hover:bg-white hover:text-black transition-all duration-200 group">
								<span className="hidden lg:block absolute -top-1 -left-1 w-2 h-2 border-t border-l border-white opacity-0 group-hover:opacity-100 transition-opacity"></span>
								<span className="hidden lg:block absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-white opacity-0 group-hover:opacity-100 transition-opacity"></span>
								<Mountain className="h-3.5 w-3.5" strokeWidth={1.75} />
								BEGIN THE CLIMB
							</button>

							<button
								className="relative flex items-center justify-center gap-2 px-5 lg:px-6 py-2 lg:py-2.5 bg-transparent border border-white text-white font-mono text-xs lg:text-sm hover:bg-white hover:text-black transition-all duration-200 group"
								style={{ borderWidth: "1px" }}
							>
								EMBRACE THE JOURNEY
								<ArrowUpRight
									className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
									strokeWidth={1.75}
								/>
							</button>
						</div>

						{/* Bottom technical notation - desktop only */}
						<div className="hidden lg:flex items-center gap-2 mt-6 opacity-40">
							<InfinityIcon className="h-3 w-3 text-white" strokeWidth={1.5} />
							<div className="flex-1 h-px bg-white"></div>
							<span className="text-white text-[9px] font-mono">
								SISYPHUS.PROTOCOL
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Bottom Footer */}
			<div
				className="absolute left-0 right-0 z-20 border-t border-white/20 bg-black/40 backdrop-blur-sm"
				style={{ bottom: "5vh" }}
			>
				<div className="container mx-auto px-4 lg:px-8 py-2 lg:py-3 flex items-center justify-between">
					<div className="flex items-center gap-3 lg:gap-6 text-[8px] lg:text-[9px] font-mono text-white/50">
						<span className="hidden lg:inline">SYSTEM.ACTIVE</span>
						<span className="lg:hidden">SYS.ACT</span>
						<div className="hidden lg:flex gap-1 items-end">
							{Array.from({ length: 8 }).map((_, i) => (
								<div
									key={i}
									className="w-1 bg-white/30"
									style={{ height: `${Math.random() * 12 + 4}px` }}
								></div>
							))}
						</div>
						<span>V1.0.0</span>
					</div>

					<div className="flex items-center gap-2 lg:gap-4 text-[8px] lg:text-[9px] font-mono text-white/50">
						<span className="hidden lg:flex items-center gap-1">
							<LoaderCircle
								className="h-2.5 w-2.5 animate-spin"
								strokeWidth={2}
							/>
							RENDERING
						</span>
						<div className="flex gap-1">
							<div className="w-1 h-1 bg-white/60 rounded-full animate-pulse"></div>
							<div
								className="w-1 h-1 bg-white/40 rounded-full animate-pulse"
								style={{ animationDelay: "0.2s" }}
							></div>
							<div
								className="w-1 h-1 bg-white/20 rounded-full animate-pulse"
								style={{ animationDelay: "0.4s" }}
							></div>
						</div>
						<span className="hidden lg:inline">FRAME: ∞</span>
					</div>
				</div>
			</div>
		</main>
	);
}
