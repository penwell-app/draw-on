import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

export interface CardProps {
    title: string;
    tag?: string;
    /** Internal route or external URL. */
    href: string;
    children?: ReactNode;
}

export function Card({ title, tag, href, children }: CardProps) {
    const isExternal = /^https?:/.test(href);
    const inner = (
        <>
            {tag && <span className="card-tag">{tag}</span>}
            <h3>{title}</h3>
            {children}
        </>
    );

    if (isExternal) {
        return (
            <a className="card" href={href} target="_blank" rel="noreferrer">
                {inner}
            </a>
        );
    }

    return (
        <Link className="card" to={href}>
            {inner}
        </Link>
    );
}

export interface CardGridProps {
    children: ReactNode;
    columns?: number;
}

export function CardGrid({ children, columns }: CardGridProps) {
    return (
        <div
            className="card-grid"
            style={columns ? { gridTemplateColumns: `repeat(auto-fit, minmax(${columns}px, 1fr))` } : undefined}
        >
            {children}
        </div>
    );
}
