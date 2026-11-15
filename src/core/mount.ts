import { draw, type DrawOptions, type Drawing } from './draw';
import { loadSvg, parseSvg } from './parseSvg';

export interface MountOptions extends DrawOptions {
    /** Replace the container's content instead of appending. Defaults to true. */
    replace?: boolean;
    /** Make the SVG scale to its container width. Defaults to true. */
    responsive?: boolean;
    /** Forwarded to `fetch` when `source` is a URL. */
    fetchInit?: RequestInit;
}

function isMarkup(source: string) {
    return source.trimStart().startsWith('<');
}

/**
 * Put an SVG into `container` and draw it. `source` can be markup, a URL to an
 * `.svg` file, or an existing `<svg>` element.
 *
 * @example
 * const drawing = await mount('#hero', '/logo.svg', { type: 'stagger' });
 */
export async function mount(
    container: Element | string,
    source: string | SVGSVGElement,
    options: MountOptions = {},
): Promise<Drawing> {
    const host = typeof container === 'string' ? document.querySelector(container) : container;
    if (!host) throw new Error(`mount(): container ${String(container)} not found.`);

    const { replace = true, responsive = true, fetchInit, ...drawOptions } = options;
    const svg =
        typeof source !== 'string'
            ? source
            : isMarkup(source)
                ? parseSvg(source)
                : await loadSvg(source, fetchInit);

    if (responsive) {
        svg.style.maxWidth = '100%';
        svg.style.height = 'auto';
    }
    if (replace) host.replaceChildren(svg);
    else host.appendChild(svg);
    return draw(svg, drawOptions);
}
