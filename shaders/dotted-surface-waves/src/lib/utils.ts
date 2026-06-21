import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Standard shadcn/ui class-name helper: merge conditional class lists and
 * de-duplicate conflicting Tailwind utilities.
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
