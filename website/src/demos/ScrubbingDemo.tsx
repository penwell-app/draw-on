import { useEffect, useRef, useState } from 'react';
import { createDrawing, parseSvg } from '@penwell/draw-on/core';
import type { Drawing } from '@penwell/draw-on/core';

const STOPS = [0, 0.25, 0.5, 0.75, 1];

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 200">
  <path d="M40 150 C120 40 200 180 280 90 C340 25 420 80 480 50"
        fill="none" stroke="#27241a" stroke-width="6" stroke-linecap="round"/>
  <circle cx="40" cy="150" r="10" fill="#f4c95d"/>
  <circle cx="480" cy="50" r="10" fill="#2f6a5c"/>
</svg>`;

/**
 * Scrubbing: the animation is a function of progress, so a slider, a timeline
 * or a scroll position can all drive it with `setProgress(0..1)`.
 */
export function ScrubbingDemo() {
    const hostRef = useRef<HTMLDivElement>(null);
    const drawingRef = useRef<Drawing | null>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return undefined;

        const svg = parseSvg(SVG);
        host.replaceChildren(svg);
        const drawing = createDrawing(svg, { duration: 220 });
        drawing.setProgress(0);
        drawingRef.current = drawing;

        return () => {
            drawing.destroy();
            drawingRef.current = null;
        };
    }, []);

    const goTo = (value: number) => {
        drawingRef.current?.setProgress(value);
        setProgress(value);
    };

    return (
        <>
            <div className="demo-stage" ref={hostRef} />
            <div className="demo-foot">
                <div className="demo-controls">
                    {STOPS.map((stop) => (
                        <button
                            key={stop}
                            type="button"
                            className={`button small${progress === stop ? '' : ' secondary'}`}
                            onClick={() => goTo(stop)}
                        >
                            {Math.round(stop * 100)}%
                        </button>
                    ))}
                    <input
                        className="demo-scrub"
                        type="range"
                        min="0"
                        max="1"
                        step="0.001"
                        value={progress}
                        aria-label="Animation progress"
                        onChange={(event) => goTo(Number(event.target.value))}
                    />
                </div>
            </div>
        </>
    );
}
