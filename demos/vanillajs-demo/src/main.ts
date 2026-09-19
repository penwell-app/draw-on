import { parseSvg, createDrawing } from '@penwell/draw-on/core';

// Any inline SVG works here — this one's hand-written, but a Mermaid or
// Excalidraw export drops in the same way.
const DIAGRAM = `<svg viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="50" width="120" height="60" rx="8" fill="#efe0c2" />
  <text x="80" y="86" text-anchor="middle" font-family="Georgia, serif" font-size="16">Fetch</text>
  <path d="M150 80 H230" stroke="#27241a" stroke-width="2.5" fill="none" />
  <path d="M230 80 L214 72 L214 88 Z" fill="#27241a" />
  <rect x="240" y="50" width="120" height="60" rx="8" fill="#efe0c2" />
  <text x="300" y="86" text-anchor="middle" font-family="Georgia, serif" font-size="16">Render</text>
</svg>`;

const host = document.querySelector<HTMLDivElement>('#stage')!;
const svg = parseSvg(DIAGRAM);
host.appendChild(svg);

const drawing = createDrawing(svg, { duration: 220 });
drawing.play();

document.querySelector<HTMLButtonElement>('#replay')!.addEventListener('click', () => {
  drawing.stop();
  drawing.reset();
  drawing.play();
});
