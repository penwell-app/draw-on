export type EasingFn = (t: number) => number;
export type EasingName =
    | 'linear'
    | 'easeIn'
    | 'easeOut'
    | 'easeInOut'
    | 'easeOutCubic'
    | 'easeInOutCubic'
    | 'easeOutQuart'
    | 'easeOutBack';
export type Easing = EasingName | EasingFn;

export const easings: Record<EasingName, EasingFn> = {
    linear: (t) => t,
    easeIn: (t) => t * t,
    easeOut: (t) => 1 - (1 - t) * (1 - t),
    easeInOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
    easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    easeOutQuart: (t) => 1 - Math.pow(1 - t, 4),
    easeOutBack: (t) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
};

export function resolveEasing(easing: Easing | undefined, fallback: EasingName): EasingFn {
    if (typeof easing === 'function') return easing;
    return easings[easing ?? fallback] ?? easings[fallback];
}

/** Numerically inverts a monotonic easing: returns t where ease(t) ≈ y. */
export function invertEasing(ease: EasingFn, y: number): number {
    if (y <= 0) return 0;
    if (y >= 1) return 1;
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 32; i++) {
        const mid = (lo + hi) / 2;
        if (ease(mid) < y) lo = mid;
        else hi = mid;
    }
    return (lo + hi) / 2;
}

export const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
