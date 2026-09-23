import { useEffect, useState } from 'react';

/**
 * Delays a fast-changing value. The playground edits SVG markup character by
 * character, and re-parsing + re-drawing on every keystroke is wasteful.
 */
export function useDebouncedValue<T>(value: T, delayMs = 260): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebounced(value), delayMs);
        return () => window.clearTimeout(timer);
    }, [value, delayMs]);

    return debounced;
}
