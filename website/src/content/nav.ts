import type { ComponentType } from 'react';
import { DOC_HEADINGS } from 'virtual:draw-on-headings';
import type { Heading } from '../lib/headings';

export type DocGroup =
    | 'Draw-On 1.0'
    | 'Draw-On 1.0 Reference'
    | 'Getting started (0.1.x)'
    | 'Guides (0.1.x)'
    | 'Recipes (0.1.x)'
    | 'Reference (0.1.x)'
    | 'More (0.1.x)';

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
        group: 'Draw-On 1.0',
        items: [
            {
                slug: '/docs/v1/start-here',
                title: 'Start here (1.0)',
                blurb: 'What changed in 1.0 and where every new capability is documented.',
                group: 'Draw-On 1.0',
                file: 'v1/start-here.mdx',
            },
            {
                slug: '/docs/v1/migration',
                title: 'Migrating from 0.1.x',
                blurb: 'Every rename, every signature change, and the three that are lossy.',
                group: 'Draw-On 1.0',
                file: 'v1/migration.mdx',
            },
            {
                slug: '/docs/v1/quickstart',
                title: 'Quickstart (1.0)',
                blurb: 'draw() and <DrawOn> in about sixty seconds, with a live example.',
                group: 'Draw-On 1.0',
                file: 'v1/quickstart.mdx',
            },
            {
                slug: '/docs/v1/installation',
                title: 'Installation (1.0)',
                blurb: 'Zero dependencies, four entry points and what each one exports.',
                group: 'Draw-On 1.0',
                file: 'v1/installation.mdx',
            },
            {
                slug: '/docs/v1/ordering',
                title: 'Ordering and timing',
                blurb: 'The five stroke orders, data-draw-order, data-draw-skip and delay.',
                group: 'Draw-On 1.0',
                file: 'v1/ordering.mdx',
            },
            {
                slug: '/docs/v1/pen',
                title: 'The pen nib',
                blurb: 'A nib that rides the stroke tip, with your own element or the default.',
                group: 'Draw-On 1.0',
                file: 'v1/pen.mdx',
            },
            {
                slug: '/docs/v1/sketchy',
                title: 'Hand-drawn mode',
                blurb: 'sketchy redraws shapes with a seeded wobble that never repeats differently.',
                group: 'Draw-On 1.0',
                file: 'v1/sketchy.mdx',
            },
            {
                slug: '/docs/v1/sprites',
                title: 'Sprites and <use>',
                blurb: 'Icons and symbols from <symbol>, <use> and page-level <defs> blocks.',
                group: 'Draw-On 1.0',
                file: 'v1/sprites.mdx',
            },
        ],
    },
    {
        group: 'Draw-On 1.0 Reference',
        items: [
            {
                slug: '/docs/api-v1/draw',
                title: 'draw()',
                blurb: 'The engine entry point, its returned handle, events and stats.',
                group: 'Draw-On 1.0 Reference',
                file: 'api-v1/draw.mdx',
            },
            {
                slug: '/docs/api-v1/draw-options',
                title: 'DrawOptions',
                blurb: 'All twenty-three options, their defaults, and labs for tuning them.',
                group: 'Draw-On 1.0 Reference',
                file: 'api-v1/draw-options.mdx',
            },
            {
                slug: '/docs/api-v1/presets',
                title: 'presets',
                blurb: 'Five tuned bundles for diagrams, icons, logos, signatures and sketches.',
                group: 'Draw-On 1.0 Reference',
                file: 'api-v1/presets.mdx',
            },
            {
                slug: '/docs/api-v1/react',
                title: 'useDrawOn and <DrawOn>',
                blurb: 'The hook, the component, triggers, controlled progress and the ref handle.',
                group: 'Draw-On 1.0 Reference',
                file: 'api-v1/react.mdx',
            },
            {
                slug: '/docs/api-v1/element',
                title: '<draw-on> element',
                blurb: 'The Web Component: attributes, methods and the four events it fires.',
                group: 'Draw-On 1.0 Reference',
                file: 'api-v1/element.mdx',
            },
            {
                slug: '/docs/api-v1/to-animated-svg',
                title: 'toAnimatedSVG',
                blurb: 'Bake the animation into a standalone CSS-only SVG for READMEs and email.',
                group: 'Draw-On 1.0 Reference',
                file: 'api-v1/to-animated-svg.mdx',
            },
            {
                slug: '/docs/api-v1/scroll',
                title: 'scrollScrub and inView',
                blurb: 'Tie progress to scroll position, or play once on entry, then clean up.',
                group: 'Draw-On 1.0 Reference',
                file: 'api-v1/scroll.mdx',
            },
            {
                slug: '/docs/api-v1/mount',
                title: 'mount, loadSvg, sanitizeSvg',
                blurb: 'Put an SVG on the page from a URL, markup or element, and sanitise it.',
                group: 'Draw-On 1.0 Reference',
                file: 'api-v1/mount.mdx',
            },
            {
                slug: '/docs/api-v1/record',
                title: 'Recording (1.0)',
                blurb: 'recordDrawToWebM and the new recordFrames, with scale and inlineImages.',
                group: 'Draw-On 1.0 Reference',
                file: 'api-v1/record.mdx',
            },
            {
                slug: '/docs/api-v1/types',
                title: 'Type reference (1.0)',
                blurb: 'Every v1 type, and why Drawing means the 0.1.x shape.',
                group: 'Draw-On 1.0 Reference',
                file: 'api-v1/types.mdx',
            },
        ],
    },
    {
        group: 'Getting started (0.1.x)',
        items: [
            {
                slug: '/docs/introduction',
                title: 'Introduction',
                blurb: 'What Draw-On does, the problem it solves and the mental model behind it.',
                group: 'Getting started (0.1.x)',
                file: 'introduction.mdx',
            },
            {
                slug: '/docs/installation',
                title: 'Installation',
                blurb: 'Install the package, pick an entry point and confirm your build setup.',
                group: 'Getting started (0.1.x)',
                file: 'installation.mdx',
            },
            {
                slug: '/docs/quickstart',
                title: 'Quickstart',
                blurb: 'Draw your first SVG in about sixty seconds, with React or vanilla JS.',
                group: 'Getting started (0.1.x)',
                file: 'quickstart.mdx',
            },
            {
                slug: '/docs/how-it-works',
                title: 'How it works',
                blurb: 'The pipeline: stroke synthesis, path forming, hide, reveal and scrubbing.',
                group: 'Getting started (0.1.x)',
                file: 'how-it-works.mdx',
            },
        ],
    },
    {
        group: 'Guides (0.1.x)',
        items: [
            {
                slug: '/docs/guides/react',
                title: 'Using with React',
                blurb: 'The hook, the component, autoplay on view, SSR and reduced motion.',
                group: 'Guides (0.1.x)',
                file: 'guides/react.mdx',
            },
            {
                slug: '/docs/guides/vanilla',
                title: 'Vanilla JS and TypeScript',
                blurb: 'Drive the engine directly without a framework, including teardown.',
                group: 'Guides (0.1.x)',
                file: 'guides/vanilla.mdx',
            },
            {
                slug: '/docs/guides/scrubbing',
                title: 'Scrubbing and scroll',
                blurb: 'setProgress for sliders, scroll-linked draws and timeline control.',
                group: 'Guides (0.1.x)',
                file: 'guides/scrubbing.mdx',
            },
            {
                slug: '/docs/guides/recording',
                title: 'Recording to WebM',
                blurb: 'Export the animation to video in the browser, and what to watch out for.',
                group: 'Guides (0.1.x)',
                file: 'guides/recording.mdx',
            },
        ],
    },
    {
        group: 'Recipes (0.1.x)',
        items: [
            {
                slug: '/docs/guides/mermaid',
                title: 'Mermaid diagrams',
                blurb: 'Render Mermaid at runtime and hand the output straight to Draw-On.',
                group: 'Recipes (0.1.x)',
                file: 'guides/mermaid.mdx',
            },
            {
                slug: '/docs/guides/excalidraw',
                title: 'Excalidraw and tldraw',
                blurb: 'Animating hand-drawn exports that mix strokes, fills and text.',
                group: 'Recipes (0.1.x)',
                file: 'guides/excalidraw.mdx',
            },
            {
                slug: '/docs/guides/figma-and-handwriting',
                title: 'Figma, notebooks and handwriting',
                blurb: 'Design exports, notebook pages and signature-style reveals.',
                group: 'Recipes (0.1.x)',
                file: 'guides/figma-and-handwriting.mdx',
            },
            {
                slug: '/docs/guides/preparing-svgs',
                title: 'Preparing your SVGs',
                blurb: 'viewBox, inline styles, ids, filters, text and accessibility.',
                group: 'Recipes (0.1.x)',
                file: 'guides/preparing-svgs.mdx',
            },
        ],
    },
    {
        group: 'Reference (0.1.x)',
        items: [
            {
                slug: '/docs/api/create-drawing',
                title: 'createDrawing',
                blurb: 'The engine entry point and the drawing handle it returns.',
                group: 'Reference (0.1.x)',
                file: 'api/create-drawing.mdx',
            },
            {
                slug: '/docs/api/drawing-options',
                title: 'DrawingOptions',
                blurb: 'Every option, its default, and a live lab for tuning them.',
                group: 'Reference (0.1.x)',
                file: 'api/drawing-options.mdx',
            },
            {
                slug: '/docs/api/use-sketch-draw',
                title: 'useSketchDraw',
                blurb: 'The React hook: options, returned API and lifecycle notes.',
                group: 'Reference (0.1.x)',
                file: 'api/use-sketch-draw.mdx',
            },
            {
                slug: '/docs/api/sketch-draw',
                title: 'SketchDraw',
                blurb: 'The unstyled component and its render-prop for controls.',
                group: 'Reference (0.1.x)',
                file: 'api/sketch-draw.mdx',
            },
            {
                slug: '/docs/api/parse-svg',
                title: 'parseSvg',
                blurb: 'Markup in, document-owned SVG element out, plus InvalidSvgError.',
                group: 'Reference (0.1.x)',
                file: 'api/parse-svg.mdx',
            },
            {
                slug: '/docs/api/compute-dims',
                title: 'computeDims',
                blurb: 'Intrinsic size with aspect ratio preserved, capped for video.',
                group: 'Reference (0.1.x)',
                file: 'api/compute-dims.mdx',
            },
            {
                slug: '/docs/api/record',
                title: 'Recording API',
                blurb: 'canRecordVideo, recordDrawToWebM, downloadBlob and RecordOptions.',
                group: 'Reference (0.1.x)',
                file: 'api/record.mdx',
            },
            {
                slug: '/docs/api/constants',
                title: 'Constants and helpers',
                blurb: 'Selectors, default ink values and the isPaint predicate.',
                group: 'Reference (0.1.x)',
                file: 'api/constants.mdx',
            },
            {
                slug: '/docs/api/types',
                title: 'Type reference',
                blurb: 'Every exported type, what it means and where it is used.',
                group: 'Reference (0.1.x)',
                file: 'api/types.mdx',
            },
        ],
    },
    {
        group: 'More (0.1.x)',
        items: [
            {
                slug: '/docs/faq',
                title: 'Troubleshooting',
                blurb: 'Invisible shapes, empty recordings, SSR crashes and other surprises.',
                group: 'More (0.1.x)',
                file: 'faq.mdx',
            },
            {
                slug: '/docs/vivus-comparison',
                title: 'Draw-On vs Vivus',
                blurb: 'What the library adds on top of Vivus, and when to use either.',
                group: 'More (0.1.x)',
                file: 'vivus-comparison.mdx',
            },
            {
                slug: '/docs/browser-support',
                title: 'Browser support',
                blurb: 'Drawing everywhere; recording on Chromium-first engines.',
                group: 'More (0.1.x)',
                file: 'browser-support.mdx',
            },
            {
                slug: '/docs/contributing',
                title: 'Contributing',
                blurb: 'Local setup, checks to run and what makes a good pull request.',
                group: 'More (0.1.x)',
                file: 'contributing.mdx',
            },
            {
                slug: '/docs/changelog',
                title: 'Changelog',
                blurb: 'Released versions of @penwell/draw-on.',
                group: 'More (0.1.x)',
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

