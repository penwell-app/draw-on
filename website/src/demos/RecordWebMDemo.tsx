import { useEffect, useRef, useState } from 'react';
import {
    canRecordVideo,
    computeDims,
    createDrawing,
    downloadBlob,
    parseSvg,
    recordDrawToWebM,
} from '@penwell/draw-on/core';
import type { Drawing } from '@penwell/draw-on/core';

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 240">
  <rect x="26" y="26" width="468" height="188" rx="16" fill="#fbfaf7" stroke="#e8e4db" stroke-width="2"/>
  <path d="M60 170 C140 60 220 190 300 100 C360 35 440 120 466 80"
        fill="none" stroke="#27241a" stroke-width="6" stroke-linecap="round"/>
  <circle cx="60" cy="170" r="11" fill="#f4c95d"/>
  <circle cx="466" cy="80" r="11" fill="#2f6a5c"/>
  <text x="260" y="204" text-anchor="middle" font-family="system-ui" font-size="14" fill="#625d50">recorded in the browser, no server</text>
</svg>`;

/**
 * WebM export: walk the progress from 0 to 1 while rasterising every frame onto
 * a canvas, then hand the resulting blob to the browser as a download.
 */
export function RecordWebMDemo() {
    const hostRef = useRef<HTMLDivElement>(null);
    const drawingRef = useRef<Drawing | null>(null);
    const [recording, setRecording] = useState(false);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState(
        canRecordVideo()
            ? 'This browser can record a canvas stream.'
            : 'This browser cannot record a canvas stream — try Chromium.',
    );

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return undefined;

        const svg = parseSvg(SVG);
        host.replaceChildren(svg);
        const drawing = createDrawing(svg, { duration: 240 });
        drawing.setProgress(0);
        drawingRef.current = drawing;

        return () => {
            drawing.destroy();
            drawingRef.current = null;
        };
    }, []);

    const record = async () => {
        const drawing = drawingRef.current;
        if (!drawing || !canRecordVideo()) return;

        setRecording(true);
        setProgress(0);

        try {
            const { width, height } = computeDims(drawing.el);
            const blob = await recordDrawToWebM(drawing.el, drawing.setProgress, {
                width,
                height,
                fps: 30,
                durationMs: 3000,
                holdMs: 700,
                background: '#fffdf7',
                onProgress: (fraction) => setProgress(fraction),
            });

            downloadBlob(blob, 'draw-on-demo.webm');
            setMessage(`Saved ${(blob.size / 1024).toFixed(0)} KB.`);
            drawing.reveal();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Recording failed.');
        } finally {
            setRecording(false);
        }
    };

    return (
        <>
            <div className="demo-stage" ref={hostRef} />
            <div className="demo-foot">
                <div className="demo-controls">
                    <button
                        type="button"
                        className="button small"
                        onClick={() => void record()}
                        disabled={recording || !canRecordVideo()}
                    >
                        {recording ? `Recording ${Math.round(progress * 100)}%` : 'Record WebM'}
                    </button>
                    <button
                        type="button"
                        className="button small secondary"
                        onClick={() => {
                            drawingRef.current?.stop();
                            drawingRef.current?.reset();
                            drawingRef.current?.play();
                        }}
                    >
                        Replay
                    </button>
                </div>
            </div>
            <div className="demo-note">{message}</div>
        </>
    );
}
