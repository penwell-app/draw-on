import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useCopyToClipboard } from '../../lib/useCopyToClipboard';
import { highlightCode } from '../../lib/highlighter';

export interface CodeBlockProps {
    /** Raw source, rendered as plain monospace on the ink panel. */
    code?: string;
    /** Shown in the header, e.g. `drawing.setProgress()`. */
    filename?: string;
    language?: string;
    /** Pre-highlighted markup — MDX passes Shiki's output through here. */
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
    showLineNumbers?: boolean;
}

/**
 * Frame around a code sample styled like a modern text editor: window dots,
 * filename chip, language badge and a copy button with feedback.
 * MDX fenced blocks arrive as pre-highlighted children, while runtime
 * snippets use the `code` prop and get syntax-highlighted via Shiki.
 */
export function CodeBlock({
    code,
    filename,
    language,
    children,
    className,
    style,
    showLineNumbers,
}: CodeBlockProps) {
    const preRef = useRef<HTMLPreElement>(null);
    const { copied, copy } = useCopyToClipboard();
    const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);

    useEffect(() => {
        if (!code || children) {
            setHighlightedHtml(null);
            return;
        }
        let cancelled = false;
        highlightCode(code, language).then((html) => {
            if (!cancelled) setHighlightedHtml(html);
        });
        return () => {
            cancelled = true;
        };
    }, [code, language, children]);

    const handleCopy = () => {
        const text = code ?? preRef.current?.textContent ?? '';
        void copy(text);
    };

    const innerCodeHtml = highlightedHtml
        ? highlightedHtml.replace(/^<pre[^>]*>|<\/pre>$/gi, '')
        : null;

    return (
        <div className={`code-block ${showLineNumbers ? 'code-editor-lines' : ''}`}>
            <div className="code-block-head">
                <div className="code-block-dots" aria-hidden="true">
                    <span className="dot dot-red" />
                    <span className="dot dot-yellow" />
                    <span className="dot dot-green" />
                </div>
                {filename ? (
                    <span className="code-block-name">
                        <svg className="code-block-file-icon" viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                            <path d="M4 1.75C4 .784 4.784 0 5.75 0h5.586a1.75 1.75 0 0 1 1.237.513l2.914 2.914c.328.328.513.774.513 1.237v9.586A1.75 1.75 0 0 1 14.25 16h-8.5A1.75 1.75 0 0 1 4 14.25V1.75Z" opacity="0.6"/>
                        </svg>
                        {filename}
                    </span>
                ) : (
                    <span className="code-block-name">example</span>
                )}
                <span className="code-block-lang">{language ?? 'code'}</span>
                <button
                    type="button"
                    className="code-block-copy"
                    onClick={handleCopy}
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
            {innerCodeHtml ? (
                <pre
                    ref={preRef}
                    className={`shiki one-dark-pro ${className ?? ''}`}
                    style={style}
                    dangerouslySetInnerHTML={{ __html: innerCodeHtml }}
                />
            ) : (
                <pre ref={preRef} className={className} style={style}>
                    {children ?? <code>{code}</code>}
                </pre>
            )}
        </div>
    );
}
