/**
 * Tiny className joiner. shadcn projects usually pull in clsx + tailwind-merge;
 * this keeps the experiment dependency-light while honoring the convention.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Left-pad a number to a fixed width of zeros (e.g. 7 -> "007"). */
export function pad(value: number, width: number): string {
  return String(Math.max(0, Math.floor(value))).padStart(width, "0");
}
