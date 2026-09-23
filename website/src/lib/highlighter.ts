import { createHighlighterCore, type HighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import themeOneDarkPro from 'shiki/themes/one-dark-pro.mjs';
import langTsx from 'shiki/langs/tsx.mjs';
import langTypescript from 'shiki/langs/typescript.mjs';
import langJavascript from 'shiki/langs/javascript.mjs';
import langBash from 'shiki/langs/bash.mjs';
import langHtml from 'shiki/langs/html.mjs';
import langCss from 'shiki/langs/css.mjs';
import langJson from 'shiki/langs/json.mjs';

let highlighterPromise: Promise<HighlighterCore> | null = null;

export function getHighlighter(): Promise<HighlighterCore> {
    if (!highlighterPromise) {
        highlighterPromise = createHighlighterCore({
            themes: [themeOneDarkPro],
            langs: [
                langTsx,
                langTypescript,
                langJavascript,
                langBash,
                langHtml,
                langCss,
                langJson,
            ],
            engine: createJavaScriptRegexEngine(),
        });
    }
    return highlighterPromise;
}

const LANG_MAP: Record<string, string> = {
    ts: 'typescript',
    typescript: 'typescript',
    tsx: 'tsx',
    js: 'javascript',
    jsx: 'javascript',
    javascript: 'javascript',
    bash: 'bash',
    sh: 'bash',
    shell: 'bash',
    html: 'html',
    css: 'css',
    json: 'json',
};

/**
 * Highlights a snippet of code using the One Dark Pro theme.
 * Returns HTML string with `<span style="color: ...">` syntax tokens.
 */
export async function highlightCode(code: string, lang = 'tsx'): Promise<string> {
    const highlighter = await getHighlighter();
    const resolvedLang = LANG_MAP[lang.toLowerCase()] ?? 'tsx';
    return highlighter.codeToHtml(code, {
        lang: resolvedLang,
        theme: 'one-dark-pro',
    });
}
