declare const process: { env: { NODE_ENV?: string } } | undefined;

const isDev = typeof process === 'undefined' || process?.env?.NODE_ENV !== 'production';

/** Dev-only console warning, stripped to a no-op in production builds. */
export function warn(message: string, ...details: unknown[]) {
    if (isDev && typeof console !== 'undefined') {
        console.warn(`[draw-on] ${message}`, ...details);
    }
}
