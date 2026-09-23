import { useEffect, useState } from 'react';

/**
 * Tracks which section heading is currently in view. Falls back to the first
 * heading when IntersectionObserver is unavailable (SSR, older engines, jsdom).
 */
export function useScrollspy(ids: string[], offset = 96): string {
    const [active, setActive] = useState(ids[0] ?? '');

    useEffect(() => {
        if (ids.length === 0) return undefined;

        const elements = ids
            .map((id) => document.getElementById(id))
            .filter((el): el is HTMLElement => el !== null);

        if (elements.length === 0) return undefined;

        if (typeof IntersectionObserver === 'undefined') {
            const onScroll = () => {
                const y = window.scrollY + offset + 8;
                let current = elements[0].id;
                for (const el of elements) {
                    if (el.offsetTop <= y) current = el.id;
                }
                setActive(current);
            };

            const frame = window.requestAnimationFrame(onScroll);
            window.addEventListener('scroll', onScroll, { passive: true });
            return () => {
                window.cancelAnimationFrame(frame);
                window.removeEventListener('scroll', onScroll);
            };
        }

        const visible = new Map<string, number>();
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    visible.set(entry.target.id, entry.isIntersecting ? entry.boundingClientRect.top : NaN);
                }
                const candidates = [...visible.entries()]
                    .filter(([, top]) => !Number.isNaN(top))
                    .sort((a, b) => a[1] - b[1]);
                if (candidates.length > 0) setActive(candidates[0][0]);
            },
            { rootMargin: `-${offset}px 0px -70% 0px`, threshold: [0, 1] },
        );

        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [ids, offset]);

    return active;
}
