import fs from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { mdxComponents } from '../components/docs/mdxComponents';
import { FLAT_NAV, docHeadings, loadDoc } from '../content/nav';

const DOCS_DIR = path.resolve(process.cwd(), 'src/content/docs');

function readDoc(file: string): string {
    return fs.readFileSync(path.join(DOCS_DIR, file), 'utf8');
}

/**
 * Compiles and renders every documentation page. This catches MDX syntax errors,
 * broken component usage and — importantly — table-of-contents anchors that no
 * longer match a heading on the page: the ids the TOC links to are compared with
 * the ids the headings actually render.
 */
describe('documentation content', () => {
    it('renders every page, with anchors that match the table of contents', async () => {
        for (const item of FLAT_NAV) {
            const raw = readDoc(item.file);

            expect(raw.length, `${item.file} is suspiciously short`).toBeGreaterThan(500);

            const fromBuild = docHeadings(item.file);
            expect(fromBuild.length, `${item.file} has no sections`).toBeGreaterThanOrEqual(3);

            const module = await loadDoc(item.slug);
            const html = renderToStaticMarkup(
                createElement(
                    MemoryRouter,
                    null,
                    createElement(module.default as never, { components: mdxComponents }),
                ),
            );

            expect(html.length, `${item.file} rendered nothing`).toBeGreaterThan(400);

            const renderedIds = [...html.matchAll(/<h([23]) id="([^"]+)"/g)].map((match) => match[2]);

            expect(renderedIds, `${item.file} headings and TOC disagree`).toEqual(
                fromBuild.map((heading) => heading.id),
            );
        }
    }, 120_000);

    it('has no unresolved placeholder text on any page', () => {
        for (const item of FLAT_NAV) {
            const raw = readDoc(item.file);

            expect(raw).not.toContain('TODO');
            expect(raw).not.toContain('FIXME');
            expect(raw).not.toContain('lorem ipsum');
        }
    });

    it('gives every page at least one code sample or live demo', () => {
        for (const item of FLAT_NAV) {
            const raw = readDoc(item.file);
            const hasFence = raw.includes('```');
            const hasDemo = raw.includes('<LiveDemo') || raw.includes('<OptionsLab');

            expect(hasFence || hasDemo, `${item.file} has no code or demo`).toBe(true);
        }
    });
});

