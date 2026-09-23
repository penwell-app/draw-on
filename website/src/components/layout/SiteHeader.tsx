import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { GitHubIcon, NpmIcon } from '../icons/BrandIcons';
import { SearchDialog } from './SearchDialog';
import { ThemeToggle } from './ThemeToggle';

const LINKS = [
    { to: '/docs/introduction', label: 'Docs' },
    { to: '/playground', label: 'Playground' },
    { to: '/examples', label: 'Examples' },
];

/** Sticky top bar: brand, primary sections, search, theme and package links. */
export function SiteHeader() {
    const [searchOpen, setSearchOpen] = useState(false);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setSearchOpen((open) => !open);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    return (
        <>
            <header className="site-header">
                <div className="shell">
                    <Link className="brand" to="/">
                        <img src="/draw-on.svg" alt="" width={26} height={26} />
                        Draw-On
                        <span className="brand-sub">v{__DRAW_ON_VERSION__}</span>
                    </Link>

                    <nav className="site-nav" aria-label="Primary">
                        {LINKS.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) => (isActive ? 'active' : undefined)}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="header-actions">
                        <button
                            type="button"
                            className="icon-button"
                            onClick={() => setSearchOpen(true)}
                            aria-label="Search the docs"
                            title="Search (Ctrl or Cmd + K)"
                        >
                            <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>⌕</span>
                        </button>

                        <a
                            className="icon-button"
                            href="https://github.com/penwell-app/draw-on"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Draw-On on GitHub"
                            title="GitHub"
                        >
                            <GitHubIcon size={16} />
                        </a>

                        <a
                            className="chip header-npm-chip"
                            href="https://www.npmjs.com/package/@penwell/draw-on"
                            target="_blank"
                            rel="noreferrer"
                            title="npm package"
                        >
                            <NpmIcon size={14} />
                            <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>
                                v{__DRAW_ON_VERSION__}
                            </span>
                        </a>

                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} />}
        </>
    );
}
