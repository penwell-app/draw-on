import { useCallback, useEffect, useRef, useState } from 'react';
import { draw, easings, parseSvg } from '@penwell/draw-on/core';
import type { DrawOnDrawing, EasingName } from '@penwell/draw-on/core';

/** A zigzag with equal-length legs, so a change in pacing reads as a change in shape. */
const TRACE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 110">
  <path d="M18 92 L70 20 L122 92 L174 20 L226 92 L282 20"
        fill="none" stroke="#27241a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M18 92 L70 92 L122 92" fill="none" stroke="#2f6a5c" stroke-width="3"
        stroke-dasharray="6 6"/>
</svg>`;

/** Smoothstep. Deliberately not one of the eight named curves. */
const smoothstep = (t: number) => t * t * (3 - 2 * t);

const NAMES = Object.keys(easings) as EasingName[];

interface CellProps {
    label: string;
    ease: EasingName | ((t: number) => number);
    strokeEase?: EasingName;
    markup: string;
}

function EasingCell({ label, ease, strokeEase, markup }: CellProps) {
    const hostRef = useRef<HTMLDivElement>(null);
    const drawingRef = useRef<DrawOnDrawing | null>(null);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return undefined;

        const svg = parseSvg(markup);
        svg.style.maxWidth = '100%';
        svg.style.height = 'auto';
        host.replaceChildren(svg);

        const drawing = draw(svg, {
            duration: 2000,
            autoplay: true,
            reveal: 'none',
            ease,
            strokeEase,
        });
        drawingRef.current = drawing;

        return () => {
            drawing.destroy();
            drawingRef.current = null;
        };
    }, [ease, strokeEase, markup]);

    const replay = () => {
        drawingRef.current?.restart();
    };

    return (
        <>
            <div className="demo-stage" ref={hostRef} />
            <div className="demo-split-label">
                <span>{label}</span>{' '}
                <button type="button" className="button ghost small" onClick={replay}>
                    Replay
                </button>
            </div>
        </>
    );
}

/**
 * The eight named curves plus a custom function, and the split between the global
 * `ease` (which shapes the whole timeline) and the per-stroke `strokeEase`.
 */
export function EasingLabDemo() {
    const [ease, setEase] = useState<EasingName>('easeOutCubic');
    const [strokeEase, setStrokeEase] = useState<EasingName>('linear');
    const hostRef = useRef<HTMLDivElement>(null);
    const drawingRef = useRef<DrawOnDrawing | null>(null);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return undefined;

        const svg = parseSvg(TRACE);
        svg.style.maxWidth = '100%';
        svg.style.height = 'auto';
        host.replaceChildren(svg);

        const drawing = draw(svg, {
            duration: 2000,
            autoplay: false,
            reveal: 'none',
            ease,
            strokeEase,
        });
        drawingRef.current = drawing;
        drawing.seek(0);

        return () => {
            drawing.destroy();
            drawingRef.current = null;
        };
    }, [ease, strokeEase]);

    const play = useCallback(() => {
        void drawingRef.current?.restart();
    }, []);

    return (
        <>
            <div className="demo-split">
                {NAMES.map((name) => (
                    <EasingCell key={name} label={name} ease={name} markup={TRACE} />
                ))}
                <EasingCell label="custom fn" ease={smoothstep} markup={TRACE} />
            </div>

            <div className="demo-stage" ref={hostRef} />

            <div className="demo-foot">
                <div className="demo-controls">
                    <label className="demo-check">
                        <span>ease</span>
                        <select
                            value={ease}
                            aria-label="Global easing"
                            onChange={(event) => setEase(event.target.value as EasingName)}
                        >
                            {NAMES.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="demo-check">
                        <span>strokeEase</span>
                        <select
                            value={strokeEase}
                            aria-label="Per-stroke easing"
                            onChange={(event) => setStrokeEase(event.target.value as EasingName)}
                        >
                            {NAMES.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <button type="button" className="button small" onClick={play}>
                        Draw it
                    </button>
                </div>
            </div>
        </>
    );
}