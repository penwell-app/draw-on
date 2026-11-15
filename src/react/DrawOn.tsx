import { forwardRef, useImperativeHandle, type CSSProperties, type ReactNode } from 'react';
import type { Drawing } from '../core/draw';
import { useDrawOn, type UseDrawOnOptions } from './useDrawOn';

export interface DrawOnProps extends UseDrawOnOptions {
    className?: string;
    style?: CSSProperties;
    /** An inline `<svg>` (JSX or an SVGR component) to draw. Ignored when `svg` or `src` is set. */
    children?: ReactNode;
}

export interface DrawOnHandle {
    play(): Promise<boolean>;
    restart(): Promise<boolean>;
    reverse(): Promise<boolean>;
    resume(): Promise<boolean>;
    pause(): void;
    seek(fraction: number): void;
    readonly drawing: Drawing | null;
}

/**
 * Draws an SVG given as JSX children, markup (`svg`) or a URL (`src`).
 *
 * @example
 * <DrawOn trigger="inView" type="stagger"><Logo /></DrawOn>
 * <DrawOn src="/diagram.svg" reveal="stroke" />
 */
export const DrawOn = forwardRef<DrawOnHandle, DrawOnProps>(function DrawOn(
    { className, style, children, ...options },
    handle,
) {
    const api = useDrawOn<HTMLDivElement>(options);
    useImperativeHandle(
        handle,
        () => ({
            play: api.play,
            restart: api.restart,
            reverse: api.reverse,
            resume: api.resume,
            pause: api.pause,
            seek: api.seek,
            get drawing() {
                return api.drawing;
            },
        }),
        [api.drawing],
    );
    const ownsContent = options.svg != null || !!options.src;
    return (
        <div ref={api.ref} className={className} style={style} data-status={api.status}>
            {ownsContent ? null : children}
        </div>
    );
});
