import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { draw, type DrawOptions, type Drawing } from '../core/draw';
import { loadSvg, parseSvg } from '../core/parseSvg';
import { inView } from '../core/scroll';

/** What starts the drawing. `manual` waits for `play()`; a numeric `progress` prop overrides all. */
export type DrawTrigger = 'auto' | 'inView' | 'hover' | 'click' | 'manual';
export type DrawOnStatus = 'idle' | 'loading' | 'ready' | 'drawing' | 'paused' | 'done' | 'error';

export interface UseDrawOnOptions extends Omit<DrawOptions, 'autoplay'> {
    /** SVG markup to mount. Omit to animate the `<svg>` already inside the ref element. */
    svg?: string;
    /** URL of an `.svg` file to fetch and mount. */
    src?: string;
    /** Defaults to `'auto'`. */
    trigger?: DrawTrigger;
    /** Controlled position 0 to 1 (scroll scrubbing, sliders). Disables `trigger`. */
    progress?: number;
    /** Change to force a rebuild, e.g. when JSX `<svg>` children change. */
    rebuildKey?: unknown;
    onReady?: (drawing: Drawing) => void;
    onError?: (error: Error) => void;
}

export interface DrawOnApi<T extends Element = HTMLDivElement> {
    /** Attach to the host element (or directly to an `<svg>`). */
    ref: RefObject<T>;
    /** The live engine; null until mounted. */
    drawing: Drawing | null;
    status: DrawOnStatus;
    error: Error | null;
    play: () => Promise<boolean>;
    restart: () => Promise<boolean>;
    reverse: () => Promise<boolean>;
    resume: () => Promise<boolean>;
    pause: () => void;
    seek: (fraction: number) => void;
}

type Callbacks = Pick<UseDrawOnOptions, 'onStart' | 'onProgress' | 'onComplete' | 'onReady' | 'onError'>;

const notReady = () => Promise.resolve(false);

/**
 * Draws an SVG inside a React element. Rebuilds when `svg`, `src`, any
 * primitive option or `rebuildKey` changes; callbacks never cause a rebuild.
 *
 * @example
 * const { ref, restart } = useDrawOn({ trigger: 'inView', type: 'stagger' });
 * return <div ref={ref}><Logo /></div>;
 */
export function useDrawOn<T extends Element = HTMLDivElement>(options: UseDrawOnOptions = {}): DrawOnApi<T> {
    const {
        svg,
        src,
        trigger = 'auto',
        progress,
        rebuildKey,
        onStart,
        onProgress,
        onComplete,
        onReady,
        onError,
        ...drawOptions
    } = options;

    const ref = useRef<T>(null);
    const drawingRef = useRef<Drawing | null>(null);
    const [drawing, setDrawing] = useState<Drawing | null>(null);
    const [status, setStatus] = useState<DrawOnStatus>('idle');
    const [error, setError] = useState<Error | null>(null);

    const callbacks = useRef<Callbacks>({});
    callbacks.current = { onStart, onProgress, onComplete, onReady, onError };
    const latest = useRef({ drawOptions, trigger, progress });
    latest.current = { drawOptions, trigger, progress };

    let optionsKey = '';
    try {
        optionsKey = JSON.stringify(drawOptions, (_k, v) => (typeof Element !== 'undefined' && v instanceof Element ? '[element]' : v));
    } catch {
        /* non-serializable options: rebuild only on svg/src/rebuildKey */
    }

    useEffect(() => {
        const host = ref.current;
        if (!host) return;
        let cancelled = false;
        let current: Drawing | null = null;
        const cleanups: Array<() => void> = [];
        const abort = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const ownsContent = svg != null || !!src;

        const fail = (err: unknown) => {
            if (cancelled) return;
            const e = err instanceof Error ? err : new Error('This SVG cannot be animated.');
            setError(e);
            setStatus('error');
            callbacks.current.onError?.(e);
        };

        const start = (el: SVGSVGElement) => {
            if (cancelled) return;
            const { drawOptions: opts, trigger: trig, progress: controlled } = latest.current;
            current = draw(el, {
                ...opts,
                autoplay: false,
                onStart: () => callbacks.current.onStart?.(),
                onProgress: (p) => callbacks.current.onProgress?.(p),
                onComplete: () => callbacks.current.onComplete?.(),
            });
            const d = current;
            cleanups.push(
                d.on('start', () => setStatus('drawing')),
                d.on('pause', () => setStatus('paused')),
                d.on('complete', () => setStatus('done')),
            );
            drawingRef.current = d;
            setDrawing(d);
            setError(null);
            setStatus('ready');
            callbacks.current.onReady?.(d);

            if (typeof controlled === 'number') {
                d.seek(controlled);
                return;
            }
            const restart = () => {
                setStatus('drawing');
                void d.restart();
            };
            if (trig === 'auto') {
                setStatus('drawing');
                void d.play();
            } else if (trig === 'inView') {
                cleanups.push(inView(host, () => {
                    setStatus('drawing');
                    void d.play();
                }));
            } else if (trig === 'hover' || trig === 'click') {
                const type = trig === 'hover' ? 'mouseenter' : 'click';
                host.addEventListener(type, restart);
                cleanups.push(() => host.removeEventListener(type, restart));
            }
        };

        const mountInto = (el: SVGSVGElement) => {
            el.style.maxWidth = '100%';
            el.style.height = 'auto';
            host.replaceChildren(el);
            start(el);
        };

        try {
            if (svg != null) {
                mountInto(parseSvg(svg));
            } else if (src) {
                setStatus('loading');
                loadSvg(src, abort ? { signal: abort.signal } : undefined).then(
                    (el) => !cancelled && mountInto(el),
                    fail,
                );
            } else {
                const el = host instanceof SVGSVGElement ? host : host.querySelector('svg');
                if (!el) throw new Error('useDrawOn: no <svg> inside the ref element. Pass `svg` or `src`, or render one.');
                start(el);
            }
        } catch (err) {
            fail(err);
        }

        return () => {
            cancelled = true;
            abort?.abort();
            cleanups.forEach((fn) => fn());
            current?.destroy();
            if (ownsContent) host.replaceChildren();
            if (drawingRef.current === current) drawingRef.current = null;
            setDrawing(null);
        };
    }, [svg, src, trigger, optionsKey, rebuildKey]);

    useEffect(() => {
        if (typeof progress === 'number') drawing?.seek(progress);
    }, [progress, drawing]);

    const play = useCallback(() => drawingRef.current?.play() ?? notReady(), []);
    const restart = useCallback(() => drawingRef.current?.restart() ?? notReady(), []);
    const reverse = useCallback(() => drawingRef.current?.reverse() ?? notReady(), []);
    const resume = useCallback(() => drawingRef.current?.resume() ?? notReady(), []);
    const pause = useCallback(() => drawingRef.current?.pause(), []);
    const seek = useCallback((fraction: number) => drawingRef.current?.seek(fraction), []);

    return { ref, drawing, status, error, play, restart, reverse, resume, pause, seek };
}
