import { useEffect, useRef, useState } from 'react';
import { draw, parseSvg, scrollScrub } from '@penwell/draw-on/core';
import type { DrawOnDrawing } from '@penwell/draw-on/core';

const CHART = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 220">
  <path d="M40 180 H612" stroke="#27241a" stroke-width="3" stroke-linecap="round"/>
  <path d="M40 180 V30" stroke="#27241a" stroke-width="3" stroke-linecap="round"/>
  <path d="M40 150 C120 150 140 96 200 96 C260 96 280 44 340 44 C400 44 420 118 480 118
           C540 118 560 78 612 78"
        fill="none" stroke="#2f6a5c" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M40 162 C140 162 200 150 260 150 C340 150 400 128 470 128 C540 128 570 112 612 112"
        fill="none" stroke="#f4c95d" stroke-width="3.5" stroke-linecap="round"/>
  <text x="40" y="206" font-family="ui-monospace, monospace" font-size="13" fill="#625d50">
    scroll the page
  </text>
</svg>`;

/**
 * `scrollScrub` pauses the drawing and ties progress to where the target sits in
 * the viewport, so this one has no play button on purpose. `start` and `end` are
 * viewport fractions: the range between them is how much scrolling it takes.
 */
export function ScrollScrubV1Demo() {
    const hostRef = useRef<HTMLDivElement>(null);
    const drawingRef = useRef<DrawOnDrawing | null>(null);
    const [start, setStart] = useState(0.95);
    const [end, setEnd] = useState(0.25);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return undefined;

        const svg = parseSvg(CHART);
        svg.style.maxWidth = '100%';
        svg.style.height = 'auto';
        host.replaceChildren(svg);

        const drawing = draw(svg, { duration: 3000, autoplay: false, reveal: 'none' });
        drawingRef.current = drawing;
        const off = drawing.on('progress', (value) => setProgress(value));

        const stop = scrollScrub(drawing, { start, end });

        return () => {
            stop();
            off();
            drawing.destroy();
            drawingRef.current = null;
        };
    }, [start, end]);

    return (
        <>
            <div className="demo-stage tall" ref={hostRef} style={{ minHeight: 460 }} />

            <div className="demo-foot">
                <div className="demo-controls">
                    <label className="demo-check">
                        <span>start</span>
                        <input
                            type="range"
                            min="0.4"
                            max="1"
                            step="0.05"
                            value={start}
                            aria-label="Viewport fraction where progress is zero"
                            onChange={(event) => setStart(Number(event.target.value))}
                        />
                        <span className="demo-percent">{start.toFixed(2)}</span>
                    </label>
                    <label className="demo-check">
                        <span>end</span>
                        <input
                            type="range"
                            min="0"
                            max="0.8"
                            step="0.05"
                            value={end}
                            aria-label="Viewport fraction where progress is one"
                            onChange={(event) => setEnd(Number(event.target.value))}
                        />
                        <span className="demo-percent">{end.toFixed(2)}</span>
                    </label>
                    <span className="demo-percent">{Math.round(progress * 100)}%</span>
                </div>
            </div>
        </>
    );
}