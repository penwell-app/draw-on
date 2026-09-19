import { useCallback, useEffect, useRef, useState } from 'react';
import {
  canRecordVideo,
  computeDims,
  createDrawing,
  downloadBlob,
  parseSvg,
  recordDrawToWebM,
  useSketchDraw,
} from '@penwell/draw-on';

const BASIC_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 420" role="img">
  <path d="M95 315 C130 120 245 80 350 170 C445 250 525 90 610 125"
        fill="none" stroke="#27241a" stroke-width="8" stroke-linecap="round"/>
  <circle cx="95" cy="315" r="16" fill="#f4c95d"/>
  <circle cx="610" cy="125" r="16" fill="#7bc6a4"/>
  <text x="350" y="365" text-anchor="middle"
        font-family="system-ui, sans-serif" font-size="30" fill="#27241a">
    draw-on
  </text>
</svg>`;

const DIAGRAM_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520">
  <defs>
    <filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-opacity=".12"/></filter>
  </defs>

  <rect x="55" y="185" width="210" height="120" rx="22"
        fill="#f4c95d" stroke="#27241a" stroke-width="5" filter="url(#shadow)"/>
  <text x="160" y="255" text-anchor="middle"
        font-family="system-ui" font-size="28" font-weight="700" fill="#27241a">Browser</text>

  <path d="M265 245 H405" fill="none" stroke="#27241a" stroke-width="6"
        stroke-linecap="round" marker-end="url(#arrow)"/>

  <rect x="405" y="185" width="210" height="120" rx="22"
        fill="#a8d8ea" stroke="#27241a" stroke-width="5" filter="url(#shadow)"/>
  <text x="510" y="255" text-anchor="middle"
        font-family="system-ui" font-size="28" font-weight="700" fill="#27241a">API</text>

  <path d="M615 245 H755" fill="none" stroke="#27241a" stroke-width="6"
        stroke-linecap="round" marker-end="url(#arrow)"/>

  <rect x="755" y="185" width="100" height="120" rx="22"
        fill="#7bc6a4" stroke="#27241a" stroke-width="5" filter="url(#shadow)"/>
  <text x="805" y="255" text-anchor="middle"
        font-family="system-ui" font-size="23" font-weight="700" fill="#27241a">DB</text>

  <path d="M160 305 V395 H510 V305" fill="none" stroke="#27241a"
        stroke-width="4" stroke-dasharray="10 10"/>
  <text x="335" y="440" text-anchor="middle"
        font-family="system-ui" font-size="22" fill="#555">request → response → persistence</text>

  <defs>
    <marker id="arrow" markerWidth="12" markerHeight="12" refX="9" refY="6" orient="auto">
      <path d="M0 0 L12 6 L0 12 Z" fill="#27241a"/>
    </marker>
  </defs>
</svg>`;

function CoreDemo({
  svgMarkup,
  duration = 220,
  title,
}: {
  svgMarkup: string;
  duration?: number;
  title: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const drawingRef = useRef<ReturnType<typeof createDrawing> | null>(null);
  const [progress, setProgress] = useState(0);

  const mount = useCallback(() => {
    const host = hostRef.current;
    if (!host) return;

    drawingRef.current?.destroy();
    host.innerHTML = '';

    const svg = parseSvg(svgMarkup);
    host.appendChild(svg);

    const drawing = createDrawing(svg, { duration });
    drawingRef.current = drawing;
    drawing.setProgress(0);
    setProgress(0);
  }, [svgMarkup, duration]);

  useEffect(() => {
    mount();
    return () => drawingRef.current?.destroy();
  }, [mount]);

  const play = () => {
    drawingRef.current?.reset();
    drawingRef.current?.play(() => setProgress(1));
  };

  const reset = () => {
    drawingRef.current?.reset();
    drawingRef.current?.setProgress(0);
    setProgress(0);
  };

  const scrub = (value: number) => {
    drawingRef.current?.setProgress(value);
    setProgress(value);
  };

  return (
    <section className="demo-card">
      <div className="demo-heading">
        <div>
          <span className="eyebrow">CORE API</span>
          <h2>{title}</h2>
        </div>
        <button className="button" onClick={play}>Replay</button>
      </div>

      <div className="svg-stage" ref={hostRef} />

      <div className="controls">
        <button className="button secondary" onClick={reset}>Reset</button>
        <input
          aria-label={`${title} progress`}
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={progress}
          onChange={(e) => scrub(Number(e.target.value))}
        />
        <span className="progress">{Math.round(progress * 100)}%</span>
      </div>
    </section>
  );
}

function ReactDemo() {
  const { containerRef, status, play, setProgress } = useSketchDraw({
    svgMarkup: DIAGRAM_SVG,
    duration: 260,
  });

  const [progress, setLocalProgress] = useState(0);

  useEffect(() => {
    setLocalProgress(0);
  }, []);

  return (
    <section className="demo-card">
      <div className="demo-heading">
        <div>
          <span className="eyebrow">REACT</span>
          <h2>React hook</h2>
        </div>
        <span className="status">{status}</span>
      </div>

      <div className="svg-stage" ref={containerRef} />

      <div className="controls">
        <button className="button" onClick={() => { play(); }}>Replay</button>
        <input
          aria-label="React demo progress"
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={progress}
          onChange={(e) => {
            const value = Number(e.target.value);
            setLocalProgress(value);
            setProgress(value);
          }}
        />
        <span className="progress">{Math.round(progress * 100)}%</span>
      </div>
    </section>
  );
}

function RecordingDemo() {
  const hostRef = useRef<HTMLDivElement>(null);
  const drawingRef = useRef<ReturnType<typeof createDrawing> | null>(null);
  const [recording, setRecording] = useState(false);
  const [message, setMessage] = useState(
    canRecordVideo() ? 'WebM recording is available in this browser.' : 'WebM recording is not available in this browser.',
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const svg = parseSvg(DIAGRAM_SVG);
    host.appendChild(svg);
    const drawing = createDrawing(svg, { duration: 260 });
    drawingRef.current = drawing;
    drawing.setProgress(0);

    return () => drawing.destroy();
  }, []);

  const record = async () => {
    const drawing = drawingRef.current;
    if (!drawing || !canRecordVideo()) return;

    setRecording(true);
    setMessage('Recording frames…');

    try {
      const { width, height } = computeDims(drawing.el);
      const blob = await recordDrawToWebM(drawing.el, drawing.setProgress, {
        width,
        height,
        fps: 30,
        durationMs: 4200,
        holdMs: 600,
        background: '#fffdf7',
        onProgress: (fraction) => setMessage(`Recording ${Math.round(fraction * 100)}%…`),
      });

      downloadBlob(blob, 'draw-on-demo.webm');
      setMessage('Done — the WebM export has been downloaded.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Recording failed.');
    } finally {
      setRecording(false);
    }
  };

  return (
    <section className="demo-card">
      <div className="demo-heading">
        <div>
          <span className="eyebrow">RECORDING</span>
          <h2>Record to WebM</h2>
        </div>
        <button className="button" disabled={recording || !canRecordVideo()} onClick={record}>
          {recording ? 'Recording…' : 'Record WebM'}
        </button>
      </div>

      <div className="svg-stage" ref={hostRef} />
      <p className="hint">{message}</p>
    </section>
  );
}

export default function App() {
  const [active, setActive] = useState('basic');

  return (
    <main>

      <header className="hero">

        <div className='logo-container'>
          <a
            href="https://www.npmjs.com/package/@penwell/draw-on"
            target="_blank"
            rel="noreferrer"
            className="logo-link"
            aria-label="Visit @penwell/draw-on on npm"
          >
            <img
              src="/draw-on.svg"
              alt="draw-on logo"
              className="main-logo"
              width="55%"
              height="55%"
            />
          </a>
        </div>

        <div className="hero-inner">
          <span className="eyebrow">@PENWELL/DRAW-ON</span>
          <h1>Make any SVG draw itself.</h1>
          <p>
            Progressive strokes, soft fill and label reveals, scrubbing, React support,
            and browser-side WebM recording.
          </p>
          <div className="hero-actions">
            <a className="button" href="https://www.npmjs.com/package/@penwell/draw-on" target="_blank" rel="noreferrer">npm</a>
            <a className="button secondary" href="https://github.com/penwell/draw-on" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
      </header>

      <nav className="tabs" aria-label="Demos">
        {[
          ['basic', 'Basic draw'],
          ['styled', 'Fills + labels'],
          ['react', 'React'],
          ['record', 'WebM'],
        ].map(([id, label]) => (
          <button
            key={id}
            className={active === id ? 'tab active' : 'tab'}
            onClick={() => setActive(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="content">
        {active === 'basic' && (
          <CoreDemo
            title="A simple SVG drawing"
            svgMarkup={BASIC_SVG}
            duration={220}
          />
        )}

        {active === 'styled' && (
          <CoreDemo
            title="Strokes → fills → labels"
            svgMarkup={DIAGRAM_SVG}
            duration={260}
          />
        )}

        {active === 'react' && <ReactDemo />}
        {active === 'record' && <RecordingDemo />}

        <section className="api-strip">
          <div>
            <span className="eyebrow">THE API</span>
            <h2>Small surface. Useful primitives.</h2>
          </div>
          <code>createDrawing(svg, options)</code>
          <code>drawing.setProgress(0.5)</code>
          <code>drawing.play()</code>
          <code>recordDrawToWebM(...)</code>
        </section>
      </div>
    </main>
  );
}