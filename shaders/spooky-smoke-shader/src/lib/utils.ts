import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * shadcn/ui's standard class-name helper: merges conditional class lists with
 * clsx and de-duplicates conflicting Tailwind utilities with tailwind-merge.
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
