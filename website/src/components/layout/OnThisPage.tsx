import { useMemo } from 'react';
import type { Heading } from '../../lib/headings';
import { useScrollspy } from '../../lib/useScrollspy';

export interface OnThisPageProps {
    headings: Heading[];
}

/** Sticky table of contents with the current section highlighted. */
export function OnThisPage({ headings }: OnThisPageProps) {
    const ids = useMemo(() => headings.map((heading) => heading.id), [headings]);
    const active = useScrollspy(ids);

    if (headings.length === 0) return null;

    return (
        <nav className="docs-toc" aria-label="On this page">
            <h4>On this page</h4>
            <ul>
                {headings.map((heading) => (
                    <li key={`${heading.id}-${heading.depth}`}>
                        <a
                            href={`#${heading.id}`}
                            className={`depth-${heading.depth}${active === heading.id ? ' active' : ''}`}
                        >
                            {heading.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
