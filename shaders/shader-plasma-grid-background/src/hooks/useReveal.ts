import { useEffect, useRef, useState } from "react";

/**
 * Reveal-on-scroll. Returns a ref to attach and a boolean that flips true once
 * the element scrolls into view. Honors prefers-reduced-motion by starting shown.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
	threshold = 0.18,
) {
	const ref = useRef<T | null>(null);
	const prefersReduced =
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const [shown, setShown] = useState(prefersReduced);

	useEffect(() => {
		if (prefersReduced) return;
		const el = ref.current;
		if (!el) return;
		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setShown(true);
						io.disconnect();
					}
				}
			},
			{ threshold },
		);
		io.observe(el);
		return () => io.disconnect();
	}, [threshold, prefersReduced]);

	return { ref, shown };
}
