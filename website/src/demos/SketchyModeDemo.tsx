import { useEffect, useRef, useState } from 'react';
import { draw, parseSvg } from '@penwell/draw-on/core';
import type { DrawOnDrawing } from '@penwell/draw-on/core';

/** One of each drawable shape, so the wobble can be judged on curves and corners alike. */
const SHAPES = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150">
  <circle cx="58" cy="66" r="40" fill="#f4c95d" stroke="#27241a" stroke-width="3"/>
  <rect x="118" y="28" width="76" height="76" rx="10" fill="#a8d8ea" stroke="#27241a" stroke-width="3"/>
  <path d="M232 44 L268 96 L196 96 Z" fill="#7bc6a4" stroke="#27241a" stroke-width="3"
        stroke-linejoin="round"/>
</svg>`;

interface SideProps {
    label: string;
    sketchy: boolean | { roughness: number; seed: number; step: number };
}

function SketchySide({ label, sketchy }: SideProps) {
    const hostRef = useRef<HTMLDivElement>(null);
    const drawingRef = useRef<DrawOnDrawing | null>(null);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return undefined;

        const svg = parseSvg(SHAPES);
        svg.style.maxWidth = '100%';
        svg.style.height = 'auto';
        host.replaceChildren(svg);

        const drawing = draw(svg, {
            duration: 1800,
            autoplay: true,
            reveal: 'none',
            sketchy,
        });
        drawingRef.current = drawing;

        return () => {
            drawing.destroy();
            drawingRef.current = null;
        };
    }, [sketchy]);

    return (
        <>
            <div className="demo-stage" ref={hostRef} />
            <div className="demo-split-label">
                <span>{label}</span>{' '}
                <button type="button" className="button ghost small" onClick={() => drawingRef.current?.restart()}>
                    Replay
                </button>
            </div>
        </>
    );
}

/**
 * `sketchy` resamples each shape along its outline and jitters the samples with a
 * seeded PRNG, so the same seed always produces the same wobble. Change the seed
 * and a different wobble is drawn; change it back and the first one returns.
 */
export function SketchyModeDemo() {
    const [on, setOn] = useState(true);
    const [roughness, setRoughness] = useState(1.2);
    const [seed, setSeed] = useState(1);
    const [step, setStep] = useState(6);

    return (
        <>
            <div className="demo-split">
                <SketchySide label="off" sketchy={false} />
                <SketchySide
                    label={on ? `on, seed ${seed}` : 'on'}
                    sketchy={on ? { roughness, seed, step } : false}
                />
            </div>

            <div className="demo-foot">
                <div className="demo-controls">
                    <label className="demo-check">
                        <input
                            type="checkbox"
                            checked={on}
                            onChange={(event) => setOn(event.target.checked)}
                        />
                        sketchy
                    </label>

                    <label className="demo-check">
                        <span>roughness</span>
                        <input
                            type="range"
                            min="0"
                            max="6"
                            step="0.2"
                            value={roughness}
                            aria-label="Maximum jitter in user units"
                            onChange={(event) => setRoughness(Number(event.target.value))}
                        />
                        <span className="demo-percent">{roughness.toFixed(1)}</span>
                    </label>

                    <label className="demo-check">
                        <span>seed</span>
                        <input
                            type="range"
                            min="1"
                            max="12"
                            step="1"
                            value={seed}
                            aria-label="Wobble seed"
                            onChange={(event) => setSeed(Number(event.target.value))}
                        />
                        <span className="demo-percent">{seed}</span>
                    </label>

                    <label className="demo-check">
                        <span>step</span>
                        <input
                            type="range"
                            min="1"
                            max="16"
                            step="1"
                            value={step}
                            aria-label="Sample spacing along each path"
                            onChange={(event) => setStep(Number(event.target.value))}
                        />
                        <span className="demo-percent">{step}</span>
                    </label>
                </div>
            </div>
        </>
    );
}