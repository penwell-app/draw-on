import { useEffect, useRef, useState } from 'react';
import { createDrawing, parseSvg } from '@penwell/draw-on/core';
import type { Drawing } from '@penwell/draw-on/core';

/** One diagram, animated twice with a different reveal window. */
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 240">
  <rect x="30" y="70" width="140" height="70" rx="14" fill="#f4c95d" stroke="#27241a" stroke-width="3"/>
  <text x="100" y="113" text-anchor="middle" font-family="system-ui" font-size="16" fill="#27241a">fills</text>
  <path d="M170 105 H310" fill="none" stroke="#27241a" stroke-width="3" stroke-linecap="round"/>
  <rect x="310" y="70" width="140" height="70" rx="14" fill="#a8d8ea" stroke="#27241a" stroke-width="3"/>
  <text x="380" y="113" text-anchor="middle" font-family="system-ui" font-size="16" fill="#27241a">labels</text>
  <text x="260" y="196" text-anchor="middle" font-family="system-ui" font-size="14" fill="#625d50">revealStart decides when these fade in</text>
</svg>`;

const VARIANTS = [
    { label: 'revealStart 0.2', options: { revealStart: 0.2, revealMs: 900 } },
    { label: 'revealStart 0.8', options: { revealStart: 0.8, revealMs: 900 } },
];

/**
 * Two identical SVGs, two different reveal windows, one shared scrubber — the
 * quickest way to feel what `revealStart` and `revealMs` actually change.
 */
export function RevealWindowDemo() {
    const firstRef = useRef<HTMLDivElement>(null);
    const secondRef = useRef<HTMLDivElement>(null);
    const drawings = useRef<Drawing[]>([]);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const hosts = [firstRef.current, secondRef.current];
        const created: Drawing[] = [];

        hosts.forEach((host, index) => {
            if (!host) return;
            const svg = parseSvg(SVG);
            host.replaceChildren(svg);
            const drawing = createDrawing(svg, { duration: 220, ...VARIANTS[index].options });
            drawing.setProgress(0);
            created.push(drawing);
        });

        drawings.current = created;

        return () => {
            created.forEach((drawing) => drawing.destroy());
            drawings.current = [];
        };
    }, []);

    const scrub = (value: number) => {
        drawings.current.forEach((drawing) => drawing.setProgress(value));
        setProgress(value);
    };

    const play = () => {
        drawings.current.forEach((drawing, index) => {
            drawing.stop();
            drawing.reset();
            drawing.play(() => {
                if (index === drawings.current.length - 1) setProgress(1);
            });
        });
        setProgress(0);
    };

    return (
        <>
            <div className="reveal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 18 }}>
                {VARIANTS.map((variant, index) => (
                    <figure key={variant.label} style={{ margin: 0 }}>
                        <div
                            className="demo-stage"
                            style={{ minHeight: 180 }}
                            ref={index === 0 ? firstRef : secondRef}
                        />
                        <figcaption className="demo-percent" style={{ textAlign: 'center' }}>
                            {variant.label}
                        </figcaption>
                    </figure>
                ))}
            </div>
            <div className="demo-foot">
                <div className="demo-controls">
                    <button type="button" className="button small" onClick={play}>
                        Replay both
                    </button>
                    <input
                        className="demo-scrub"
                        type="range"
                        min="0"
                        max="1"
                        step="0.001"
                        value={progress}
                        aria-label="Shared progress"
                        onChange={(event) => scrub(Number(event.target.value))}
                    />
                    <span className="demo-percent">{Math.round(progress * 100)}%</span>
                </div>
            </div>
        </>
    );
}
