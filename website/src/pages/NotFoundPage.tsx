import { Link } from 'react-router-dom';
import { PageHeader } from '../components/docs/PageHeader';
import { useDocumentMeta } from '../lib/useDocumentMeta';

export function NotFoundPage() {
    useDocumentMeta({
        title: 'Page not found',
        description: 'That page does not exist on the Draw-On documentation site.',
        path: '/404',
    });

    return (
        <main className="shell" style={{ paddingTop: 28, paddingBottom: 40 }}>
            <PageHeader
                eyebrow="404"
                title="That page has not been drawn yet"
                lead="The link you followed does not exist. The sidebar, the examples and the playground are all one click away."
            />
            <div className="card-grid">
                <Link className="card" to="/docs/introduction">
                    <span className="card-tag">Docs</span>
                    <h3>Introduction</h3>
                    <p>Start from the beginning: what Draw-On does and how it works.</p>
                </Link>
                <Link className="card" to="/playground">
                    <span className="card-tag">Playground</span>
                    <h3>Try it live</h3>
                    <p>Paste an SVG, tune the options, copy the generated code.</p>
                </Link>
                <Link className="card" to="/examples">
                    <span className="card-tag">Examples</span>
                    <h3>Sample gallery</h3>
                    <p>Flowcharts, notebooks, annotations and more, ready to paste.</p>
                </Link>
            </div>
        </main>
    );
}
