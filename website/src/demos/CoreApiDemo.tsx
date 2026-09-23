import { useEffect, useRef, useState } from 'react';
import { createDrawing, parseSvg } from '@penwell/draw-on/core';
import type { Drawing } from '@penwell/draw-on/core';

/** A compact diagram: filled boxes, connectors and a caption. */
const DIAGRAM = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 260">
  <rect x="28" y="96" width="150" height="70" rx="14" fill="#f4c95d" stroke="#27241a" stroke-width="3"/>
  <text x="103" y="140" text-anchor="middle" font-family="system-ui" font-size="17" fill="#27241a">parse</text>
  <path d="M178 131 H286" fill="none" stroke="#27241a" stroke-width="3" stroke-linecap="round"/>
  <rect x="286" y="96" width="150" height="70" rx="14" fill="#a8d8ea" stroke="#27241a" stroke-width="3"/>
  <text x="361" y="140" text-anchor="middle" font-family="system-ui" font-size="17" fill="#27241a">draw</text>
  <path d="M436 131 H544" fill="none" stroke="#27241a" stroke-width="3" stroke-linecap="round"/>
  <rect x="544" y="96" width="70" height="70" rx="14" fill="#7bc6a4" stroke="#27241a" stroke-width="3"/>
  <text x="579" y="140" text-anchor="middle" font-family="system-ui" font-size="15" fill="#27241a">play</text>
</svg>`;

/**
 * The framework-agnostic core API: parse the markup, hand the element to
 * createDrawing, then drive it with play() and setProgress().
 */
export function CoreApiDemo() {
    const hostRef = useRef<HTMLDivElement>(null);
    const drawingRef = useRef<Drawing | null>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return undefined;

        const svg = parseSvg(DIAGRAM);
        host.replaceChildren(svg);

        const drawing = createDrawing(svg, { duration: 240, revealStart: 0.5 });
        drawingRef.current = drawing;
        drawing.setProgress(0);
        drawing.play(() => setProgress(1));

        return () => {
            drawing.destroy();
            drawingRef.current = null;
        };
    }, []);

    const replay = () => {
        const drawing = drawingRef.current;
        if (!drawing) return;
        drawing.stop();
        drawing.reset();
        setProgress(0);
        drawing.play(() => setProgress(1));
    };

    const scrub = (value: number) => {
        drawingRef.current?.setProgress(value);
        setProgress(value);
    };

    return (
        <>
            <div className="demo-stage" ref={hostRef} />
            <div className="demo-foot">
                <div className="demo-controls">
                    <button type="button" className="button small" onClick={replay}>
                        Replay
                    </button>
                    <input
                        className="demo-scrub"
                        type="range"
                        min="0"
                        max="1"
                        step="0.001"
                        value={progress}
                        aria-label="Animation progress"
                        onChange={(event) => scrub(Number(event.target.value))}
                    />
                    <span className="demo-percent">{Math.round(progress * 100)}%</span>
                </div>
            </div>
        </>
    );
}
