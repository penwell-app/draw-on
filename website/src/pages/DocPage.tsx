import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { ComponentType } from 'react';
import { PageHeader } from '../components/docs/PageHeader';
import { Prose } from '../components/docs/Prose';
import { mdxComponents } from '../components/docs/mdxComponents';
import { DocsShell } from '../components/layout/DocsShell';
import { docHeadings, editUrl, findDoc, loadDoc, neighbours } from '../content/nav';
import type { Heading } from '../lib/headings';
import { useDocumentMeta } from '../lib/useDocumentMeta';

interface Loaded {
    slug: string;
    Content: ComponentType<Record<string, unknown>> | null;
    headings: Heading[];
    error: string;
}

const EMPTY: Omit<Loaded, 'slug'> = { Content: null, headings: [], error: '' };

function PrevNext({ slug }: { slug: string }) {
    const { prev, next } = neighbours(slug);
    if (!prev && !next) return null;

    return (
        <nav className="prev-next" aria-label="Pagination">
            {prev ? (
                <Link to={prev.slug}>
                    <span className="dir">← Previous</span>
                    <span className="label">{prev.title}</span>
                </Link>
            ) : (
                <span />
            )}
            {next ? (
                <Link className="next" to={next.slug}>
                    <span className="dir">Next →</span>
                    <span className="label">{next.title}</span>
                </Link>
            ) : (
                <span />
            )}
        </nav>
    );
}

/**
 * Renders one documentation page: MDX content, sidebar, table of contents and
 * pagination. The MDX module and its raw source are loaded together, so the
 * headings for the table of contents come from the text that is on screen.
 */
export function DocPage() {
    const params = useParams();
    const slug = `/docs/${params['*'] ?? ''}`.replace(/\/$/, '');
    const item = findDoc(slug);
    const [loaded, setLoaded] = useState<Loaded | null>(null);

    // Tagged by slug, so a route change reads as "loading" without an effect
    // having to reset state first.
    const state: Loaded = loaded?.slug === slug ? loaded : { slug, ...EMPTY };

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const module = await loadDoc(slug);
                if (cancelled) return;
                setLoaded({
                    slug,
                    Content: module.default,
                    // Parsed from the markdown at build time (see vite.config.ts).
                    headings: docHeadings(item?.file ?? ''),
                    error: '',
                });
            } catch (cause) {
                if (cancelled) return;
                setLoaded({
                    slug,
                    Content: null,
                    headings: [],
                    error:
                        cause instanceof Error ? cause.message : 'This page could not be loaded.',
                });
            }
        };

        void load();
        return () => {
            cancelled = true;
        };
    }, [slug]);

    useDocumentMeta({
        title: item?.title ?? 'Not found',
        description: item?.blurb ?? 'Draw-On documentation.',
        path: slug,
        type: 'article',
    });

    if (!item) {
        return (
            <DocsShell headings={[]}>
                <PageHeader
                    title="No such page"
                    lead={`There is no documentation page at ${slug}.`}
                    crumbs={[{ label: 'Docs', href: '/docs/introduction' }]}
                />
                <p>
                    Try the <Link to="/docs/introduction">introduction</Link> or search with{' '}
                    <kbd>Ctrl</kbd> + <kbd>K</kbd>.
                </p>
            </DocsShell>
        );
    }

    return (
        <DocsShell headings={state.headings}>
            <PageHeader
                title={item.title}
                lead={item.blurb}
                crumbs={[{ label: 'Docs', href: '/docs/introduction' }, { label: item.group }, { label: item.title }]}
                actions={
                    <>
                        <a
                            className="button small secondary"
                            href={editUrl(item.file)}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Edit this page
                        </a>
                        <Link className="button small secondary" to="/playground">
                            Open the playground
                        </Link>
                    </>
                }
            />

            {state.error && <p className="callout warning">{state.error}</p>}

            <Prose>
                {state.Content ? (
                    <state.Content components={mdxComponents} />
                ) : (
                    !state.error && <p>Loading…</p>
                )}
            </Prose>

            <PrevNext slug={slug} />
        </DocsShell>
    );
}