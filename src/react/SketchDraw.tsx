import type { CSSProperties, ReactNode } from 'react';
import { useSketchDraw, type SketchDrawApi, type UseSketchDrawOptions } from './useSketchDraw';

export interface SketchDrawProps extends UseSketchDrawOptions {
    className?: string;
    style?: CSSProperties;
    /** Render prop for controls (replay, export, progress). Rendered after the SVG. */
    children?: (api: SketchDrawApi) => ReactNode;
}

/**
 * Unstyled host for a draw-on animation. Bring your own chrome via `children`,
 * or drop down to `useSketchDraw` for full control of the markup.
 */
export function SketchDraw({ className, style, children, ...options }: SketchDrawProps) {
    const api = useSketchDraw(options);
    return (
        <>
            <div ref={api.containerRef} className={className} style={style} />
            {children?.(api)}
        </>
    );
}
