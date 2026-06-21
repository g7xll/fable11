import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Canonical shadcn `cn()` — merges conditional class lists and resolves
 * conflicting Tailwind utilities (last one wins). Used across the studio
 * chrome that frames the integrated résumé component.
 */
export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}
