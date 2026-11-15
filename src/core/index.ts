export {
    SHAPE_SELECTOR,
    TEXT_SELECTOR,
    NON_RENDERED_SELECTOR,
    DEFAULT_STROKE,
    DEFAULT_STROKE_WIDTH,
    isPaint,
} from './paint';

export { draw } from './draw';
export type {
    Drawing as DrawOnDrawing,
    DrawOptions,
    DrawEvent,
    DrawStats,
    RevealMode,
    TextMode,
    PenOptions,
    SketchyOptions,
    Easing,
    EasingFn,
    EasingName,
} from './draw';
export { easings } from './engine/easing';

export { mount } from './mount';
export type { MountOptions } from './mount';

export { toAnimatedSVG } from './animatedSvg';
export type { AnimatedSvgOptions } from './animatedSvg';

export { scrollScrub, inView } from './scroll';
export type { ScrollScrubOptions, InViewOptions } from './scroll';

export { presets } from './presets';
export type { PresetName } from './presets';

export { createDrawing } from './createDrawing';
export type { Drawing, DrawingOptions, DrawType } from './createDrawing';

export { parseSvg, loadSvg, sanitizeSvg, computeDims, InvalidSvgError } from './parseSvg';
export type { Dimensions } from './parseSvg';

export { canRecordVideo, recordDrawToWebM, recordFrames, downloadBlob } from './record';
export type { RecordOptions } from './record';
