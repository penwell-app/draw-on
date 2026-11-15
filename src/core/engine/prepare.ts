import { DEFAULT_STROKE, DEFAULT_STROKE_WIDTH, NON_RENDERED_SELECTOR, SHAPE_SELECTOR, TEXT_SELECTOR, isPaint } from '../paint';
import { warn } from '../warn';
import type { Journal } from './journal';

const SVG_NS = 'http://www.w3.org/2000/svg';
const XLINK_NS = 'http://www.w3.org/1999/xlink';

export type StrokeMode = 'dash' | 'fade' | 'dot';

export interface StrokeItem {
    el: SVGGeometryElement;
    /** Geometric length in user units, for `getPointAtLength`. */
    length: number;
    /** Length in dash units (differs from `length` when `pathLength` is set). */
    dash: number;
    mode: StrokeMode;
    strokeOpacity: number;
    hasFill: boolean;
}

export interface FillItem {
    el: SVGElement;
    opacity: number;
    /** Index into the stroke list when the same element is also drawn. */
    stroke: number;
}

export interface TextItem {
    el: SVGElement | HTMLElement;
    opacity: number;
}

export interface Scene {
    strokes: StrokeItem[];
    fills: FillItem[];
    texts: TextItem[];
    textNodes: { node: Text; value: string }[];
}

export interface CollectOptions {
    stroke?: string;
    strokeWidth?: string | number;
    outline?: boolean;
}

export interface SketchyOptions {
    /** Max jitter in user units. Defaults to 1.2. */
    roughness?: number;
    /** Same seed gives the same wobble on every run. Defaults to 1. */
    seed?: number;
    /** Sample spacing along each path in user units. Defaults to 6. */
    step?: number;
}

function num(value: string | null, fallback = 0): number {
    const n = value == null ? NaN : parseFloat(value);
    return Number.isFinite(n) ? n : fallback;
}

function findById(svg: SVGSVGElement, id: string): Element | null {
    const quoted = id.replace(/["\\]/g, '\\$&');
    return svg.querySelector(`[id="${quoted}"]`) ?? svg.ownerDocument.getElementById(id);
}

function stripIds(el: Element) {
    el.removeAttribute('id');
    el.querySelectorAll('[id]').forEach((child) => child.removeAttribute('id'));
}

function viewBoxTransform(
    vb: [number, number, number, number],
    width: number,
    height: number,
    par: string | null,
): string {
    const [x, y, w, h] = vb;
    if (!(w > 0 && h > 0)) return '';
    const [align = 'xMidYMid', meetOrSlice = 'meet'] = (par ?? '').trim().split(/\s+/).filter(Boolean);
    let sx = width / w;
    let sy = height / h;
    let tx = 0;
    let ty = 0;
    if (align !== 'none') {
        const s = meetOrSlice === 'slice' ? Math.max(sx, sy) : Math.min(sx, sy);
        sx = sy = s;
        const xAlign = align.slice(1, 4);
        const yAlign = align.slice(5, 8);
        if (xAlign === 'Mid') tx = (width - w * s) / 2;
        else if (xAlign === 'Max') tx = width - w * s;
        if (yAlign === 'Mid') ty = (height - h * s) / 2;
        else if (yAlign === 'Max') ty = height - h * s;
    }
    return `translate(${tx - x * sx} ${ty - y * sy}) scale(${sx} ${sy})`;
}

function parseLength(value: string | null, reference: number): number {
    if (!value) return reference;
    if (value.trim().endsWith('%')) return (reference * num(value, 100)) / 100;
    return num(value, reference);
}

const USE_OWN_ATTRS = new Set(['x', 'y', 'width', 'height', 'href', 'xlink:href', 'transform']);
const SYMBOL_OWN_ATTRS = new Set(['id', 'viewBox', 'preserveAspectRatio', 'width', 'height', 'x', 'y', 'refX', 'refY']);

/**
 * Replaces every rendered `<use>` with an inline clone of what it references
 * (`<symbol>`, `<path>`, `<g>`, nested `<svg>`), so the referenced geometry can
 * be measured and drawn. Returns how many `<use>` elements were resolved.
 */
export function resolveUses(svg: SVGSVGElement, journal: Journal, maxDepth = 8): number {
    const doc = svg.ownerDocument;
    const skipped = new WeakSet<Element>();
    let resolved = 0;

    for (let pass = 0; pass < maxDepth; pass++) {
        const uses = Array.from(svg.querySelectorAll('use')).filter(
            (use) => !skipped.has(use) && !use.closest(NON_RENDERED_SELECTOR),
        );
        if (!uses.length) return resolved;

        for (const use of uses) {
            const href = use.getAttribute('href') ?? use.getAttributeNS(XLINK_NS, 'href') ?? '';
            if (!href.startsWith('#')) {
                warn(`<use> points outside this document ("${href}") and cannot be drawn.`, use);
                skipped.add(use);
                continue;
            }
            const target = findById(svg, href.slice(1));
            if (!target) {
                warn(`<use> references a missing id "${href}".`, use);
                skipped.add(use);
                continue;
            }
            if (target === use || target.contains(use)) {
                warn(`<use> "${href}" references itself.`, use);
                skipped.add(use);
                continue;
            }

            const group = doc.createElementNS(SVG_NS, 'g');
            for (const attr of Array.from(use.attributes)) {
                if (!USE_OWN_ATTRS.has(attr.name)) group.setAttribute(attr.name, attr.value);
            }
            const x = num(use.getAttribute('x'));
            const y = num(use.getAttribute('y'));
            const transform = [use.getAttribute('transform'), x || y ? `translate(${x} ${y})` : '']
                .filter(Boolean)
                .join(' ');
            if (transform) group.setAttribute('transform', transform);

            const tag = target.tagName.toLowerCase();
            if (tag === 'symbol' || tag === 'svg') {
                const inner = doc.createElementNS(SVG_NS, 'g');
                for (const attr of Array.from(target.attributes)) {
                    if (!SYMBOL_OWN_ATTRS.has(attr.name)) inner.setAttribute(attr.name, attr.value);
                }
                const vb = (target.getAttribute('viewBox') ?? '')
                    .trim()
                    .split(/[\s,]+/)
                    .map(Number);
                if (vb.length === 4 && vb.every(Number.isFinite)) {
                    const box = vb as [number, number, number, number];
                    const width = parseLength(use.getAttribute('width') ?? target.getAttribute('width'), box[2]);
                    const height = parseLength(use.getAttribute('height') ?? target.getAttribute('height'), box[3]);
                    const t = viewBoxTransform(box, width, height, target.getAttribute('preserveAspectRatio'));
                    if (t) inner.setAttribute('transform', t);
                }
                target.childNodes.forEach((child) => {
                    const copy = child.cloneNode(true);
                    if (copy instanceof Element) stripIds(copy);
                    inner.appendChild(copy);
                });
                group.appendChild(inner);
            } else {
                const copy = target.cloneNode(true) as Element;
                stripIds(copy);
                group.appendChild(copy);
            }

            group.setAttribute('data-draw-on-use', href);
            journal.replace(use, group);
            resolved++;
        }
    }
    warn(`Stopped resolving nested <use> after ${maxDepth} levels.`);
    return resolved;
}

function mulberry32(seed: number) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const GEOMETRY_ATTRS = new Set([
    'd', 'x', 'y', 'width', 'height', 'rx', 'ry', 'cx', 'cy', 'r', 'points', 'x1', 'y1', 'x2', 'y2', 'pathLength',
]);
const CLOSED_TAGS = new Set(['rect', 'circle', 'ellipse', 'polygon']);

/** Rebuilds each shape as a slightly wobbly path for a hand-drawn look. */
export function applySketchy(svg: SVGSVGElement, journal: Journal, opts: SketchyOptions = {}) {
    const roughness = opts.roughness ?? 1.2;
    const step = Math.max(1, opts.step ?? 6);
    const rand = mulberry32(opts.seed ?? 1);
    const doc = svg.ownerDocument;

    svg.querySelectorAll(SHAPE_SELECTOR).forEach((node) => {
        if (node.closest(NON_RENDERED_SELECTOR) || node.closest('[data-draw-skip]')) return;
        const el = node as SVGGeometryElement;
        const tag = el.tagName.toLowerCase();
        const d = el.getAttribute('d') ?? '';
        if (tag === 'path' && (d.match(/[Mm]/g)?.length ?? 0) > 1) return;
        let length = 0;
        try {
            length = el.getTotalLength();
        } catch {
            return;
        }
        if (!(length > 0)) return;

        const closed = CLOSED_TAGS.has(tag) || (tag === 'path' && /[Zz]\s*$/.test(d));
        const count = Math.max(8, Math.ceil(length / step));
        const last = closed ? count - 1 : count;
        const points: string[] = [];
        for (let i = 0; i <= last; i++) {
            const p = el.getPointAtLength((length * i) / count);
            const jx = (rand() * 2 - 1) * roughness;
            const jy = (rand() * 2 - 1) * roughness;
            points.push(`${(p.x + jx).toFixed(2)} ${(p.y + jy).toFixed(2)}`);
        }
        const path = `M${points.join(' L')}${closed ? ' Z' : ''}`;

        if (tag === 'path') {
            journal.setAttr(el, 'd', path);
            return;
        }
        const replacement = doc.createElementNS(SVG_NS, 'path');
        for (const attr of Array.from(el.attributes)) {
            if (!GEOMETRY_ATTRS.has(attr.name)) replacement.setAttribute(attr.name, attr.value);
        }
        replacement.setAttribute('d', path);
        journal.replace(el, replacement);
    });
}

function measure(el: SVGGeometryElement): number {
    try {
        const length = el.getTotalLength();
        return Number.isFinite(length) ? length : 0;
    } catch {
        return 0;
    }
}

/**
 * Finds everything that should draw (strokes), fade (fills) and appear
 * (labels), giving fill-only shapes an outline to draw along the way.
 */
export function collect(svg: SVGSVGElement, journal: Journal, opts: CollectOptions = {}): Scene {
    const strokeColor = opts.stroke ?? DEFAULT_STROKE;
    const strokeWidth = String(opts.strokeWidth ?? DEFAULT_STROKE_WIDTH);
    const outline = opts.outline !== false;
    const strokes: StrokeItem[] = [];
    const fills: FillItem[] = [];
    const order = new Map<StrokeItem, number>();

    svg.querySelectorAll(SHAPE_SELECTOR).forEach((node) => {
        if (node.closest(NON_RENDERED_SELECTOR) || node.closest('[data-draw-skip]')) return;
        const el = node as SVGGeometryElement;
        const cs = getComputedStyle(el);
        if (cs.display === 'none') return;

        const hasStroke = isPaint(cs.stroke || el.getAttribute('stroke'));
        const hasFill = isPaint(cs.fill || el.getAttribute('fill'));

        let drawn = hasStroke;
        if (!hasStroke && hasFill && outline) {
            journal.setStyle(el, 'stroke', strokeColor);
            if (!el.getAttribute('stroke-width') && !el.style.strokeWidth) {
                journal.setStyle(el, 'stroke-width', strokeWidth);
            }
            drawn = true;
        }

        let strokeIndex = -1;
        if (drawn) {
            const length = measure(el);
            const pathLength = num(el.getAttribute('pathLength'), 0);
            const dashed = hasStroke && !!cs.strokeDasharray && cs.strokeDasharray !== 'none';
            const item: StrokeItem = {
                el,
                length,
                dash: pathLength > 0 ? pathLength : length,
                mode: dashed ? 'fade' : length < 0.01 ? 'dot' : 'dash',
                strokeOpacity: hasStroke ? num(cs.strokeOpacity, 1) : 1,
                hasFill,
            };
            const ordered = el.closest('[data-draw-order]');
            order.set(item, ordered && svg.contains(ordered) ? num(ordered.getAttribute('data-draw-order')) : 0);
            strokeIndex = strokes.push(item) - 1;
        }

        if (hasFill) fills.push({ el, opacity: num(cs.fillOpacity, 1), stroke: strokeIndex });
    });

    const sorted = strokes.slice().sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));
    const position = new Map(sorted.map((s, i) => [s, i]));
    fills.forEach((f) => {
        if (f.stroke >= 0) f.stroke = position.get(strokes[f.stroke]) ?? -1;
    });

    const texts: TextItem[] = [];
    const textNodes: { node: Text; value: string }[] = [];
    svg.querySelectorAll(TEXT_SELECTOR).forEach((node) => {
        if (node.closest(NON_RENDERED_SELECTOR) || node.closest('[data-draw-skip]')) return;
        if (node.parentElement?.closest(TEXT_SELECTOR)) return;
        const el = node as SVGElement;
        texts.push({ el, opacity: num(getComputedStyle(el).opacity, 1) });
        if (el.tagName.toLowerCase() === 'text') {
            const walker = svg.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            for (let t = walker.nextNode(); t; t = walker.nextNode()) {
                const text = t as Text;
                if (text.data.trim()) textNodes.push({ node: text, value: text.data });
            }
        }
    });

    return { strokes: sorted, fills, texts, textNodes };
}
