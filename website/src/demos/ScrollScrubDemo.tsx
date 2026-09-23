import { useEffect, useRef, useState } from 'react';
import { createDrawing, parseSvg } from '@penwell/draw-on/core';
import type { Drawing } from '@penwell/draw-on/core';

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 260">
  <rect x="30" y="30" width="500" height="200" rx="14" fill="#fffdf7" stroke="#e8e4db" stroke-width="2"/>
  <path d="M70 210 C110 90 170 200 220 120 C270 40 330 150 400 90 C450 50 490 110 500 70"
        fill="none" stroke="#27241a" stroke-width="5" stroke-linecap="round"/>
  <circle cx="70" cy="210" r="9" fill="#f4c95d"/>
  <circle cx="500" cy="70" r="9" fill="#7bc6a4"/>
  <text x="280" y="30" text-anchor="middle" font-family="system-ui" font-size="14" fill="#625d50">scroll the panel</text>
</svg>`;

/**
 * Scroll-linked drawing: map the scroll position inside any scrollable element
 * onto `setProgress`. This panel scrolls on its own so the page never jumps.
 */
export function ScrollScrubDemo() {
    const trackRef = useRef<HTMLDivElement>(null);
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

    const handleScroll = () => {
        const track = trackRef.current;
        const drawing = drawingRef.current;
        if (!track || !drawing) return;

        const max = track.scrollHeight - track.clientHeight;
        const fraction = max > 0 ? Math.min(1, Math.max(0, track.scrollTop / max)) : 0;
        drawing.setProgress(fraction);
        setProgress(fraction);
    };

    return (
        <>
            <div
                ref={trackRef}
                onScroll={handleScroll}
                style={{
                    height: 320,
                    overflowY: 'auto',
                    borderBottom: '1px solid var(--line-soft)',
                    background: 'var(--surface-raised)',
                }}
            >
                <div style={{ position: 'sticky', top: 0, padding: 18, background: 'var(--surface-raised)' }}>
                    <span className="chip">progress {Math.round(progress * 100)}%</span>
                </div>
                <div ref={hostRef} style={{ padding: '0 18px' }} />
                <div style={{ height: 520 }} />
            </div>
            <div className="demo-note">
                Keep scrolling inside the panel — the drawing follows <code>scrollTop</code>, and it can
                run backwards just as easily.
            </div>
        </>
    );
}
