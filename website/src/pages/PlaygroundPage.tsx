import { Link, useSearchParams } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { xml } from '@codemirror/lang-xml';
import { useState } from 'react';
import { PageHeader } from '../components/docs/PageHeader';
import { OptionsLab } from '../components/demo/OptionsLab';
import { cloneSample, findSample } from '../content/samples';
import { useDebouncedValue } from '../lib/useDebouncedValue';
import { useDocumentMeta } from '../lib/useDocumentMeta';

/**
 * The playground: edit the SVG markup on the left, watch the engine redraw on
 * the right, then take away the generated code. Edits are debounced so the
 * drawing is rebuilt once you pause, not on every keystroke.
 */
export function PlaygroundPage() {
    const [params] = useSearchParams();
    const requested = params.get('sample');
    const initialId = requested && findSample(requested) ? requested : 'flowchart';

    const [markup, setMarkup] = useState(() => cloneSample(initialId));
    const debounced = useDebouncedValue(markup, 280);

    useDocumentMeta({
        title: 'Playground',
        description:
            'Edit SVG markup and drive the real @penwell/draw-on options: duration, type, reveal window, stroke. Scrub it and record it as WebM.',
        path: '/playground',
    });

    return (
        <main className="shell" style={{ paddingTop: 28, paddingBottom: 40 }}>
            <PageHeader
                eyebrow="Playground"
                title="Try it on your own SVG"
                lead="Paste any inline SVG, tune the options that the library actually accepts, and copy the generated code. Everything here runs the same engine that ships in the package."
                crumbs={[{ label: 'Home', href: '/' }, { label: 'Playground' }]}
                actions={
                    <>
                        <Link className="button small secondary" to="/examples">
                            Load a sample
                        </Link>
                        <Link className="button small secondary" to="/docs/api/drawing-options">
                            Read the options reference
                        </Link>
                    </>
                }
            />

            <div style={{ marginBottom: 18 }}>
                <div className="playground-panel">
                    <header>
                        <h3>SVG source</h3>
                        <span className="demo-status">{markup.length} characters</span>
                    </header>
                    <CodeMirror
                        value={markup}
                        height="320px"
                        extensions={[xml()]}
                        basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: false }}
                        onChange={(value) => setMarkup(value)}
                        aria-label="SVG markup"
                    />
                    <p className="playground-note">
                        Invalid markup shows an error next to the preview and keeps the last good
                        drawing. Try removing a closing tag to see it.
                    </p>
                </div>
            </div>

            <OptionsLab svg={debounced} onSvgChange={setMarkup} showSamples showCode />
        </main>
    );
}
