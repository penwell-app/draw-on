import type { StrokeItem } from './prepare';

export type DrawType = 'delayed' | 'sync' | 'oneByOne' | 'stagger' | 'speed';

export interface Segment {
    start: number;
    end: number;
}

export interface TimelineOptions {
    type?: DrawType;
    /** Total length in ms (ignored by `speed`). */
    duration: number;
    /** Gap between stroke starts in ms, for `stagger`. */
    stagger?: number;
    /** Pen speed in user units per second, for `speed`. */
    speed?: number;
}

export interface Timeline {
    segments: Segment[];
    totalMs: number;
}

/** Splits the 0..1 timeline into one start/end window per stroke. */
export function computeTimeline(strokes: StrokeItem[], opts: TimelineOptions): Timeline {
    const n = strokes.length;
    const duration = Math.max(1, opts.duration);
    if (n === 0) return { segments: [], totalMs: duration };

    const drawn = strokes.filter((s) => s.mode === 'dash');
    const average = drawn.length ? drawn.reduce((sum, s) => sum + s.length, 0) / drawn.length : 1;
    const weights = strokes.map((s) => (s.mode === 'dash' ? Math.max(s.length, 0.001) : average * 0.25));

    switch (opts.type ?? 'oneByOne') {
        case 'sync':
            return { segments: strokes.map(() => ({ start: 0, end: 1 })), totalMs: duration };

        case 'delayed': {
            if (n === 1) return { segments: [{ start: 0, end: 1 }], totalMs: duration };
            return {
                segments: strokes.map((_, i) => {
                    const start = (i / (n - 1)) * 0.5;
                    return { start, end: start + 0.5 };
                }),
                totalMs: duration,
            };
        }

        case 'stagger': {
            const gap = Math.max(0, opts.stagger ?? 80);
            const each = Math.max(duration - (n - 1) * gap, duration * 0.25);
            const total = (n - 1) * gap + each;
            return {
                segments: strokes.map((_, i) => ({ start: (i * gap) / total, end: (i * gap + each) / total })),
                totalMs: total,
            };
        }

        case 'speed': {
            const speed = Math.max(1, opts.speed ?? 400);
            const times = weights.map((w) => (w / speed) * 1000);
            const total = Math.max(1, times.reduce((a, b) => a + b, 0));
            let acc = 0;
            return {
                segments: times.map((t) => {
                    const start = acc / total;
                    acc += t;
                    return { start, end: acc / total };
                }),
                totalMs: total,
            };
        }

        default: {
            const total = weights.reduce((a, b) => a + b, 0);
            let acc = 0;
            return {
                segments: weights.map((w) => {
                    const start = acc / total;
                    acc += w;
                    return { start, end: acc / total };
                }),
                totalMs: duration,
            };
        }
    }
}
