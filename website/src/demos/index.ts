import type { ComponentType } from 'react';
import { AnimatedSvgExportDemo } from './AnimatedSvgExportDemo';
import { BasicStrokesDemo } from './BasicStrokesDemo';
import { CoreApiDemo } from './CoreApiDemo';
import { DrawOnComponentDemo } from './DrawOnComponentDemo';
import { DrawOnElementDemo } from './DrawOnElementDemo';
import { EasingLabDemo } from './EasingLabDemo';
import { EngineHandleDemo } from './EngineHandleDemo';
import { InViewDemo } from './InViewDemo';
import { IntersectionDemo } from './IntersectionDemo';
import { MermaidDemo } from './MermaidDemo';
import { OrderingModesDemo } from './OrderingModesDemo';
import { PenNibDemo } from './PenNibDemo';
import { PresetsDemo } from './PresetsDemo';
import { ReactComponentDemo } from './ReactComponentDemo';
import { ReactHookDemo } from './ReactHookDemo';
import { RecordFramesDemo } from './RecordFramesDemo';
import { RecordWebMDemo } from './RecordWebMDemo';
import { RevealTextModesDemo } from './RevealTextModesDemo';
import { RevealWindowDemo } from './RevealWindowDemo';
import { ScrubbingDemo } from './ScrubbingDemo';
import { ScrollScrubDemo } from './ScrollScrubDemo';
import { ScrollScrubV1Demo } from './ScrollScrubV1Demo';
import { SketchyModeDemo } from './SketchyModeDemo';
import { SymbolSpriteDemo } from './SymbolSpriteDemo';
import { UseDrawOnTriggersDemo } from './UseDrawOnTriggersDemo';
import { VivusCompareDemo } from './VivusCompareDemo';

export { DEMO_SOURCES } from './sources';
export type { DemoSource } from './sources';

/**
 * The demos themselves, keyed by the same ids as `DEMO_SOURCES`. A page that
 * passes `sourceId` to `<LiveDemo>` gets this component rendered live *and* its
 * source printed underneath, so the two can never drift.
 *
 * The `v1-*` ids drive the 1.0 engine. The unprefixed ones document 0.1.x and are
 * kept for the pages under the legacy sidebar groups.
 */
export const DEMO_COMPONENTS: Record<string, ComponentType> = {
    // 1.0 engine
    'engine-handle': EngineHandleDemo,
    'ordering-modes': OrderingModesDemo,
    'easing-lab': EasingLabDemo,
    'reveal-text-modes': RevealTextModesDemo,
    'pen-nib': PenNibDemo,
    'sketchy-mode': SketchyModeDemo,
    presets: PresetsDemo,
    'drawon-component': DrawOnComponentDemo,
    'usedrawon-triggers': UseDrawOnTriggersDemo,
    'drawon-element': DrawOnElementDemo,
    'symbol-sprite': SymbolSpriteDemo,
    'scroll-scrub-v1': ScrollScrubV1Demo,
    'in-view': InViewDemo,
    'record-frames': RecordFramesDemo,
    'animated-svg-export': AnimatedSvgExportDemo,

    // 0.1.x engine
    'basic-strokes': BasicStrokesDemo,
    'core-api': CoreApiDemo,
    'react-hook': ReactHookDemo,
    'react-component': ReactComponentDemo,
    'reveal-window': RevealWindowDemo,
    scrubbing: ScrubbingDemo,
    'scroll-scrub': ScrollScrubDemo,
    'record-webm': RecordWebMDemo,
    mermaid: MermaidDemo,
    'vivus-compare': VivusCompareDemo,
    intersection: IntersectionDemo,
};

export const DEMO_IDS = Object.keys(DEMO_COMPONENTS);