import { Boxes, FolderTree, Sparkles, TerminalSquare } from "lucide-react";
import type { ReactNode } from "react";
import { CodeBlock, CodeTabs } from "@/components/lab/code";
import {
	componentSource,
	componentsJson,
	demoSource,
	setupSource,
	tweakedUsageSource,
	usageSource,
} from "@/components/lab/sources";

function SectionHeader({
	index,
	eyebrow,
	title,
	children,
}: {
	index: string;
	eyebrow: string;
	title: string;
	children?: ReactNode;
}) {
	return (
		<div className="mb-9 max-w-2xl">
			<div className="mb-3 flex items-center gap-3">
				<span className="font-mono text-[11px] text-accent">{index}</span>
				<span className="h-px w-8 bg-border" />
				<span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
					{eyebrow}
				</span>
			</div>
			<h2 className="text-[1.9rem] font-semibold leading-tight tracking-[-0.02em] sm:text-[2.3rem]">
				{title}
			</h2>
			{children ? (
				<p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
					{children}
				</p>
			) : null}
		</div>
	);
}

function StepCard({
	icon,
	title,
	children,
}: {
	icon: ReactNode;
	title: string;
	children: ReactNode;
}) {
	return (
		<div className="glass-soft rounded-xl p-5">
			<div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-black/30 text-accent">
				{icon}
			</div>
			<h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
			<p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
				{children}
			</p>
		</div>
	);
}

/* ---------- Integration ---------- */
function Integration() {
	return (
		<section
			id="integration"
			className="mx-auto max-w-[1100px] px-4 py-20 sm:px-6 sm:py-28"
		>
			<SectionHeader
				index="01"
				eyebrow="Drop-in integration"
				title="Straight into components/ui"
			>
				The shader ships as one self-contained file. If your app already runs
				the shadcn stack — Tailwind&nbsp;CSS, TypeScript and a{" "}
				<code className="font-mono text-foreground/90">components.json</code> —
				integration is a copy-paste plus an import.
			</SectionHeader>

			<div className="mb-12 grid gap-4 md:grid-cols-3">
				<StepCard
					icon={<FolderTree className="h-[18px] w-[18px]" />}
					title="Why /components/ui"
				>
					shadcn maps the{" "}
					<code className="font-mono text-foreground/90">ui</code> alias to{" "}
					<code className="font-mono text-foreground/90">@/components/ui</code>{" "}
					in{" "}
					<code className="font-mono text-foreground/90">components.json</code>.
					Keeping primitives there is what makes the demo's{" "}
					<code className="font-mono text-foreground/90">
						@/components/ui/…
					</code>{" "}
					import resolve, lets the CLI manage the file, and puts it where every
					consumer expects.
				</StepCard>
				<StepCard
					icon={<Boxes className="h-[18px] w-[18px]" />}
					title="Paste the file"
				>
					Save the component as{" "}
					<code className="font-mono text-foreground/90">
						src/components/ui/abstract-glassy-shader.tsx
					</code>
					. It needs nothing but React — no Three.js, no context providers, no
					images or fonts.
				</StepCard>
				<StepCard
					icon={<Sparkles className="h-[18px] w-[18px]" />}
					title="Import & render"
				>
					Pull in the named{" "}
					<code className="font-mono text-foreground/90">ShaderComponent</code>{" "}
					and give it a sized parent. Optional{" "}
					<code className="font-mono text-foreground/90">settings</code> and{" "}
					<code className="font-mono text-foreground/90">onFrame</code> props
					are there when you want them.
				</StepCard>
			</div>

			<CodeTabs
				tabs={[
					{ id: "usage", label: "Usage.tsx", code: usageSource },
					{ id: "props", label: "With props", code: tweakedUsageSource },
					{
						id: "component",
						label: "abstract-glassy-shader.tsx",
						code: componentSource,
					},
					{ id: "demo", label: "demo.tsx", code: demoSource },
					{ id: "cfg", label: "components.json", code: componentsJson },
				]}
			/>

			<details className="group mt-6 overflow-hidden rounded-xl border border-border bg-black/30">
				<summary className="flex cursor-pointer list-none items-center gap-2.5 px-5 py-4 text-[14px] font-medium text-foreground/90 marker:hidden">
					<TerminalSquare className="h-4 w-4 text-accent" />
					No shadcn / Tailwind / TypeScript yet? Start here
					<span className="ml-auto font-mono text-[11px] text-muted-foreground transition-transform group-open:rotate-180">
						▾
					</span>
				</summary>
				<div className="border-t border-border p-4">
					<CodeBlock filename="setup.sh" code={setupSource} />
				</div>
			</details>
		</section>
	);
}

/* ---------- Anatomy ---------- */
const ANATOMY: { tag: string; title: string; body: string }[] = [
	{
		tag: "sdCircle(p, r)",
		title: "Signed distance",
		body: "Each blob is a circle as a distance field — negative inside, zero on the rim, positive outside. One cheap evaluation per pixel.",
	},
	{
		tag: "opSmoothUnion(a, b, k)",
		title: "Smooth union",
		body: "A polynomial smooth-min welds the two fields into one gooey surface. k — the Merge fader — sets how wide the weld stretches.",
	},
	{
		tag: "cos(time) · spread",
		title: "Orbiting centres",
		body: "Blob A and B ride cosine/sine of the clock (B offset by 3.14 rad), sweeping past each other and dragging the weld around.",
	},
	{
		tag: "exp(-glow · |d|)",
		title: "Exponential glow",
		body: "Distance to the surface becomes a soft halo. Raise Glow for a tight rim, drop it for a wide atmospheric bloom.",
	},
	{
		tag: "0.5 + 0.5·cos(…)",
		title: "Cosine spectrum",
		body: "The default palette is the classic cosine ramp over the uv field. Glass and Ember remap the same trick to cool and warm.",
	},
	{
		tag: "smoothstep(0.01, 0, d)",
		title: "Liquid core",
		body: "Just inside the iso-surface the colour blows out to white for that molten-glass highlight. The Core fader dials its strength.",
	},
];

function Anatomy() {
	return (
		<section id="anatomy" className="border-t border-border bg-white/[0.012]">
			<div className="mx-auto max-w-[1100px] px-4 py-20 sm:px-6 sm:py-28">
				<SectionHeader
					index="02"
					eyebrow="How it works"
					title="Anatomy of the field"
				>
					The whole image is six lines of signed-distance math evaluated on a
					single full-screen quad. Every fader on the control deck maps to one
					term below.
				</SectionHeader>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{ANATOMY.map((a) => (
						<div key={a.tag} className="glass-soft rounded-xl p-5">
							<code className="inline-block rounded-md border border-border bg-black/40 px-2.5 py-1 font-mono text-[11.5px] text-accent">
								{a.tag}
							</code>
							<h3 className="mt-3.5 text-[15px] font-semibold text-foreground">
								{a.title}
							</h3>
							<p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
								{a.body}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

/* ---------- API ---------- */
const PROPS: [string, string, string, string][] = [
	[
		"className",
		"string",
		"—",
		"Applied to the <canvas> (or fallback). Size it through its parent.",
	],
	[
		"settings",
		"Partial<ShaderSettings>",
		"{}",
		"Live overrides — omit any field to keep the original constant.",
	],
	[
		"onFrame",
		"(s: ShaderStats) => void",
		"—",
		"Per-frame readouts: time, fps, buffer size, blob centres.",
	],
	["style", "CSSProperties", "—", "Merged onto the canvas element."],
];

const SETTINGS: [string, string, string, string][] = [
	["speed", "number", "1", "Clock multiplier; 0 freezes the field."],
	["radius1", "number", "0.2", "Blob A radius, in uv units."],
	["radius2", "number", "0.16", "Blob B radius, in uv units."],
	["merge", "number", "0.2", "Smooth-union k — the weld width."],
	["glow", "number", "10", "Glow falloff exponent (higher = tighter)."],
	["spread", "number", "0.4", "Orbit amplitude; vertical sweep is half."],
	["core", "number", "1", "White-core intensity, 0–1."],
	[
		"palette",
		'"spectrum" | "glass" | "ember"',
		'"spectrum"',
		"Colour ramp; spectrum is verbatim.",
	],
	["paused", "boolean", "false", "Freeze the animation clock."],
];

function ApiTable({ rows }: { rows: [string, string, string, string][] }) {
	return (
		<div className="overflow-x-auto rounded-xl border border-border bg-black/30">
			<table className="w-full min-w-[640px] border-collapse text-left">
				<thead>
					<tr className="border-b border-border">
						{["Name", "Type", "Default", "Description"].map((h) => (
							<th
								key={h}
								className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
							>
								{h}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((r) => (
						<tr key={r[0]} className="border-b border-border/60 last:border-0">
							<td className="whitespace-nowrap px-4 py-3 font-mono text-[12.5px] text-accent">
								{r[0]}
							</td>
							<td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] text-foreground/80">
								{r[1]}
							</td>
							<td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] text-muted-foreground">
								{r[2]}
							</td>
							<td className="px-4 py-3 text-[13px] text-muted-foreground">
								{r[3]}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function Api() {
	return (
		<section id="api" className="border-t border-border">
			<div className="mx-auto max-w-[1100px] px-4 py-20 sm:px-6 sm:py-28">
				<SectionHeader index="03" eyebrow="Reference" title="Props & uniforms">
					Default props reproduce the source shader frame-for-frame. Pass a
					partial <code className="font-mono text-foreground/90">settings</code>{" "}
					object to promote any baked-in constant to a live uniform.
				</SectionHeader>

				<h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/70">
					ShaderComponent
				</h3>
				<ApiTable rows={PROPS} />

				<h3 className="mb-3 mt-10 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/70">
					ShaderSettings
				</h3>
				<ApiTable rows={SETTINGS} />
			</div>
		</section>
	);
}

function Footer() {
	return (
		<footer className="border-t border-border">
			<div className="mx-auto flex max-w-[1100px] flex-col items-start justify-between gap-4 px-4 py-10 sm:flex-row sm:items-center sm:px-6">
				<div className="flex items-center gap-2.5">
					<span className="text-[14px] font-semibold tracking-tight">
						GLASSWORKS
					</span>
					<span className="font-mono text-[11px] text-muted-foreground">
						· shaders/abstract-glassy-shader
					</span>
				</div>
				<p className="font-mono text-[11px] text-muted-foreground">
					Built with Fable 5 · WebGL2 · honours{" "}
					<code className="text-foreground/80">prefers-reduced-motion</code>
				</p>
			</div>
		</footer>
	);
}

export function Docs() {
	return (
		<div className="relative z-10 bg-background">
			<Integration />
			<Anatomy />
			<Api />
			<Footer />
		</div>
	);
}
