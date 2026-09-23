import { Link } from 'react-router-dom';
import { PageHeader } from '../components/docs/PageHeader';
import { SampleExplorer } from '../components/demo/SampleExplorer';
import { useDocumentMeta } from '../lib/useDocumentMeta';

/** Gallery of ready-to-use SVGs — each one drawn by the engine that ships. */
export function ExamplesPage() {
    useDocumentMeta({
        title: 'Examples',
        description:
            'Ready-to-use SVG examples for @penwell/draw-on: flowcharts, notebooks, annotations, mind maps, sequence diagrams, dark canvases and pure stroke art.',
        path: '/examples',
    });

    return (
        <main className="shell" style={{ paddingTop: 28, paddingBottom: 40 }}>
            <PageHeader
                eyebrow="Examples"
                title="Pick a shape, get the code"
                lead="Every card below draws when it scrolls into view. Copy the SVG, the React version or the vanilla version, or send the sample straight to the playground."
                crumbs={[{ label: 'Home', href: '/' }, { label: 'Examples' }]}
                actions={
                    <>
                        <Link className="button small" to="/playground">
                            Open the playground
                        </Link>
                        <Link className="button small secondary" to="/docs/guides/preparing-svgs">
                            Preparing your own SVG
                        </Link>
                    </>
                }
            />

            <SampleExplorer />
        </main>
    );
}
