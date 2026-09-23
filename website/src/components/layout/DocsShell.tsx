import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { Heading } from '../../lib/headings';
import { DocsSidebar } from './DocsSidebar';
import { OnThisPage } from './OnThisPage';

export interface DocsShellProps {
    headings: Heading[];
    children: ReactNode;
}

/**
 * Three-column documentation layout: grouped sidebar, article, on-this-page.
 * Below 900px the sidebar becomes a drawer opened from the header button, and
 * the table of contents is hidden so the article keeps the full width.
 */
export function DocsShell({ headings, children }: DocsShellProps) {
    const { pathname } = useLocation();

    // The drawer is open only while the route it was opened on is current, so a
    // navigation (including back/forward) closes it without an effect.
    const [openedFor, setOpenedFor] = useState<string | null>(null);
    const drawerOpen = openedFor === pathname;

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
    }, [pathname]);

    return (
        <>
            <div className="docs-shell">
                <aside className="docs-sidebar">
                    <DocsSidebar />
                </aside>

                <main className="docs-main" id="content">
                    {children}
                </main>

                <OnThisPage headings={headings} />
            </div>

            <button
                type="button"
                className="button small secondary drawer-trigger"
                onClick={() => setOpenedFor(pathname)}
                aria-expanded={drawerOpen}
            >
                Browse the docs
            </button>

            {drawerOpen && (
                <>
                    <div className="drawer-backdrop" onClick={() => setOpenedFor(null)} />
                    <div className="drawer" role="dialog" aria-modal="true" aria-label="Documentation">
                        <div className="drawer-head">
                            <span className="eyebrow">Documentation</span>
                            <button
                                type="button"
                                className="icon-button"
                                onClick={() => setOpenedFor(null)}
                                aria-label="Close documentation navigation"
                            >
                                ×
                            </button>
                        </div>
                        <DocsSidebar onNavigate={() => setOpenedFor(null)} />
                    </div>
                </>
            )}
        </>
    );
}
