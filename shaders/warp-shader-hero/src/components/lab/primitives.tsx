import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { cn, clamp } from "@/lib/utils";

/** A graphite instrument panel with an engraved title strip. */
export function Panel({
	title,
	kicker,
	right,
	children,
	className,
}: {
	title: string;
	kicker?: string;
	right?: ReactNode;
	children: ReactNode;
	className?: string;
}) {
	return (
		<section
			className={cn(
				"relative rounded-xl border border-hairline bg-panel/80 backdrop-blur-sm",
				"shadow-[0_1px_0_rgba(255,255,255,0.03)_inset,0_18px_40px_-24px_rgba(0,0,0,0.9)]",
				className,
			)}
		>
			<header className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-3">
				<div className="min-w-0">
					{kicker && (
						<div className="font-mono text-[10px] uppercase tracking-[0.28em] text-signal-dim">
							{kicker}
						</div>
					)}
					<h3 className="truncate font-mono text-[13px] font-medium uppercase tracking-[0.14em] text-ink">
						{title}
					</h3>
				</div>
				{right}
			</header>
			<div className="p-4">{children}</div>
		</section>
	);
}

/** A labelled instrument fader wired to a numeric value. */
export function Fader({
	id,
	label,
	hint,
	value,
	min,
	max,
	step,
	suffix,
	onChange,
}: {
	id: string;
	label: string;
	hint?: string;
	value: number;
	min: number;
	max: number;
	step: number;
	suffix?: string;
	onChange: (v: number) => void;
}) {
	const fill = clamp(((value - min) / (max - min)) * 100, 0, 100);
	const decimals = step < 1 ? 2 : 0;
	return (
		<div className="group">
			<div className="mb-1.5 flex items-baseline justify-between gap-2">
				<label
					htmlFor={id}
					className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-dim group-hover:text-ink"
					title={hint}
				>
					{label}
				</label>
				<span className="font-mono text-[12px] tabular-nums text-signal">
					{value.toFixed(decimals)}
					{suffix ?? ""}
				</span>
			</div>
			<input
				id={id}
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(e) => onChange(parseFloat(e.target.value))}
				style={{ ["--fill" as string]: `${fill}%` }}
				aria-label={label}
			/>
		</div>
	);
}

/** A segmented selector (used for the Warp `shape` enum). */
export function Segments<T extends string>({
	options,
	value,
	onChange,
	ariaLabel,
}: {
	options: { value: T; label: string }[];
	value: T;
	onChange: (v: T) => void;
	ariaLabel: string;
}) {
	return (
		<div
			role="radiogroup"
			aria-label={ariaLabel}
			className="grid auto-cols-fr grid-flow-col gap-1 rounded-lg border border-hairline bg-rail p-1"
		>
			{options.map((opt) => {
				const active = opt.value === value;
				return (
					<button
						key={opt.value}
						role="radio"
						aria-checked={active}
						onClick={() => onChange(opt.value)}
						className={cn(
							"rounded-md px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
							active
								? "bg-signal/15 text-signal shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-signal)_40%,transparent)_inset]"
								: "text-ink-dim hover:text-ink hover:bg-white/5",
						)}
					>
						{opt.label}
					</button>
				);
			})}
		</div>
	);
}

/** Copy-to-clipboard button with a transient confirmation state. */
export function CopyButton({
	text,
	label = "Copy",
	className,
}: {
	text: string;
	label?: string;
	className?: string;
}) {
	const [copied, setCopied] = useState(false);
	return (
		<button
			onClick={async () => {
				try {
					await navigator.clipboard.writeText(text);
				} catch {
					/* clipboard blocked (e.g. headless) — still flash the confirm */
				}
				setCopied(true);
				window.setTimeout(() => setCopied(false), 1400);
			}}
			className={cn(
				"inline-flex items-center gap-1.5 rounded-md border border-hairline bg-rail px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-dim transition-colors hover:border-signal/50 hover:text-signal",
				className,
			)}
			aria-label={label}
		>
			{copied ? (
				<Check className="h-3.5 w-3.5 text-signal" />
			) : (
				<Copy className="h-3.5 w-3.5" />
			)}
			{copied ? "Copied" : label}
		</button>
	);
}

/** A small colour swatch + editable hex/hsl text for one of the Warp colours. */
export function Swatch({
	value,
	onChange,
	index,
}: {
	value: string;
	onChange: (v: string) => void;
	index: number;
}) {
	return (
		<div className="flex items-center gap-2 rounded-lg border border-hairline bg-rail px-2 py-1.5">
			<span
				className="h-6 w-6 shrink-0 rounded-md border border-white/15"
				style={{ background: value }}
				aria-hidden
			/>
			<div className="min-w-0 flex-1">
				<div className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">
					colors[{index}]
				</div>
				<input
					value={value}
					onChange={(e) => onChange(e.target.value)}
					spellCheck={false}
					className="w-full bg-transparent font-mono text-[11px] text-ink outline-none placeholder:text-ink-faint"
					aria-label={`Warp color ${index}`}
				/>
			</div>
		</div>
	);
}
