import { clamp01, resolveEasing, type Easing } from './engine/easing';
import { Journal } from './engine/journal';
import { applySketchy, collect, resolveUses, type Scene, type SketchyOptions, type StrokeItem } from './engine/prepare';
import { computeTimeline, type DrawType, type Segment } from './engine/timeline';
import { DEFAULT_STROKE } from './paint';
import { InvalidSvgError } from './parseSvg';
import { warn } from './warn';

export type { DrawType } from './engine/timeline';
export type { SketchyOptions } from './engine/prepare';
export type { Easing, EasingFn, EasingName } from './engine/easing';

/** How fills fade in: all together near the end, each behind its own stroke, or never hidden. */
export type RevealMode = 'end' | 'stroke' | 'none';
/** How labels appear: fade in, type out letter by letter, or stay untouched. */
export type TextMode = 'fade' | 'type' | 'none';

export interface PenOptions {
    /** Radius of the default nib, in SVG user units. Defaults to 3. */
    radius?: number;
    /** Nib colour. Defaults to the outline stroke colour. */
    color?: string;
    /** Bring your own nib (any SVG element, drawn around 0,0). */
    element?: SVGElement;
}

export interface DrawOptions {
    /** Total length in milliseconds. Defaults to 2000. Ignored by `type: 'speed'`. */
    duration?: number;
    /** Stroke ordering. Defaults to `'oneByOne'`. */
    type?: DrawType;
    /** Gap between stroke starts in ms for `type: 'stagger'`. Defaults to 80. */
    stagger?: number;
    /** Constant pen speed in user units per second for `type: 'speed'`. Defaults to 400. */
    speed?: number;
    /** Wait this many ms before drawing starts. */
    delay?: number;
    /** Easing over the whole timeline. Defaults to `'easeOutCubic'`. */
    ease?: Easing;
    /** Easing inside each stroke. Defaults to `'linear'`. */
    strokeEase?: Easing;
    /** Outline colour given to fill-only shapes. */
    stroke?: string;
    /** Outline width given to fill-only shapes without one. */
    strokeWidth?: string | number;
    /** Give fill-only shapes an outline to draw. Defaults to true. */
    outline?: boolean;
    /** Fill reveal strategy. Defaults to `'end'`. */
    reveal?: RevealMode;
    /** For `reveal: 'end'`: progress at which fills start fading in, 0 to 1. Defaults to 0.6. */
    revealStart?: number;
    /** Label reveal strategy. Defaults to `'fade'`. */
    text?: TextMode;
    /** `true` loops forever, a number repeats that many extra times. */
    loop?: boolean | number;
    /** Undraw on alternate loops instead of snapping back. */
    yoyo?: boolean;
    /** Speed multiplier. Defaults to 1. */
    playbackRate?: number;
    /** Start drawing immediately. Defaults to true. */
    autoplay?: boolean;
    /** `'respect'` jumps to the finished frame when the user prefers reduced motion. Defaults to `'respect'`. */
    reducedMotion?: 'respect' | 'ignore';
    /** Show a nib riding the tip of the stroke being drawn. */
    pen?: boolean | PenOptions;
    /** Redraw shapes with a hand-drawn wobble. */
    sketchy?: boolean | SketchyOptions;
    onStart?: () => void;
    onProgress?: (progress: number) => void;
    onComplete?: () => void;
}

export type DrawEvent = 'start' | 'progress' | 'pause' | 'complete';

export interface DrawStats {
    strokes: number;
    fills: number;
    texts: number;
    resolvedUses: number;
}

export interface Drawing {
    /** The animated SVG element. */
    readonly el: SVGSVGElement;
    /** Timeline length in ms at playback rate 1. */
    readonly duration: number;
    /** Current position, 0 to 1. Assigning seeks. */
    progress: number;
    readonly playing: boolean;
    /** Speed multiplier; can change mid-play. */
    playbackRate: number;
    readonly stats: DrawStats;
    /** Draw forward from the current position. Resolves true when finished, false if interrupted. */
    play(): Promise<boolean>;
    /** Undraw back to the start. */
    reverse(): Promise<boolean>;
    /** Rewind to 0 and play. */
    restart(): Promise<boolean>;
    pause(): void;
    /** Continue in the current direction. */
    resume(): Promise<boolean>;
    /** Jump to a progress 0 to 1 without changing play state. */
    seek(fraction: number): void;
    /** Jump to a time in ms. */
    seekTime(ms: number): void;
    /** Alias of `seek`, handy to pass to `recordDrawToWebM`. */
    setProgress(fraction: number): void;
    /** Pause and rewind to the blank state. */
    reset(): void;
    on(event: DrawEvent, handler: (progress: number) => void): () => void;
    /** Stop and restore the SVG exactly as it was before `draw()`. */
    destroy(): void;
}

function resolveTarget(target: SVGSVGElement | Element | string): SVGSVGElement {
    if (typeof document === 'undefined') throw new InvalidSvgError('draw() requires a browser document.');
    let el: Element | null = null;
    if (typeof target === 'string') {
        if (target.trim().startsWith('<')) {
            throw new InvalidSvgError('draw() takes an element or selector. Use mount(container, markup) for markup.');
        }
        el = document.querySelector(target);
    } else {
        el = target;
    }
    if (el && el.tagName.toLowerCase() !== 'svg') el = el.querySelector('svg');
    if (!el) throw new InvalidSvgError(`No <svg> found for ${typeof target === 'string' ? `"${target}"` : 'target'}.`);
    return el as SVGSVGElement;
}

function prefersReducedMotion(): boolean {
    return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function localMatrix(svg: SVGSVGElement, el: SVGGraphicsElement): DOMMatrix | SVGMatrix | null {
    const root = svg.getScreenCTM();
    const own = el.getScreenCTM();
    if (!root || !own) return null;
    return root.inverse().multiply(own);
}

/** Internal: prepared scene plus a pure `render(progress)`; shared by `draw` and exporters. */
export interface Prepared {
    svg: SVGSVGElement;
    journal: Journal;
    scene: Scene;
    segments: Segment[];
    totalMs: number;
    resolvedUses: number;
}

export function prepare(svg: SVGSVGElement, opts: DrawOptions): Prepared {
    const journal = new Journal();
    const resolvedUses = resolveUses(svg, journal);
    if (opts.sketchy) applySketchy(svg, journal, opts.sketchy === true ? {} : opts.sketchy);
    const scene = collect(svg, journal, { stroke: opts.stroke, strokeWidth: opts.strokeWidth, outline: opts.outline });
    if (!scene.strokes.length) {
        warn('No drawable shapes found. Check that the SVG is in the DOM and not inside <defs>.', svg);
    }
    const { segments, totalMs } = computeTimeline(scene.strokes, {
        type: opts.type,
        duration: opts.duration ?? 2000,
        stagger: opts.stagger,
        speed: opts.speed,
    });
    return { svg, journal, scene, segments, totalMs, resolvedUses };
}

/**
 * Makes an inline `<svg>` draw itself: strokes animate on, then fills and
 * labels fade in. Accepts the element, a wrapper containing one, or a selector.
 *
 * @example
 * const drawing = draw('#logo', { duration: 1800, type: 'stagger' });
 * await drawing.play();
 */
export function draw(target: SVGSVGElement | Element | string, options: DrawOptions = {}): Drawing {
    const svg = resolveTarget(target);
    const prep = prepare(svg, options);
    const { journal, scene, segments } = prep;
    const { strokes, fills, texts, textNodes } = scene;

    const ease = resolveEasing(options.ease, 'easeOutCubic');
    const strokeEase = resolveEasing(options.strokeEase, 'linear');
    const revealMode = options.reveal ?? 'end';
    const textMode = options.text ?? 'fade';
    const revealStart = Math.min(0.999, Math.max(0, options.revealStart ?? 0.6));
    const totalChars = textNodes.reduce((sum, t) => sum + t.value.length, 0);

    const listeners: Record<DrawEvent, Set<(p: number) => void>> = {
        start: new Set(),
        progress: new Set(),
        pause: new Set(),
        complete: new Set(),
    };
    const emit = (event: DrawEvent, p: number) => {
        listeners[event].forEach((fn) => fn(p));
        if (event === 'start') options.onStart?.();
        else if (event === 'progress') options.onProgress?.(p);
        else if (event === 'complete') options.onComplete?.();
    };

    let pen: SVGElement | null = null;
    if (options.pen) {
        const penOpts: PenOptions = options.pen === true ? {} : options.pen;
        pen = penOpts.element ?? document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        if (!penOpts.element) {
            pen.setAttribute('r', String(penOpts.radius ?? 3));
            pen.setAttribute('fill', penOpts.color ?? options.stroke ?? DEFAULT_STROKE);
        }
        pen.setAttribute('pointer-events', 'none');
        pen.setAttribute('data-draw-skip', '');
        if (pen.parentNode !== svg) journal.insert(svg, pen);
        journal.setStyle(pen, 'display', 'none');
    }

    const locals = new Float64Array(strokes.length);
    let progress = 0;

    function renderStroke(s: StrokeItem, local: number) {
        const eased = strokeEase(local);
        if (s.mode === 'dash') {
            const gap = s.dash * 1.01 + 0.001;
            journal.setStyle(s.el, 'stroke-dasharray', `${gap} ${gap}`);
            journal.setStyle(s.el, 'stroke-dashoffset', String(gap - eased * s.dash));
            journal.setStyle(s.el, 'stroke-opacity', local > 0 ? String(s.strokeOpacity) : '0');
        } else if (s.mode === 'fade') {
            journal.setStyle(s.el, 'stroke-opacity', String(s.strokeOpacity * eased));
        } else {
            journal.setStyle(s.el, 'stroke-opacity', local > 0 ? String(s.strokeOpacity) : '0');
        }
    }

    function renderPen() {
        if (!pen) return;
        let active = -1;
        for (let i = 0; i < strokes.length; i++) {
            if (locals[i] > 0 && locals[i] < 1 && strokes[i].mode === 'dash') active = i;
        }
        if (active < 0) {
            journal.setStyle(pen, 'display', 'none');
            return;
        }
        const s = strokes[active];
        const point = s.el.getPointAtLength(s.length * strokeEase(locals[active]));
        const m = localMatrix(svg, s.el);
        const x = m ? m.a * point.x + m.c * point.y + m.e : point.x;
        const y = m ? m.b * point.x + m.d * point.y + m.f : point.y;
        journal.setStyle(pen, 'display', '');
        journal.setAttr(pen, 'transform', `translate(${x} ${y})`);
    }

    function render(fraction: number) {
        progress = clamp01(fraction);
        const e = ease(progress);

        for (let i = 0; i < strokes.length; i++) {
            const { start, end } = segments[i];
            const local = end > start ? clamp01((e - start) / (end - start)) : e >= start ? 1 : 0;
            locals[i] = local;
            renderStroke(strokes[i], local);
        }

        const endAmount = clamp01((progress - revealStart) / (1 - revealStart));
        if (revealMode !== 'none') {
            for (const f of fills) {
                const amount =
                    revealMode === 'stroke' && f.stroke >= 0 ? clamp01((locals[f.stroke] - 0.6) / 0.4) : endAmount;
                journal.setStyle(f.el, 'fill-opacity', String(f.opacity * amount));
            }
        }

        if (textMode === 'fade') {
            for (const t of texts) journal.setStyle(t.el, 'opacity', String(t.opacity * endAmount));
        } else if (textMode === 'type') {
            for (const t of texts) {
                if (t.el.tagName.toLowerCase() !== 'text') {
                    journal.setStyle(t.el, 'opacity', String(t.opacity * endAmount));
                }
            }
            let budget = Math.round(totalChars * endAmount);
            for (const t of textNodes) {
                const take = Math.min(budget, t.value.length);
                journal.setText(t.node, t.value.slice(0, take));
                budget -= take;
            }
        }

        renderPen();
        emit('progress', progress);
    }

    const reduced = options.reducedMotion !== 'ignore' && prefersReducedMotion();
    const iterations = options.loop === true ? Infinity : 1 + Math.max(0, Number(options.loop) || 0);
    let rate = options.playbackRate ?? 1;
    let raf = 0;
    let playing = false;
    let destroyed = false;
    let direction = 1;
    let lastTs = 0;
    let delayLeft = 0;
    let iteration = 0;
    let settle: ((finished: boolean) => void) | null = null;

    function halt() {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        playing = false;
        lastTs = 0;
    }

    function finish(done: boolean) {
        const resolve = settle;
        settle = null;
        resolve?.(done);
    }

    function tick(ts: number) {
        const dt = lastTs ? ts - lastTs : 0;
        lastTs = ts;
        if (delayLeft > 0) {
            delayLeft -= dt;
            raf = requestAnimationFrame(tick);
            return;
        }
        const next = progress + (direction * dt * rate) / prep.totalMs;
        if ((direction > 0 && next >= 1) || (direction < 0 && next <= 0)) {
            iteration++;
            if (iteration < iterations) {
                if (options.yoyo) {
                    render(direction > 0 ? 1 : 0);
                    direction = -direction;
                } else {
                    render(direction > 0 ? 0 : 1);
                }
                raf = requestAnimationFrame(tick);
                return;
            }
            render(direction > 0 ? 1 : 0);
            halt();
            emit('complete', progress);
            finish(true);
            return;
        }
        render(next);
        raf = requestAnimationFrame(tick);
    }

    function run(dir: number, fromStart: boolean): Promise<boolean> {
        if (destroyed) return Promise.resolve(false);
        finish(false);
        halt();
        direction = dir;
        if (reduced) {
            render(dir > 0 ? 1 : 0);
            emit('complete', progress);
            return Promise.resolve(true);
        }
        if (fromStart) {
            iteration = 0;
            delayLeft = dir > 0 ? options.delay ?? 0 : 0;
            emit('start', progress);
        }
        playing = true;
        const done = new Promise<boolean>((resolve) => (settle = resolve));
        raf = requestAnimationFrame(tick);
        return done;
    }

    const drawing: Drawing = {
        el: svg,
        get duration() {
            return prep.totalMs;
        },
        get progress() {
            return progress;
        },
        set progress(value: number) {
            render(value);
        },
        get playing() {
            return playing;
        },
        get playbackRate() {
            return rate;
        },
        set playbackRate(value: number) {
            rate = Math.max(0.01, value);
        },
        stats: {
            strokes: strokes.length,
            fills: fills.length,
            texts: texts.length,
            resolvedUses: prep.resolvedUses,
        },
        play() {
            if (progress >= 1) render(0);
            return run(1, progress === 0);
        },
        reverse() {
            if (progress <= 0) render(1);
            return run(-1, progress === 1);
        },
        restart() {
            render(0);
            return run(1, true);
        },
        pause() {
            if (!playing) return;
            halt();
            emit('pause', progress);
        },
        resume() {
            return playing ? Promise.resolve(false) : run(direction, false);
        },
        seek(fraction: number) {
            render(fraction);
        },
        seekTime(ms: number) {
            render(ms / prep.totalMs);
        },
        setProgress(fraction: number) {
            render(fraction);
        },
        reset() {
            halt();
            finish(false);
            render(0);
        },
        on(event, handler) {
            listeners[event].add(handler);
            return () => listeners[event].delete(handler);
        },
        destroy() {
            if (destroyed) return;
            destroyed = true;
            halt();
            finish(false);
            journal.restore();
            (Object.keys(listeners) as DrawEvent[]).forEach((k) => listeners[k].clear());
        },
    };

    render(0);
    if (options.autoplay !== false) void drawing.play();
    return drawing;
}
