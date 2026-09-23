import { Link } from 'react-router-dom';
import type { SampleDef } from '../../content/samples';
import { SAMPLES } from '../../content/samples';
import { toCoreSnippet, toHookSnippet, DEFAULT_PLAYGROUND_OPTIONS } from '../../lib/codegen';
import { useLiveDrawing } from '../../lib/useLiveDrawing';
import { useInView } from '../../lib/useInView';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { useCopyToClipboard } from '../../lib/useCopyToClipboard';
import { useEffect, useRef } from 'react';

function SampleCard({ sample }: { sample: SampleDef }) {
    const reducedMotion = useReducedMotion();
    const options = { ...DEFAULT_PLAYGROUND_OPTIONS, ...sample.recommended };
    const [live, hostRef] = useLiveDrawing({
        svgMarkup: sample.svg,
        options,
        autoPlay: false,
    });
    const inView = useInView(hostRef);
    const drawn = useRef(false);
    const { copied, copy } = useCopyToClipboard();

    useEffect(() => {
        if (!inView || drawn.current || reducedMotion) return;
        drawn.current = true;
        live.play();
    }, [inView, reducedMotion, live]);

    const hookCode = toHookSnippet({ svgMarkup: sample.svg, options });
    const coreCode = toCoreSnippet({ svgMarkup: sample.svg, options });

    return (
        <article className="sample-card">
            <div className="demo-stage">
                <div ref={hostRef} />
            </div>

            <div className="sample-card-body">
                <h3>{sample.title}</h3>
                <p>{sample.description}</p>

                <div className="sample-tags">
                    {sample.source && <span className="chip">{sample.source}</span>}
                    {sample.tags.map((tag) => (
                        <span className="chip" key={tag}>
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="sample-actions">
                    <button type="button" className="button small" onClick={live.play}>
                        Draw
                    </button>
                    <button
                        type="button"
                        className="button small secondary"
                        onClick={() => void copy(hookCode)}
                    >
                        {copied ? 'Copied' : 'Copy React'}
                    </button>
                    <button
                        type="button"
                        className="button small secondary"
                        onClick={() => void copy(coreCode)}
                    >
                        Copy vanilla
                    </button>
                    <button
                        type="button"
                        className="button small ghost"
                        onClick={() => void copy(sample.svg)}
                    >
                        Copy SVG
                    </button>
                    <Link className="button small secondary" to={`/playground?sample=${sample.id}`}>
                        Open in playground
                    </Link>
                </div>
            </div>
        </article>
    );
}

export interface SampleExplorerProps {
    /** Limit to specific sample ids. */
    ids?: string[];
}

/** Gallery of ready-to-paste SVGs, each one drawn with the real engine. */
export function SampleExplorer({ ids }: SampleExplorerProps) {
    const samples = ids ? SAMPLES.filter((sample) => ids.includes(sample.id)) : SAMPLES;

    return (
        <div className="sample-grid">
            {samples.map((sample) => (
                <SampleCard key={sample.id} sample={sample} />
            ))}
        </div>
    );
}
