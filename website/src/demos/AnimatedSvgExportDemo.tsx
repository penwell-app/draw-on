import { useMemo, useState } from 'react';
import { downloadBlob, toAnimatedSVG } from '@penwell/draw-on/core';
import type { DrawType, RevealMode } from '@penwell/draw-on/core';

const MARKUP = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 170">
  <path d="M28 140 C70 60 120 150 168 74 C200 26 250 130 292 58 C318 12 356 96 392 44"
        fill="none" stroke="#27241a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="168" cy="74" r="14" fill="#f4c95d" stroke="#27241a" stroke-width="3"/>
  <circle cx="292" cy="58" r="14" fill="#a8d8ea" stroke="#27241a" stroke-width="3"/>
</svg>`;

const TYPES: DrawType[] = ['oneByOne', 'delayed', 'sync', 'stagger', 'speed'];
const REVEALS: RevealMode[] = ['end', 'stroke', 'none'];

/**
 * The export is a standalone file animated by CSS keyframes alone, so the honest
 * way to show it is an `<img>`. Nothing here runs Draw-On at view time.
 */
export function AnimatedSvgExportDemo() {
    const [duration, setDuration] = useState(2400);
    const [type, setType] = useState<DrawType>('stagger');
    const [reveal, setReveal] = useState<RevealMode>('end');

    const { svgText, error } = useMemo(() => {
        try {
            return { svgText: toAnimatedSVG(MARKUP, { duration, type, reveal }), error: '' };
        } catch (cause) {
            return {
                svgText: '',
                error: cause instanceof Error ? cause.message : 'Could not build the animated SVG.',
            };
        }
    }, [duration, type, reveal]);

    const url = useMemo(
        () => (svgText ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}` : ''),
        [svgText],
    );

    const kilobytes = Math.round((new TextEncoder().encode(svgText).length / 1024) * 10) / 10;

    return (
        <>
            <p className="demo-note">
                Rendered below as a plain <code>&lt;img&gt;</code>. There is no script in the file and no
                Draw-On on this page involved in showing it.
            </p>

            <div className="demo-stage">
                {error ? (
                    <p className="demo-error">{error}</p>
                ) : svgText ? (
                    <img
                        src={url}
                        alt="The same drawing exported as a CSS-only animated SVG"
                        style={{ width: '100%', maxWidth: 460, height: 'auto' }}
                    />
                ) : null}
            </div>

            <div className="demo-foot">
                <div className="demo-controls">
                    <label className="demo-check">
                        <span>duration</span>
                        <input
                            type="range"
                            min="400"
                            max="6000"
                            step="100"
                            value={duration}
                            aria-label="Export duration in milliseconds"
                            onChange={(event) => setDuration(Number(event.target.value))}
                        />
                        <span className="demo-percent">{duration}ms</span>
                    </label>

                    <label className="demo-check">
                        <span>type</span>
                        <select
                            value={type}
                            aria-label="Export ordering"
                            onChange={(event) => setType(event.target.value as DrawType)}
                        >
                            {TYPES.map((value) => (
                                <option key={value} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="demo-check">
                        <span>reveal</span>
                        <select
                            value={reveal}
                            aria-label="Export fill reveal"
                            onChange={(event) => setReveal(event.target.value as RevealMode)}
                        >
                            {REVEALS.map((value) => (
                                <option key={value} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                    </label>

                    <button
                        type="button"
                        className="button small secondary"
                        disabled={!svgText}
                        onClick={() =>
                            downloadBlob(
                                new Blob([svgText], { type: 'image/svg+xml' }),
                                'draw-on-animated.svg',
                            )
                        }
                    >
                        Download the file
                    </button>
                </div>
            </div>

            <p className="demo-note">
                {svgText.length > 0
                    ? `${kilobytes} KB of self-contained SVG. Open it in a new tab to confirm the CSS carries it.`
                    : 'Building the export...'}
            </p>
        </>
    );
}