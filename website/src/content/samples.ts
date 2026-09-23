import type { DrawingOptions } from '@penwell/draw-on/core';

export type SampleTag =
    | 'strokes'
    | 'fills'
    | 'text'
    | 'filters'
    | 'dashed'
    | 'dark'
    | 'handwriting'
    | 'diagram';

export interface SampleDef {
    id: string;
    title: string;
    description: string;
    tags: SampleTag[];
    /** Full serialized `<svg>…</svg>` markup, exactly what the library receives. */
    svg: string;
    /** Options this sample looks best with — merged over the defaults. */
    recommended?: DrawingOptions;
    /** Where the markup would come from in a real app. */
    source?: string;
}

export const SAMPLES: SampleDef[] = [
    {
        id: 'hello-strokes',
        title: 'Strokes, fills and a label',
        description:
            'One continuous stroke, two filled dots and a text label — the classic three-beat draw-on.',
        tags: ['strokes', 'fills', 'text'],
        source: 'Hand-written SVG',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 320" role="img">
  <path d="M95 235 C130 80 245 50 350 130 C445 205 525 60 610 90"
        fill="none" stroke="#27241a" stroke-width="8" stroke-linecap="round"/>
  <circle cx="95" cy="235" r="16" fill="#f4c95d"/>
  <circle cx="610" cy="90" r="16" fill="#7bc6a4"/>
  <text x="350" y="290" text-anchor="middle" font-family="system-ui, sans-serif"
        font-size="28" font-weight="700" fill="#27241a">draw-on</text>
</svg>`,
    },
    {
        id: 'flowchart',
        title: 'Flowchart with filters',
        description:
            'Fill-only boxes that gain a temporary outline, a drop shadow, an arrowhead marker and a dashed return path.',
        tags: ['fills', 'text', 'filters', 'dashed'],
        source: 'Mermaid-style flowchart',
        recommended: { duration: 260, revealStart: 0.5, revealMs: 650 },
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 480">
  <defs>
    <filter id="sample-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="8" flood-opacity="0.12"/>
    </filter>
    <marker id="sample-arrow" markerWidth="12" markerHeight="12" refX="9" refY="6" orient="auto">
      <path d="M0 0 L12 6 L0 12 Z" fill="#27241a"/>
    </marker>
  </defs>

  <rect x="55" y="150" width="210" height="120" rx="22" fill="#f4c95d"
        stroke="#27241a" stroke-width="5" filter="url(#sample-shadow)"/>
  <text x="160" y="220" text-anchor="middle" font-family="system-ui" font-size="26"
        font-weight="700" fill="#27241a">Browser</text>

  <path d="M265 210 H405" fill="none" stroke="#27241a" stroke-width="6"
        stroke-linecap="round" marker-end="url(#sample-arrow)"/>

  <rect x="405" y="150" width="210" height="120" rx="22" fill="#a8d8ea"
        stroke="#27241a" stroke-width="5" filter="url(#sample-shadow)"/>
  <text x="510" y="220" text-anchor="middle" font-family="system-ui" font-size="26"
        font-weight="700" fill="#27241a">API</text>

  <path d="M615 210 H755" fill="none" stroke="#27241a" stroke-width="6"
        stroke-linecap="round" marker-end="url(#sample-arrow)"/>

  <rect x="755" y="150" width="100" height="120" rx="22" fill="#7bc6a4"
        stroke="#27241a" stroke-width="5" filter="url(#sample-shadow)"/>
  <text x="805" y="220" text-anchor="middle" font-family="system-ui" font-size="22"
        font-weight="700" fill="#27241a">DB</text>

  <path d="M160 270 V360 H510 V270" fill="none" stroke="#27241a" stroke-width="4"
        stroke-dasharray="10 10"/>
  <text x="335" y="405" text-anchor="middle" font-family="system-ui" font-size="21"
        fill="#625d50">request to response to persistence</text>
</svg>`,
    },
    {
        id: 'notebook-page',
        title: 'Notebook page',
        description:
            'A page of ruled notes with a highlighted title block, handwriting and a checklist.',
        tags: ['handwriting', 'fills', 'text'],
        source: 'Penwell notebook export',
        recommended: { duration: 300, revealStart: 0.55, revealMs: 700 },
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 380">
  <rect x="24" y="20" width="472" height="340" rx="12" fill="#fffdf7"
        stroke="#e8e4db" stroke-width="2"/>
  <rect x="52" y="48" width="196" height="28" rx="6" fill="#f4d9a8"/>
  <text x="150" y="68" text-anchor="middle" font-family="Georgia, serif" font-size="15"
        fill="#27241a">weekly notes</text>

  <text x="52" y="112" font-family="Georgia, serif" font-size="13" fill="#625d50">03 / plan</text>
  <path d="M120 106 H452" stroke="#27241a" stroke-width="1.6" fill="none"/>
  <path d="M120 140 C160 128 200 146 244 134 C288 122 330 144 372 132 C404 123 428 136 452 130"
        fill="none" stroke="#27241a" stroke-width="1.6"/>
  <path d="M120 176 H420" stroke="#27241a" stroke-width="1.6" fill="none"/>
  <path d="M120 210 C152 200 186 216 220 206 C258 195 296 214 336 204"
        fill="none" stroke="#27241a" stroke-width="1.6"/>

  <rect x="52" y="252" width="18" height="18" rx="4" fill="none" stroke="#2f6a5c" stroke-width="2"/>
  <path d="M56 261 L61 267 L70 255" fill="none" stroke="#2f6a5c" stroke-width="2.4"
        stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M88 262 H372" stroke="#27241a" stroke-width="1.6" fill="none"/>

  <rect x="52" y="292" width="18" height="18" rx="4" fill="#f4c95d"/>
  <path d="M88 302 H320" stroke="#27241a" stroke-width="1.6" fill="none"/>

  <rect x="52" y="330" width="120" height="6" rx="3" fill="#7bc6a4"/>
  <rect x="182" y="330" width="180" height="6" rx="3" fill="#e8e4db"/>
</svg>`,
    },
    {
        id: 'annotation',
        title: 'Annotated document',
        description:
            'Underlined emphasis, a callout arrow and a margin note — how a review layer draws itself on.',
        tags: ['strokes', 'fills', 'text'],
        source: 'Document annotation layer',
        recommended: { type: 'delayed', duration: 260 },
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 380">
  <rect x="40" y="28" width="380" height="324" rx="14" fill="#fffdf7"
        stroke="#e8e4db" stroke-width="2"/>
  <rect x="70" y="58" width="150" height="14" rx="7" fill="#e8e4db"/>
  <path d="M70 104 H380" stroke="#27241a" stroke-width="1.6" fill="none"/>
  <path d="M70 132 H340" stroke="#27241a" stroke-width="1.6" fill="none"/>
  <path d="M70 160 H370" stroke="#27241a" stroke-width="1.6" fill="none"/>
  <path d="M70 196 H300" stroke="#27241a" stroke-width="1.6" fill="none"/>
  <path d="M70 224 H356" stroke="#27241a" stroke-width="1.6" fill="none"/>

  <rect x="66" y="186" width="240" height="60" rx="8" fill="#f4c95d" fill-opacity="0.35"/>
  <path d="M70 258 C130 266 200 250 306 262" fill="none" stroke="#2f6a5c" stroke-width="4"
        stroke-linecap="round"/>

  <path d="M312 262 C380 262 400 220 452 196" fill="none" stroke="#2f6a5c" stroke-width="2.5"
        stroke-dasharray="7 7"/>
  <path d="M452 196 L436 200 L446 212 Z" fill="#2f6a5c"/>

  <rect x="430" y="120" width="160" height="66" rx="12" fill="#e7efe8"/>
  <text x="510" y="150" text-anchor="middle" font-family="system-ui" font-size="14"
        font-weight="700" fill="#2f6a5c">needs a source</text>
  <text x="510" y="170" text-anchor="middle" font-family="system-ui" font-size="13"
        fill="#625d50">see appendix B</text>
</svg>`,
    },
    {
        id: 'sequence',
        title: 'Sequence diagram',
        description: 'Vertical lifelines, dashed messages and labels drawn in one pass.',
        tags: ['dashed', 'text', 'diagram'],
        source: 'Sequence diagram export',
        recommended: { type: 'sync', duration: 240 },
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 400">
  <defs>
    <marker id="seq-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
      <path d="M0 0 L10 5 L0 10 Z" fill="#27241a"/>
    </marker>
  </defs>

  <rect x="48" y="28" width="150" height="46" rx="10" fill="#f4c95d"/>
  <text x="123" y="56" text-anchor="middle" font-family="system-ui" font-size="16"
        font-weight="700" fill="#27241a">Client</text>
  <rect x="286" y="28" width="150" height="46" rx="10" fill="#a8d8ea"/>
  <text x="361" y="56" text-anchor="middle" font-family="system-ui" font-size="16"
        font-weight="700" fill="#27241a">Server</text>
  <rect x="524" y="28" width="150" height="46" rx="10" fill="#7bc6a4"/>
  <text x="599" y="56" text-anchor="middle" font-family="system-ui" font-size="16"
        font-weight="700" fill="#27241a">Cache</text>

  <path d="M123 74 V368" stroke="#27241a" stroke-width="1.6" stroke-dasharray="8 8" fill="none"/>
  <path d="M361 74 V368" stroke="#27241a" stroke-width="1.6" stroke-dasharray="8 8" fill="none"/>
  <path d="M599 74 V368" stroke="#27241a" stroke-width="1.6" stroke-dasharray="8 8" fill="none"/>

  <path d="M126 128 H358" stroke="#27241a" stroke-width="3" marker-end="url(#seq-arrow)" fill="none"/>
  <text x="242" y="120" text-anchor="middle" font-family="system-ui" font-size="14"
        fill="#625d50">get(key)</text>

  <path d="M364 176 H596" stroke="#27241a" stroke-width="3" marker-end="url(#seq-arrow)" fill="none"/>
  <text x="480" y="168" text-anchor="middle" font-family="system-ui" font-size="14"
        fill="#625d50">lookup(key)</text>

  <path d="M596 224 H367" stroke="#2f6a5c" stroke-width="3" stroke-dasharray="9 7"
        marker-end="url(#seq-arrow)" fill="none"/>
  <text x="480" y="216" text-anchor="middle" font-family="system-ui" font-size="14"
        fill="#2f6a5c">hit</text>

  <path d="M358 272 H129" stroke="#2f6a5c" stroke-width="3" stroke-dasharray="9 7"
        marker-end="url(#seq-arrow)" fill="none"/>
  <text x="242" y="264" text-anchor="middle" font-family="system-ui" font-size="14"
        fill="#2f6a5c">200 OK</text>

  <rect x="129" y="300" width="464" height="52" rx="10" fill="#f5f0e5"
        stroke="#e8e4db" stroke-width="2"/>
  <text x="361" y="332" text-anchor="middle" font-family="system-ui" font-size="14"
        fill="#625d50">round trip 42 ms</text>
</svg>`,
    },
    {
        id: 'mindmap',
        title: 'Mind map',
        description:
            'A centre idea with curved branches. Every node is a filled shape, so each one gets an outline before it fills in.',
        tags: ['fills', 'text', 'diagram'],
        source: 'Mind map export',
        recommended: { type: 'delayed', duration: 300, revealStart: 0.45 },
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 420">
  <ellipse cx="380" cy="210" rx="118" ry="60" fill="#f4c95d" stroke="#27241a" stroke-width="3"/>
  <text x="380" y="216" text-anchor="middle" font-family="system-ui" font-size="20"
        font-weight="700" fill="#27241a">Draw-On</text>

  <path d="M262 210 C200 210 190 120 128 108" fill="none" stroke="#27241a" stroke-width="3"/>
  <path d="M498 210 C560 210 570 120 632 108" fill="none" stroke="#27241a" stroke-width="3"/>
  <path d="M262 214 C200 214 190 306 128 318" fill="none" stroke="#27241a" stroke-width="3"/>
  <path d="M498 214 C560 214 570 306 632 318" fill="none" stroke="#27241a" stroke-width="3"/>

  <rect x="24" y="82" width="150" height="52" rx="14" fill="#a8d8ea" stroke="#27241a" stroke-width="3"/>
  <text x="99" y="114" text-anchor="middle" font-family="system-ui" font-size="15"
        fill="#27241a">strokes</text>

  <rect x="586" y="82" width="150" height="52" rx="14" fill="#7bc6a4" stroke="#27241a" stroke-width="3"/>
  <text x="661" y="114" text-anchor="middle" font-family="system-ui" font-size="15"
        fill="#27241a">fills</text>

  <rect x="24" y="292" width="150" height="52" rx="14" fill="#e7efe8" stroke="#27241a" stroke-width="3"/>
  <text x="99" y="324" text-anchor="middle" font-family="system-ui" font-size="15"
        fill="#27241a">scrub</text>

  <rect x="586" y="292" width="150" height="52" rx="14" fill="#fdf3d9" stroke="#27241a" stroke-width="3"/>
  <text x="661" y="324" text-anchor="middle" font-family="system-ui" font-size="15"
        fill="#27241a">record</text>
</svg>`,
    },
    {
        id: 'pure-strokes',
        title: 'Nothing but strokes',
        description: 'No fills at all: a spiral, a star and an arrow, animated purely as outlines.',
        tags: ['strokes'],
        source: 'Icon set',
        recommended: { type: 'oneByOne', duration: 200 },
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 240">
  <path d="M120 120 C120 96 142 78 166 82 C196 87 208 120 190 142 C167 170 122 166 100 138
           C72 102 100 54 146 44" fill="none" stroke="#27241a" stroke-width="4"
        stroke-linecap="round"/>
  <path d="M320 44 L336 100 L394 100 L348 134 L366 190 L320 156 L274 190 L292 134 L246 100 L304 100 Z"
        fill="none" stroke="#27241a" stroke-width="4" stroke-linejoin="round"/>
  <path d="M452 190 V64" fill="none" stroke="#27241a" stroke-width="4" stroke-linecap="round"/>
  <path d="M424 92 L452 60 L480 92" fill="none" stroke="#27241a" stroke-width="4"
        stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M432 178 H556" fill="none" stroke="#2f6a5c" stroke-width="4" stroke-linecap="round"/>
</svg>`,
    },
    {
        id: 'dark-canvas',
        title: 'Dark canvas',
        description:
            'A dark board with light strokes and gold accents — stroke colours come straight from your markup.',
        tags: ['dark', 'strokes', 'text'],
        source: 'Dark-theme diagram',
        recommended: { stroke: '#f6f2e8', duration: 240 },
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 340">
  <rect x="0" y="0" width="720" height="340" rx="18" fill="#1b1a15"/>
  <circle cx="96" cy="96" r="34" fill="none" stroke="#f6f2e8" stroke-width="3"/>
  <path d="M130 130 C210 200 300 110 400 180 C470 230 560 190 636 236" fill="none"
        stroke="#f4c95d" stroke-width="4" stroke-linecap="round"/>
  <path d="M96 190 H320" fill="none" stroke="#a8d8ea" stroke-width="3" stroke-linecap="round"/>
  <path d="M96 226 H260" fill="none" stroke="#7bc6a4" stroke-width="3" stroke-linecap="round"/>
  <rect x="420" y="64" width="200" height="70" rx="14" fill="none" stroke="#f6f2e8"
        stroke-width="2.5"/>
  <text x="520" y="106" text-anchor="middle" font-family="system-ui" font-size="18"
        fill="#f6f2e8">dark mode</text>
  <text x="96" y="290" font-family="ui-monospace, monospace" font-size="14"
        fill="#8d897d">stroke colours are yours to choose</text>
</svg>`,
    },
];

export function findSample(id: string): SampleDef | undefined {
    return SAMPLES.find((sample) => sample.id === id);
}

/** A fresh copy of a sample's markup — the engine mutates the element it is given. */
export function cloneSample(id: string): string {
    return findSample(id)?.svg ?? '';
}



