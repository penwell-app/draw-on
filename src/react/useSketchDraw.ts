import { useCallback, useEffect, useRef, useState } from 'react';
import { createDrawing, type Drawing, type DrawingOptions } from '../core/createDrawing';
import { computeDims, parseSvg, type Dimensions } from '../core/parseSvg';
import { canRecordVideo, recordDrawToWebM, type RecordOptions } from '../core/record';

export type SketchStatus = 'idle' | 'drawing' | 'done' | 'error';

export interface UseSketchDrawOptions extends DrawingOptions {
    /** Serialized `<svg>…</svg>` markup to animate (e.g. from a Mermaid render). */
    svgMarkup: string;
    /** Draw immediately once the SVG is mounted. Defaults to true. */
    autoPlay?: boolean;
    /** Caps the reported video width, preserving aspect ratio. Defaults to 1280. */
    maxWidth?: number;
    onDone?: () => void;
    onError?: (error: Error) => void;
}

export interface SketchDrawApi {
    /** Attach to the element that should host the animated SVG. */
    containerRef: React.RefObject<HTMLDivElement>;
    status: SketchStatus;
    error: string;
    /** Intrinsic size of the parsed SVG, capped by `maxWidth`. */
    dimensions: Dimensions;
    /** Rewind and draw again. */
    play: () => void;
    /** Jump to an arbitrary progress 0 to 1. */
    setProgress: (fraction: number) => void;
    /** True when this browser supports WebM capture. */
    canRecord: boolean;
    /** Record the draw-on to a WebM blob. Rejects if unsupported or not ready. */
    exportWebM: (opts?: Partial<RecordOptions>) => Promise<Blob>;
    /** Escape hatch to the underlying engine. Null until the SVG is mounted. */
    drawing: Drawing | null;
}

const FALLBACK_DIMS: Dimensions = { width: 960, height: 600 };

/**
 * Mounts `svgMarkup` into a container and animates its strokes on, then fades
 * the fills and labels in. Rebuilds whenever the markup changes.
 */
export function useSketchDraw(options: UseSketchDrawOptions): SketchDrawApi {
    const {
        svgMarkup,
        autoPlay = true,
        maxWidth = 1280,
        onDone,
        onError,
        ...drawOptions
    } = options;

    const containerRef = useRef<HTMLDivElement | null>(null);
    const drawingRef = useRef<Drawing | null>(null);
    const [status, setStatus] = useState<SketchStatus>('idle');
    const [error, setError] = useState('');
    const [dimensions, setDimensions] = useState<Dimensions>(FALLBACK_DIMS);

    // Kept in refs so changing callbacks or tuning never rebuilds the SVG.
    const drawOptionsRef = useRef(drawOptions);
    drawOptionsRef.current = drawOptions;
    const onDoneRef = useRef(onDone);
    onDoneRef.current = onDone;
    const onErrorRef = useRef(onError);
    onErrorRef.current = onError;
    const autoPlayRef = useRef(autoPlay);
    autoPlayRef.current = autoPlay;
    const maxWidthRef = useRef(maxWidth);
    maxWidthRef.current = maxWidth;

    useEffect(() => {
        const host = containerRef.current;
        if (!host) return;

        host.innerHTML = '';
        setError('');
        setStatus('drawing');

        let drawing: Drawing;
        try {
            const svg = parseSvg(svgMarkup);
            svg.style.maxWidth = '100%';
            svg.style.height = 'auto';
            host.appendChild(svg);
            setDimensions(computeDims(svg, maxWidthRef.current));
            drawing = createDrawing(svg, drawOptionsRef.current);
        } catch (err) {
            const e = err instanceof Error ? err : new Error('This diagram cannot be animated.');
            setStatus('error');
            setError(e.message);
            onErrorRef.current?.(e);
            return;
        }

        drawingRef.current = drawing;

        if (autoPlayRef.current) {
            drawing.play(() => {
                setStatus('done');
                onDoneRef.current?.();
            });
        } else {
            drawing.hide();
        }

        return () => {
            drawing.destroy();
            drawingRef.current = null;
        };
    }, [svgMarkup]);

    const play = useCallback(() => {
        const drawing = drawingRef.current;
        if (!drawing) return;
        setStatus('drawing');
        drawing.stop();
        drawing.reset();
        drawing.play(() => {
            setStatus('done');
            onDoneRef.current?.();
        });
    }, []);

    const setProgress = useCallback((fraction: number) => {
        drawingRef.current?.setProgress(fraction);
    }, []);

    const exportWebM = useCallback(
        async (opts: Partial<RecordOptions> = {}) => {
            const drawing = drawingRef.current;
            if (!drawing) throw new Error('Nothing to record yet.');
            const { width, height } = computeDims(drawing.el, maxWidthRef.current);
            const blob = await recordDrawToWebM(drawing.el, drawing.setProgress, {
                width,
                height,
                ...opts,
            });
            drawing.reveal();
            return blob;
        },
        [],
    );

    return {
        containerRef,
        status,
        error,
        dimensions,
        play,
        setProgress,
        canRecord: canRecordVideo(),
        exportWebM,
        drawing: drawingRef.current,
    };
}
