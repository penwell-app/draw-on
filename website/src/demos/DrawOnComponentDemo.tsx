import { useRef, useState } from 'react';
import { DrawOn } from '@penwell/draw-on/react';
import type { DrawOnHandle } from '@penwell/draw-on/react';

/**
 * The component takes JSX straight: the `<svg>` is a child, not a string. The ref
 * gives the command handle, and the drawing is left undrawn until asked.
 */
export function DrawOnComponentDemo() {
    const handleRef = useRef<DrawOnHandle>(null);
    const [status, setStatus] = useState('ready to play');
    const [progress, setProgress] = useState(0);

    const onProgress = (value: number) => setProgress(value);

    return (
        <>
            <DrawOn
                ref={handleRef}
                className="demo-stage"
                duration={2400}
                reveal="stroke"
                trigger="manual"
                onStart={() => setStatus('drawing')}
                onProgress={onProgress}
                onComplete={() => setStatus('complete')}
                onError={(error) => setStatus(error.message)}
            >
                <svg viewBox="0 0 640 210" xmlns="http://www.w3.org/2000/svg">
                    <rect
                        x="24"
                        y="58"
                        width="170"
                        height="92"
                        rx="18"
                        fill="#a8d8ea"
                        stroke="#27241a"
                        strokeWidth="3.5"
                    />
                    <text
                        x="109"
                        y="112"
                        textAnchor="middle"
                        fontFamily="system-ui, sans-serif"
                        fontSize="19"
                        fontWeight="700"
                        fill="#27241a"
                    >
                        children
                    </text>

                    <path
                        d="M194 104 H300"
                        fill="none"
                        stroke="#27241a"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                    />
                    <path d="M294 97 L310 104 L294 111 Z" fill="#27241a" />

                    <rect
                        x="310"
                        y="58"
                        width="170"
                        height="92"
                        rx="18"
                        fill="#7bc6a4"
                        stroke="#27241a"
                        strokeWidth="3.5"
                    />
                    <text
                        x="395"
                        y="112"
                        textAnchor="middle"
                        fontFamily="system-ui, sans-serif"
                        fontSize="19"
                        fontWeight="700"
                        fill="#27241a"
                    >
                        svg prop
                    </text>

                    <path
                        d="M480 104 H586"
                        fill="none"
                        stroke="#27241a"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                    />
                    <path d="M580 97 L596 104 L580 111 Z" fill="#27241a" />

                    <text
                        x="320"
                        y="190"
                        textAnchor="middle"
                        fontFamily="ui-monospace, monospace"
                        fontSize="14"
                        fill="#625d50"
                    >
                        this svg is JSX, not a string
                    </text>
                </svg>
            </DrawOn>

            <div className="demo-foot">
                <div className="demo-controls">
                    <button type="button" className="button small" onClick={() => void handleRef.current?.play()}>
                        Play
                    </button>
                    <button
                        type="button"
                        className="button small secondary"
                        onClick={() => void handleRef.current?.restart()}
                    >
                        Restart
                    </button>
                    <button
                        type="button"
                        className="button small secondary"
                        onClick={() => void handleRef.current?.reverse()}
                    >
                        Reverse
                    </button>
                    <button
                        type="button"
                        className="button small secondary"
                        onClick={() => handleRef.current?.pause()}
                    >
                        Pause
                    </button>

                    <input
                        className="demo-scrub"
                        type="range"
                        min="0"
                        max="1"
                        step="0.001"
                        value={progress}
                        aria-label="Seek to a point in the draw"
                        onChange={(event) => handleRef.current?.seek(Number(event.target.value))}
                    />
                    <span className="demo-percent">{Math.round(progress * 100)}%</span>
                    <span className="demo-percent">{status}</span>
                </div>
            </div>
        </>
    );
}