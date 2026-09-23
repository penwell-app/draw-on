import { isValidElement } from 'react';
import type { ReactNode } from 'react';
import { slugify } from '../../lib/slugify';

export interface HeadingProps {
    level?: 2 | 3 | 4;
    children?: ReactNode;
    id?: string;
    className?: string;
}

/** Flatten a React subtree down to its text so headings can be slugged. */
function textOf(node: ReactNode): string {
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map((child) => textOf(child)).join('');
    if (isValidElement(node)) {
        return textOf((node.props as { children?: ReactNode }).children);
    }
    return '';
}

/**
 * Heading with an anchor id derived from its text. `extractHeadings` slugs the
 * same way, so the "on this page" links always land on the right section.
 */
export function Heading({ level = 2, children, id, className }: HeadingProps) {
    const text = textOf(children).trim();
    const anchor = id ?? slugify(text);
    const Tag = `h${level}` as const;

    return (
        <Tag id={anchor} className={className}>
            <a href={`#${anchor}`}>{children}</a>
        </Tag>
    );
}
