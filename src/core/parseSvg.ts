/** Thrown when markup contains no usable `<svg>` root. */
export class InvalidSvgError extends Error {
    constructor(message = 'No SVG to animate.') {
        super(message);
        this.name = 'InvalidSvgError';
    }
}

const BLOCKED_TAGS = 'script, iframe, object, embed';
const HREF_ATTRS = ['href', 'xlink:href'];
const UNSAFE_URL = /^\s*(javascript|vbscript|data:text\/html)/i;

/**
 * Strips scripts, event-handler attributes and `javascript:` links in place so
 * untrusted markup can be mounted safely.
 */
export function sanitizeSvg<T extends Element>(root: T): T {
    root.querySelectorAll(BLOCKED_TAGS).forEach((el) => el.remove());
    root.querySelectorAll('animate, set').forEach((el) => {
        const name = el.getAttribute('attributeName') ?? '';
        if (HREF_ATTRS.includes(name) || name.startsWith('on')) el.remove();
    });
    [root, ...Array.from(root.querySelectorAll('*'))].forEach((el) => {
        for (const attr of Array.from(el.attributes)) {
            const name = attr.name.toLowerCase();
            // Strip control chars browsers ignore inside URLs, e.g. "java\tscript:".
            const value = attr.value.replace(/[\u0000-\u001f\u007f\s]+/g, '');
            if (name.startsWith('on') || (HREF_ATTRS.includes(name) && UNSAFE_URL.test(value))) {
                el.removeAttribute(attr.name);
            }
        }
    });
    return root;
}

/**
 * Parse serialized `<svg>…</svg>` markup into an element owned by the current
 * document, ready to append and animate. Scripts and event handlers are removed.
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
    return sanitizeSvg(document.importNode(found, true) as SVGSVGElement);
}

/** Fetch an `.svg` file and parse it with `parseSvg`. */
export async function loadSvg(url: string, init?: RequestInit): Promise<SVGSVGElement> {
    const res = await fetch(url, init);
    if (!res.ok) throw new InvalidSvgError(`Could not load SVG from ${url} (HTTP ${res.status}).`);
    return parseSvg(await res.text());
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
