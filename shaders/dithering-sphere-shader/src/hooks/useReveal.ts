import { useEffect, useRef, useState } from "react";

/**
 * Reveal-on-scroll: returns a ref + a boolean that flips true the first time the
 * element scrolls into view. Respects `prefers-reduced-motion` by revealing
 * immediately.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
	threshold = 0.18,
) {
	const ref = useRef<T>(null);
	const [shown, setShown] = useState(false);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;

		if (
			typeof window !== "undefined" &&
			window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
		) {
			setShown(true);
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setShown(true);
					observer.disconnect();
				}
			},
			{ threshold },
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, [threshold]);

	return { ref, shown };
}
