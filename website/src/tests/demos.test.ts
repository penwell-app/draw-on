import { describe, expect, it } from 'vitest';
import { DEMO_COMPONENTS, DEMO_IDS, DEMO_SOURCES } from '../demos';

describe('demo registry', () => {
    it('keeps components and raw sources in step', () => {
        expect(Object.keys(DEMO_COMPONENTS).sort()).toEqual(Object.keys(DEMO_SOURCES).sort());
    });

    it('has a source file for every demo and vice versa', () => {
        for (const id of DEMO_IDS) {
            const source = DEMO_SOURCES[id];

            expect(source.filename.endsWith('.tsx')).toBe(true);
            expect(source.code.length).toBeGreaterThan(200);
            expect(typeof DEMO_COMPONENTS[id]).toBe('function');
        }
    });
});
