import Vivus from 'vivus';
import {
    DEFAULT_STROKE,
    DEFAULT_STROKE_WIDTH,
    SHAPE_SELECTOR,
    TEXT_SELECTOR,
    isPaint,
} from './paint';

/**
 * The draw-on engine. Takes an inline `<svg>`, strips its fills/labels so Vivus
 * can animate the strokes on, and reveals them at the end — the lines literally
 * draw themselves, then the diagram fills in.
 *
 * This mutates the passed SVG in place (Vivus converts shapes to paths), so pass
 * a clone if you need the original markup preserved.
 */

export type DrawType = 'delayed' | 'sync' | 'oneByOne';

export interface DrawingOptions {
    /** Vivus animation length in frames. Higher is slower. */
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
    /** Fade duration in milliseconds for `hide` and `reveal`. */
    revealMs?: number;
}

export interface Drawing {
    /** The animated SVG element (post Vivus pathformer). */
    readonly el: SVGSVGElement;
    /** Blank the fills/labels so only strokes will draw. */
    hide(): void;
    /** Restore fills/labels with a soft fade. */
    reveal(): void;
    /** Jump to an arbitrary progress 0 to 1 (for frame-accurate recording). */
    setProgress(fraction: number): void;
    /** Play the draw-on animation; `onDone` fires when complete. */
    play(onDone?: () => void): void;
    stop(): void;
    /** Rewind to the blank, undrawn state. Call before replaying. */
    reset(): void;
    destroy(): void;
}

export function createDrawing(svg: SVGSVGElement, opts: DrawingOptions = {}): Drawing {
    const strokeColor = opts.stroke ?? DEFAULT_STROKE;
    const strokeWidth = String(opts.strokeWidth ?? DEFAULT_STROKE_WIDTH);
    const revealStart = Math.min(0.999, Math.max(0, opts.revealStart ?? 0.6));
    const revealMs = opts.revealMs ?? 500;
    const fade = `${revealMs}ms ease`;

    // Give fill-only shapes a stroke so Vivus has an outline to draw.
    svg.querySelectorAll(SHAPE_SELECTOR).forEach((el) => {
        const stroke = el.getAttribute('stroke') || getComputedStyle(el).stroke;
        const fill = el.getAttribute('fill') || getComputedStyle(el).fill;
        if (!isPaint(stroke) && isPaint(fill)) {
            el.setAttribute('stroke', strokeColor);
            if (!el.getAttribute('stroke-width')) el.setAttribute('stroke-width', strokeWidth);
        }
    });

    const vivus = new Vivus(svg as unknown as HTMLElement, {
        type: opts.type ?? 'oneByOne',
        duration: opts.duration ?? 220,
        start: 'manual',
        animTimingFunction: Vivus.EASE_OUT,
    });

    const el = vivus.el as unknown as SVGSVGElement;

    const shapes = Array.from(el.querySelectorAll(SHAPE_SELECTOR)).filter((node) => {
        const fill = node.getAttribute('fill') || getComputedStyle(node).fill;
        if (!isPaint(fill)) return false;
        (node as SVGElement).dataset.origFillOpacity = node.getAttribute('fill-opacity') || '1';
        return true;
    });
    const texts = Array.from(el.querySelectorAll(TEXT_SELECTOR)) as HTMLElement[];

    function hide() {
        shapes.forEach((node) => {
            (node as SVGElement).style.transition = '';
            node.setAttribute('fill-opacity', '0');
        });
        texts.forEach((node) => {
            node.style.transition = '';
            node.style.opacity = '0';
        });
    }

    function reveal() {
        shapes.forEach((node) => {
            (node as SVGElement).style.transition = `fill-opacity ${fade}`;
            node.setAttribute('fill-opacity', (node as SVGElement).dataset.origFillOpacity || '1');
        });
        texts.forEach((node) => {
            node.style.transition = `opacity ${fade}`;
            node.style.opacity = '1';
        });
    }

    function setProgress(fraction: number) {
        vivus.setFrameProgress(fraction);
        const amount = Math.min(1, Math.max(0, (fraction - revealStart) / (1 - revealStart)));
        shapes.forEach((node) => {
            const target = Number((node as SVGElement).dataset.origFillOpacity || '1') * amount;
            node.setAttribute('fill-opacity', String(target));
        });
        texts.forEach((node) => {
            node.style.opacity = String(amount);
        });
    }

    function play(onDone?: () => void) {
        hide();
        vivus.play(1, () => {
            reveal();
            onDone?.();
        });
    }

    function stop() {
        vivus.stop();
    }

    function reset() {
        vivus.reset();
    }

    function destroy() {
        try {
            vivus.destroy();
        } catch {
            /* noop */
        }
    }

    return { el, hide, reveal, setProgress, play, stop, reset, destroy };
}
