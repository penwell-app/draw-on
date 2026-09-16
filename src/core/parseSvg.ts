/** Thrown when markup contains no usable `<svg>` root. */
export class InvalidSvgError extends Error {
    constructor(message = 'No SVG to animate.') {
        super(message);
        this.name = 'InvalidSvgError';
    }
}

/**
 * Parse serialized `<svg>…</svg>` markup into an element owned by the current
 * document, ready to append and animate.
 */
export function parseSvg(markup: string): SVGSVGElement {
    if (typeof document === 'undefined') {
        throw new InvalidSvgError('parseSvg requires a browser document.');
    }
    let found: SVGSVGElement | null = null;
    try {
        const doc = new DOMParser().parseFromString(markup, 'image/svg+xml');
        found = doc.querySelector('svg');
    } catch {
        throw new InvalidSvgError();
    }
    if (!found) throw new InvalidSvgError();
    return document.importNode(found, true) as SVGSVGElement;
}

export interface Dimensions {
    width: number;
    height: number;
}

/**
 * Intrinsic pixel size of an SVG, preferring its viewBox and capped at
 * `maxWidth` with the aspect ratio preserved. Used to size video output.
 */
export function computeDims(svg: SVGSVGElement, maxWidth = 1280): Dimensions {
    const vb = svg.viewBox?.baseVal;
    let w = (vb && vb.width) || svg.clientWidth || 960;
    let h = (vb && vb.height) || svg.clientHeight || 600;
    if (w > maxWidth) {
        h = h * (maxWidth / w);
        w = maxWidth;
    }
    return { width: Math.round(w), height: Math.round(h) };
}
