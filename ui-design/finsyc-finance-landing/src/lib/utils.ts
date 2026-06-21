/**
 * cn — conditional className joiner used across the Finsyc components.
 * Accepts strings, undefined, null, false (e.g. `cond && "class"`) and joins
 * the truthy values with a single space. Kept dependency-free so the project
 * only relies on framer-motion + lucide-react as the prompt specifies.
 */
export type ClassValue = string | number | null | undefined | false;

export function cn(...inputs: ClassValue[]): string {
	return inputs.filter(Boolean).join(" ");
}
