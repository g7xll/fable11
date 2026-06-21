import {
	ArrowUpRight,
	Boxes,
	Code2,
	FolderTree,
	Gauge,
	Hand,
	Terminal,
} from "lucide-react";
import { useEffect, useRef } from "react";

/** Reveal-on-scroll wrapper using IntersectionObserver. */
function Reveal({
	children,
	delay = 0,
	className = "",
}: {
	children: React.ReactNode;
	delay?: number;
	className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.isIntersecting) {
						(e.target as HTMLElement).classList.add("is-visible");
						io.unobserve(e.target);
					}
				});
			},
			{ threshold: 0.16 },
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);
	return (
		<div
			ref={ref}
			className={`reveal ${className}`}
			style={{ transitionDelay: `${delay}ms` }}
		>
			{children}
		</div>
	);
}

/** Tiny syntax-tinted code shell (no highlighter dep, just spans). */
function CodeShell({
	title,
	badge,
	lines,
}: {
	title: string;
	badge: string;
	lines: React.ReactNode[];
}) {
	return (
		<div className="code-shell overflow-hidden rounded-2xl">
			<div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
				<div className="flex items-center gap-2">
					<span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
					<span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
					<span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
					<span className="ml-2 font-mono text-xs text-ash">{title}</span>
				</div>
				<span className="rounded-full border border-gold/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-gold/70">
					{badge}
				</span>
			</div>
			<pre className="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-relaxed text-paper/90">
				<code className="block">
					{lines.map((l, i) => (
						<span key={i} className="block whitespace-pre">
							{l}
						</span>
					))}
				</code>
			</pre>
		</div>
	);
}

const c = {
	kw: (t: string) => <span className="text-ember">{t}</span>,
	str: (t: string) => <span className="text-[#9ece6a]">{t}</span>,
	fn: (t: string) => <span className="text-gold">{t}</span>,
	com: (t: string) => <span className="text-ash">{t}</span>,
	punc: (t: string) => <span className="text-paper/60">{t}</span>,
};

export function IntegrationSection() {
	return (
		<section
			id="integrate"
			className="relative border-t border-white/5 bg-void px-6 py-24 md:px-10 md:py-32"
		>
			<div className="mx-auto max-w-6xl">
				<Reveal>
					<p className="mb-3 font-mono text-xs uppercase tracking-[0.32em] text-ember">
						Drop-in / shadcn-ready
					</p>
					<h2 className="max-w-3xl font-display text-3xl font-semibold leading-tight text-paper md:text-5xl">
						One component.{" "}
						<span className="text-ash">Tailwind, TypeScript, zero config.</span>
					</h2>
					<p className="mt-5 max-w-2xl text-base leading-relaxed text-ash md:text-lg">
						The hero is a single self-contained file. It lives where every
						shadcn primitive lives —{" "}
						<code className="text-gold">@/components/ui</code> — so the import
						path is the convention, not an accident. WebGL2 is the only runtime
						dependency, and it ships inside the component.
					</p>
				</Reveal>

				<div className="mt-14 grid gap-6 lg:grid-cols-2">
					<Reveal delay={60}>
						<CodeShell
							title="terminal"
							badge="setup"
							lines={[
								c.com("# 1 — scaffold a shadcn + Tailwind + TS project"),
								<>
									{c.fn("npx")} shadcn@latest {c.kw("init")}
								</>,
								<> </>,
								c.com("# 2 — drop the hero into the ui folder"),
								<>{c.fn("cp")} animated-shader-hero.tsx \</>,
								<>{"   "}src/components/ui/</>,
								<> </>,
								c.com("# that's it — WebGL2 ships inside the file"),
							]}
						/>
					</Reveal>

					<Reveal delay={120}>
						<CodeShell
							title="src/app/page.tsx"
							badge="usage"
							lines={[
								<>
									{c.kw("import")} Hero {c.kw("from")}{" "}
									{c.str('"@/components/ui/animated-shader-hero"')}
								</>,
								<> </>,
								<>
									{c.kw("export default function")} {c.fn("Page")}
									{c.punc("() {")}
								</>,
								<>
									{"  "}
									{c.kw("return")} {c.punc("(")}
								</>,
								<>
									{"    "}
									{c.punc("<")}
									{c.fn("Hero")}
								</>,
								<>
									{"      "}headline={c.punc("{{")} line1:{" "}
									{c.str('"Launch Your"')},
								</>,
								<>
									{"               "}line2: {c.str('"Workflow Into Orbit"')}{" "}
									{c.punc("}}")}
								</>,
								<>
									{"      "}subtitle={c.str('"Built for the next gen…"')}
								</>,
								<>
									{"    "}
									{c.punc("/>")}
								</>,
								<>
									{"  "}
									{c.punc(")")}
								</>,
								c.punc("}"),
							]}
						/>
					</Reveal>
				</div>

				{/* Why /components/ui — the question the prompt asks us to answer. */}
				<Reveal delay={80}>
					<div className="mt-8 flex items-start gap-4 rounded-2xl border border-gold/10 bg-void-900/60 p-5 md:p-6">
						<FolderTree className="mt-0.5 h-5 w-5 shrink-0 text-ember" />
						<p className="text-sm leading-relaxed text-ash md:text-[15px]">
							<span className="text-paper">
								Why <code className="text-gold">/components/ui</code>?
							</span>{" "}
							shadcn’s <code className="text-gold">components.json</code>{" "}
							aliases <code className="text-gold">ui</code> to this folder, so
							the CLI, the registry, and every generated import resolve here.
							Keeping the hero alongside your{" "}
							<code className="text-gold">button</code> and{" "}
							<code className="text-gold">card</code> means{" "}
							<code className="text-gold">
								@/components/ui/animated-shader-hero
							</code>{" "}
							just works — no path rewrites, no special-casing.
						</p>
					</div>
				</Reveal>
			</div>
		</section>
	);
}

export function UniformsSection() {
	const items = [
		{
			icon: Gauge,
			uniform: "time",
			type: "float",
			copy: "Seconds since mount. Drives the drifting fractal clouds and the slow breathing zoom.",
		},
		{
			icon: Boxes,
			uniform: "resolution",
			type: "vec2",
			copy: "Canvas size in device pixels. The shader centers and normalizes UVs against it on every resize.",
		},
		{
			icon: Hand,
			uniform: "pointerCount",
			type: "int",
			copy: "Active pointers. Drag the canvas and the field reacts — the hero is interactive, not a loop.",
		},
	];

	return (
		<section className="relative border-t border-white/5 bg-void-900 px-6 py-24 md:px-10 md:py-32">
			<div className="mx-auto max-w-6xl">
				<Reveal>
					<p className="mb-3 font-mono text-xs uppercase tracking-[0.32em] text-ember">
						Under the canvas
					</p>
					<h2 className="max-w-3xl font-display text-3xl font-semibold leading-tight text-paper md:text-5xl">
						Three uniforms do all the work.
					</h2>
				</Reveal>

				<div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/5 md:grid-cols-3">
					{items.map((it, i) => (
						<Reveal key={it.uniform} delay={i * 80} className="bg-void">
							<div className="h-full p-7">
								<it.icon className="h-6 w-6 text-ember" />
								<div className="mt-5 font-mono text-sm">
									<span className="text-gold/50">{it.type} </span>
									<span className="text-paper">{it.uniform}</span>
								</div>
								<p className="mt-3 text-sm leading-relaxed text-ash">
									{it.copy}
								</p>
							</div>
						</Reveal>
					))}
				</div>

				<Reveal delay={40}>
					<p className="mt-8 font-mono text-xs text-ash">
						<span className="text-ember">{"// "}</span>
						fragment shader by Matthias Hurrle{" "}
						<a
							href="https://twitter.com/atzedent"
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-0.5 text-gold/70 underline-offset-4 hover:underline"
						>
							@atzedent
							<ArrowUpRight className="h-3 w-3" />
						</a>
					</p>
				</Reveal>
			</div>
		</section>
	);
}

/** The prompt's own "How to Use" block, re-skinned to the studio palette. */
export function HowToUseSection() {
	const usage = `<Hero
  trustBadge={{
    text: "Your trust badge text",
    icons: ["🚀", "⭐", "✨"]   // optional
  }}
  headline={{
    line1: "Your First Line",
    line2: "Your Second Line"
  }}
  subtitle="Your compelling subtitle text goes here..."
  buttons={{
    primary:   { text: "Primary CTA",   onClick: handlePrimaryClick },
    secondary: { text: "Secondary CTA", onClick: handleSecondaryClick }
  }}
  className="custom-classes"   // optional
/>`;

	return (
		<section className="relative border-t border-white/5 bg-void px-6 py-24 md:px-10 md:py-32">
			<div className="mx-auto max-w-4xl">
				<Reveal>
					<div className="flex items-center gap-2.5">
						<Code2 className="h-5 w-5 text-ember" />
						<h2 className="font-display text-2xl font-semibold text-paper md:text-3xl">
							How to use the Hero component
						</h2>
					</div>
					<p className="mt-4 text-base leading-relaxed text-ash">
						Every prop is optional except{" "}
						<code className="text-gold">headline</code> and{" "}
						<code className="text-gold">subtitle</code>. Pass{" "}
						<code className="text-gold">onClick</code> handlers, swap the trust
						badge, or omit the buttons entirely.
					</p>
				</Reveal>

				<Reveal delay={80}>
					<div className="code-shell mt-8 overflow-hidden rounded-2xl">
						<div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
							<Terminal className="h-4 w-4 text-ash" />
							<span className="font-mono text-xs text-ash">HeroDemo.tsx</span>
						</div>
						<pre className="overflow-x-auto px-5 py-5 font-mono text-[12.5px] leading-relaxed text-paper/90">
							<code>{usage}</code>
						</pre>
					</div>
				</Reveal>
			</div>
		</section>
	);
}

export function SiteFooter() {
	return (
		<footer className="border-t border-white/5 bg-void-900 px-6 py-12 md:px-10">
			<div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
				<div className="font-mono text-sm text-ash">
					<span className="text-ember">◆</span> EMBERFIELD
					<span className="text-paper/40"> — generative hero studio</span>
				</div>
				<div className="flex flex-wrap gap-x-7 gap-y-2 font-mono text-xs text-ash">
					<span>React 18</span>
					<span>TypeScript</span>
					<span>Tailwind CSS</span>
					<span>WebGL2</span>
					<span>shadcn structure</span>
				</div>
			</div>
		</footer>
	);
}
