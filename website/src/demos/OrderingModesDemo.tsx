import { useEffect, useRef, useState } from 'react';
import { draw, parseSvg } from '@penwell/draw-on/core';
import type { DrawOnDrawing, DrawOptions } from '@penwell/draw-on/core';

/** Four separated boxes, so the order the strokes start in is obvious at a glance. */
const STEPS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 150">
  <rect x="20" y="40" width="120" height="70" rx="14" fill="#f4c95d" stroke="#27241a" stroke-width="3"/>
  <text x="80" y="82" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" fill="#27241a">1</text>
  <rect x="180" y="40" width="120" height="70" rx="14" fill="#a8d8ea" stroke="#27241a" stroke-width="3"/>
  <text x="240" y="82" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" fill="#27241a">2</text>
  <rect x="340" y="40" width="120" height="70" rx="14" fill="#7bc6a4" stroke="#27241a" stroke-width="3"/>
  <text x="400" y="82" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" fill="#27241a">3</text>
  <rect x="500" y="40" width="120" height="70" rx="14" fill="#e7efe8" stroke="#27241a" stroke-width="3"/>
  <text x="560" y="82" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" fill="#27241a">4</text>
</svg>`;

interface CellProps {
    label: string;
    note: string;
    options: DrawOptions;
    markup: string;
}

/** One ordering mode on its own stage, autoplaying on mount. */
function OrderingCell({ label, note, options, markup }: CellProps) {
    const hostRef = useRef<HTMLDivElement>(null);
    const drawingRef = useRef<DrawOnDrawing | null>(null);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return undefined;

        const svg = parseSvg(markup);
        svg.style.maxWidth = '100%';
        svg.style.height = 'auto';
        host.replaceChildren(svg);

        const drawing = draw(svg, { ...options, autoplay: true, reveal: 'none' });
        drawingRef.current = drawing;

        return () => {
            drawing.destroy();
            drawingRef.current = null;
        };
    }, [options, markup]);

    return (
        <>
            <div className="demo-stage" ref={hostRef} />
            <div className="demo-split-label" title={note}>
                {label}
            </div>
        </>
    );
}

/**
 * The five stroke orders side by side. `stagger` and `speed` are live because they
 * change the shape of the timeline rather than just its pacing.
 */
export function OrderingModesDemo() {
    const [stagger, setStagger] = useState(80);
    const [speed, setSpeed] = useState(400);

    const fixed = { duration: 2400, reveal: 'none' } as const;

    return (
        <>
            <div className="demo-split">
                <OrderingCell
                    label="oneByOne"
                    note="Back to back, each stroke given time proportional to its length."
                    options={{ ...fixed, type: 'oneByOne' }}
                    markup={STEPS}
                />
                <OrderingCell
                    label="delayed"
                    note="Cascade: every stroke lasts half the timeline, heavily overlapping."
                    options={{ ...fixed, type: 'delayed' }}
                    markup={STEPS}
                />
                <OrderingCell
                    label="sync"
                    note="Every stroke at once across the whole timeline."
                    options={{ ...fixed, type: 'sync' }}
                    markup={STEPS}
                />
                <OrderingCell
                    label={`stagger ${stagger}ms`}
                    note="Even gap between starts. The total grows with the gap."
                    options={{ ...fixed, type: 'stagger', stagger }}
                    markup={STEPS}
                />
                <OrderingCell
                    label={`speed ${speed}/s`}
                    note="Constant pen speed in user units per second. Duration is ignored."
                    options={{ type: 'speed', speed, reveal: 'none' }}
                    markup={STEPS}
                />
            </div>

            <div className="demo-foot">
                <div className="demo-controls">
                    <label className="demo-check">
                        <span>stagger</span>
                        <input
                            type="range"
                            min="0"
                            max="400"
                            step="20"
                            value={stagger}
                            aria-label="Gap between stroke starts in milliseconds"
                            onChange={(event) => setStagger(Number(event.target.value))}
                        />
                        <span className="demo-percent">{stagger}ms</span>
                    </label>
                    <label className="demo-check">
                        <span>speed</span>
                        <input
                            type="range"
                            min="60"
                            max="1200"
                            step="20"
                            value={speed}
                            aria-label="Pen speed in user units per second"
                            onChange={(event) => setSpeed(Number(event.target.value))}
                        />
                        <span className="demo-percent">{speed}/s</span>
                    </label>
                </div>
            </div>
        </>
    );
}