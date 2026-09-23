import { useState } from 'react';
import { useSketchDraw } from '@penwell/draw-on';

const NOTE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 210">
  <rect x="18" y="16" width="384" height="178" rx="12" fill="#fffdf7" stroke="#e8e4db" stroke-width="2"/>
  <rect x="44" y="40" width="150" height="22" rx="5" fill="#f4d9a8"/>
  <text x="119" y="56" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="#27241a">today</text>
  <path d="M44 92 H352" stroke="#27241a" stroke-width="1.5" fill="none"/>
  <path d="M44 120 H320" stroke="#27241a" stroke-width="1.5" fill="none"/>
  <path d="M44 148 H336" stroke="#27241a" stroke-width="1.5" fill="none"/>
  <path d="M44 172 H240" stroke="#2f6a5c" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`;

/**
 * The React hook: markup in, container ref plus controls out. Every call here
 * is the real `useSketchDraw` from the package.
 */
export function ReactHookDemo() {
    const { containerRef, status, play, setProgress, canRecord, exportWebM } = useSketchDraw({
        svgMarkup: NOTE,
        duration: 220,
        revealStart: 0.55,
    });

    const [progress, setLocalProgress] = useState(0);

    return (
        <>
            <div className="demo-stage" ref={containerRef} />
            <div className="demo-foot">
                <div className="demo-controls">
                    <button
                        type="button"
                        className="button small"
                        onClick={play}
                        disabled={status === 'error'}
                    >
                        {status === 'drawing' ? 'Drawing…' : 'Replay'}
                    </button>

                    <input
                        className="demo-scrub"
                        type="range"
                        min="0"
                        max="1"
                        step="0.001"
                        value={progress}
                        aria-label="Animation progress"
                        disabled={status === 'error'}
                        onChange={(event) => {
                            const value = Number(event.target.value);
                            setLocalProgress(value);
                            setProgress(value);
                        }}
                    />
                    <span className="demo-percent">{Math.round(progress * 100)}%</span>

                    {canRecord && (
                        <button
                            type="button"
                            className="button small secondary"
                            onClick={() => void exportWebM()}
                        >
                            Export
                        </button>
                    )}
                </div>
            </div>
            {status === 'error' && (
                <p className="demo-error">That markup could not be animated.</p>
            )}
        </>
    );
}
