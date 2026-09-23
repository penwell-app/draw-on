import { describe, expect, it } from 'vitest';
import {
    DOC_FILES,
    FLAT_NAV,
    NAV,
    editUrl,
    findDoc,
    hasDocModule,
    neighbours,
} from '../content/nav';

describe('documentation navigation', () => {
    it('has unique slugs and unique files', () => {
        const slugs = FLAT_NAV.map((item) => item.slug);
        const files = FLAT_NAV.map((item) => item.file);

        expect(new Set(slugs).size).toBe(slugs.length);
        expect(new Set(files).size).toBe(files.length);
    });

    it('resolves every entry to an MDX module', () => {
        const missing = FLAT_NAV.filter((item) => !hasDocModule(item.file));

        expect(missing.map((item) => item.file)).toEqual([]);
    });

    it('lists every MDX file in the sidebar', () => {
        const listed = new Set(FLAT_NAV.map((item) => item.file));
        const orphaned = DOC_FILES.filter((file) => !listed.has(file));

        expect(orphaned).toEqual([]);
    });

    it('gives every entry a title, a summary and a group', () => {
        for (const item of FLAT_NAV) {
            expect(item.title.length).toBeGreaterThan(2);
            expect(item.blurb.length).toBeGreaterThan(10);
            expect(item.slug.startsWith('/docs/')).toBe(true);
            expect(item.file.endsWith('.mdx')).toBe(true);
        }
    });

    it('matches the group on the item to the section it sits in', () => {
        for (const section of NAV) {
            for (const item of section.items) {
                expect(item.group).toBe(section.group);
            }
        }
    });

    it('builds an edit link for every page', () => {
        for (const item of FLAT_NAV) {
            const url = editUrl(item.file);
            expect(url).toContain('/website/src/content/docs/');
            expect(url.endsWith(`${item.file}`)).toBe(true);
        }
    });

    it('walks prev and next in reading order', () => {
        const first = neighbours(FLAT_NAV[0].slug);
        const middle = neighbours(FLAT_NAV[4].slug);
        const last = neighbours(FLAT_NAV[FLAT_NAV.length - 1].slug);

        expect(first.prev).toBeUndefined();
        expect(first.next?.slug).toBe(FLAT_NAV[1].slug);

        expect(middle.prev?.slug).toBe(FLAT_NAV[3].slug);
        expect(middle.next?.slug).toBe(FLAT_NAV[5].slug);

        expect(last.next).toBeUndefined();
        expect(last.prev?.slug).toBe(FLAT_NAV[FLAT_NAV.length - 2].slug);
    });

    it('finds pages by slug and ignores unknown ones', () => {
        expect(findDoc('/docs/introduction')?.title).toBe('Introduction');
        expect(findDoc('/docs/does-not-exist')).toBeUndefined();
        expect(neighbours('/docs/does-not-exist')).toEqual({});
    });

    it('covers the sections the site advertises', () => {
        const groups = NAV.map((section) => section.group);

        expect(groups).toEqual(['Getting started', 'Guides', 'Recipes', 'Reference', 'More']);
        expect(FLAT_NAV.length).toBeGreaterThanOrEqual(24);
    });
});
