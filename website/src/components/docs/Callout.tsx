import type { ReactNode } from 'react';

export interface CalloutProps {
    type?: 'note' | 'tip' | 'warning' | 'danger';
    title?: string;
    children: ReactNode;
}

const ICONS: Record<NonNullable<CalloutProps['type']>, string> = {
    note: 'i',
    tip: '*',
    warning: '!',
    danger: 'x',
};

const LABELS: Record<NonNullable<CalloutProps['type']>, string> = {
    note: 'Note',
    tip: 'Tip',
    warning: 'Heads up',
    danger: 'Careful',
};

export function Callout({ type = 'note', title, children }: CalloutProps) {
    return (
        <div className={`callout ${type}`}>
            <span className="callout-icon" aria-hidden="true">
                {ICONS[type]}
            </span>
            <div>
                <span className="callout-title">{title ?? LABELS[type]}</span>
                {children}
            </div>
        </div>
    );
}
