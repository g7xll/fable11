/**
 * cn — the standard shadcn class-name combiner. In a fresh shadcn project this
 * wraps `clsx` + `tailwind-merge`; here we keep the same call signature with a
 * dependency-free implementation so the project stays self-contained.
 */
export function cn(
	...classes: Array<string | false | null | undefined>
): string {
	return classes.filter(Boolean).join(" ");
}

/** Clamp `v` into the inclusive `[lo, hi]` range. */
export function clamp(v: number, lo: number, hi: number): number {
	return Math.min(Math.max(v, lo), hi);
}
