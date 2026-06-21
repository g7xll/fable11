import { Asterisk, MoveDown, Wind } from "lucide-react";
import { useEffect, useState } from "react";
import { SmokeBackground } from "@/components/ui/spooky-smoke-animation";
import { VapourConsole } from "@/components/VapourConsole";
import { useTunedColor } from "@/hooks/useTunedColor";
import { REAGENTS } from "@/lib/reagents";

function MarqueeRow({ hex }: { hex: string }) {
	const items = [
		"tune the vapour",
		"WebGL2 · fbm noise",
		"single smokeColor prop",
		"no dependencies",
		"60fps fragment shader",
		"read the smoke",
	];
	return (
		<div className="flex overflow-hidden border-y border-ash/10 bg-void/70 py-3 backdrop-blur-sm">
			<div className="flex shrink-0 animate-drift items-center gap-10 whitespace-nowrap pr-10">
				{[...items, ...items].map((t, i) => (
					<span
						key={i}
						className="flex items-center gap-10 font-mono text-[11px] uppercase tracking-[0.28em] text-smoke"
					>
						{t}
						<span style={{ color: hex }}>✦</span>
					</span>
				))}
			</div>
		</div>
	);
}

export default function App() {
	const tuned = useTunedColor();
	const { hex, activeReagent } = tuned;

	// Rolling séance timestamp for the instrument header — purely atmospheric.
	const [stamp, setStamp] = useState("00:00:00");
	useEffect(() => {
		const tick = () => {
			const d = new Date();
			const p = (n: number) => String(n).padStart(2, "0");
			setStamp(`${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`);
		};
		tick();
		const id = window.setInterval(tick, 1000);
		return () => window.clearInterval(id);
	}, []);

	return (
		<div className="relative min-h-[100svh] w-full overflow-hidden bg-void text-ash">
			{/* ---- ambient backdrop ----
          A subtle fixed wash, tinted by the current reagent, that ties the whole
          page to the smoke colour without competing with the observation window. */}
			<div
				className="pointer-events-none fixed inset-0 -z-10 transition-colors duration-700"
				aria-hidden="true"
				style={{
					background: `radial-gradient(80% 55% at 50% 0%, ${hex}1f 0%, transparent 60%), #08080a`,
				}}
			/>
			<div
				className="pointer-events-none fixed inset-0 -z-10 grain-overlay"
				aria-hidden="true"
			/>

			{/* ---- instrument top bar ---- */}
			<header className="relative z-10 flex items-center justify-between px-5 py-4 md:px-8">
				<div className="flex items-center gap-3">
					<Asterisk
						className="h-5 w-5 text-ash"
						strokeWidth={1.5}
						aria-hidden="true"
					/>
					<span className="font-display text-xl tracking-wide text-ash">
						Aether
					</span>
				</div>
				<nav className="hidden items-center gap-8 font-mono text-[10px] uppercase tracking-[0.28em] text-smoke md:flex">
					<span>Instrument</span>
					<span>Reagents</span>
					<span>Specimens</span>
				</nav>
				<span className="font-mono text-[10px] uppercase tracking-[0.24em] text-smoke">
					séance · {stamp}
				</span>
			</header>

			{/* ---- hero ---- */}
			<main className="relative z-10">
				<section className="mx-auto max-w-7xl px-5 pb-14 pt-4 md:px-8">
					{/* headline band */}
					<div className="mb-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.32em] text-smoke animate-veil-up">
						<Wind
							className="h-3.5 w-3.5"
							strokeWidth={1.75}
							aria-hidden="true"
						/>
						a vapour reading instrument
						<span className="h-px w-10 bg-ash/30" />
						no. 0{REAGENTS.length}
					</div>

					<div className="grid grid-cols-1 items-end gap-x-8 gap-y-4 lg:grid-cols-[1fr_auto]">
						<h1 className="font-display text-[clamp(3.2rem,12vw,9.5rem)] font-medium leading-[0.82] tracking-[-0.015em] text-ash text-balance animate-veil-blur">
							Read the{" "}
							<span className="relative italic">
								smoke
								<span
									className="absolute -bottom-1 left-0 h-px w-full transition-colors duration-500"
									style={{ background: hex, boxShadow: `0 0 22px ${hex}` }}
								/>
							</span>
							<span
								className="align-super text-[0.32em] not-italic transition-colors duration-500"
								style={{ color: hex }}
							>
								✦
							</span>
						</h1>

						<p
							className="max-w-xs pb-3 font-sans text-[14px] leading-relaxed text-bone/85 lg:text-right animate-veil-up"
							style={{ animationDelay: "0.15s" }}
						>
							A single WebGL2 fragment shader breathes an endless field of
							fbm-noise smoke. Hand it one colour — through the{" "}
							<span className="font-medium text-ash">smokeColor</span> prop —
							and the whole séance changes its mind.
						</p>
					</div>

					{/* observation window + console */}
					<div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_440px]">
						{/* the live, unobstructed smoke field */}
						<figure
							className="group relative aspect-[16/11] w-full overflow-hidden border border-ash/14 bg-void animate-veil-up sm:aspect-[16/9] lg:aspect-auto lg:min-h-[440px]"
							style={{ animationDelay: "0.1s" }}
						>
							<div className="absolute inset-0">
								<SmokeBackground smokeColor={hex} />
							</div>
							<div
								className="pointer-events-none absolute inset-0 grain-overlay"
								aria-hidden="true"
							/>
							<div
								className="pointer-events-none absolute inset-0"
								aria-hidden="true"
								style={{
									background:
										"radial-gradient(120% 120% at 50% 50%, transparent 58%, rgba(8,8,10,0.55) 100%)",
								}}
							/>
							{/* instrument frame marks */}
							<span className="reg-mark pointer-events-none absolute -left-px -top-px z-10 h-5 w-5" />
							<span className="reg-mark pointer-events-none absolute -right-px -top-px z-10 h-5 w-5" />
							<span className="reg-mark pointer-events-none absolute -bottom-px -left-px z-10 h-5 w-5" />
							<span className="reg-mark pointer-events-none absolute -bottom-px -right-px z-10 h-5 w-5" />

							<figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 md:p-5">
								<span className="font-mono text-[10px] uppercase tracking-[0.28em] text-ash/80">
									observation window · live
								</span>
								<span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-ash/80">
									reading{" "}
									<span style={{ color: hex }}>
										{activeReagent ? activeReagent.name : "manual tincture"}
									</span>
									<span
										className="h-2.5 w-2.5 rounded-full"
										style={{ background: hex, boxShadow: `0 0 12px ${hex}` }}
									/>
								</span>
							</figcaption>
						</figure>

						{/* console column */}
						<div
							className="flex justify-center animate-veil-up lg:justify-end"
							style={{ animationDelay: "0.2s" }}
						>
							<VapourConsole tuned={tuned} />
						</div>
					</div>

					<div
						className="mt-7 flex flex-wrap items-center gap-4 animate-veil-up"
						style={{ animationDelay: "0.3s" }}
					>
						<a
							href="#specimens"
							className="group inline-flex items-center gap-2 border border-ash/25 bg-ash px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-void transition-colors duration-200 hover:bg-bone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ash/60 focus-visible:ring-offset-2 focus-visible:ring-offset-void"
						>
							View specimens
							<MoveDown
								className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-y-0.5"
								strokeWidth={2}
								aria-hidden="true"
							/>
						</a>
						<p className="font-mono text-[10px] uppercase tracking-[0.24em] text-smoke">
							eight reagents · one <span className="text-ash">smokeColor</span>{" "}
							prop · zero dependencies
						</p>
					</div>
				</section>

				<MarqueeRow hex={hex} />

				{/* ---- specimens: the two documented usages from demo.tsx ---- */}
				<section
					id="specimens"
					className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28"
				>
					<div className="mb-10 flex flex-wrap items-end justify-between gap-4">
						<h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-none text-ash">
							Two specimens,
							<br />
							<span className="italic text-bone/90">one prop.</span>
						</h2>
						<p className="max-w-xs font-sans text-sm leading-relaxed text-smoke">
							The component ships with two canonical usages. Both are the same
							shader; only the reagent differs.
						</p>
					</div>

					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<SpecimenPane
							numeral="A"
							title="Default"
							code="<SmokeBackground />"
							note="No prop. The shader falls back to its #808080 cinder ash — neutral, ambient, unsummoned."
							demoColor="#808080"
						/>
						<SpecimenPane
							numeral="B"
							title="Customized"
							code='<SmokeBackground smokeColor="#FF0000" />'
							note="One hex string is all it takes. The brightest folds of the noise inherit the tint you hand it."
							demoColor="#FF0000"
						/>
					</div>
				</section>

				{/* ---- footer ---- */}
				<footer className="border-t border-ash/10 bg-void/80 px-5 py-10 backdrop-blur-sm md:px-8">
					<div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
						<div className="flex items-center gap-3">
							<Asterisk
								className="h-4 w-4 text-ash"
								strokeWidth={1.5}
								aria-hidden="true"
							/>
							<span className="font-display text-lg text-ash">Aether</span>
							<span className="font-mono text-[10px] uppercase tracking-[0.24em] text-smoke">
								— spooky smoke shader
							</span>
						</div>
						<p className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke">
							WebGL2 · React · shadcn/ui structure · self-contained
						</p>
					</div>
				</footer>
			</main>
		</div>
	);
}

/** A framed "specimen" pane that renders the live shader at the documented colour. */
function SpecimenPane({
	numeral,
	title,
	code,
	note,
	demoColor,
}: {
	numeral: string;
	title: string;
	code: string;
	note: string;
	demoColor: string;
}) {
	return (
		<figure className="group relative overflow-hidden border border-ash/14 bg-void/40">
			<span className="reg-mark pointer-events-none absolute -left-px -top-px z-10 h-4 w-4" />
			<span className="reg-mark pointer-events-none absolute -right-px -top-px z-10 h-4 w-4" />

			<div className="relative aspect-[16/10] w-full overflow-hidden">
				<SmokeBackground smokeColor={demoColor} />
				<div
					className="pointer-events-none absolute inset-0"
					style={{
						background:
							"linear-gradient(180deg, rgba(8,8,10,0.1) 0%, rgba(8,8,10,0) 40%, rgba(8,8,10,0.7) 100%)",
					}}
					aria-hidden="true"
				/>
				<span className="absolute left-4 top-4 font-display text-2xl text-ash/90">
					{numeral}
				</span>
				<span
					className="absolute right-4 top-4 h-3 w-3 rounded-full"
					style={{ background: demoColor, boxShadow: `0 0 14px ${demoColor}` }}
					aria-hidden="true"
				/>
			</div>

			<figcaption className="space-y-3 border-t border-ash/12 px-5 py-5">
				<div className="flex items-baseline justify-between">
					<h3 className="font-display text-2xl text-ash">{title}</h3>
					<span className="font-mono text-[10px] uppercase tracking-[0.2em] text-smoke">
						{demoColor}
					</span>
				</div>
				<pre className="overflow-x-auto border border-ash/10 bg-ink/80 px-3 py-2 font-mono text-[11px] leading-relaxed text-bone/90">
					<code>{code}</code>
				</pre>
				<p className="font-sans text-[13px] leading-relaxed text-smoke">
					{note}
				</p>
			</figcaption>
		</figure>
	);
}
