import { describe, expect, it } from 'vitest';
import { parseSvg } from '@penwell/draw-on/core';
import {
    DEFAULT_PLAYGROUND_OPTIONS,
    toComponentSnippet,
    toCoreSnippet,
    toHookSnippet,
    toRecordSnippet,
} from '../lib/codegen';
import { SAMPLES } from '../content/samples';

const input = {
    svgMarkup: SAMPLES[0].svg,
    options: DEFAULT_PLAYGROUND_OPTIONS,
};

describe('snippet generation', () => {
    it('carries the current option values into every snippet', () => {
        const options = { ...DEFAULT_PLAYGROUND_OPTIONS, duration: 420, type: 'delayed' as const };
        const snippets = [
            toCoreSnippet({ ...input, options }),
            toHookSnippet({ ...input, options }),
            toComponentSnippet({ ...input, options }),
            toRecordSnippet({ ...input, options }),
        ];

        for (const snippet of snippets) {
            expect(snippet).toContain('duration: 420');
            expect(snippet).toContain("type: 'delayed'");
            expect(snippet).toContain("stroke: '#27241a'");
            expect(snippet).toContain("strokeWidth: '1.25'");
            expect(snippet).toContain('revealStart: 0.6');
            expect(snippet).toContain('revealMs: 500');
        }
    });

    it('imports from the right entry points', () => {
        expect(toCoreSnippet(input)).toContain("from '@penwell/draw-on/core'");
        expect(toHookSnippet(input)).toContain("from '@penwell/draw-on'");
        expect(toComponentSnippet(input)).toContain("from '@penwell/draw-on'");
        expect(toRecordSnippet(input)).toContain('recordDrawToWebM');
    });

    it('escapes markup so it survives a template literal', () => {
        const tricky = '<svg xmlns="http://www.w3.org/2000/svg">\n  <text>${oops}</text>\n</svg>';
        const snippet = toCoreSnippet({ svgMarkup: tricky, options: DEFAULT_PLAYGROUND_OPTIONS });

        expect(snippet).toContain('\\${oops}');
        expect(snippet).not.toContain('<text>${oops}</text>');
    });

    it('keeps the sample markup animatable after escaping', () => {
        for (const sample of SAMPLES) {
            expect(() => parseSvg(sample.svg)).not.toThrow();
            expect(toCoreSnippet({ svgMarkup: sample.svg, options: DEFAULT_PLAYGROUND_OPTIONS })).toContain(
                'createDrawing(svg,',
            );
        }
    });

    it('produces snippets the user can read', () => {
        const snippet = toHookSnippet(input);

        expect(snippet.startsWith('import {')).toBe(true);
        expect(snippet.trimEnd().endsWith('}')).toBe(true);
        expect(snippet).not.toContain('\t');

        // The markup is inserted verbatim, so every line of the original SVG must
        // still be present, unmangled.
        for (const line of SAMPLES[0].svg.split('\n')) {
            const trimmed = line.trim();
            if (trimmed) expect(snippet).toContain(trimmed);
        }
    });

    it('dedents mixed indentation', () => {
        const lines = toCoreSnippet(input).split('\n');
        const imports = lines.filter((line) => line.startsWith('import '));

        expect(imports).toHaveLength(1);
        expect(lines[0]).toBe("import { createDrawing, parseSvg } from '@penwell/draw-on/core';");
        expect(lines.some((line) => line.startsWith('const drawing = createDrawing(svg, {'))).toBe(
            true,
        );
        expect(lines.some((line) => line === '    duration: 220,')).toBe(true);
    });
});
