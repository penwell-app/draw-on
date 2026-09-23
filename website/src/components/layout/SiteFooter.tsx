import { Link } from 'react-router-dom';
import { FLAT_NAV } from '../../content/nav';

const COLUMNS = [
    {
        title: 'Learn',
        links: [
            { to: '/docs/introduction', label: 'Introduction' },
            { to: '/docs/quickstart', label: 'Quickstart' },
            { to: '/docs/how-it-works', label: 'How it works' },
            { to: '/docs/guides/react', label: 'React guide' },
        ],
    },
    {
        title: 'Build',
        links: [
            { to: '/playground', label: 'Playground' },
            { to: '/examples', label: 'Examples' },
            { to: '/docs/guides/recording', label: 'Recording to WebM' },
            { to: '/docs/faq', label: 'Troubleshooting' },
        ],
    },
    {
        title: 'Package',
        links: [
            { to: '/docs/api/create-drawing', label: 'createDrawing' },
            { to: '/docs/api/use-sketch-draw', label: 'useSketchDraw' },
            { to: '/docs/changelog', label: 'Changelog' },
            { to: '/docs/contributing', label: 'Contributing' },
        ],
    },
];

export function SiteFooter() {
    return (
        <footer className="site-footer">
            <div className="shell">
                <div className="footer-grid">
                    <div>
                        <h4>Draw-On</h4>
                        <p className="muted" style={{ maxWidth: '34ch' }}>
                            Make any inline SVG draw itself: strokes first, then fills and labels.
                            Scrubbable, recordable, and shipped as {FLAT_NAV.length} documented pages
                            of examples.
                        </p>
                    </div>

                    {COLUMNS.map((column) => (
                        <div key={column.title}>
                            <h4>{column.title}</h4>
                            <ul>
                                {column.links.map((link) => (
                                    <li key={link.to}>
                                        <Link to={link.to}>{link.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="footer-bottom">
                    <span>MIT © 2026 Pratik Singh · @penwell/draw-on v{__DRAW_ON_VERSION__}</span>
                    <span>
                        <a
                            href="https://www.npmjs.com/package/@penwell/draw-on"
                            target="_blank"
                            rel="noreferrer"
                        >
                            npm
                        </a>{' '}
                        ·{' '}
                        <a
                            href="https://github.com/penwell-app/draw-on"
                            target="_blank"
                            rel="noreferrer"
                        >
                            GitHub
                        </a>{' '}
                        ·{' '}
                        <a href="https://usepenwell.com/" target="_blank" rel="noreferrer">
                            Built for Penwell
                        </a>
                    </span>
                </div>
            </div>
        </footer>
    );
}
