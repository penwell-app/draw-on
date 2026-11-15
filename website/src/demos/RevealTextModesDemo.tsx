import { useEffect, useRef, useState } from 'react';
import { draw, parseSvg } from '@penwell/draw-on/core';
import type { DrawOnDrawing, DrawOptions, RevealMode, TextMode } from '@penwell/draw-on/core';

/** Filled boxes with labels, so both the fill reveal and the label reveal show. */
const PANELS = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 120">
  <rect x="16" y="26" width="120" height="66" rx="14" fill="#f4c95d" stroke="#27241a" stroke-width="3"/>
  <text x="76" y="65" text-anchor="middle" font-family="system-ui, sans-serif" font-size="15"
        font-weight="700" fill="#27241a">fill</text>

  <rect x="164" y="26" width="120" height="66" rx="14" fill="#7bc6a4" stroke="#27241a" stroke-width="3"/>
  <text x="224" y="65" text-anchor="middle" font-family="system-ui, sans-serif" font-size="15"
        font-weight="700" fill="#27241a">label</text>
</svg>`;

interface CellProps {
    label: string;
    note: string;
    options: DrawOptions;
}

function RevealCell({ label, note, options }: CellProps) {
    const hostRef = useRef<HTMLDivElement>(null);
    const drawingRef = useRef<DrawOnDrawing | null>(null);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return undefined;

        const svg = parseSvg(PANELS);
        svg.style.maxWidth = '100%';
        svg.style.height = 'auto';
        host.replaceChildren(svg);

        const drawing = draw(svg, { duration: 2200, autoplay: true, ...options });
        drawingRef.current = drawing;

        return () => {
            drawing.destroy();
            drawingRef.current = null;
        };
    }, [options]);

    const replay = () => {
        drawingRef.current?.restart();
    };

    return (
        <>
            <div className="demo-stage" ref={hostRef} title={note} />
            <div className="demo-split-label">
                <span>{label}</span>{' '}
                <button type="button" className="button ghost small" onClick={replay}>
                    Replay
                </button>
            </div>
        </>
    );
}

const REVEALS: RevealMode[] = ['end', 'stroke', 'none'];
const TEXTS: TextMode[] = ['fade', 'type', 'none'];

/**
 * Fill reveal and label reveal are independent in 1.0. The top row varies
 * `reveal` with labels fading; the bottom row varies `text` with fills landing
 * at the end.
 */
export function RevealTextModesDemo() {
    const [revealStart, setRevealStart] = useState(0.6);

    const shared = { duration: 2200, revealStart } as const;

    return (
        <>
            <div className="demo-split">
                {REVEALS.map((reveal) => (
                    <RevealCell
                        key={reveal}
                        label={`reveal: ${reveal}`}
                        note={
                            reveal === 'end'
                                ? 'All fills share one fade, starting at revealStart.'
                                : reveal === 'stroke'
                                  ? 'Each fill fades behind its own stroke.'
                                  : 'Fills are never hidden.'
                        }
                        options={{ ...shared, reveal, text: 'fade' }}
                    />
                ))}
            </div>

            <div className="demo-split">
                {TEXTS.map((text) => (
                    <RevealCell
                        key={text}
                        label={`text: ${text}`}
                        note={
                            text === 'fade'
                                ? 'Labels fade in with the reveal window.'
                                : text === 'type'
                                  ? 'Labels are typed out letter by letter against a shared budget.'
                                  : 'Labels are left untouched.'
                        }
                        options={{ ...shared, reveal: 'end', text }}
                    />
                ))}
            </div>

            <div className="demo-foot">
                <div className="demo-controls">
                    <label className="demo-check">
                        <span>revealStart</span>
                        <input
                            type="range"
                            min="0"
                            max="0.95"
                            step="0.05"
                            value={revealStart}
                            aria-label="Progress at which fills start fading in"
                            onChange={(event) => setRevealStart(Number(event.target.value))}
                        />
                        <span className="demo-percent">{revealStart.toFixed(2)}</span>
                    </label>
                </div>
            </div>
        </>
    );
}