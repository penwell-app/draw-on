import { useEffect, useRef, useState } from 'react';
import { draw, parseSvg } from '@penwell/draw-on/core';
import type { DrawOnDrawing } from '@penwell/draw-on/core';

/** Defined once, outside the animated SVG, and referenced by id from inside it. */
const PAGE_SPRITES = `<svg
    aria-hidden="true"
    style="position:absolute;width:0;height:0;overflow:hidden"
    xmlns="http://www.w3.org/2000/svg"
  >
  <defs>
    <symbol id="page-badge" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="21" fill="#7bc6a4" stroke="#27241a" stroke-width="2.5"/>
      <path d="M14 24 L21 31 L34 17" fill="none" stroke="#fffdf7" stroke-width="3.6"
            stroke-linecap="round" stroke-linejoin="round"/>
    </symbol>
    <symbol id="page-warn" viewBox="0 0 48 48">
      <path d="M24 6 L44 42 H4 Z" fill="#f4c95d" stroke="#27241a" stroke-width="2.5"
            stroke-linejoin="round"/>
      <path d="M24 19 V30" stroke="#27241a" stroke-width="3.2" stroke-linecap="round"/>
      <circle cx="24" cy="36" r="2.1" fill="#27241a"/>
    </symbol>
  </defs>
</svg>`;

const SCENE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 220">
  <defs>
    <symbol id="local-gear" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="13" fill="#a8d8ea" stroke="#27241a" stroke-width="2.5"/>
      <path d="M24 5 V12 M24 36 V43 M5 24 H12 M36 24 H43 M11 11 L16 16
               M32 32 L37 37 M37 11 L32 16 M16 32 L11 37"
            stroke="#27241a" stroke-width="2.8" stroke-linecap="round"/>
    </symbol>
    <symbol id="local-box" viewBox="0 0 48 48">
      <rect x="7" y="13" width="34" height="26" rx="6" fill="#e7efe8" stroke="#27241a" stroke-width="2.5"/>
      <path d="M7 22 H41" stroke="#27241a" stroke-width="2.5"/>
    </symbol>
  </defs>

  <use href="#local-gear" x="24" y="36" width="86" height="86"/>
  <use href="#local-box" x="134" y="36" width="86" height="86"/>
  <use href="#page-badge" x="244" y="36" width="86" height="86"/>
  <use href="#page-warn" x="354" y="36" width="86" height="86"/>
  <use href="#local-gear" x="464" y="36" width="86" height="86" data-draw-skip=""/>

  <text x="256" y="176" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18"
        font-weight="700" fill="#27241a">two local symbols, two page-level ones</text>
  <text x="256" y="202" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14"
        fill="#625d50">the last icon is skipped and never moves</text>
</svg>`;

/**
 * Every rendered `<use>` is replaced by an inline clone of what it references, so
 * the geometry can be measured and drawn. `stats.resolvedUses` reports how many.
 */
export function SymbolSpriteDemo() {
    const hostRef = useRef<HTMLDivElement>(null);
    const drawingRef = useRef<DrawOnDrawing | null>(null);
    const [resolved, setResolved] = useState<number | null>(null);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return undefined;

        const svg = parseSvg(SCENE);
        svg.style.maxWidth = '100%';
        svg.style.height = 'auto';
        host.replaceChildren(svg);

        const drawing = draw(svg, { duration: 2200, reveal: 'stroke', autoplay: false });
        drawingRef.current = drawing;
        drawing.seek(0);
        setResolved(drawing.stats.resolvedUses);

        return () => {
            drawing.destroy();
            drawingRef.current = null;
        };
    }, []);

    return (
        <>
            <div dangerouslySetInnerHTML={{ __html: PAGE_SPRITES }} />

            <div className="demo-stage" ref={hostRef} />

            <div className="demo-foot">
                <div className="demo-controls">
                    <button type="button" className="button small" onClick={() => drawingRef.current?.restart()}>
                        Draw it
                    </button>
                    <span className="demo-percent">
                        {resolved === null ? '' : `${resolved} use elements resolved`}
                    </span>
                </div>
            </div>
        </>
    );
}