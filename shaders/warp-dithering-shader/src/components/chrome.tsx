import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Four L-shaped instrument brackets framing a panel. */
export function CornerBrackets({
	className,
	tone = "amber",
}: {
	className?: string;
	tone?: "amber" | "ash";
}) {
	const color = tone === "amber" ? "border-amber/70" : "border-ash/40";
	const base = cn("absolute h-3 w-3", color);
	return (
		<div className={cn("pointer-events-none absolute inset-0", className)}>
			<span className={cn(base, "left-0 top-0 border-l border-t")} />
			<span className={cn(base, "right-0 top-0 border-r border-t")} />
			<span className={cn(base, "bottom-0 left-0 border-b border-l")} />
			<span className={cn(base, "bottom-0 right-0 border-b border-r")} />
		</div>
	);
}

/** A small mono uppercase tag. */
export function Chip({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 border border-border/80 bg-panel/70 px-2 py-1 text-[10px] uppercase leading-none tracking-widest2 text-ash",
				className,
			)}
		>
			{children}
		</span>
	);
}

/** Numbered section header used across the page. */
export function SectionHeading({
	index,
	kicker,
	title,
	children,
}: {
	index: string;
	kicker: string;
	title: string;
	children?: ReactNode;
}) {
	return (
		<header className="mb-10 flex flex-col gap-3">
			<div className="flex items-center gap-3 text-amber">
				<span className="font-mono text-xs tabular-nums">{index}</span>
				<span className="h-px w-8 bg-amber/60" />
				<span className="font-mono text-[11px] uppercase tracking-widest2">
					{kicker}
				</span>
			</div>
			<h2 className="font-display text-3xl font-semibold tracking-tight text-bone sm:text-4xl">
				{title}
			</h2>
			{children ? (
				<p className="max-w-2xl text-sm leading-relaxed text-ash">{children}</p>
			) : null}
		</header>
	);
}
