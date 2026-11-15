import animatedSvgExport from './AnimatedSvgExportDemo.tsx?raw';
import basicStrokes from './BasicStrokesDemo.tsx?raw';
import coreApi from './CoreApiDemo.tsx?raw';
import drawOnComponent from './DrawOnComponentDemo.tsx?raw';
import drawOnElement from './DrawOnElementDemo.tsx?raw';
import easingLab from './EasingLabDemo.tsx?raw';
import engineHandle from './EngineHandleDemo.tsx?raw';
import inView from './InViewDemo.tsx?raw';
import intersection from './IntersectionDemo.tsx?raw';
import mermaid from './MermaidDemo.tsx?raw';
import orderingModes from './OrderingModesDemo.tsx?raw';
import penNib from './PenNibDemo.tsx?raw';
import presets from './PresetsDemo.tsx?raw';
import reactComponent from './ReactComponentDemo.tsx?raw';
import reactHook from './ReactHookDemo.tsx?raw';
import recordFrames from './RecordFramesDemo.tsx?raw';
import recordWebM from './RecordWebMDemo.tsx?raw';
import revealTextModes from './RevealTextModesDemo.tsx?raw';
import revealWindow from './RevealWindowDemo.tsx?raw';
import scrubbing from './ScrubbingDemo.tsx?raw';
import scrollScrub from './ScrollScrubDemo.tsx?raw';
import scrollScrubV1 from './ScrollScrubV1Demo.tsx?raw';
import sketchyMode from './SketchyModeDemo.tsx?raw';
import symbolSprite from './SymbolSpriteDemo.tsx?raw';
import useDrawOnTriggers from './UseDrawOnTriggersDemo.tsx?raw';
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
    'engine-handle': { filename: 'EngineHandleDemo.tsx', code: engineHandle },
    'ordering-modes': { filename: 'OrderingModesDemo.tsx', code: orderingModes },
    'easing-lab': { filename: 'EasingLabDemo.tsx', code: easingLab },
    'reveal-text-modes': { filename: 'RevealTextModesDemo.tsx', code: revealTextModes },
    'pen-nib': { filename: 'PenNibDemo.tsx', code: penNib },
    'sketchy-mode': { filename: 'SketchyModeDemo.tsx', code: sketchyMode },
    presets: { filename: 'PresetsDemo.tsx', code: presets },
    'drawon-component': { filename: 'DrawOnComponentDemo.tsx', code: drawOnComponent },
    'usedrawon-triggers': { filename: 'UseDrawOnTriggersDemo.tsx', code: useDrawOnTriggers },
    'drawon-element': { filename: 'DrawOnElementDemo.tsx', code: drawOnElement },
    'symbol-sprite': { filename: 'SymbolSpriteDemo.tsx', code: symbolSprite },
    'scroll-scrub-v1': { filename: 'ScrollScrubV1Demo.tsx', code: scrollScrubV1 },
    'in-view': { filename: 'InViewDemo.tsx', code: inView },
    'record-frames': { filename: 'RecordFramesDemo.tsx', code: recordFrames },
    'animated-svg-export': { filename: 'AnimatedSvgExportDemo.tsx', code: animatedSvgExport },

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