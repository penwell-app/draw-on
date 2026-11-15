import { createElement, useCallback, useEffect, useRef, useState } from 'react';
import { defineDrawOn } from '@penwell/draw-on/element';

const PRESETS = ['diagram', 'icon', 'logo', 'signature', 'sketch'];

interface Detail {
    progress?: number;
    error?: unknown;
}

/**
 * `<draw-on>` is a real custom element: attributes in, events out, methods on the
 * node. Nothing here is React state driving the drawing, which is the point.
 */
export function DrawOnElementDemo() {
    const hostRef = useRef<HTMLElement>(null);
    const [preset, setPreset] = useState('diagram');
    const [trigger, setTrigger] = useState('auto');
    const [log, setLog] = useState<string[]>([]);

    const append = useCallback((line: string) => {
        setLog((previous) => [line, ...previous].slice(0, 30));
    }, []);

    useEffect(() => {
        defineDrawOn();
    }, []);

    useEffect(() => {
        const element = hostRef.current;
        if (!element) return undefined;

        const handle = (type: string) => (event: Event) => {
            const detail = (event as CustomEvent<Detail>).detail ?? {};
            if (type === 'draw-error') {
                const value = detail.error;
                append(`draw-error ${value instanceof Error ? value.message : String(value)}`);
                return;
            }
            append(`${type} ${Math.round((detail.progress ?? 0) * 100)}%`);
        };

        const start = handle('draw-start');
        const complete = handle('draw-complete');
        const error = handle('draw-error');

        element.addEventListener('draw-start', start);
        element.addEventListener('draw-complete', complete);
        element.addEventListener('draw-error', error);

        return () => {
            element.removeEventListener('draw-start', start);
            element.removeEventListener('draw-complete', complete);
            element.removeEventListener('draw-error', error);
        };
    }, [append]);

    const call = (method: 'play' | 'restart' | 'reverse') => {
        const element = hostRef.current as unknown as Record<string, () => void> | null;
        element?.[method]?.();
    };

    return (
        <>
            {createElement(
                'draw-on',
                {
                    ref: hostRef,
                    className: 'demo-stage',
                    preset,
                    trigger,
                    'reveal-start': '0.55',
                    yoyo: '',
                },
                createElement('svg', {
                    viewBox: '0 0 640 180',
                    xmlns: 'http://www.w3.org/2000/svg',
                    dangerouslySetInnerHTML: {
                        __html: `
      <rect x="26" y="44" width="150" height="80" rx="18" fill="#f4c95d" stroke="#27241a" stroke-width="3"/>
      <text x="101" y="92" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" fill="#27241a">attributes</text>
      <path d="M176 84 H272" fill="none" stroke="#27241a" stroke-width="3" stroke-linecap="round"/>
      <path d="M266 78 L280 84 L266 90 Z" fill="#27241a"/>
      <rect x="280" y="44" width="150" height="80" rx="18" fill="#a8d8ea" stroke="#27241a" stroke-width="3"/>
      <text x="355" y="92" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" fill="#27241a">become</text>
      <path d="M430 84 H500" fill="none" stroke="#27241a" stroke-width="3" stroke-linecap="round"/>
      <path d="M494 78 L508 84 L494 90 Z" fill="#27241a"/>
      <rect x="508" y="44" width="110" height="80" rx="18" fill="#7bc6a4" stroke="#27241a" stroke-width="3"/>
      <text x="563" y="92" text-anchor="middle" font-family="system-ui, sans-serif" font-size="17" fill="#27241a">options</text>
      <text x="320" y="160" text-anchor="middle" font-family="ui-monospace, monospace" font-size="13" fill="#625d50">a real custom element, no React involved</text>
    `,
                    },
                }),
            )}

            <div className="demo-foot">
                <div className="demo-controls">
                    <button type="button" className="button small" onClick={() => call('play')}>
                        play()
                    </button>
                    <button type="button" className="button small secondary" onClick={() => call('restart')}>
                        restart()
                    </button>
                    <button type="button" className="button small secondary" onClick={() => call('reverse')}>
                        reverse()
                    </button>

                    <label className="demo-check">
                        <span>preset</span>
                        <select
                            value={preset}
                            aria-label="Preset attribute"
                            onChange={(event) => setPreset(event.target.value)}
                        >
                            {PRESETS.map((name) => (
                                <option key={name} value={name}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="demo-check">
                        <span>trigger</span>
                        <select
                            value={trigger}
                            aria-label="Trigger attribute"
                            onChange={(event) => setTrigger(event.target.value)}
                        >
                            <option value="auto">auto</option>
                            <option value="hover">hover</option>
                            <option value="click">click</option>
                            <option value="inView">inView</option>
                            <option value="none">none</option>
                        </select>
                    </label>
                </div>
            </div>

            <p className="demo-log">
                {log.length === 0 ? (
                    <span className="demo-log-empty">No events yet.</span>
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