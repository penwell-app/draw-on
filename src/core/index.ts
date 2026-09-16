export {
    SHAPE_SELECTOR,
    TEXT_SELECTOR,
    DEFAULT_STROKE,
    DEFAULT_STROKE_WIDTH,
    isPaint,
} from './paint';

export { createDrawing } from './createDrawing';
export type { Drawing, DrawingOptions, DrawType } from './createDrawing';

export { parseSvg, computeDims, InvalidSvgError } from './parseSvg';
export type { Dimensions } from './parseSvg';

export { canRecordVideo, recordDrawToWebM, downloadBlob } from './record';
export type { RecordOptions } from './record';
