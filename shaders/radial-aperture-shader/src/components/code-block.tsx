import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/** A labelled, copy-to-clipboard source block used in the integration section. */
export function CodeBlock({
	code,
	label,
	className,
}: {
	code: string;
	label?: string;
	className?: string;
}) {
	const [copied, setCopied] = useState(false);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(code);
		} catch {
			/* clipboard blocked — ignore */
		}
		setCopied(true);
		window.setTimeout(() => setCopied(false), 1400);
	};

	return (
		<div
			className={cn(
				"group relative overflow-hidden rounded-xl border border-line bg-panel/80",
				className,
			)}
		>
			<div className="flex items-center justify-between border-b border-line/70 px-4 py-2.5">
				<span className="font-mono text-[11px] uppercase tracking-[0.18em] text-dim">
					{label ?? "code"}
				</span>
				<button
					onClick={copy}
					className="inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-dim transition-colors hover:border-ember/60 hover:text-ember"
					aria-label="Copy to clipboard"
				>
					{copied ? (
						<>
							<Check className="h-3 w-3" /> copied
						</>
					) : (
						<>
							<Copy className="h-3 w-3" /> copy
						</>
					)}
				</button>
			</div>
			<pre className="overflow-x-auto px-4 py-4 text-[12.5px] leading-relaxed">
				<code className="font-mono text-ash/90">{code}</code>
			</pre>
		</div>
	);
}
