/**
 * Tiny className joiner. shadcn projects usually pull in clsx + tailwind-merge;
 * this keeps the experiment dependency-light while honoring the convention so
 * `@/lib/utils` exists where shadcn components expect it.
 */
export function cn(
	...classes: Array<string | false | null | undefined>
): string {
	return classes.filter(Boolean).join(" ");
}
