import { defineConfig } from 'vitest/config';
import { drawOnAlias, headingsPlugin, mdxPlugin, reactAlias } from './vite.config.ts';

export default defineConfig({
    plugins: [mdxPlugin, headingsPlugin],
    resolve: {
        alias: { ...drawOnAlias, ...reactAlias },
        dedupe: ['react', 'react-dom'],
    },
    define: {
        __DRAW_ON_VERSION__: JSON.stringify('0.0.0-test'),
    },
    test: {
        environment: 'jsdom',
        globals: true,
        include: ['src/tests/**/*.test.ts'],
        setupFiles: ['src/tests/setup.ts'],
    },
});
