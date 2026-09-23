import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    canRecordVideo,
    computeDims,
    createDrawing,
    parseSvg,
    recordDrawToWebM,
} from '@penwell/draw-on/core';
import type { Drawing, DrawingOptions, RecordOptions } from '@penwell/draw-on/core';

export type LiveStatus = 'idle' | 'drawing' | 'done' | 'error';

export interface LiveDrawingState {
    /** Serialized `<svg>…</svg>` markup to animate. */
    svgMarkup: string;
    /** Engine options. Changing them rebuilds the drawing (unlike `useSketchDraw`). */
    options?: DrawingOptions;
    /** Draw immediately on mount. Defaults to true. */
    autoPlay?: boolean;
    /** Caps recorded video width, preserving aspect ratio. Defaults to 1280. */
    maxWidth?: number;
}

export interface LiveDrawingApi {
    drawing: Drawing | null;
    status: LiveStatus;
    error: string;
    progress: number;
    canRecord: boolean;
    play(): void;
    reset(): void;
    scrub(fraction: number): void;
    record(options?: Partial<RecordOptions>): Promise<Blob>;
}

export type LiveDrawingResult = [
    api: LiveDrawingApi,
    hostRef: React.RefObject<HTMLDivElement | null>,
];

/** Options are compared by value, so a fresh object with the same content is a no-op. */
function useStableOptions(options: DrawingOptions | undefined) {
    const key = useMemo(() => JSON.stringify(options ?? {}), [options]);
    // Parsed back from the key so the effect can depend on the string alone.
    const stable = useMemo<DrawingOptions>(() => JSON.parse(key) as DrawingOptions, [key]);
    return { key, stable };
}

/**
 * Site-side counterpart to `useSketchDraw`. It deliberately differs in one way:
 * editing the options rebuilds the drawing, which is what the option playground
 * and the API reference need. Everything else mirrors the real hook so the docs
 * show the same behaviour users get from the package.
 *
 * Returns `[api, hostRef]` — the ref stays separate so the API object is plain
 * data and functions.
 */
export function useLiveDrawing({
    svgMarkup,
    options,
    autoPlay = true,
    maxWidth = 1280,
}: LiveDrawingState): LiveDrawingResult {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const drawingRef = useRef<Drawing | null>(null);
    const [drawing, setDrawing] = useState<Drawing | null>(null);
    const [status, setStatus] = useState<LiveStatus>('idle');
    const [error, setError] = useState('');
    const { key: optionsKey, stable: stableOptions } = useStableOptions(options);

    // Progress belongs to one markup + option combination, so a rebuild reads as
    // 0 without the effect having to reset it.
    const renderKey = `${svgMarkup.length}:${optionsKey}:${String(autoPlay)}`;
    const [progressState, setProgressState] = useState({ key: '', value: 0 });
    const progress = progressState.key === renderKey ? progressState.value : 0;
    const setProgress = useCallback(
        (value: number) => setProgressState({ key: renderKey, value }),
        [renderKey],
    );

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return undefined;

        host.innerHTML = '';
        drawingRef.current = null;
        setDrawing(null);

        let created: Drawing;
        try {
            const svg = parseSvg(svgMarkup);
            svg.style.maxWidth = '100%';
            svg.style.height = 'auto';
            host.appendChild(svg);
            created = createDrawing(svg, stableOptions);
        } catch (err) {
            const failure = err instanceof Error ? err : new Error('This SVG cannot be animated.');
            // The engine is built synchronously, so a parse failure has to land in
            // the same commit — there is nothing to await.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setStatus('error');
            setError(failure.message);
            return undefined;
        }

        drawingRef.current = created;
        setDrawing(created);

        if (autoPlay) {
            created.play(() => {
                setStatus('done');
                setProgress(1);
            });
        } else {
            created.hide();
            created.setProgress(0);
        }

        return () => {
            created.destroy();
            drawingRef.current = null;
        };
    }, [svgMarkup, stableOptions, autoPlay, setProgress]);

    const play = useCallback(() => {
        const current = drawingRef.current;
        if (!current) return;
        setProgress(0);
        setStatus('drawing');
        current.stop();
        current.reset();
        current.play(() => {
            setStatus('done');
            setProgress(1);
        });
    }, [setProgress]);

    const reset = useCallback(() => {
        const current = drawingRef.current;
        if (!current) return;
        current.stop();
        current.reset();
        current.setProgress(0);
        setProgress(0);
        setStatus('idle');
    }, [setProgress]);

    const scrub = useCallback(
        (fraction: number) => {
            const current = drawingRef.current;
            if (!current) return;
            current.stop();
            const clamped = Math.min(1, Math.max(0, fraction));
            current.setProgress(clamped);
            setProgress(clamped);
        },
        [setProgress],
    );

    const record = useCallback(
        async (recordOptions: Partial<RecordOptions> = {}) => {
            const current = drawingRef.current;
            if (!current) throw new Error('Nothing to record yet.');

            const { width, height } = computeDims(current.el, maxWidth);
            const blob = await recordDrawToWebM(current.el, current.setProgress, {
                width,
                height,
                ...recordOptions,
            });

            current.reveal();
            setProgress(1);
            setStatus('done');
            return blob;
        },
        [maxWidth, setProgress],
    );

    const canRecord = useMemo(() => canRecordVideo(), []);

    const api: LiveDrawingApi = {
        drawing,
        status,
        error,
        progress,
        canRecord,
        play,
        reset,
        scrub,
        record,
    };

    return [api, hostRef];
}

