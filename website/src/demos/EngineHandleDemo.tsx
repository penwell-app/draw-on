import { useCallback, useEffect, useRef, useState } from 'react';
import { draw, parseSvg } from '@penwell/draw-on/core';
import type { DrawEvent, DrawOnDrawing, DrawStats } from '@penwell/draw-on/core';

/** A connector diagram: three filled boxes, two arrows and a caption. */
const MARKUP = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 240">
  <rect x="24" y="86" width="150" height="70" rx="14" fill="#f4c95d" stroke="#27241a" stroke-width="3"/>
  <text x="99" y="128" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" fill="#27241a">request</text>

  <path d="M174 121 H282" fill="none" stroke="#27241a" stroke-width="3" stroke-linecap="round"/>
  <path d="M276 115 L290 121 L276 127 Z" fill="#27241a"/>

  <rect x="290" y="86" width="150" height="70" rx="14" fill="#a8d8ea" stroke="#27241a" stroke-width="3"/>
  <text x="365" y="128" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" fill="#27241a">draw</text>

  <path d="M440 121 H520" fill="none" stroke="#27241a" stroke-width="3" stroke-linecap="round"/>
  <path d="M514 115 L528 121 L514 127 Z" fill="#27241a"/>

  <rect x="528" y="86" width="90" height="70" rx="14" fill="#7bc6a4" stroke="#27241a" stroke-width="3"/>
  <text x="573" y="128" text-anchor="middle" font-family="system-ui, sans-serif" font-size="15" fill="#27241a">done</text>

  <text x="320" y="206" text-anchor="middle" font-family="ui-monospace, monospace" font-size="14"
        fill="#625d50">every control below is one method on the returned handle</text>
</svg>`;

const LOGGED_EVENTS: DrawEvent[] = ['start', 'pause', 'complete'];

/**
 * The 1.0 handle: playback controls, live `playbackRate`, a seek slider and the
 * event stream. `progress` events fire every frame, so they are shown as a
 * number and the log only keeps the three edges.
 */
export function EngineHandleDemo() {
    const hostRef = useRef<HTMLDivElement>(null);
    const drawingRef = useRef<DrawOnDrawing | null>(null);

    const [progress, setProgress] = useState(0);
    const [rate, setRate] = useState(1);
    const [loop, setLoop] = useState(false);
    const [yoyo, setYoyo] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [stats, setStats] = useState<DrawStats | null>(null);
    const [log, setLog] = useState<string[]>([]);

    const append = useCallback((line: string) => {
        setLog((previous) => [line, ...previous].slice(0, 40));
    }, []);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return undefined;

        const svg = parseSvg(MARKUP);
        svg.style.maxWidth = '100%';
        svg.style.height = 'auto';
        host.replaceChildren(svg);

        const drawing = draw(svg, {
            duration: 2600,
            autoplay: false,
            loop,
            yoyo,
        });
        drawingRef.current = drawing;
        setStats(drawing.stats);
        setProgress(0);
        setPlaying(false);
        setLog([]);

        const offs = [
            ...LOGGED_EVENTS.map((event) =>
                drawing.on(event, (value) => {
                    if (event === 'start') setPlaying(true);
                    if (event === 'pause') setPlaying(false);
                    if (event === 'complete') setPlaying(false);
                    append(`${event} at ${Math.round(value * 100)}%`);
                }),
            ),
            drawing.on('progress', (value) => setProgress(value)),
        ];

        return () => {
            offs.forEach((off) => off());
            drawing.destroy();
            drawingRef.current = null;
        };
    }, [loop, yoyo, append]);

    useEffect(() => {
        const drawing = drawingRef.current;
        if (drawing) drawing.playbackRate = rate;
    }, [rate]);

    const run = useCallback(
        (method: 'play' | 'reverse' | 'restart' | 'resume') => {
            const drawing = drawingRef.current;
            if (!drawing) return;
            drawing[method]().then((finished) => {
                if (method === 'play' || method === 'resume') setPlaying(finished);
                append(`${method}() resolved ${finished}`);
            });
        },
        [append],
    );

    const pause = () => {
        drawingRef.current?.pause();
        append('pause() called');
    };

    const seek = (value: number) => {
        drawingRef.current?.seek(value);
        setProgress(value);
    };

    return (
        <>
            <div className="demo-stage" ref={hostRef} />
            <div className="demo-foot">
                <div className="demo-controls">
                    <button
                        type="button"
                        className="button small"
                        onClick={() => run(playing ? 'resume' : 'play')}
                    >
                        {playing ? 'Resume' : 'Play'}
                    </button>
                    <button type="button" className="button small secondary" onClick={pause}>
                        Pause
                    </button>
                    <button type="button" className="button small secondary" onClick={() => run('reverse')}>
                        Reverse
                    </button>
                    <button type="button" className="button small secondary" onClick={() => run('restart')}>
                        Restart
                    </button>

                    <input
                        className="demo-scrub"
                        type="range"
                        min="0"
                        max="1"
                        step="0.001"
                        value={progress}
                        aria-label="Seek to a point in the draw"
                        onChange={(event) => seek(Number(event.target.value))}
                    />
                    <span className="demo-percent">{Math.round(progress * 100)}%</span>
                </div>

                <div className="demo-controls">
                    <label className="demo-check">
                        <span>speed</span>
                        <select
                            value={String(rate)}
                            aria-label="Playback rate"
                            onChange={(event) => setRate(Number(event.target.value))}
                        >
                            <option value="0.25">0.25x</option>
                            <option value="0.5">0.5x</option>
                            <option value="1">1x</option>
                            <option value="2">2x</option>
                            <option value="4">4x</option>
                        </select>
                    </label>
                    <label className="demo-check">
                        <input
                            type="checkbox"
                            checked={loop}
                            onChange={(event) => setLoop(event.target.checked)}
                        />
                        loop
                    </label>
                    <label className="demo-check">
                        <input
                            type="checkbox"
                            checked={yoyo}
                            onChange={(event) => setYoyo(event.target.checked)}
                        />
                        yoyo
                    </label>
                    {stats && (
                        <span className="demo-percent">
                            {stats.strokes} strokes, {stats.fills} fills, {stats.texts} labels
                        </span>
                    )}
                </div>
            </div>

            <p className="demo-log">
                {log.length === 0 ? (
                    <span className="demo-log-empty">No events yet. Press Play.</span>
                ) : (
                    log.map((line, index) => (
                        <span key={`${index}-${line}`}>
                            <b>{line.split(' ')[0]}</b>
                            {line.slice(line.indexOf(' '))}
                            <br />
                        </span>
                    ))
                )}
            </p>
        </>
    );
}