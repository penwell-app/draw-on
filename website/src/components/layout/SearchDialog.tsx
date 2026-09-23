import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FLAT_NAV } from '../../content/nav';
import type { NavItem } from '../../content/nav';

export interface SearchDialogProps {
    onClose(): void;
}

function matches(item: NavItem, query: string): boolean {
    const haystack = `${item.title} ${item.blurb} ${item.group} ${item.slug}`.toLowerCase();
    return query
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .every((token) => haystack.includes(token));
}

/**
 * ⌘K / Ctrl+K palette over the page titles and summaries in `nav.ts`. The header
 * mounts it only while open, so each visit starts with a clean query.
 */
export function SearchDialog({ onClose }: SearchDialogProps) {
    const [query, setQuery] = useState('');
    const [active, setActive] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const results = useMemo(() => {
        if (!query.trim()) return FLAT_NAV.slice(0, 8);
        return FLAT_NAV.filter((item) => matches(item, query)).slice(0, 12);
    }, [query]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const go = (item: NavItem) => {
        navigate(item.slug);
        onClose();
    };

    return (
        <div
            className="search-backdrop"
            role="presentation"
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="search-panel" role="dialog" aria-modal="true" aria-label="Search the docs">
                <input
                    ref={inputRef}
                    className="search-input"
                    type="search"
                    value={query}
                    placeholder="Search guides, recipes and the API…"
                    aria-label="Search"
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setActive(0);
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'ArrowDown') {
                            event.preventDefault();
                            setActive((index) => Math.min(index + 1, results.length - 1));
                        } else if (event.key === 'ArrowUp') {
                            event.preventDefault();
                            setActive((index) => Math.max(index - 1, 0));
                        } else if (event.key === 'Enter' && results[active]) {
                            event.preventDefault();
                            go(results[active]);
                        }
                    }}
                />

                {results.length === 0 ? (
                    <p className="search-empty">
                        Nothing matched “{query}”. Try “scrub”, “record”, “mermaid” or “options”.
                    </p>
                ) : (
                    <ul className="search-results">
                        {results.map((item, index) => (
                            <li key={item.slug}>
                                <Link
                                    to={item.slug}
                                    data-active={index === active}
                                    onClick={onClose}
                                    onMouseEnter={() => setActive(index)}
                                >
                                    <span className="hit-title">
                                        {item.title}
                                        <span className="hit-group">{item.group}</span>
                                    </span>
                                    <span className="hit-blurb">{item.blurb}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
