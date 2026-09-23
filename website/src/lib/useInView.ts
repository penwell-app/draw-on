import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

/**
 * Reports whether an element has entered the viewport once. Used to start a
 * draw-on when a demo scrolls into view instead of all at once on load.
 */
export function useInView<T extends HTMLElement>(
    ref: RefObject<T | null>,
    rootMargin = '0px 0px -15% 0px',
): boolean {
    // Without IntersectionObserver everything counts as in view from the start.
    const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined');
    const seen = useRef(false);

    useEffect(() => {
        const element = ref.current;
        if (!element || seen.current) return undefined;

        if (typeof IntersectionObserver === 'undefined') {
            seen.current = true;
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        seen.current = true;
                        setInView(true);
                        observer.disconnect();
                    }
                }
            },
            { rootMargin },
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [ref, rootMargin]);

    return inView;
}
