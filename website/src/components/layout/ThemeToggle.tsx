import { useTheme } from '../../lib/theme';
import type { ThemeName } from '../../lib/theme';

const ORDER: ThemeName[] = ['system', 'light', 'dark'];
const ICONS: Record<ThemeName, string> = { system: 'auto', light: 'light', dark: 'dark' };

/** Cycles system → light → dark. The choice is remembered in localStorage. */
export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const next = () => {
        const index = ORDER.indexOf(theme);
        setTheme(ORDER[(index + 1) % ORDER.length]);
    };

    return (
        <button
            type="button"
            className="icon-button"
            onClick={next}
            title={`Theme: ${theme}. Click to change.`}
            aria-label={`Theme: ${theme}. Click to change.`}
        >
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{ICONS[theme]}</span>
        </button>
    );
}
