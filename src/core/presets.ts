import type { DrawOptions } from './draw';

/**
 * Tuned option bundles for common SVG sources. Spread and override:
 * `draw(svg, { ...presets.diagram, duration: 3000 })`.
 */
export const presets = {
    /** Mermaid, Excalidraw, draw.io: outline boxes one by one, fill each behind its stroke. */
    diagram: { type: 'oneByOne', duration: 3200, reveal: 'stroke', ease: 'easeInOut' },
    /** Lucide, Heroicons, Feather: every stroke at once, quick and snappy. */
    icon: { type: 'sync', duration: 900, ease: 'easeOutCubic', reveal: 'none' },
    /** Logos and wordmarks: staggered strokes, fills land at the end. */
    logo: { type: 'stagger', duration: 2200, stagger: 90, ease: 'easeInOut', revealStart: 0.7 },
    /** Signatures and handwriting: constant pen speed with a nib. */
    signature: { type: 'speed', speed: 700, ease: 'linear', strokeEase: 'easeInOut', pen: true, reveal: 'none' },
    /** Whiteboard look: wobbly strokes, labels typed out. */
    sketch: { type: 'oneByOne', duration: 3500, sketchy: true, text: 'type', reveal: 'stroke' },
} satisfies Record<string, DrawOptions>;

export type PresetName = keyof typeof presets;
