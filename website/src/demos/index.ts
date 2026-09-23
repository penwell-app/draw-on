import type { ComponentType } from 'react';
import { BasicStrokesDemo } from './BasicStrokesDemo';
import { CoreApiDemo } from './CoreApiDemo';
import { IntersectionDemo } from './IntersectionDemo';
import { MermaidDemo } from './MermaidDemo';
import { ReactComponentDemo } from './ReactComponentDemo';
import { ReactHookDemo } from './ReactHookDemo';
import { RecordWebMDemo } from './RecordWebMDemo';
import { RevealWindowDemo } from './RevealWindowDemo';
import { ScrubbingDemo } from './ScrubbingDemo';
import { ScrollScrubDemo } from './ScrollScrubDemo';
import { VivusCompareDemo } from './VivusCompareDemo';

export { DEMO_SOURCES } from './sources';
export type { DemoSource } from './sources';

/**
 * The demos themselves, keyed by the same ids as `DEMO_SOURCES`. A page that
 * passes `sourceId` to `<LiveDemo>` gets this component rendered live *and* its
 * source printed underneath, so the two can never drift.
 */
export const DEMO_COMPONENTS: Record<string, ComponentType> = {
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
