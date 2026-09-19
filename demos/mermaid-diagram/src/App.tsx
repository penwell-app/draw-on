import { useEffect, useState } from 'react';
import mermaid from 'mermaid';
import { useSketchDraw } from '@penwell/draw-on';

mermaid.initialize({ startOnLoad: false, theme: 'neutral' });

const DEFINITION = `flowchart LR
  A[Upload] --> B[Parse]
  B --> C[Notebook]`;

export default function App() {
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    mermaid
      .render('sketch-reveal-demo', DEFINITION)
      .then(({ svg }) => {
        if (!cancelled) setSvgMarkup(svg);
      })
      .catch((err: Error) => {
        if (!cancelled) setRenderError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <h1>Draw On - Real Mermaid Output</h1>
      <p className='description'>
        This diagram is rendered by Mermaid at runtime, then handed straight
        to <code>useSketchDraw</code> no pre-baked SVG.
      </p>
      {renderError && <p>Mermaid couldn't render that diagram: {renderError}</p>}
      {svgMarkup && <Animated svgMarkup={svgMarkup} />}
    </>
  );
}

function Animated({ svgMarkup }: { svgMarkup: string }) {
  const { containerRef, play, status } = useSketchDraw({
    svgMarkup,
    duration: 260,
  });

  return (
    <>
      <div ref={containerRef} />
      <button onClick={play} disabled={status === 'error'}>
        Replay
      </button>
    </>
  );
}
