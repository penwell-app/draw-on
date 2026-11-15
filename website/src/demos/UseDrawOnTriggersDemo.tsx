import { useState } from 'react';
import { useDrawOn } from '@penwell/draw-on/react';
import type { DrawTrigger } from '@penwell/draw-on/react';

const MARKUP = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 120">
  <rect x="18" y="28" width="118" height="64" rx="14" fill="#f4c95d" stroke="#27241a" stroke-width="3"/>
  <text x="77" y="66" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16"
        fill="#27241a">trigger</text>
  <path d="M136 60 H170" fill="none" stroke="#27241a" stroke-width="3" stroke-linecap="round"/>
  <path d="M164 54 L178 60 L164 66 Z" fill="#27241a"/>
  <rect x="178" y="28" width="104" height="64" rx="14" fill="#a8d8ea" stroke="#27241a" stroke-width="3"/>
  <text x="230" y="66" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16"
        fill="#27241a">plays</text>
</svg>`;

function TriggerCell({ trigger, hint }: { trigger: DrawTrigger; hint: string }) {
    const { ref, status } = useDrawOn({ svg: MARKUP, trigger, duration: 1600, reveal: 'none' });

    return (
        <>
            <div className="demo-stage" ref={ref} />
            <div className="demo-split-label">
                <span>{trigger}</span> <span className="demo-log-empty">{hint}</span>
                <span className="demo-percent"> {status}</span>
            </div>
        </>
    );
}

/** `inView` only means something when the drawing starts outside the viewport. */
function InViewCell() {
    const { ref, status } = useDrawOn({ svg: MARKUP, trigger: 'inView', duration: 1600, reveal: 'none' });

    return (
        <>
            <div
                className="demo-stage"
                style={{ display: 'block', overflowY: 'auto', maxHeight: 200, minHeight: 200 }}
            >
                <div style={{ height: 190 }} />
                <div ref={ref} />
                <div style={{ height: 40 }} />
            </div>
            <div className="demo-split-label">
                <span>inView</span>{' '}
                <span className="demo-log-empty">scroll the box</span>
                <span className="demo-percent"> {status}</span>
            </div>
        </>
    );
}

/** `progress` takes over: it seeks, and it disables every trigger. */
function ControlledCell() {
    const [value, setValue] = useState(0.15);
    const { ref } = useDrawOn({ svg: MARKUP, progress: value, reveal: 'none' });

    return (
        <>
            <div className="demo-stage" ref={ref} />
            <div className="demo-foot">
                <div className="demo-controls">
                    <input
                        className="demo-scrub"
                        type="range"
                        min="0"
                        max="1"
                        step="0.001"
                        value={value}
                        aria-label="Controlled progress"
                        onChange={(event) => setValue(Number(event.target.value))}
                    />
                    <span className="demo-percent">{Math.round(value * 100)}%</span>
                </div>
            </div>
            <div className="demo-split-label">
                <span>progress</span> <span className="demo-log-empty">you drive it</span>
            </div>
        </>
    );
}

/**
 * Every trigger `useDrawOn` understands, plus the controlled path. `auto` and
 * `inView` start themselves; `hover` and `click` restart on the event; `manual`
 * waits for you; `progress` wins over all of them.
 */
export function UseDrawOnTriggersDemo() {
    const [mounted, setMounted] = useState(true);

    return (
        <>
            <div className="demo-split">
                <TriggerCell trigger="auto" hint="starts itself" />
                <TriggerCell trigger="hover" hint="restart on mouseenter" />
                <TriggerCell trigger="click" hint="restart on click" />
                <InViewCell />
            </div>

            {mounted ? <ControlledCell /> : null}

            <div className="demo-foot">
                <div className="demo-controls">
                    <button
                        type="button"
                        className="button small secondary"
                        onClick={() => setMounted((value) => !value)}
                    >
                        {mounted ? 'Unmount the controlled cell' : 'Mount the controlled cell'}
                    </button>
                    <span className="demo-log-empty">
                        Unmounting runs the cleanup, which is how you prove teardown works.
                    </span>
                </div>
            </div>
        </>
    );
}