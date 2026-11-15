import { draw, type Drawing as DrawOnDrawing } from './draw';
import type { DrawType } from './engine/timeline';

// v0 API kept for compatibility; `draw()` is the v1 entry point.

export type { DrawType } from './engine/timeline';

/** @deprecated Use `DrawOptions` with `draw()`, which takes milliseconds. */
export interface DrawingOptions {
    /** Animation length in 60 fps frames. Higher is slower. Defaults to 220. */
    duration?: number;
    /** Stroke ordering strategy. */
    type?: DrawType;
    /** Stroke colour given to fill-only shapes so they have an outline to draw. */
    stroke?: string;
    /** Stroke width given to fill-only shapes that have none. */
    strokeWidth?: string | number;
    /**
     * Progress at which fills and labels start fading in, 0 to 1. The default
     * of 0.6 means they appear over the final 40% of the draw.
     */
    revealStart?: number;
    /** Fade duration in milliseconds for `reveal`. */
    revealMs?: number;
}

/** @deprecated Use the `Drawing` returned by `draw()`. */
export interface Drawing {
    /** The animated SVG element. */
    readonly el: SVGSVGElement;
    /** Blank the drawing so only strokes will draw. */
    hide(): void;
    /** Ease to the finished drawing over `revealMs`. */
    reveal(): void;
    /** Jump to an arbitrary progress 0 to 1 (for frame-accurate recording). */
    setProgress(fraction: number): void;
    /** Play the draw-on animation; `onDone` fires when complete. */
    play(onDone?: () => void): void;
    stop(): void;
    /** Rewind to the blank, undrawn state. Call before replaying. */
    reset(): void;
    destroy(): void;
    /** The v1 engine behind this drawing. */
    readonly drawing: DrawOnDrawing;
}

const FRAME_MS = 1000 / 60;

/** @deprecated Use `draw(svg, options)`. */
export function createDrawing(svg: SVGSVGElement, opts: DrawingOptions = {}): Drawing {
    const drawing = draw(svg, {
        duration: (opts.duration ?? 220) * FRAME_MS,
        type: opts.type ?? 'oneByOne',
        stroke: opts.stroke,
        strokeWidth: opts.strokeWidth,
        revealStart: opts.revealStart,
        ease: 'easeOutCubic',
        autoplay: false,
        reducedMotion: 'ignore',
    });
    const revealMs = opts.revealMs ?? 500;
    let fade = 0;

    function cancelFade() {
        if (fade) cancelAnimationFrame(fade);
        fade = 0;
    }

    return {
        el: drawing.el,
        drawing,
        hide() {
            cancelFade();
            drawing.reset();
        },
        reveal() {
            cancelFade();
            const from = drawing.progress;
            if (from >= 1 || revealMs <= 0) {
                drawing.seek(1);
                return;
            }
            const t0 = performance.now();
            const step = (now: number) => {
                const k = Math.min(1, (now - t0) / revealMs);
                drawing.seek(from + (1 - from) * k);
                fade = k < 1 ? requestAnimationFrame(step) : 0;
            };
            fade = requestAnimationFrame(step);
        },
        setProgress(fraction) {
            cancelFade();
            drawing.seek(fraction);
        },
        play(onDone) {
            cancelFade();
            void drawing.play().then((finished) => {
                if (finished) onDone?.();
            });
        },
        stop() {
            drawing.pause();
        },
        reset() {
            cancelFade();
            drawing.reset();
        },
        destroy() {
            cancelFade();
            drawing.destroy();
        },
    };
}
