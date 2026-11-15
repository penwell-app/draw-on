import { useEffect, useRef, useState } from 'react';
import { downloadBlob, draw, parseSvg, recordFrames } from '@penwell/draw-on/core';
import type { DrawOnDrawing } from '@penwell/draw-on/core';

const SCENE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 220">
  <path d="M40 178 H604" stroke="#27241a" stroke-width="3" stroke-linecap="round"/>
  <path d="M40 178 V28" stroke="#27241a" stroke-width="3" stroke-linecap="round"/>
  <path d="M40 148 C130 148 150 84 220 84 C290 84 310 122 380 122 C450 122 470 56 540 56
           C570 56 590 44 604 40"
        fill="none" stroke="#2f6a5c" stroke-width="5" stroke-linecap="round"/>
  <circle cx="220" cy="84" r="11" fill="#f4c95d" stroke="#27241a" stroke-width="2.5"/>
  <circle cx="380" cy="122" r="11" fill="#a8d8ea" stroke="#27241a" stroke-width="2.5"/>
  <text x="40" y="206" font-family="ui-monospace, monospace" font-size="13" fill="#625d50">
        recordFrames renders faster than real time
  </text>
</svg>`;

const FPS = 30;
const DURATION_MS = 1000;

/**
 * `recordFrames` returns one PNG per step with no wall-clock pacing, so a short
 * clip is the honest thing to render in a browser tab. Every frame is offered as
 * a thumbnail you can save on its own.
 */
interface RenderedFrame {
    blob: Blob;
    url: string;
}

export function RecordFramesDemo() {
    const hostRef = useRef<HTMLDivElement>(null);
    const drawingRef = useRef<DrawOnDrawing | null>(null);

    const [frames, setFrames] = useState<RenderedFrame[]>([]);
    const [progress, setProgress] = useState(0);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    // Object URLs are owned by state so rendering never touches a ref, and so
    // the previous batch can be revoked the moment a new one replaces it.
    useEffect(
        () => () => {
            setFrames((current) => {
                current.forEach((frame) => URL.revokeObjectURL(frame.url));
                return [];
            });
        },
        [],
    );

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return undefined;

        const svg = parseSvg(SCENE);
        svg.style.maxWidth = '100%';
        svg.style.height = 'auto';
        host.replaceChildren(svg);

        const drawing = draw(svg, { duration: 3000, autoplay: false, reveal: 'none' });
        drawingRef.current = drawing;
        drawing.seek(0);

        return () => {
            drawing.destroy();
            drawingRef.current = null;
        };
    }, []);

    const record = async () => {
        const drawing = drawingRef.current;
        if (!drawing) return;

        setBusy(true);
        setError('');
        setProgress(0);

        try {
            const blobs = await recordFrames(drawing.el, drawing.setProgress, {
                width: 640,
                height: 220,
                fps: FPS,
                durationMs: DURATION_MS,
                background: 'transparent',
                onProgress: (value) => setProgress(value),
            });

            setFrames((previous) => {
                previous.forEach((frame) => URL.revokeObjectURL(frame.url));
                return blobs.map((blob) => ({ blob, url: URL.createObjectURL(blob) }));
            });
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Recording failed.');
        } finally {
            drawing.seek(1);
            setBusy(false);
        }
    };

    const totalKb = frames.reduce((sum, frame) => sum + frame.blob.size, 0);

    return (
        <>
            <div className="demo-stage" ref={hostRef} />

            <div className="demo-foot">
                <div className="demo-controls">
                    <button
                        type="button"
                        className="button small"
                        disabled={busy}
                        onClick={() => void record()}
                    >
                        {busy ? `Rendering ${Math.round(progress * 100)}%` : 'Render PNG frames'}
                    </button>
                    <span className="demo-percent">
                        {frames.length > 0
                            ? `${frames.length} frames, ${Math.round(totalKb / 1024)} KB total`
                            : `${FPS} fps for ${DURATION_MS}ms gives ${FPS + 1} frames`}
                    </span>
                </div>
            </div>

            {error ? <p className="demo-error">{error}</p> : null}

            {frames.length > 0 ? (
                <div className="demo-frames" role="group" aria-label="Rendered PNG frames">
                    {frames.map((frame, index) => (
                        <button
                            key={`${index}-${frame.blob.size}`}
                            type="button"
                            className="demo-frame"
                            title={`Save frame ${index + 1} (${Math.round(frame.blob.size / 1024)} KB)`}
                            onClick={() => downloadBlob(frame.blob, `draw-on-frame-${index + 1}.png`)}
                        >
                            <img src={frame.url} alt={`Frame ${index + 1}`} />
                            <span>{index + 1}</span>
                        </button>
                    ))}
                </div>
            ) : null}

            {!frames.length && !busy ? (
                <p className="demo-note">
                    Frame rendering needs only a canvas, so it works in more browsers than WebM
                    capture, which additionally requires <code>MediaRecorder</code>.
                </p>
            ) : null}
        </>
    );
}