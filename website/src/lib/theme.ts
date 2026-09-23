import { useCallback, useEffect, useState } from 'react';

export type ThemeName = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'draw-on-theme';

export function readStoredTheme(): ThemeName {
    if (typeof localStorage === 'undefined') return 'system';
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    } catch {
        return 'system';
    }
}

export function systemPrefersDark(): boolean {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveTheme(theme: ThemeName, systemDark = systemPrefersDark()): ResolvedTheme {
    if (theme === 'system') return systemDark ? 'dark' : 'light';
    return theme;
}

/**
 * Theme state for the site. The resolved theme is derived rather than stored, so
 * switching is just a render; the effect only mirrors it onto `<html>` for CSS.
 * `index.html` applies the stored theme before React loads, avoiding a flash.
 */
export function useTheme() {
    const [theme, setThemeState] = useState<ThemeName>(() => readStoredTheme());
    const [systemDark, setSystemDark] = useState(() => systemPrefersDark());
    const resolved = resolveTheme(theme, systemDark);

    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.dataset.theme = resolved;
        }
    }, [resolved]);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return undefined;
        }
        const query = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = () => setSystemDark(query.matches);
        query.addEventListener('change', onChange);
        return () => query.removeEventListener('change', onChange);
    }, []);

    const setTheme = useCallback((next: ThemeName) => {
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {
            /* storage can be unavailable in private modes — the theme still applies */
        }
        setThemeState(next);
    }, []);

    return { theme, resolved, setTheme };
}
