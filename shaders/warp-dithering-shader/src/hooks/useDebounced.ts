import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of `value`. The verbatim <DitheringShader /> rebuilds
 * its GL program whenever any prop changes, so we debounce the live param object
 * before handing it to the shader — slider drags stay smooth instead of
 * triggering a recompile storm, while the UI itself reads the instant value.
 */
export function useDebounced<T>(value: T, delay = 90): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
