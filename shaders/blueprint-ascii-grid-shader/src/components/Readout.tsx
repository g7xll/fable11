import { cn } from "@/lib/utils";

type ReadoutProps = {
	label: string;
	value: string;
	unit?: string;
	className?: string;
	/** Monospace tabular value rendered larger. */
	accent?: boolean;
};

/**
 * A single instrument readout: a small mono label over a tabular-figure value.
 * Used across the telemetry HUD and footer status strip.
 */
export function Readout({
	label,
	value,
	unit,
	className,
	accent,
}: ReadoutProps) {
	return (
		<div className={cn("flex flex-col gap-1", className)}>
			<span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
				{label}
			</span>
			<span
				className={cn(
					"font-mono tabular-nums leading-none text-ink",
					accent ? "text-xl font-bold sm:text-2xl" : "text-sm",
				)}
				style={{ fontVariantNumeric: "tabular-nums" }}
			>
				{value}
				{unit ? (
					<span className="ml-1 text-[0.6em] font-normal text-ink-faint">
						{unit}
					</span>
				) : null}
			</span>
		</div>
	);
}
