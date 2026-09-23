import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
    DEFAULT_STROKE,
    DEFAULT_STROKE_WIDTH,
    SHAPE_SELECTOR,
    TEXT_SELECTOR,
    isPaint,
} from '@penwell/draw-on/core';

/**
 * The docs quote exact defaults and a reveal formula. These tests fail when the
 * engine moves away from what the pages promise, so the prose cannot drift.
 */
function readEngineSource(): string {
    const candidates = [
        path.resolve(process.cwd(), '..', 'src', 'core', 'createDrawing.ts'),
        path.resolve(process.cwd(), 'src', 'core', 'createDrawing.ts'),
    ];
    const found = candidates.find((candidate) => fs.existsSync(candidate));

    if (!found) {
        throw new Error(`Could not locate the engine source. Looked in: ${candidates.join(', ')}`);
    }

    return fs.readFileSync(found, 'utf8');
}

const SOURCE = readEngineSource();

/** The documented mapping from progress to the reveal amount. */
function revealAmount(fraction: number, revealStart = 0.6): number {
    const start = Math.min(0.999, Math.max(0, revealStart));
    return Math.min(1, Math.max(0, (fraction - start) / (1 - start)));
}

describe('documented constants', () => {
    it('exports the selectors the reference page lists', () => {
        expect(SHAPE_SELECTOR).toBe('path, rect, circle, ellipse, line, polyline, polygon');
        expect(TEXT_SELECTOR).toBe('text, foreignObject, image');
    });

    it('exports the default ink values', () => {
        expect(DEFAULT_STROKE).toBe('#27241a');
        expect(DEFAULT_STROKE_WIDTH).toBe('1.25');
    });

    it('treats only real paint values as paint', () => {
        expect(isPaint('#f4c95d')).toBe(true);
        expect(isPaint('rgb(39, 36, 26)')).toBe(true);
        expect(isPaint('url(#gradient)')).toBe(true);

        expect(isPaint(null)).toBe(false);
        expect(isPaint('')).toBe(false);
        expect(isPaint('none')).toBe(false);
        expect(isPaint('transparent')).toBe(false);
        expect(isPaint('rgba(0, 0, 0, 0)')).toBe(false);
    });
});

describe('reveal window maths', () => {
    it('matches the table on the DrawingOptions page', () => {
        expect(revealAmount(0, 0.6)).toBe(0);
        expect(revealAmount(0.3, 0.6)).toBe(0);
        expect(revealAmount(0.6, 0.6)).toBe(0);
        expect(revealAmount(0.8, 0.6)).toBeCloseTo(0.5, 5);
        expect(revealAmount(1, 0.6)).toBe(1);
    });

    it('follows a lower revealStart as documented', () => {
        expect(revealAmount(0.2, 0.3)).toBe(0);
        expect(revealAmount(0.4, 0.3)).toBeCloseTo(0.1428, 3);
        expect(revealAmount(0.6, 0.3)).toBeCloseTo(0.4285, 3);
        expect(revealAmount(1, 0.3)).toBe(1);
    });

    it('is clamped so the animation can never invert', () => {
        expect(revealAmount(-1, 0.6)).toBe(0);
        expect(revealAmount(2, 0.6)).toBe(1);
        expect(revealAmount(1, 0.999)).toBe(1);
    });
});

describe('engine defaults quoted in the docs', () => {
    it('still uses 220 frames and oneByOne', () => {
        expect(SOURCE).toContain('opts.duration ?? 220');
        expect(SOURCE).toContain("opts.type ?? 'oneByOne'");
    });

    it('still uses the documented reveal defaults', () => {
        expect(SOURCE).toContain('opts.revealStart ?? 0.6');
        expect(SOURCE).toContain('opts.revealMs ?? 500');
    });

    it('still clamps revealStart below 1', () => {
        expect(SOURCE).toContain('Math.min(0.999, Math.max(0, opts.revealStart ?? 0.6))');
    });

    it('still computes the reveal amount with the documented formula', () => {
        expect(SOURCE).toContain('(fraction - revealStart) / (1 - revealStart)');
    });

    it('still falls back to the documented stroke values', () => {
        expect(SOURCE).toContain('opts.stroke ?? DEFAULT_STROKE');
        expect(SOURCE).toContain('opts.strokeWidth ?? DEFAULT_STROKE_WIDTH');
    });
});
