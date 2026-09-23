import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

export interface Crumb {
    label: string;
    href?: string;
}

export interface PageHeaderProps {
    eyebrow?: string;
    title: string;
    lead?: string;
    crumbs?: Crumb[];
    actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, lead, crumbs, actions }: PageHeaderProps) {
    return (
        <header className="page-header">
            {crumbs && crumbs.length > 0 && (
                <ol className="breadcrumbs">
                    {crumbs.map((crumb, index) => (
                        <li key={`${crumb.label}-${index}`}>
                            {crumb.href ? <Link to={crumb.href}>{crumb.label}</Link> : crumb.label}
                            {index < crumbs.length - 1 && <span aria-hidden="true"> / </span>}
                        </li>
                    ))}
                </ol>
            )}
            {eyebrow && <p className="eyebrow" style={{ marginBottom: 0 }}>{eyebrow}</p>}
            <h1>{title}</h1>
            {lead && <p className="lead">{lead}</p>}
            {actions && <div className="page-header-actions">{actions}</div>}
        </header>
    );
}
