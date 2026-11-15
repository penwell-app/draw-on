import { useEffect, useRef, useState } from 'react';
import { draw, parseSvg } from '@penwell/draw-on/core';
import type { DrawOnDrawing } from '@penwell/draw-on/core';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** A long looping flourish, so there is always a stroke for the nib to ride. */
const HANDWRITING = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 200">
  <path d="M60 140 C90 70 140 60 156 100 C170 134 140 152 128 134
           C116 116 150 78 186 86 C220 94 214 138 196 152
           C180 164 176 146 186 132 C204 108 244 86 268 98
           C290 109 284 140 270 152
           M320 60 C400 40 470 90 560 70"
        fill="none" stroke="#27241a" stroke-width="5" stroke-linecap="round"
        stroke-linejoin="round"/>
  <path d="M60 168 H580" stroke="#e8e4db" stroke-width="2" fill="none"/>
</svg>`;

const COLOURS = [
    { value: '#27241a', label: 'ink' },
    { value: '#2f6a5c', label: 'green' },
    { value: '#f4c95d', label: 'gold' },
];

type NibShape = 'dot' | 'wedge';

/** A wedge nib, drawn around 0,0 so the engine only has to translate it. */
function createWedge(fill: string): SVGElement {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', 'M0 -11 L7 6 L0 2 L-7 6 Z');
    path.setAttribute('fill', fill);
    return path;
}

/**
 * `pen` rides the tip of whichever stroke is mid-draw. It only follows strokes it
 * can dash, so a nib handed a custom element is translated but never rotated.
 */
export function PenNibDemo() {
    const hostRef = useRef<HTMLDivElement>(null);
    const drawingRef = useRef<DrawOnDrawing | null>(null);

    const [enabled, setEnabled] = useState(true);
    const [radius, setRadius] = useState(3);
    const [colour, setColour] = useState('#27241a');
    const [shape, setShape] = useState<NibShape>('dot');

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return undefined;

        const svg = parseSvg(HANDWRITING);
        svg.style.maxWidth = '100%';
        svg.style.height = 'auto';
        host.replaceChildren(svg);

        const nib = shape === 'wedge' ? createWedge(colour) : undefined;

        const drawing = draw(svg, {
            type: 'speed',
            speed: 520,
            reveal: 'none',
            autoplay: false,
            pen: enabled ? { radius, color: colour, element: nib } : false,
        });
        drawingRef.current = drawing;
        drawing.seek(0);

        return () => {
            drawing.destroy();
            drawingRef.current = null;
        };
    }, [enabled, radius, colour, shape]);

    return (
        <>
            <div className="demo-stage" ref={hostRef} />

            <div className="demo-foot">
                <div className="demo-controls">
                    <button type="button" className="button small" onClick={() => drawingRef.current?.restart()}>
                        Draw it
                    </button>

                    <label className="demo-check">
                        <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(event) => setEnabled(event.target.checked)}
                        />
                        pen
                    </label>

                    <label className="demo-check">
                        <span>nib</span>
                        <select
                            value={shape}
                            aria-label="Nib shape"
                            onChange={(event) => setShape(event.target.value as NibShape)}
                        >
                            <option value="dot">default circle</option>
                            <option value="wedge">custom element</option>
                        </select>
                    </label>

                    <label className="demo-check">
                        <span>radius</span>
                        <input
                            type="range"
                            min="1"
                            max="12"
                            step="1"
                            value={radius}
                            aria-label="Nib radius"
                            onChange={(event) => setRadius(Number(event.target.value))}
                        />
                        <span className="demo-percent">{radius}</span>
                    </label>

                    <label className="demo-check">
                        <span>colour</span>
                        <select
                            value={colour}
                            aria-label="Nib colour"
                            onChange={(event) => setColour(event.target.value)}
                        >
                            {COLOURS.map((entry) => (
                                <option key={entry.value} value={entry.value}>
                                    {entry.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>
        </>
    );
}