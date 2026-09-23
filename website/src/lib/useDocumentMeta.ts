import { useEffect } from 'react';

const SITE_NAME = 'Draw-On';
const SITE_URL = 'https://draw-on-nu.vercel.app/';

export interface DocumentMeta {
    title: string;
    description: string;
    /** Route path, used for the canonical URL. */
    path: string;
    type?: 'website' | 'article';
}

function upsertMeta(selector: string, attrs: Record<string, string>) {
    let el = document.head.querySelector<HTMLMetaElement>(selector);
    if (!el) {
        el = document.createElement('meta');
        document.head.appendChild(el);
    }
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
}

function upsertLink(rel: string, href: string) {
    let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!el) {
        el = document.createElement('link');
        el.rel = rel;
        document.head.appendChild(el);
    }
    el.href = href;
}

/** Keeps <title>, description, canonical and OG tags in sync with the route. */
export function useDocumentMeta({ title, description, path, type = 'website' }: DocumentMeta) {
    useEffect(() => {
        const fullTitle = title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`;
        const url = `${SITE_URL}${path}`;

        document.title = fullTitle;
        upsertMeta('meta[name="description"]', { name: 'description', content: description });
        upsertMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle });
        upsertMeta('meta[property="og:description"]', {
            property: 'og:description',
            content: description,
        });
        upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type });
        upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url });
        upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle });
        upsertMeta('meta[name="twitter:description"]', {
            name: 'twitter:description',
            content: description,
        });
        upsertLink('canonical', url);
    }, [title, description, path, type]);
}
