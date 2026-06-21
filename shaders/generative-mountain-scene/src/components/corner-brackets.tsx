import { cn } from "@/lib/utils";

/**
 * Four L-shaped registration brackets pinned to the corners of a relatively-
 * positioned parent — the "viewfinder / survey plate" framing reused on the
 * hero stage and the specimen panes.
 */
export function CornerBrackets({
	className,
	size = 22,
}: {
	className?: string;
	size?: number;
}) {
	const common = "absolute border-glacier/55";
	const len = `${size}px`;
	return (
		<div
			className={cn("pointer-events-none absolute inset-0", className)}
			aria-hidden="true"
		>
			<span
				className={cn(common, "left-0 top-0 border-l border-t")}
				style={{ width: len, height: len }}
			/>
			<span
				className={cn(common, "right-0 top-0 border-r border-t")}
				style={{ width: len, height: len }}
			/>
			<span
				className={cn(common, "bottom-0 left-0 border-b border-l")}
				style={{ width: len, height: len }}
			/>
			<span
				className={cn(common, "bottom-0 right-0 border-b border-r")}
				style={{ width: len, height: len }}
			/>
		</div>
	);
}
