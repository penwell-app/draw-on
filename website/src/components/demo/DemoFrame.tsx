import type { ReactNode } from 'react';

export interface DemoFrameProps {
    title: string;
    description?: string;
    /** Small label in the header, e.g. the live status. */
    status?: string;
    /** Header buttons. */
    actions?: ReactNode;
    /**
     * The stage: usually the container the SVG is mounted into. With `raw`, the
     * children are responsible for their own stage and controls, and are rendered
     * directly under the header instead.
     */
    children: ReactNode;
    /** Renders children without the stage, footer or note wrappers. */
    raw?: boolean;
    /** Controls row under the stage. */
    footer?: ReactNode;
    /** Extra line under the controls. */
    note?: ReactNode;
    /** Minimum stage height in pixels. */
    height?: number;
    className?: string;
}

/** Presentation shell shared by every live demo on the site. */
export function DemoFrame({
    title,
    description,
    status,
    actions,
    children,
    raw,
    footer,
    note,
    height,
    className,
}: DemoFrameProps) {
    return (
        <section className={`demo${className ? ` ${className}` : ''}`}>
            <header className="demo-head">
                <div className="demo-head-text">
                    <h3>{title}</h3>
                    {description && <p>{description}</p>}
                </div>
                <div className="demo-head-actions">
                    {status && <span className="demo-status">{status}</span>}
                    {actions}
                </div>
            </header>

            {raw ? (
                children
            ) : (
                <div
                    className={height && height > 320 ? 'demo-stage tall' : 'demo-stage'}
                    style={height ? { minHeight: height } : undefined}
                >
                    {children}
                </div>
            )}

            {!raw && footer && <div className="demo-foot">{footer}</div>}
            {!raw && note && <div className="demo-note">{note}</div>}
        </section>
    );
}

