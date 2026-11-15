import { useEffect, useRef } from 'react';
import { draw, parseSvg, presets } from '@penwell/draw-on/core';
import type { DrawOnDrawing, PresetName } from '@penwell/draw-on/core';

/** Strokes, a fill and a label, so each preset's choices are all visible. */
const MARKUP = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 140">
  <path d="M24 100 C70 40 120 130 164 68 C196 24 236 96 276 44"
        fill="none" stroke="#27241a" stroke-width="5" stroke-linecap="round"/>
  <rect x="96" y="86" width="104" height="42" rx="12" fill="#f4c95d" stroke="#27241a" stroke-width="3"/>
  <text x="148" y="113" text-anchor="middle" font-family="system-ui, sans-serif" font-size="15"
        font-weight="700" fill="#27241a">preset</text>
</svg>`;

const NOTES: Record<PresetName, string> = {
    diagram: 'oneByOne over 3200ms, each fill behind its own stroke',
    icon: 'every stroke at once over 900ms, no fill reveal at all',
    logo: 'staggered 90ms apart, fills land at 70% of the timeline',
    signature: 'constant pen speed with a nib, duration ignored',
    sketch: 'wobbly strokes and labels typed out letter by letter',
};

function PresetCell({ name }: { name: PresetName }) {
    const hostRef = useRef<HTMLDivElement>(null);
    const drawingRef = useRef<DrawOnDrawing | null>(null);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return undefined;

        const svg = parseSvg(MARKUP);
        svg.style.maxWidth = '100%';
        svg.style.height = 'auto';
        host.replaceChildren(svg);

        const drawing = draw(svg, { ...presets[name], autoplay: true });
        drawingRef.current = drawing;

        return () => {
            drawing.destroy();
            drawingRef.current = null;
        };
    }, [name]);

    return (
        <>
            <div className="demo-stage" ref={hostRef} title={NOTES[name]} />
            <div className="demo-split-label">
                <span>{name}</span>{' '}
                <button type="button" className="button ghost small" onClick={() => drawingRef.current?.restart()}>
                    Replay
                </button>
            </div>
        </>
    );
}

/** The five shipped bundles on identical artwork, so the only difference is the preset. */
export function PresetsDemo() {
    return (
        <div className="demo-split">
            {(Object.keys(presets) as PresetName[]).map((name) => (
                <PresetCell key={name} name={name} />
            ))}
        </div>
    );
}