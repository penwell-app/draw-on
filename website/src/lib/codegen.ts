import type { DrawingOptions } from '@penwell/draw-on/core';

/** The knobs the playground drives — every one of them is a real library option. */
export type PlaygroundOptions = Required<
    Pick<DrawingOptions, 'duration' | 'type' | 'stroke' | 'strokeWidth' | 'revealStart' | 'revealMs'>
>;

export interface CodegenInput {
    svgMarkup: string;
    options: PlaygroundOptions;
}

export const DEFAULT_PLAYGROUND_OPTIONS: PlaygroundOptions = {
    duration: 220,
    type: 'oneByOne',
    stroke: '#27241a',
    strokeWidth: '1.25',
    revealStart: 0.6,
    revealMs: 500,
};

const INDENT = '    ';

/** Make arbitrary SVG markup safe to drop inside a JS template literal. */
function svgLiteral(markup: string): string {
    const escaped = markup
        .replace(/\\/g, '\\\\')
        .replace(/`/g, '\\`')
        .replace(/\$\{/g, '\\${')
        .trim();

    return `\`${escaped}\``;
}

function optionLines(options: PlaygroundOptions, depth: number): string[] {
    const pad = INDENT.repeat(depth);

    return [
        `${pad}duration: ${options.duration},`,
        `${pad}type: '${options.type}',`,
        `${pad}stroke: '${options.stroke}',`,
        `${pad}strokeWidth: '${String(options.strokeWidth)}',`,
        `${pad}revealStart: ${options.revealStart},`,
        `${pad}revealMs: ${options.revealMs},`,
    ];
}

/**
 * Snippets are assembled line by line rather than dedented from a template: the
 * SVG markup is multi-line, and a template-wide dedent would eat its indentation.
 */
export function toCoreSnippet({ svgMarkup, options }: CodegenInput): string {
    return [
        "import { createDrawing, parseSvg } from '@penwell/draw-on/core';",
        '',
        `const SVG = ${svgLiteral(svgMarkup)};`,
        '',
        "const host = document.querySelector<HTMLDivElement>('#stage')!;",
        'const svg = parseSvg(SVG);',
        'host.appendChild(svg);',
        '',
        'const drawing = createDrawing(svg, {',
        ...optionLines(options, 1),
        '});',
        '',
        "drawing.play(() => console.log('drawn'));",
    ].join('\n');
}

export function toHookSnippet({ svgMarkup, options }: CodegenInput): string {
    return [
        "import { useSketchDraw } from '@penwell/draw-on';",
        '',
        `const SVG = ${svgLiteral(svgMarkup)};`,
        '',
        'export function Diagram() {',
        '    const { containerRef, status, play, setProgress, canRecord, exportWebM } =',
        '        useSketchDraw({',
        '            svgMarkup: SVG,',
        ...optionLines(options, 3),
        '        });',
        '',
        '    return (',
        '        <>',
        '            <div ref={containerRef} />',
        '',
        "            <button onClick={play}>{status === 'drawing' ? 'Drawing…' : 'Replay'}</button>",
        '',
        '            <input',
        '                type="range"',
        '                min={0}',
        '                max={1}',
        '                step={0.001}',
        '                onChange={(event) => setProgress(Number(event.target.value))}',
        '            />',
        '',
        '            {canRecord && <button onClick={() => exportWebM()}>Export WebM</button>}',
        '        </>',
        '    );',
        '}',
    ].join('\n');
}

export function toComponentSnippet({ svgMarkup, options }: CodegenInput): string {
    return [
        "import { SketchDraw } from '@penwell/draw-on';",
        '',
        `const SVG = ${svgLiteral(svgMarkup)};`,
        '',
        'export function Diagram() {',
        '    return (',
        '        <SketchDraw',
        '            svgMarkup={SVG}',
        '            className="stage"',
        ...optionLines(options, 3),
        '        >',
        '            {({ play, status }) => (',
        "                <button onClick={play}>{status === 'drawing' ? 'Drawing…' : 'Replay'}</button>",
        '            )}',
        '        </SketchDraw>',
        '    );',
        '}',
    ].join('\n');
}

export function toRecordSnippet({ svgMarkup, options }: CodegenInput): string {
    return [
        'import {',
        '    canRecordVideo,',
        '    computeDims,',
        '    createDrawing,',
        '    downloadBlob,',
        '    parseSvg,',
        '    recordDrawToWebM,',
        "} from '@penwell/draw-on/core';",
        '',
        `const SVG = ${svgLiteral(svgMarkup)};`,
        '',
        'const svg = parseSvg(SVG);',
        "document.querySelector('#stage')!.appendChild(svg);",
        '',
        'const drawing = createDrawing(svg, {',
        ...optionLines(options, 1),
        '});',
        '',
        "if (!canRecordVideo()) throw new Error('Recording is not supported in this browser.');",
        '',
        'const { width, height } = computeDims(drawing.el);',
        '',
        'const blob = await recordDrawToWebM(drawing.el, drawing.setProgress, {',
        '    width,',
        '    height,',
        '    fps: 30,',
        '    durationMs: 4000,',
        '    holdMs: 900,',
        "    background: '#faf8f3',",
        "    onProgress: (fraction) => console.log(Math.round(fraction * 100) + '%'),",
        '});',
        '',
        "downloadBlob(blob, 'diagram.webm');",
    ].join('\n');
}
