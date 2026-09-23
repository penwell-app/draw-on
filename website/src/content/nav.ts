import type { ComponentType } from 'react';
import { DOC_HEADINGS } from 'virtual:draw-on-headings';
import type { Heading } from '../lib/headings';

export type DocGroup = 'Getting started' | 'Guides' | 'Recipes' | 'Reference' | 'More';

export interface NavItem {
    /** Route path, e.g. `/docs/guides/react`. */
    slug: string;
    title: string;
    /** One-line summary: used by search, cards and page headers. */
    blurb: string;
    group: DocGroup;
    /** Path relative to `src/content/docs`, e.g. `guides/react.mdx`. */
    file: string;
}

export interface NavSection {
    group: DocGroup;
    items: NavItem[];
}

export type DocModule = {
    default: ComponentType<Record<string, unknown>>;
};

const modules = import.meta.glob('./docs/**/*.mdx') as Record<string, () => Promise<DocModule>>;

const toKey = (file: string) => `./docs/${file}`;

export const NAV: NavSection[] = [
    {
        group: 'Getting started',
        items: [
            {
                slug: '/docs/introduction',
                title: 'Introduction',
                blurb: 'What Draw-On does, the problem it solves and the mental model behind it.',
                group: 'Getting started',
                file: 'introduction.mdx',
            },
            {
                slug: '/docs/installation',
                title: 'Installation',
                blurb: 'Install the package, pick an entry point and confirm your build setup.',
                group: 'Getting started',
                file: 'installation.mdx',
            },
            {
                slug: '/docs/quickstart',
                title: 'Quickstart',
                blurb: 'Draw your first SVG in about sixty seconds, with React or vanilla JS.',
                group: 'Getting started',
                file: 'quickstart.mdx',
            },
            {
                slug: '/docs/how-it-works',
                title: 'How it works',
                blurb: 'The pipeline: stroke synthesis, path forming, hide, reveal and scrubbing.',
                group: 'Getting started',
                file: 'how-it-works.mdx',
            },
        ],
    },
    {
        group: 'Guides',
        items: [
            {
                slug: '/docs/guides/react',
                title: 'Using with React',
                blurb: 'The hook, the component, autoplay on view, SSR and reduced motion.',
                group: 'Guides',
                file: 'guides/react.mdx',
            },
            {
                slug: '/docs/guides/vanilla',
                title: 'Vanilla JS and TypeScript',
                blurb: 'Drive the engine directly without a framework, including teardown.',
                group: 'Guides',
                file: 'guides/vanilla.mdx',
            },
            {
                slug: '/docs/guides/scrubbing',
                title: 'Scrubbing and scroll',
                blurb: 'setProgress for sliders, scroll-linked draws and timeline control.',
                group: 'Guides',
                file: 'guides/scrubbing.mdx',
            },
            {
                slug: '/docs/guides/recording',
                title: 'Recording to WebM',
                blurb: 'Export the animation to video in the browser, and what to watch out for.',
                group: 'Guides',
                file: 'guides/recording.mdx',
            },
        ],
    },
    {
        group: 'Recipes',
        items: [
            {
                slug: '/docs/guides/mermaid',
                title: 'Mermaid diagrams',
                blurb: 'Render Mermaid at runtime and hand the output straight to Draw-On.',
                group: 'Recipes',
                file: 'guides/mermaid.mdx',
            },
            {
                slug: '/docs/guides/excalidraw',
                title: 'Excalidraw and tldraw',
                blurb: 'Animating hand-drawn exports that mix strokes, fills and text.',
                group: 'Recipes',
                file: 'guides/excalidraw.mdx',
            },
            {
                slug: '/docs/guides/figma-and-handwriting',
                title: 'Figma, notebooks and handwriting',
                blurb: 'Design exports, notebook pages and signature-style reveals.',
                group: 'Recipes',
                file: 'guides/figma-and-handwriting.mdx',
            },
            {
                slug: '/docs/guides/preparing-svgs',
                title: 'Preparing your SVGs',
                blurb: 'viewBox, inline styles, ids, filters, text and accessibility.',
                group: 'Recipes',
                file: 'guides/preparing-svgs.mdx',
            },
        ],
    },
    {
        group: 'Reference',
        items: [
            {
                slug: '/docs/api/create-drawing',
                title: 'createDrawing',
                blurb: 'The engine entry point and the drawing handle it returns.',
                group: 'Reference',
                file: 'api/create-drawing.mdx',
            },
            {
                slug: '/docs/api/drawing-options',
                title: 'DrawingOptions',
                blurb: 'Every option, its default, and a live lab for tuning them.',
                group: 'Reference',
                file: 'api/drawing-options.mdx',
            },
            {
                slug: '/docs/api/use-sketch-draw',
                title: 'useSketchDraw',
                blurb: 'The React hook: options, returned API and lifecycle notes.',
                group: 'Reference',
                file: 'api/use-sketch-draw.mdx',
            },
            {
                slug: '/docs/api/sketch-draw',
                title: 'SketchDraw',
                blurb: 'The unstyled component and its render-prop for controls.',
                group: 'Reference',
                file: 'api/sketch-draw.mdx',
            },
            {
                slug: '/docs/api/parse-svg',
                title: 'parseSvg',
                blurb: 'Markup in, document-owned SVG element out, plus InvalidSvgError.',
                group: 'Reference',
                file: 'api/parse-svg.mdx',
            },
            {
                slug: '/docs/api/compute-dims',
                title: 'computeDims',
                blurb: 'Intrinsic size with aspect ratio preserved, capped for video.',
                group: 'Reference',
                file: 'api/compute-dims.mdx',
            },
            {
                slug: '/docs/api/record',
                title: 'Recording API',
                blurb: 'canRecordVideo, recordDrawToWebM, downloadBlob and RecordOptions.',
                group: 'Reference',
                file: 'api/record.mdx',
            },
            {
                slug: '/docs/api/constants',
                title: 'Constants and helpers',
                blurb: 'Selectors, default ink values and the isPaint predicate.',
                group: 'Reference',
                file: 'api/constants.mdx',
            },
            {
                slug: '/docs/api/types',
                title: 'Type reference',
                blurb: 'Every exported type, what it means and where it is used.',
                group: 'Reference',
                file: 'api/types.mdx',
            },
        ],
    },
    {
        group: 'More',
        items: [
            {
                slug: '/docs/faq',
                title: 'Troubleshooting',
                blurb: 'Invisible shapes, empty recordings, SSR crashes and other surprises.',
                group: 'More',
                file: 'faq.mdx',
            },
            {
                slug: '/docs/vivus-comparison',
                title: 'Draw-On vs Vivus',
                blurb: 'What the library adds on top of Vivus, and when to use either.',
                group: 'More',
                file: 'vivus-comparison.mdx',
            },
            {
                slug: '/docs/browser-support',
                title: 'Browser support',
                blurb: 'Drawing everywhere; recording on Chromium-first engines.',
                group: 'More',
                file: 'browser-support.mdx',
            },
            {
                slug: '/docs/contributing',
                title: 'Contributing',
                blurb: 'Local setup, checks to run and what makes a good pull request.',
                group: 'More',
                file: 'contributing.mdx',
            },
            {
                slug: '/docs/changelog',
                title: 'Changelog',
                blurb: 'Released versions of @penwell/draw-on.',
                group: 'More',
                file: 'changelog.mdx',
            },
        ],
    },
];

export const FLAT_NAV: NavItem[] = NAV.flatMap((section) => section.items);

export const DOC_FILES: string[] = Object.keys(modules).map((path) => path.replace('./docs/', ''));

export function findDoc(slug: string): NavItem | undefined {
    return FLAT_NAV.find((item) => item.slug === slug);
}

export function hasDocModule(file: string): boolean {
    return Boolean(modules[toKey(file)]);
}

/** Headings for a page, extracted from its markdown at build time. */
export function docHeadings(file: string): Heading[] {
    return DOC_HEADINGS[file] ?? [];
}

export function neighbours(slug: string): { prev?: NavItem; next?: NavItem } {
    const index = FLAT_NAV.findIndex((item) => item.slug === slug);
    if (index === -1) return {};
    return {
        prev: index > 0 ? FLAT_NAV[index - 1] : undefined,
        next: index < FLAT_NAV.length - 1 ? FLAT_NAV[index + 1] : undefined,
    };
}

export async function loadDoc(slug: string): Promise<DocModule> {
    const item = findDoc(slug);
    if (!item) throw new Error(`Unknown docs route: ${slug}`);

    const loader = modules[toKey(item.file)];
    if (!loader) throw new Error(`No MDX module found for ${item.file}`);
    return loader();
}

export function editUrl(file: string): string {
    return `https://github.com/penwell-app/draw-on/blob/master/website/src/content/docs/${file}`;
}

