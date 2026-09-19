import { useSketchDraw } from '@penwell/draw-on';
import { downloadBlob } from '@penwell/draw-on/core';
import "./App.css"

// Swap this for a Mermaid, Excalidraw, or Figma export — anything that
// serializes to `<svg>…</svg>` works the same way.
const NOTE = `<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="320" height="160" rx="12" fill="#fffdf7" />
  <rect x="48" y="44" width="180" height="22" rx="4" fill="#f4d9a8" />
  <text x="138" y="60" text-anchor="middle" font-family="Georgia, serif" font-size="13">today</text>
  <path d="M48 96 H300" stroke="#27241a" stroke-width="1.5" fill="none" />
  <path d="M48 122 H260" stroke="#27241a" stroke-width="1.5" fill="none" />
  <path d="M48 148 H280" stroke="#27241a" stroke-width="1.5" fill="none" />
</svg>`;

export default function App() {
  const { containerRef, status, play, canRecord, exportWebM } = useSketchDraw({
    svgMarkup: NOTE,
    duration: 220,
  });

  async function handleExport() {
    const blob = await exportWebM();
    downloadBlob(blob, 'DrawOn-react-demo.webm');
  }

  return (
    <>
      <h1>Draw On - React Example</h1>
       <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={play} disabled={status === 'error'}>
          Replay
        </button>
        {canRecord && <button onClick={handleExport}>Export WebM</button>}
         <div ref={containerRef} />
      </div>
     
     
      {status === 'error' && <p>Couldn't animate that SVG.</p>}
    </>
  );
}
