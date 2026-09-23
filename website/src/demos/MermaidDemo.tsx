import { useEffect, useState } from 'react';
import { useSketchDraw } from '@penwell/draw-on';

const DEFINITION = `flowchart LR
  A[Upload] --> B[Parse]
  B --> C[Notebook]
  C --> D[Share]`;

/**
 * Mermaid renders at runtime, then its SVG output is handed straight to
 * `useSketchDraw`. Mermaid is imported lazily so it only loads on this page.
 */
export function MermaidDemo() {
    const [markup, setMarkup] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        const render = async () => {
            try {
                const mermaid = (await import('mermaid')).default;
                mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
                const { svg } = await mermaid.render('draw-on-mermaid-demo', DEFINITION);
                if (!cancelled) setMarkup(svg);
            } catch (cause) {
                if (!cancelled) {
                    setError(cause instanceof Error ? cause.message : 'Mermaid failed to render.');
                }
            }
        };

        void render();
        return () => {
            cancelled = true;
        };
    }, []);

    if (error) return <p className="demo-error">Mermaid said: {error}</p>;
    if (!markup) return <p className="playground-note">Rendering the diagram with Mermaid…</p>;

    return <AnimatedMermaid svgMarkup={markup} />;
}

function AnimatedMermaid({ svgMarkup }: { svgMarkup: string }) {
    const { containerRef, status, play } = useSketchDraw({
        svgMarkup,
        duration: 280,
        revealStart: 0.5,
    });

    return (
        <>
            <div className="demo-stage" ref={containerRef} />
            <div className="demo-foot">
                <div className="demo-controls">
                    <button type="button" className="button small" onClick={play}>
                        {status === 'drawing' ? 'Drawing…' : 'Replay'}
                    </button>
                    <span className="demo-percent">{status}</span>
                </div>
            </div>
        </>
    );
}
