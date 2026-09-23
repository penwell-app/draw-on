import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mdx from '@mdx-js/rollup';
import rehypeShiki from '@shikijs/rehype';
import react from '@vitejs/plugin-react';
import remarkGfm from 'remark-gfm';
import { defineConfig } from 'vite';
import type { Plugin, PluginOption } from 'vite';
import { extractHeadings } from './src/lib/headings.ts';

const root = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(fs.readFileSync(path.resolve(root, '../package.json'), 'utf8')) as {
    version: string;
};

/**
 * The site imports the library straight from `../src` so the docs, the demos and
 * the playground always reflect the working tree instead of a published build.
 */
export const drawOnAlias = {
    '@penwell/draw-on/core': path.resolve(root, '../src/core/index.ts'),
    '@penwell/draw-on': path.resolve(root, '../src/index.ts'),
};

/**
 * The library source is outside this workspace, so Node's upward lookup would
 * find the monorepo root's React (18.x) instead of the site's (19.x) — two React
 * copies, and hook errors in the browser. Pin both to this package's copies.
 */
export const externalDepsAlias = {
    react: path.resolve(root, 'node_modules/react'),
    'react-dom': path.resolve(root, 'node_modules/react-dom'),
    vivus: path.resolve(root, 'node_modules/vivus'),
};

const DOCS_DIR = path.resolve(root, 'src/content/docs');
const HEADINGS_MODULE = 'virtual:draw-on-headings';
const RESOLVED_HEADINGS_MODULE = `\0${HEADINGS_MODULE}`;

function listMdxFiles(dir: string): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return listMdxFiles(full);
        return entry.name.endsWith('.mdx') ? [full] : [];
    });
}

/**
 * Serves `virtual:draw-on-headings`, a map of every documentation page's
 * h2/h3 headings. The doc shell reads it for the table of contents, which is the
 * one thing that cannot come from the compiled MDX, and doing it here keeps the
 * parsing out of the browser bundle.
 */
export const headingsPlugin: Plugin = {
    name: 'draw-on-doc-headings',
    resolveId(id) {
        return id === HEADINGS_MODULE ? RESOLVED_HEADINGS_MODULE : null;
    },
    load(id) {
        if (id !== RESOLVED_HEADINGS_MODULE) return null;

        const map: Record<string, unknown> = {};
        for (const file of listMdxFiles(DOCS_DIR)) {
            this.addWatchFile(file);
            const key = path.relative(DOCS_DIR, file).split(path.sep).join('/');
            map[key] = extractHeadings(fs.readFileSync(file, 'utf8'));
        }

        return `export const DOC_HEADINGS = ${JSON.stringify(map)};`;
    },
};

/**
 * MDX with GitHub-flavoured markdown and build-time Shiki highlighting. Shared
 * with `vitest.config.ts` so tests compile the real pages.
 */
export const mdxPlugin: PluginOption = {
    enforce: 'pre',
    ...mdx({
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
            [
                rehypeShiki,
                {
                    theme: 'one-dark-pro',
                    fallbackLanguage: 'text',
                },
            ],
        ],
    }),
};

export default defineConfig({
    plugins: [mdxPlugin, headingsPlugin, react({ include: /\.(mdx|js|jsx|ts|tsx)$/ })],
    resolve: {
        alias: { ...drawOnAlias, ...externalDepsAlias },
        dedupe: ['react', 'react-dom'],
    },
    define: {
        __DRAW_ON_VERSION__: JSON.stringify(pkg.version),
    },
    server: {
        port: 5180,
        strictPort: false,
    },
    preview: {
        port: 4180,
        strictPort: false,
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
        chunkSizeWarningLimit: 900,
    },
});

