import { useEffect, useRef, useState } from 'react';
import { draw, inView, parseSvg } from '@penwell/draw-on/core';
import type { DrawOnDrawing } from '@penwell/draw-on/core';

const CARD = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 150">
  <rect x="16" y="22" width="240" height="106" rx="18" fill="#f4c95d" stroke="#27241a" stroke-width="3"/>
  <text x="136" y="72" text-anchor="middle" font-family="system-ui, sans-serif" font-size="19"
        font-weight="700" fill="#27241a">enters the view</text>
  <text x="136" y="98" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14"
        fill="#625d50">then draws once</text>

  <path d="M256 75 H306" fill="none" stroke="#27241a" stroke-width="3" stroke-linecap="round"/>
  <path d="M300 69 L314 75 L300 81 Z" fill="#27241a"/>

  <rect x="314" y="22" width="230" height="106" rx="18" fill="#a8d8ea" stroke="#27241a" stroke-width="3"/>
  <text x="429" y="72" text-anchor="middle" font-family="system-ui, sans-serif" font-size="19"
        font-weight="700" fill="#27241a">and can leave again</text>
  <text x="429" y="98" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14"
        fill="#625d50">onLeave fires on the way out</text>
</svg>`;

/**
 * `inView` is one observer with an optional `onLeave`. With `once: false` it keeps
 * watching, so leaving and re-entering replays. The drawing sits below the fold
 * inside this scroll box so the trigger is actually reachable.
 */
export function InViewDemo() {
    const hostRef = useRef<HTMLDivElement>(null);
    const drawingRef = useRef<DrawOnDrawing | null>(null);
    const [once, setOnce] = useState(false);
    const [hits, setHits] = useState(0);
    const [inside, setInside] = useState(false);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return undefined;

        const svg = parseSvg(CARD);
        svg.style.maxWidth = '100%';
        svg.style.height = 'auto';
        host.replaceChildren(svg);

        const drawing = draw(svg, { duration: 1800, autoplay: false, reveal: 'stroke' });
        drawingRef.current = drawing;
        drawing.seek(0);
        setInside(false);
        setHits(0);

        const stop = inView(
            drawing.el,
            () => {
                setHits((count) => count + 1);
                setInside(true);
                drawing.restart();
            },
            {
                once,
                onLeave: () => setInside(false),
            },
        );

        return () => {
            stop();
            drawing.destroy();
            drawingRef.current = null;
        };
    }, [once]);

    return (
        <>
            <div
                className="demo-stage"
                style={{ display: 'block', overflowY: 'auto', maxHeight: 230, minHeight: 230 }}
            >
                <div style={{ height: 240 }}>
                    <span className="demo-log-empty">
                        {hits === 0 ? 'Scroll down inside this box.' : 'Back to the top to leave it.'}
                    </span>
                </div>
                <div ref={hostRef} />
                <div style={{ height: 220 }} />
            </div>

            <div className="demo-foot">
                <div className="demo-controls">
                    <label className="demo-check">
                        <input
                            type="checkbox"
                            checked={once}
                            onChange={(event) => setOnce(event.target.checked)}
                        />
                        once: {String(once)}
                    </label>
                    <button type="button" className="button small secondary" onClick={() => drawingRef.current?.restart()}>
                        Replay
                    </button>
                    <span className="demo-percent">
                        {hits} {hits === 1 ? 'entry' : 'entries'}
                        {inside ? ', inside' : ', outside'}
                    </span>
                </div>
            </div>
        </>
    );
}