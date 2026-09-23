import type { ReactNode } from 'react';

export interface ProseProps {
    children: ReactNode;
}

/** Typography wrapper for MDX article bodies. */
export function Prose({ children }: ProseProps) {
    return <div className="prose">{children}</div>;
}
