import { LiveDemo } from '../components/demo/LiveDemo';

/**
 * The whole recipe in one component: replay the preset, scrub through it and
 * export it as WebM. Nothing here is site-specific — this is the library.
 */
export function BasicStrokesDemo() {
    return (
        <LiveDemo
            title="hello-strokes.svg"
            description="A stroke, two fills and a label, drawn by the real engine."
            sampleId="hello-strokes"
        />
    );
}
