import { slugify } from './slugify';

/** Headings collected at build time (or from raw markdown in tests). */
export interface Heading {
    depth: 2 | 3;
    id: string;
    text: string;
}

function inlineText(value: string): string {
    return value
        .replace(/`([^`]*)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/[*_~]/g, '')
        .trim();
}

/**
 * Pull the h2/h3 headings out of raw MDX source. The site itself uses the
 * build-time `headings` export produced by the remark plugin in
 * `vite.config.ts`; this function is the independent check the tests use, so an
 * anchor that would break the table of contents fails the suite.
 */
export function extractHeadings(markdown: string): Heading[] {
    const headings: Heading[] = [];
    let inFence = false;

    for (const line of markdown.split(/\r?\n/)) {
        if (/^\s*(```|~~~)/.test(line)) {
            inFence = !inFence;
            continue;
        }
        if (inFence) continue;

        const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
        if (!match) continue;

        const text = inlineText(match[2]);
        if (!text) continue;

        headings.push({ depth: match[1].length === 2 ? 2 : 3, id: slugify(text), text });
    }

    return headings;
}

export { slugify };

