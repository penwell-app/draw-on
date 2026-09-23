import { describe, expect, it } from 'vitest';
import { parseSvg } from '@penwell/draw-on/core';
import { SAMPLES, cloneSample, findSample } from '../content/samples';

const OPTION_KEYS = ['duration', 'type', 'stroke', 'strokeWidth', 'revealStart', 'revealMs'];
const DRAW_TYPES = ['oneByOne', 'delayed', 'sync'];

describe('samples', () => {
    it('offers a decent spread of artwork', () => {
        expect(SAMPLES.length).toBeGreaterThanOrEqual(8);

        const ids = SAMPLES.map((sample) => sample.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('every sample parses through the real parser', () => {
        for (const sample of SAMPLES) {
            const svg = parseSvg(sample.svg);

            expect(svg.tagName.toLowerCase()).toBe('svg');
            expect(svg.getAttribute('viewBox')).toBeTruthy();
            expect(svg.getAttribute('xmlns')).toBe('http://www.w3.org/2000/svg');
        }
    });

    it('every sample has something to draw', () => {
        for (const sample of SAMPLES) {
            const svg = parseSvg(sample.svg);
            const shapes = svg.querySelectorAll(
                'path, rect, circle, ellipse, line, polyline, polygon',
            );

            expect(shapes.length).toBeGreaterThan(0);
        }
    });

    it('keeps element ids unique inside each sample', () => {
        for (const sample of SAMPLES) {
            const svg = parseSvg(sample.svg);
            const ids = [...svg.querySelectorAll('[id]')].map((el) => el.getAttribute('id') ?? '');

            expect(new Set(ids).size).toBe(ids.length);
        }
    });

    it('only recommends options the engine actually accepts', () => {
        for (const sample of SAMPLES) {
            for (const [key, value] of Object.entries(sample.recommended ?? {})) {
                expect(OPTION_KEYS).toContain(key);

                if (key === 'type') expect(DRAW_TYPES).toContain(value);
                if (key === 'duration') expect(typeof value).toBe('number');
                if (key === 'revealStart') {
                    expect(Number(value)).toBeGreaterThanOrEqual(0);
                    expect(Number(value)).toBeLessThanOrEqual(0.999);
                }
                if (key === 'revealMs') expect(Number(value)).toBeGreaterThan(0);
            }
        }
    });

    it('describes every sample for the gallery', () => {
        for (const sample of SAMPLES) {
            expect(sample.title.length).toBeGreaterThan(3);
            expect(sample.description.length).toBeGreaterThan(20);
            expect(sample.tags.length).toBeGreaterThan(0);
            expect(sample.source).toBeTruthy();
        }
    });

    it('clones markup so the engine never sees a shared element', () => {
        const first = cloneSample('flowchart');
        const second = cloneSample('flowchart');

        expect(first).toBe(second);
        expect(first).toContain('<svg');
        expect(cloneSample('nope')).toBe('');
        expect(findSample('flowchart')?.title).toContain('Flowchart');
    });
});
