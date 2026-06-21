/**
 * The integration docket — a collapsible bottom drawer that tells the shadcn
 * integration story the prompt asks for: where the component lives, why it goes
 * in `@/components/ui`, the dependencies it needs, and a copyable usage snippet.
 *
 * It is the "documentation" half of a component-library page, kept out of the
 * way until opened so the live specimen stays the hero.
 */

import { Check, ClipboardCopy, FileCode2, PanelBottom } from "lucide-react";
import { useState } from "react";

const INSTALL_CMD = `npx shadcn@latest init      # sets up @/components/ui + Tailwind
# drop liquid-crystal.tsx into src/components/ui/
npm i lucide-react clsx tailwind-merge`;

const USAGE = `import { useState } from "react";
import {
  InteractiveShader,
  ControlsPanel,
  type ShaderParams,
} from "@/components/ui/liquid-crystal";

export default function DemoOne() {
  const [params, setParams] = useState<ShaderParams>({
    hue: 188, speed: 0.5, noise: 0.28,
    warp: 0.14, zoom: 1.6, brightness: 1.0,
  });

  const onParamChange = (k: keyof ShaderParams) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setParams((p) => ({ ...p, [k]: parseFloat(e.target.value) }));

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <InteractiveShader {...params} />
      <ControlsPanel params={params} onParamChange={onParamChange} />
    </div>
  );
}`;

function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);
	return (
		<button
			type="button"
			onClick={() => {
				navigator.clipboard?.writeText(text).then(
					() => {
						setCopied(true);
						setTimeout(() => setCopied(false), 1600);
					},
					() => undefined,
				);
			}}
			className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider2 text-bench-bone/70 transition-colors hover:border-prism-cyan/40 hover:text-prism-cyan"
		>
			{copied ? (
				<>
					<Check className="h-3 w-3" /> copied
				</>
			) : (
				<>
					<ClipboardCopy className="h-3 w-3" /> copy
				</>
			)}
		</button>
	);
}

function CodeBlock({ title, code }: { title: string; code: string }) {
	return (
		<div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-bench-void/70">
			<div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
				<span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider2 text-bench-steel">
					<FileCode2 className="h-3 w-3" /> {title}
				</span>
				<CopyButton text={code} />
			</div>
			<pre className="overflow-x-auto px-3 py-3 font-mono text-[11.5px] leading-relaxed text-bench-bone/80">
				<code>{code}</code>
			</pre>
		</div>
	);
}

export function IntegrationDocket() {
	const [open, setOpen] = useState(false);

	return (
		<div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center">
			<div className="pointer-events-auto w-full max-w-5xl px-4 pb-4">
				<button
					type="button"
					onClick={() => setOpen((o) => !o)}
					aria-expanded={open}
					className="panel-brushed group flex w-full items-center justify-between rounded-t-2xl border border-white/10 px-5 py-3 shadow-2xl transition-colors hover:border-prism-cyan/30"
					style={{
						borderBottomLeftRadius: open ? 0 : undefined,
						borderBottomRightRadius: open ? 0 : undefined,
					}}
				>
					<span className="flex items-center gap-2.5">
						<PanelBottom
							className="h-4 w-4 text-prism-cyan"
							strokeWidth={1.5}
						/>
						<span className="font-mono text-[11px] uppercase tracking-wider2 text-bench-bone/85">
							Integration · @/components/ui/liquid-crystal
						</span>
					</span>
					<span className="font-mono text-[10px] uppercase tracking-wider2 text-bench-steel transition-colors group-hover:text-prism-cyan">
						{open ? "hide" : "open"}
					</span>
				</button>

				{open && (
					<div className="panel-brushed animate-fade-in rounded-b-2xl border border-t-0 border-white/10 p-5 shadow-2xl">
						<div className="mb-4 grid gap-4 md:grid-cols-3">
							<div>
								<p className="font-mono text-[10px] uppercase tracking-wider2 text-prism-cyan">
									Drop-in path
								</p>
								<p className="mt-1.5 text-[12.5px] leading-relaxed text-bench-bone/65">
									shadcn resolves the{" "}
									<code className="rounded bg-white/5 px-1 text-bench-bone/90">
										ui
									</code>{" "}
									alias to{" "}
									<code className="rounded bg-white/5 px-1 text-bench-bone/90">
										@/components/ui
									</code>
									. Keeping the shader there lets any consumer import it by the
									same alias the CLI generates.
								</p>
							</div>
							<div>
								<p className="font-mono text-[10px] uppercase tracking-wider2 text-prism-cyan">
									Dependencies
								</p>
								<p className="mt-1.5 text-[12.5px] leading-relaxed text-bench-bone/65">
									Raw WebGL only — no three.js. Tailwind for the panel,{" "}
									<code className="rounded bg-white/5 px-1 text-bench-bone/90">
										lucide-react
									</code>{" "}
									for icons. No context provider required.
								</p>
							</div>
							<div>
								<p className="font-mono text-[10px] uppercase tracking-wider2 text-prism-cyan">
									Props
								</p>
								<p className="mt-1.5 text-[12.5px] leading-relaxed text-bench-bone/65">
									Six controlled uniforms via{" "}
									<code className="rounded bg-white/5 px-1 text-bench-bone/90">
										ShaderParams
									</code>{" "}
									plus an optional{" "}
									<code className="rounded bg-white/5 px-1 text-bench-bone/90">
										onFrame
									</code>{" "}
									telemetry callback.
								</p>
							</div>
						</div>

						<div className="flex flex-col gap-4 md:flex-row">
							<CodeBlock title="setup" code={INSTALL_CMD} />
							<CodeBlock title="usage — demo.tsx" code={USAGE} />
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
