export const SHAPE_SELECTOR = 'path, rect, circle, ellipse, line, polyline, polygon';
export const TEXT_SELECTOR = 'text, foreignObject, image';
/** Containers whose children are templates, not rendered geometry. */
export const NON_RENDERED_SELECTOR =
    'defs, symbol, clipPath, mask, marker, pattern, linearGradient, radialGradient, filter';
export const DEFAULT_STROKE = '#27241a';
export const DEFAULT_STROKE_WIDTH = '1.25';

/** True when a fill/stroke value actually paints something. */
export function isPaint(value: string | null): boolean {
    if (!value) return false;
    const v = value.trim().toLowerCase();
    return v !== '' && v !== 'none' && v !== 'transparent' && v !== 'rgba(0, 0, 0, 0)';
}
