import { useCallback, useEffect, useRef, useState } from 'react';
import { downloadBlob } from '@penwell/draw-on/core';
import type { DrawingOptions } from '@penwell/draw-on/core';
import { findSample } from '../../content/samples';
import { DEMO_COMPONENTS, DEMO_SOURCES } from '../../demos';
import { useInView } from '../../lib/useInView';
import { useLiveDrawing } from '../../lib/useLiveDrawing';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { CodeBlock } from '../docs/CodeBlock';
import { DemoFrame } from './DemoFrame';
import { ProgressScrubber } from './ProgressScrubber';
import { RecordButton } from './RecordButton';

export interface LiveDemoProps {
    title: string;
    description?: string;
    /** Preset from `content/samples.ts`. */
    sampleId?: string;
    /** Inline markup instead of a preset. */
    svgMarkup?: string;
    /** Key into the demo registry (`src/demos/index.ts`). */
    sourceId?: string;
    options?: DrawingOptions;
    autoPlay?: boolean;
    /** Draw once when the demo scrolls into view. */
    autoPlayWhenInView?: boolean;
    /** Ignored when `sourceId` is set: those demos bring their own controls. */
    controls?: 'full' | 'replay' | 'none';
    /** Show the WebM export button when the browser supports it. */
    record?: boolean;
    /** Stage min-height in pixels. Ignored when `sourceId` is set. */
    height?: number;
    wide?: boolean;
}

/**
 * One live drawing with the controls that matter: replay, scrubbing and — where
 * the browser allows it — a WebM export.
 *
 * Two modes:
 * - `sourceId` renders that demo component for real and prints its own source
 *   underneath, so the code on a page is the code that ran.
 * - `sampleId` / `svgMarkup` renders a generic engine view with the standard
 *   control bar, which is what the API pages need.
 */
export function LiveDemo(props: LiveDemoProps) {
    const { sourceId } = props;

    if (sourceId && DEMO_COMPONENTS[sourceId]) {
        return <DemoWithSource {...props} sourceId={sourceId} />;
    }

    return <EngineDemo {...props} />;
}

function DemoWithSource({ title, description, sourceId, wide }: LiveDemoProps & { sourceId: string }) {
    const Demo = DEMO_COMPONENTS[sourceId];
    const source = DEMO_SOURCES[sourceId];

    return (
        <>
            <DemoFrame
                title={title}
                description={description}
                raw
                className={wide ? 'wide' : undefined}
            >
                <Demo />
            </DemoFrame>

            {source && (
                <details className="demo-source">
                    <summary style={{ padding: '10px 18px', cursor: 'pointer' }}>
                        {source.filename} — the real component behind this demo
                    </summary>
                    <CodeBlock code={source.code} filename={source.filename} language="tsx" />
                </details>
            )}
        </>
    );
}


function EngineDemo({
    title,
    description,
    sampleId,
    svgMarkup,
    options,
    autoPlay = true,
    autoPlayWhenInView = false,
    controls = 'full',
    record = false,
    height,
    wide,
}: LiveDemoProps) {
    const sample = sampleId ? findSample(sampleId) : undefined;
    const markup = svgMarkup ?? sample?.svg ?? '';
    const mergedOptions: DrawingOptions = { ...sample?.recommended, ...options };
    const reducedMotion = useReducedMotion();
    const shouldAutoPlay = autoPlay && !reducedMotion;

    const [live, hostRef] = useLiveDrawing({
        svgMarkup: markup,
        options: mergedOptions,
        autoPlay: shouldAutoPlay,
    });
    const inView = useInView(hostRef);
    const playedOnce = useRef(false);

    const [recording, setRecording] = useState(false);
    const [recordProgress, setRecordProgress] = useState(0);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!autoPlayWhenInView || !inView || playedOnce.current) return;
        playedOnce.current = true;
        live.play();
    }, [autoPlayWhenInView, inView, live]);

    const handleRecord = useCallback(async () => {
        setRecording(true);
        setRecordProgress(0);
        setMessage('Rendering frames to WebM…');
        try {
            const blob = await live.record({
                onProgress: (fraction: number) => setRecordProgress(fraction),
            });
            downloadBlob(blob, `${sampleId ?? 'draw-on'}.webm`);
            setMessage(`Saved ${(blob.size / 1024).toFixed(0)} KB of WebM.`);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Recording failed.');
        } finally {
            setRecording(false);
        }
    }, [live, sampleId]);

    const footer =
        controls === 'none' ? undefined : (
            <div className="demo-controls">
                <button type="button" className="button small" onClick={live.play}>
                    Replay
                </button>

                {controls === 'full' && (
                    <button type="button" className="button small secondary" onClick={live.reset}>
                        Reset
                    </button>
                )}

                {controls === 'full' && (
                    <ProgressScrubber
                        value={live.progress}
                        onChange={live.scrub}
                        label={`${title} progress`}
                    />
                )}

                {record && (
                    <RecordButton
                        canRecord={live.canRecord}
                        recording={recording}
                        progress={recordProgress}
                        onRecord={() => void handleRecord()}
                    />
                )}
            </div>
        );

    return (
        <DemoFrame
            title={title}
            description={description}
            status={live.status}
            actions={
                <button type="button" className="button small" onClick={live.play}>
                    Draw
                </button>
            }
            footer={footer}
            note={live.error ? <p className="demo-error">{live.error}</p> : message || undefined}
            height={height}
            className={wide ? 'wide' : undefined}
        >
            <div ref={hostRef} />
        </DemoFrame>
    );
}
