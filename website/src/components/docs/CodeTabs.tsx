import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useCopyToClipboard } from '../../lib/useCopyToClipboard';
import { highlightCode } from '../../lib/highlighter';

export interface CodeTab {
    id: string;
    label: string;
    code: string;
    language?: string;
    filename?: string;
}

export interface CodeTabsProps {
    tabs: CodeTab[];
    defaultTab?: string;
    className?: string;
    style?: CSSProperties;
    showLineNumbers?: boolean;
}

/**
 * Tabbed code samples styled like a modern text editor with tabs: window dots,
 * file-styled tab buttons, active filename indicator, copy button and full
 * syntax highlighting with line numbering.
 */
export function CodeTabs({
    tabs,
    defaultTab,
    className,
    style,
    showLineNumbers = true,
}: CodeTabsProps) {
    const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? '');
    const preRef = useRef<HTMLPreElement>(null);
    const { copied, copy } = useCopyToClipboard();
    const [highlightedMap, setHighlightedMap] = useState<Record<string, string>>({});

    const current = tabs.find((tab) => tab.id === active) ?? tabs[0];

    useEffect(() => {
        if (!current?.code) return;
        if (highlightedMap[current.id]) return;

        let cancelled = false;
        highlightCode(current.code, current.language ?? 'tsx').then((html) => {
            if (!cancelled) {
                setHighlightedMap((prev) => ({ ...prev, [current.id]: html }));
            }
        });
        return () => {
            cancelled = true;
        };
    }, [current, highlightedMap]);

    if (!current) return null;

    const highlightedHtml = highlightedMap[current.id];
    const innerCodeHtml = highlightedHtml
        ? highlightedHtml.replace(/^<pre[^>]*>|<\/pre>$/gi, '')
        : null;

    return (
        <div className={`code-tabs ${showLineNumbers ? 'code-editor-lines' : ''}`}>
            <div className="code-tabs-bar" role="tablist" aria-label="Code samples">
                <div className="code-block-dots" aria-hidden="true">
                    <span className="dot dot-red" />
                    <span className="dot dot-yellow" />
                    <span className="dot dot-green" />
                </div>
                <div className="code-tabs-list">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            aria-selected={tab.id === current.id}
                            onClick={() => setActive(tab.id)}
                            className="code-tab-button"
                        >
                            <svg className="code-tab-icon" viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                                <path d="M4 1.75C4 .784 4.784 0 5.75 0h5.586a1.75 1.75 0 0 1 1.237.513l2.914 2.914c.328.328.513.774.513 1.237v9.586A1.75 1.75 0 0 1 14.25 16h-8.5A1.75 1.75 0 0 1 4 14.25V1.75Z" opacity="0.6"/>
                            </svg>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
                {current.filename && <span className="code-tabs-file">{current.filename}</span>}
                <button
                    type="button"
                    className="code-block-copy"
                    onClick={() => void copy(current.code)}
                    aria-label="Copy code to clipboard"
                    title={copied ? 'Copied to clipboard' : 'Copy code'}
                >
                    {copied ? (
                        <>
                            <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
                            </svg>
                            <span>Copied</span>
                        </>
                    ) : (
                        <>
                            <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                                <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/>
                                <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/>
                            </svg>
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <div className="code-block">
                {innerCodeHtml ? (
                    <pre
                        ref={preRef}
                        className={`shiki one-dark-pro ${className ?? ''}`}
                        style={style}
                        dangerouslySetInnerHTML={{ __html: innerCodeHtml }}
                    />
                ) : (
                    <pre ref={preRef} className={className} style={style}>
                        <code>{current.code}</code>
                    </pre>
                )}
            </div>
        </div>
    );
}
