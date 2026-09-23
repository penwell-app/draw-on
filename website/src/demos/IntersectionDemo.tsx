import { useEffect, useRef, useState } from 'react';
import { createDrawing, parseSvg } from '@penwell/draw-on/core';
import type { Drawing } from '@penwell/draw-on/core';

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 200">
  <path d="M50 140 C110 40 170 170 240 96 C300 32 360 128 470 76"
        fill="none" stroke="#27241a" stroke-width="6" stroke-linecap="round"/>
  <circle cx="50" cy="140" r="10" fill="#f4c95d"/>
  <circle cx="470" cy="76" r="10" fill="#2f6a5c"/>
</svg>`;

/**
 * Draw when the SVG scrolls into view instead of on load. The observer watches
 * the container, so the animation starts at the moment a reader reaches it.
 */
export function IntersectionDemo() {
    const hostRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState('waiting for the viewport');
    const [run, setRun] = useState(0);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return undefined;

        const svg = parseSvg(SVG);
        host.replaceChildren(svg);
        const drawing: Drawing = createDrawing(svg, { duration: 240 });
        drawing.hide();
        drawing.setProgress(0);

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    setStatus('drawing');
                    drawing.play(() => setStatus('drawn'));
                }
            },
            { threshold: 0.5 },
        );

        observer.observe(host);

        return () => {
            observer.disconnect();
            drawing.destroy();
        };
    }, [run]);

    return (
        <>
            <div className="demo-stage" ref={hostRef} />
            <div className="demo-foot">
                <div className="demo-controls">
                    <button type="button" className="button small" onClick={() => setRun((n) => n + 1)}>
                        Reset and wait
                    </button>
                    <span className="demo-percent">{status}</span>
                </div>
            </div>
            <div className="demo-note">
                After resetting, scroll this demo out of view and back to trigger it again.
            </div>
        </>
    );
}
