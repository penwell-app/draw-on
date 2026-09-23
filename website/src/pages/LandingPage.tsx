import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CodeTabs } from '../components/docs/CodeTabs';
import { MediaGallery } from '../components/docs/MediaGallery';
import { LiveDemo } from '../components/demo/LiveDemo';
import { GitHubIcon, NpmIcon } from '../components/icons/BrandIcons';
import { DEMO_SOURCES } from '../demos/sources';
import { SAMPLES } from '../content/samples';
import { FLAT_NAV } from '../content/nav';
import { useLiveDrawing } from '../lib/useLiveDrawing';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import { useReducedMotion } from '../lib/useReducedMotion';
import { useCopyToClipboard } from '../lib/useCopyToClipboard';

const FEATURES = [
    {
        icon: '01',
        title: 'Strokes draw themselves',
        body: 'Every path, line and outline animates on progressively, in the order you choose.',
    },
    {
        icon: '02',
        title: 'Fill-only shapes get an outline',
        body: 'Shapes with no stroke are given one so there is something to draw, then it fades away.',
    },
    {
        icon: '03',
        title: 'Labels fade in last',
        body: 'Text, images and foreign objects stay hidden until the strokes have finished.',
    },
    {
        icon: '04',
        title: 'Scrubbable',
        body: 'Progress is a number from 0 to 1, so sliders, timelines and scroll all work.',
    },
    {
        icon: '05',
        title: 'Recordable in the browser',
        body: 'Export a WebM clip with MediaRecorder and canvas.captureStream — no server, no ffmpeg.',
    },
    {
        icon: '06',
        title: 'React or plain JS',
        body: 'A hook, an unstyled component, and a framework-agnostic core in the same package.',
    },
];

const API_SNIPPETS = [
    {
        num: '01',
        slug: '/docs/api/create-drawing',
        blurb: 'Engine entry point',
        codeJsx: (
            <>
                <span className="tok-fn">createDrawing</span>
                <span className="tok-punc">(</span>
                <span className="tok-var">svg</span>
                <span className="tok-punc">, </span>
                <span className="tok-var">options</span>
                <span className="tok-punc">)</span>
            </>
        ),
        raw: 'createDrawing(svg, options); // Engine entry point',
    },
    {
        num: '02',
        slug: '/docs/guides/scrubbing',
        blurb: 'Scrub anywhere',
        codeJsx: (
            <>
                <span className="tok-var">drawing</span>
                <span className="tok-punc">.</span>
                <span className="tok-fn">setProgress</span>
                <span className="tok-punc">(</span>
                <span className="tok-num">0.5</span>
                <span className="tok-punc">)</span>
            </>
        ),
        raw: 'drawing.setProgress(0.5); // Scrub anywhere',
    },
    {
        num: '03',
        slug: '/docs/api/create-drawing',
        blurb: 'Strokes, then fills',
        codeJsx: (
            <>
                <span className="tok-var">drawing</span>
                <span className="tok-punc">.</span>
                <span className="tok-fn">play</span>
                <span className="tok-punc">()</span>
            </>
        ),
        raw: 'drawing.play(); // Strokes, then fills',
    },
    {
        num: '04',
        slug: '/docs/api/use-sketch-draw',
        blurb: 'React hook',
        codeJsx: (
            <>
                <span className="tok-fn">useSketchDraw</span>
                <span className="tok-punc">({'{ '}</span>
                <span className="tok-prop">svgMarkup</span>
                <span className="tok-punc">{' }'}</span>
                <span className="tok-punc">)</span>
            </>
        ),
        raw: 'useSketchDraw({ svgMarkup }); // React hook',
    },
    {
        num: '05',
        slug: '/docs/api/sketch-draw',
        blurb: 'Component + render prop',
        codeJsx: (
            <>
                <span className="tok-punc">&lt;</span>
                <span className="tok-tag">SketchDraw</span>
                <span className="tok-prop"> svgMarkup</span>
                <span className="tok-punc">=</span>
                <span className="tok-str">"..."</span>
                <span className="tok-punc"> /&gt;</span>
            </>
        ),
        raw: '<SketchDraw svgMarkup="..." /> // Component + render prop',
    },
    {
        num: '06',
        slug: '/docs/api/record',
        blurb: 'Browser-side capture',
        codeJsx: (
            <>
                <span className="tok-fn">recordDrawToWebM</span>
                <span className="tok-punc">(</span>
                <span className="tok-var">el</span>
                <span className="tok-punc">, </span>
                <span className="tok-var">setProgress</span>
                <span className="tok-punc">, </span>
                <span className="tok-var">options</span>
                <span className="tok-punc">)</span>
            </>
        ),
        raw: 'recordDrawToWebM(el, setProgress, options); // Browser-side capture',
    },
];

function InstallCodeBlock() {
    const { copied, copy } = useCopyToClipboard();
    const command = 'npm install @penwell/draw-on';

    return (
        <div className="install-codeblock">
            <div className="install-codeblock-content">
                <NpmIcon size={16} className="install-npm-icon" />
                <span className="install-prompt">$</span>
                <code className="install-code">
                    <span className="token-cmd">npm</span>{' '}
                    <span className="token-arg">install</span>{' '}
                    <span className="token-pkg">@penwell/draw-on</span>
                </code>
            </div>
            <button
                type="button"
                className="code-block-copy"
                onClick={() => void copy(command)}
                aria-label="Copy install command"
                title={copied ? 'Copied to clipboard' : 'Copy command'}
            >
                {copied ? (
                    <>
                        <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                            <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                        </svg>
                        <span>Copied</span>
                    </>
                ) : (
                    <>
                        <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                            <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z" />
                            <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z" />
                        </svg>
                        <span>Copy</span>
                    </>
                )}
            </button>
        </div>
    );
}

function ApiCodeEditor() {
    const { copied, copy } = useCopyToClipboard();
    const allCode = API_SNIPPETS.map((s) => s.raw).join('\n');

    return (
        <div className="api-code-editor">
            <div className="api-editor-header">
                <div className="code-block-dots" aria-hidden="true">
                    <span className="dot dot-red" />
                    <span className="dot dot-yellow" />
                    <span className="dot dot-green" />
                </div>
                <div className="api-editor-tab">
                    <svg className="code-block-file-icon" viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                        <path d="M4 1.75C4 .784 4.784 0 5.75 0h5.586a1.75 1.75 0 0 1 1.237.513l2.914 2.914c.328.328.513.774.513 1.237v9.586A1.75 1.75 0 0 1 14.25 16h-8.5A1.75 1.75 0 0 1 4 14.25V1.75Z" opacity="0.6" />
                    </svg>
                    <span>api-cheatsheet.ts</span>
                </div>
                <span className="code-block-lang">TypeScript</span>
                <button
                    type="button"
                    className="code-block-copy"
                    onClick={() => void copy(allCode)}
                    aria-label="Copy API snippets"
                    title={copied ? 'Copied to clipboard' : 'Copy all snippets'}
                >
                    {copied ? (
                        <>
                            <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                            </svg>
                            <span>Copied</span>
                        </>
                    ) : (
                        <>
                            <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                                <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z" />
                                <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z" />
                            </svg>
                            <span>Copy all</span>
                        </>
                    )}
                </button>
            </div>
            <div className="api-editor-lines">
                {API_SNIPPETS.map((snippet) => (
                    <Link
                        key={snippet.slug + snippet.num}
                        to={snippet.slug}
                        className="api-editor-row"
                        title={`View docs: ${snippet.blurb}`}
                    >
                        <span className="api-row-num">{snippet.num}</span>
                        <div className="api-row-code">{snippet.codeJsx}</div>
                        <span className="api-row-comment">// {snippet.blurb}</span>
                        <span className="api-row-arrow" aria-hidden="true">→</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}

const TABS = [
    { id: 'basic', label: 'Strokes and fills', sampleId: 'hello-strokes' },
    { id: 'diagram', label: 'Diagram', sampleId: 'flowchart' },
    { id: 'notebook', label: 'Notebook', sampleId: 'notebook-page' },
];

/** Fetches the repository logo and draws it with the library itself. */
function SelfDrawingLogo() {
    const [markup, setMarkup] = useState('');
    const played = useRef(false);
    const reducedMotion = useReducedMotion();
    const [live, hostRef] = useLiveDrawing({
        svgMarkup: markup,
        options: { duration: 340, revealStart: 0.55, revealMs: 800 },
        autoPlay: false,
    });

    useEffect(() => {
        let cancelled = false;
        fetch('/draw-on.svg')
            .then((response) => response.text())
            .then((text) => {
                if (!cancelled) setMarkup(text);
            })
            .catch(() => undefined);
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!markup || reducedMotion || played.current) return;
        played.current = true;
        live.play();
    }, [markup, reducedMotion, live]);

    if (!markup) {
        return <img src="/draw-on.svg" alt="Draw-On" width={640} height={400} />;
    }

    return (
        <>
            <div ref={hostRef} aria-label="The Draw-On logo, drawing itself" />
            <div className="hero-stage-controls">
                <button type="button" className="button small" onClick={live.play}>
                    Replay the logo
                </button>
                <input
                    className="demo-scrub"
                    type="range"
                    min="0"
                    max="1"
                    step="0.001"
                    value={live.progress}
                    aria-label="Logo progress"
                    onChange={(event) => live.scrub(Number(event.target.value))}
                />
                <span className="demo-percent">{Math.round(live.progress * 100)}%</span>
            </div>
        </>
    );
}


export function LandingPage() {
    const [active, setActive] = useState(TABS[0].id);

    useDocumentMeta({
        title: 'Draw-On - make any inline SVG draw itself',
        description:
            '@penwell/draw-on animates any inline SVG: progressive strokes, fill and label reveals, scrubbing, and WebM recording in the browser.',
        path: '/',
    });

    const codeTabs = useMemo(
        () => [
            {
                id: 'hook',
                label: 'React hook',
                language: 'tsx',
                filename: 'ReactHookDemo.tsx',
                code: DEMO_SOURCES['react-hook'].code,
            },
            {
                id: 'core',
                label: 'Vanilla',
                language: 'ts',
                filename: 'CoreApiDemo.tsx',
                code: DEMO_SOURCES['core-api'].code,
            },
            {
                id: 'record',
                label: 'Recording',
                language: 'tsx',
                filename: 'RecordWebMDemo.tsx',
                code: DEMO_SOURCES['record-webm'].code,
            },
        ],
        [],
    );

    const tab = TABS.find((item) => item.id === active) ?? TABS[0];

    return (
        <main>
            <section className="hero">
                <div className="shell hero-grid">
                    <div>
                        <span className="eyebrow">npm · @penwell/draw-on v{__DRAW_ON_VERSION__}</span>
                        <h1>Make any inline SVG draw itself.</h1>
                        <p className="lead">
                            Strokes animate on one by one, then fills and labels fade in behind them.
                            Scrub to any point with <code>setProgress</code>, or record the whole thing
                            to a WebM clip - in the browser, with no server and no ffmpeg.
                        </p>

                        <InstallCodeBlock />

                        <div className="hero-actions">
                            <Link className="button" to="/docs/quickstart">
                                Get started
                            </Link>
                            <Link className="button secondary" to="/playground">
                                Try the playground
                            </Link>
                            <a
                                className="button secondary icon-link"
                                href="https://github.com/penwell-app/draw-on"
                                target="_blank"
                                rel="noreferrer"
                                title="Draw-On on GitHub"
                            >
                                <GitHubIcon size={17} />
                                <span>GitHub</span>
                            </a>
                            <a
                                className="button secondary icon-link"
                                href="https://www.npmjs.com/package/@penwell/draw-on"
                                target="_blank"
                                rel="noreferrer"
                                title="@penwell/draw-on on npm"
                            >
                                <NpmIcon size={16} />
                                <span>npm</span>
                            </a>
                        </div>

                        <div className="hero-meta">
                            <span className="chip accent">ESM + CJS</span>
                            <span className="chip">TypeScript</span>
                            <span className="chip">React optional</span>
                            <span className="chip">
                                {SAMPLES.length} samples · {FLAT_NAV.length} docs pages
                            </span>
                        </div>
                    </div>

                    <div className="hero-stage">
                        <SelfDrawingLogo />
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="shell">
                    <div className="section-head">
                        <div>
                            <span className="eyebrow">See it happen</span>
                            <h2>Swap the markup, keep the code.</h2>
                            <p>
                                Everything below is the real engine running on this page. Press Draw,
                                drag the scrubber, or export the clip.
                            </p>
                        </div>
                        <div className="spacer" />
                        <div className="landing-tabs" role="tablist" aria-label="Sample demos">
                            {TABS.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={item.id === active}
                                    onClick={() => setActive(item.id)}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <LiveDemo
                        key={tab.id}
                        sampleId={tab.sampleId}
                        title={`${tab.label} — ${SAMPLES.find((sample) => sample.id === tab.sampleId)?.source ?? 'SVG'}`}
                        description="Replay, scrub and record, straight from the package."
                        controls="full"
                        record
                        autoPlayWhenInView
                        height={340}
                    />
                </div>
            </section>

            <section className="section">
                <div className="shell">
                    <div className="section-head">
                        <div>
                            <span className="eyebrow">What you get</span>
                            <h2>Small surface, useful primitives.</h2>
                        </div>
                    </div>

                    <div className="feature-grid">
                        {FEATURES.map((feature) => (
                            <article className="feature" key={feature.icon}>
                                <span className="feature-icon">{feature.icon}</span>
                                <h3>{feature.title}</h3>
                                <p>{feature.body}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="shell">
                    <div className="section-head">
                        <div>
                            <span className="eyebrow">Why not just Vivus?</span>
                            <h2>Because real diagrams are not all strokes.</h2>
                            <p>
                                Mermaid, Excalidraw and Figma exports are mostly filled shapes and
                                text. Draw-On synthesises the outlines, hides the fills, and brings
                                them back at the right moment.
                            </p>
                        </div>
                        <div className="spacer" />
                        <Link className="button small secondary" to="/docs/vivus-comparison">
                            Read the comparison
                        </Link>
                    </div>

                    <div className="compare">
                        <article>
                            <h3>Vivus on its own</h3>
                            <ul>
                                <li>Drives strokes; fills and labels are on screen from the start</li>
                                <li>No reveal window for fills or text</li>
                                <li>No frame-accurate progress API for recording</li>
                                <li>No browser-side video export</li>
                            </ul>
                        </article>
                        <article>
                            <h3>@penwell/draw-on</h3>
                            <ul>
                                <li>Gives fill-only shapes a temporary outline so they can draw on</li>
                                <li>Hides fills and labels, then fades them in over the last stretch</li>
                                <li>
                                    Exposes <code>setProgress(0..1)</code> for scrubbing and capture
                                </li>
                                <li>
                                    Ships <code>recordDrawToWebM</code> for in-browser clips
                                </li>
                            </ul>
                        </article>
                    </div>

                    <LiveDemo
                        title="The same SVG, two engines"
                        description="Vivus only animates outlines. Draw-On outlines the filled boxes first, then reveals them."
                        sourceId="vivus-compare"
                        controls="none"
                        autoPlayWhenInView
                    />
                </div>
            </section>

            <section className="section">
                <div className="shell">
                    <div className="section-head">
                        <div>
                            <span className="eyebrow">Copy, paste, ship</span>
                            <h2>The real files behind the demos.</h2>
                            <p>
                                These tabs read the actual component sources in this repository — the
                                same files running on this page.
                            </p>
                        </div>
                    </div>
                    <CodeTabs tabs={codeTabs} defaultTab="hook" />
                </div>
            </section>

            <section className="section">
                <div className="shell">
                    <div className="section-head">
                        <div>
                            <span className="eyebrow">In the wild</span>
                            <h2>Notebooks, diagrams and annotations.</h2>
                        </div>
                        <div className="spacer" />
                        <a
                            className="button small secondary"
                            href="https://github.com/penwell-app/draw-on/tree/master/demos"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Browse the demos folder
                        </a>
                    </div>
                    <MediaGallery />
                </div>
            </section>

            <section className="section">
                <div className="shell">
                    <div className="section-head">
                        <div>
                            <span className="eyebrow">Recipes</span>
                            <h2>Point it at what you already have.</h2>
                        </div>
                    </div>

                    <div className="card-grid">
                        <Link className="card" to="/docs/guides/mermaid">
                            <span className="card-tag">Recipe</span>
                            <h3>Mermaid</h3>
                            <p>Render at runtime, animate the output — nothing pre-baked.</p>
                        </Link>
                        <Link className="card" to="/docs/guides/excalidraw">
                            <span className="card-tag">Recipe</span>
                            <h3>Excalidraw and tldraw</h3>
                            <p>Hand-drawn strokes plus rough fills, in draw-on order.</p>
                        </Link>
                        <Link className="card" to="/docs/guides/figma-and-handwriting">
                            <span className="card-tag">Recipe</span>
                            <h3>Figma and handwriting</h3>
                            <p>Design exports, notebook pages and signature reveals.</p>
                        </Link>
                        <Link className="card" to="/docs/guides/recording">
                            <span className="card-tag">Recipe</span>
                            <h3>Video export</h3>
                            <p>Turn any of the above into a shareable WebM clip.</p>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="shell">
                    <div className="section-head">
                        <div>
                            <span className="eyebrow">The API</span>
                            <h2>Six calls cover most of it.</h2>
                        </div>
                    </div>

                    <ApiCodeEditor />

                    <div className="cta-band">
                        <div>
                            <h2>Make something draw itself.</h2>
                            <p>Install the package, paste an SVG, and watch it happen.</p>
                        </div>
                        <div className="cta-actions">
                            <Link className="button" to="/docs/introduction">
                                Start with the basics
                            </Link>
                            <Link className="button secondary" to="/examples">
                                See every sample
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}



