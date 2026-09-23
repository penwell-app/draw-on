import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { SiteHeader } from './components/layout/SiteHeader';
import { SiteFooter } from './components/layout/SiteFooter';
import { LandingPage } from './pages/LandingPage';
import { DocPage } from './pages/DocPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Heavy routes (CodeMirror, Mermaid) load only when visited.
const PlaygroundPage = lazy(() =>
    import('./pages/PlaygroundPage').then((module) => ({ default: module.PlaygroundPage })),
);
const ExamplesPage = lazy(() =>
    import('./pages/ExamplesPage').then((module) => ({ default: module.ExamplesPage })),
);

function RouteFallback() {
    return <p style={{ padding: '48px 24px' }}>Loading…</p>;
}

export function App() {
    return (
        <>
            <a className="skip-link" href="#content">
                Skip to content
            </a>

            <SiteHeader />

            <Suspense fallback={<RouteFallback />}>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/playground" element={<PlaygroundPage />} />
                    <Route path="/examples" element={<ExamplesPage />} />
                    <Route path="/docs/*" element={<DocPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>

            <SiteFooter />
        </>
    );
}
