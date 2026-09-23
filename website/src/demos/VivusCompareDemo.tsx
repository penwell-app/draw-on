import { useEffect, useRef } from 'react';
import Vivus from 'vivus';
import { createDrawing, parseSvg } from '@penwell/draw-on/core';
import type { Drawing } from '@penwell/draw-on/core';

/** Filled shapes plus text - the case where plain Vivus leaves things behind. */
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 220">
  <rect x="26" y="28" width="150" height="66" rx="12" fill="#f4c95d"/>
  <text x="101" y="68" text-anchor="middle" font-family="system-ui" font-size="15" fill="#27241a">filled box</text>
  <path d="M176 61 H286" fill="none" stroke="#27241a" stroke-width="3" stroke-linecap="round"/>
  <rect x="286" y="28" width="108" height="66" rx="12" fill="#a8d8ea"/>
  <text x="340" y="68" text-anchor="middle" font-family="system-ui" font-size="15" fill="#27241a">label</text>
  <path d="M40 170 C120 120 200 200 280 150 C330 120 360 145 390 132"
        fill="none" stroke="#27241a" stroke-width="4" stroke-linecap="round"/>
</svg>`;

/**
 * The same SVG animated by Vivus on the left and by Draw-On on the right.
 * Vivus only knows about strokes, so the filled boxes and labels are already
 * there; Draw-On outlines the fills first, then fades them in.
 */
export function VivusCompareDemo() {
    const vivusHostRef = useRef<HTMLDivElement>(null);
    const drawOnHostRef = useRef<HTMLDivElement>(null);
    const vivusRef = useRef<Vivus | null>(null);
    const drawingRef = useRef<Drawing | null>(null);

    useEffect(() => {
        const vivusHost = vivusHostRef.current;
        const drawOnHost = drawOnHostRef.current;
        if (!vivusHost || !drawOnHost) return undefined;

        const vivusSvg = parseSvg(SVG);
        vivusHost.replaceChildren(vivusSvg);
        const vivus = new Vivus(vivusSvg as unknown as HTMLElement, {
            duration: 200,
            type: 'oneByOne',
            start: 'manual',
        });
        vivusRef.current = vivus;

        const drawOnSvg = parseSvg(SVG);
        drawOnHost.replaceChildren(drawOnSvg);
        const drawing = createDrawing(drawOnSvg, { duration: 200 });
        drawingRef.current = drawing;

        vivus.play();
        drawing.play();

        return () => {
            vivus.destroy();
            drawing.destroy();
            vivusRef.current = null;
            drawingRef.current = null;
        };
    }, []);

    const replay = () => {
        vivusRef.current?.stop();
        vivusRef.current?.reset();
        vivusRef.current?.play();
        drawingRef.current?.stop();
        drawingRef.current?.reset();
        drawingRef.current?.play();
    };

    return (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 18 }}>
                <figure style={{ margin: 0 }}>
                    <div className="demo-stage" style={{ minHeight: 170 }} ref={vivusHostRef} />
                    <figcaption className="demo-percent" style={{ textAlign: 'center' }}>
                        Vivus only
                    </figcaption>
                </figure>
                <figure style={{ margin: 0 }}>
                    <div className="demo-stage" style={{ minHeight: 170 }} ref={drawOnHostRef} />
                    <figcaption className="demo-percent" style={{ textAlign: 'center' }}>
                        @penwell/draw-on
                    </figcaption>
                </figure>
            </div>
            <div className="demo-foot">
                <div className="demo-controls">
                    <button type="button" className="button small" onClick={replay}>
                        Replay both
                    </button>
                </div>
            </div>
        </>
    );
}
