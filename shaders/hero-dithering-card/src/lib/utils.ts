import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Canonical shadcn `cn()` — merges conditional class lists and resolves
 * conflicting Tailwind utilities (last one wins). Used across the press-room
 * chrome that frames the proofed component.
 */
export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}
