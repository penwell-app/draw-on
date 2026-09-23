import { useState } from 'react';
import { SketchDraw } from '@penwell/draw-on';

const CHART = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 240">
  <path d="M40 200 H420" stroke="#27241a" stroke-width="2" fill="none"/>
  <rect x="66" y="140" width="46" height="60" fill="#f4c95d"/>
  <rect x="140" y="104" width="46" height="96" fill="#a8d8ea"/>
  <rect x="214" y="66" width="46" height="134" fill="#7bc6a4"/>
  <rect x="288" y="120" width="46" height="80" fill="#f4c95d"/>
  <rect x="362" y="88" width="46" height="112" fill="#a8d8ea"/>
  <text x="230" y="228" text-anchor="middle" font-family="system-ui" font-size="14" fill="#625d50">draws one bar at a time</text>
</svg>`;

/**
 * The unstyled component: it owns the container and hands you the same API
 * through a render prop, so your controls live wherever you want them.
 */
export function ReactComponentDemo() {
    const [percent, setPercent] = useState(0);

    return (
        <SketchDraw
            svgMarkup={CHART}
            duration={240}
        >
            {({ containerRef, status, play, setProgress }) => (
                <>
                    <div className="demo-stage" ref={containerRef} />
                    <div className="demo-foot">
                        <div className="demo-controls">
                            <button type="button" className="button small" onClick={play}>
                                {status === 'drawing' ? 'Drawing…' : 'Replay'}
                            </button>
                            <input
                                className="demo-scrub"
                                type="range"
                                min="0"
                                max="1"
                                step="0.001"
                                value={percent}
                                aria-label="Animation progress"
                                onChange={(event) => {
                                    const value = Number(event.target.value);
                                    setPercent(value);
                                    setProgress(value);
                                }}
                            />
                            <span className="demo-percent">{Math.round(percent * 100)}%</span>
                        </div>
                    </div>
                </>
            )}
        </SketchDraw>
    );
}
