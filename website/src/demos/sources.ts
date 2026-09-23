import basicStrokes from './BasicStrokesDemo.tsx?raw';
import coreApi from './CoreApiDemo.tsx?raw';
import intersection from './IntersectionDemo.tsx?raw';
import mermaid from './MermaidDemo.tsx?raw';
import reactComponent from './ReactComponentDemo.tsx?raw';
import reactHook from './ReactHookDemo.tsx?raw';
import recordWebM from './RecordWebMDemo.tsx?raw';
import revealWindow from './RevealWindowDemo.tsx?raw';
import scrubbing from './ScrubbingDemo.tsx?raw';
import scrollScrub from './ScrollScrubDemo.tsx?raw';
import vivusCompare from './VivusCompareDemo.tsx?raw';

export interface DemoSource {
    filename: string;
    code: string;
}

/**
 * The exact source of every demo component, imported as text. Anything shown on
 * the site with a `sourceId` is the file that is actually running above it, so
 * the snippets can never drift from the behaviour.
 */
export const DEMO_SOURCES: Record<string, DemoSource> = {
    'basic-strokes': { filename: 'BasicStrokesDemo.tsx', code: basicStrokes },
    'core-api': { filename: 'CoreApiDemo.tsx', code: coreApi },
    'react-hook': { filename: 'ReactHookDemo.tsx', code: reactHook },
    'react-component': { filename: 'ReactComponentDemo.tsx', code: reactComponent },
    'reveal-window': { filename: 'RevealWindowDemo.tsx', code: revealWindow },
    scrubbing: { filename: 'ScrubbingDemo.tsx', code: scrubbing },
    'scroll-scrub': { filename: 'ScrollScrubDemo.tsx', code: scrollScrub },
    'record-webm': { filename: 'RecordWebMDemo.tsx', code: recordWebM },
    mermaid: { filename: 'MermaidDemo.tsx', code: mermaid },
    'vivus-compare': { filename: 'VivusCompareDemo.tsx', code: vivusCompare },
    intersection: { filename: 'IntersectionDemo.tsx', code: intersection },
};

export const DEMO_SOURCE_IDS = Object.keys(DEMO_SOURCES);
