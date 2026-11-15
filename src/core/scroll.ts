import type { Drawing } from './draw';

export interface ScrollScrubOptions {
    /** Element whose position drives progress. Defaults to the drawing's SVG. */
    target?: Element;
    /** Viewport fraction (0 top, 1 bottom) where the target's top gives progress 0. Defaults to 0.9. */
    start?: number;
    /** Viewport fraction where the target's top gives progress 1. Defaults to 0.3. */
    end?: number;
}

/**
 * Ties a drawing's progress to scroll position. Returns a cleanup function.
 *
 * @example
 * const stop = scrollScrub(draw('#chart', { autoplay: false }));
 */
export function scrollScrub(drawing: Drawing, opts: ScrollScrubOptions = {}): () => void {
    const target = opts.target ?? drawing.el;
    const start = opts.start ?? 0.9;
    const end = opts.end ?? 0.3;
    let frame = 0;

    const update = () => {
        frame = 0;
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const top = target.getBoundingClientRect().top;
        const span = (start - end) * vh || 1;
        drawing.seek((start * vh - top) / span);
    };
    const schedule = () => {
        if (!frame) frame = requestAnimationFrame(update);
    };

    drawing.pause();
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
        if (frame) cancelAnimationFrame(frame);
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
    };
}

export interface InViewOptions {
    /** Share of the element that must be visible, 0 to 1. Defaults to 0.3. */
    threshold?: number;
    /** Stop observing after the first hit. Defaults to true. */
    once?: boolean;
    /** Also called when the element leaves the viewport. */
    onLeave?: () => void;
    rootMargin?: string;
}

/**
 * Calls `onEnter` when `el` scrolls into view. Returns a cleanup function.
 * Falls back to calling immediately where `IntersectionObserver` is missing.
 *
 * @example
 * const drawing = draw('#logo', { autoplay: false });
 * inView(drawing.el, () => drawing.play());
 */
export function inView(el: Element, onEnter: () => void, opts: InViewOptions = {}): () => void {
    if (typeof IntersectionObserver === 'undefined') {
        onEnter();
        return () => { };
    }
    const once = opts.once ?? true;
    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    onEnter();
                    if (once) observer.disconnect();
                } else {
                    opts.onLeave?.();
                }
            }
        },
        { threshold: opts.threshold ?? 0.3, rootMargin: opts.rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
}
