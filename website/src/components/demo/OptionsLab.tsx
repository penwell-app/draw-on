import { useCallback, useMemo, useState } from 'react';
import { downloadBlob } from '@penwell/draw-on/core';
import { SAMPLES, cloneSample, findSample } from '../../content/samples';
import {
    DEFAULT_PLAYGROUND_OPTIONS,
    toComponentSnippet,
    toCoreSnippet,
    toHookSnippet,
    toRecordSnippet,
} from '../../lib/codegen';
import type { PlaygroundOptions } from '../../lib/codegen';
import { useLiveDrawing } from '../../lib/useLiveDrawing';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { CodeTabs } from '../docs/CodeTabs';
import { ProgressScrubber } from './ProgressScrubber';
import { RecordButton } from './RecordButton';
import { OptionsPanel } from './OptionsPanel';
import { SamplePicker } from './SamplePicker';

export interface OptionsLabProps {
    /** Controlled markup — the playground feeds the editor buffer in here. */
    svg?: string;
    onSvgChange?: (markup: string) => void;
    initialSampleId?: string;
    showSamples?: boolean;
    showCode?: boolean;
    height?: number;
}

/**
 * The heart of the playground: pick or paste markup, turn the real option knobs,
 * watch the engine re-draw, scrub, export the clip, and take the generated code.
 */
export function OptionsLab({
    svg,
    onSvgChange,
    initialSampleId = SAMPLES[1]?.id ?? SAMPLES[0].id,
    showSamples = true,
    showCode = true,
    height = 320,
}: OptionsLabProps) {
    const [sampleId, setSampleId] = useState(initialSampleId);
    const [localSvg, setLocalSvg] = useState(() => cloneSample(initialSampleId));
    const [options, setOptions] = useState<PlaygroundOptions>(DEFAULT_PLAYGROUND_OPTIONS);
    const [recording, setRecording] = useState(false);
    const [recordProgress, setRecordProgress] = useState(0);
    const [message, setMessage] = useState('');
    const reducedMotion = useReducedMotion();

    const markup = svg ?? localSvg;

    const updateMarkup = useCallback(
        (next: string) => {
            if (onSvgChange) onSvgChange(next);
            else setLocalSvg(next);
        },
        [onSvgChange],
    );

    const pickSample = useCallback(
        (id: string) => {
            setSampleId(id);
            updateMarkup(cloneSample(id));
            const recommended = findSample(id)?.recommended;
            if (recommended) setOptions((previous) => ({ ...previous, ...recommended }));
        },
        [updateMarkup],
    );

    const [live, hostRef] = useLiveDrawing({
        svgMarkup: markup,
        options,
        autoPlay: !reducedMotion,
    });

    const snippets = useMemo(() => {
        const input = { svgMarkup: markup, options };
        return [
            { id: 'core', label: 'Vanilla', code: toCoreSnippet(input), language: 'ts' },
            { id: 'hook', label: 'React hook', code: toHookSnippet(input), language: 'tsx' },
            { id: 'component', label: 'Component', code: toComponentSnippet(input), language: 'tsx' },
            { id: 'record', label: 'Record', code: toRecordSnippet(input), language: 'ts' },
        ];
    }, [markup, options]);

    const handleRecord = useCallback(async () => {
        setRecording(true);
        setRecordProgress(0);
        setMessage('Rendering frames to WebM…');
        try {
            const blob = await live.record({
                onProgress: (fraction: number) => setRecordProgress(fraction),
            });
            downloadBlob(blob, 'draw-on-playground.webm');
            setMessage(`Saved ${(blob.size / 1024).toFixed(0)} KB of WebM.`);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Recording failed.');
        } finally {
            setRecording(false);
        }
    }, [live]);

    return (
        <div className="playground">
            <section className="playground-panel">
                <header>
                    <h3>Preview</h3>
                    <span className="demo-status">{live.status}</span>
                </header>

                <div className="demo-stage" style={{ minHeight: height }} ref={hostRef} />

                {live.error && <p className="demo-error">{live.error}</p>}

                <div className="demo-foot">
                    <div className="demo-controls">
                        <button type="button" className="button small" onClick={live.play}>
                            Replay
                        </button>
                        <button
                            type="button"
                            className="button small secondary"
                            onClick={live.reset}
                        >
                            Reset
                        </button>
                        <ProgressScrubber value={live.progress} onChange={live.scrub} />
                        <RecordButton
                            canRecord={live.canRecord}
                            recording={recording}
                            progress={recordProgress}
                            onRecord={() => void handleRecord()}
                        />
                    </div>
                </div>

                {message && <p className="playground-note">{message}</p>}

                {showSamples && <SamplePicker value={sampleId} onChange={pickSample} />}
                <OptionsPanel
                    value={options}
                    onChange={(next) => setOptions((previous) => ({ ...previous, ...next }))}
                />
            </section>

            {showCode && (
                <section className="playground-panel">
                    <header>
                        <h3>Generated code</h3>
                    </header>
                    <CodeTabs tabs={snippets} defaultTab="hook" />
                    <p className="playground-note">
                        Generated from the current SVG and options. The preview runs the same engine
                        from <code>src/</code>.
                    </p>
                </section>
            )}
        </div>
    );
}
