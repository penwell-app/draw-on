import { prepare, type DrawOptions } from './draw';
import { invertEasing, resolveEasing, type Easing, type EasingName } from './engine/easing';
import { parseSvg } from './parseSvg';

export type AnimatedSvgOptions = Omit<
    DrawOptions,
    'autoplay' | 'loop' | 'yoyo' | 'playbackRate' | 'pen' | 'onStart' | 'onProgress' | 'onComplete'
>;

const CSS_EASE: Record<EasingName, string> = {
    linear: 'linear',
    easeIn: 'cubic-bezier(.55,.085,.68,.53)',
    easeOut: 'cubic-bezier(.25,.46,.45,.94)',
    easeInOut: 'cubic-bezier(.455,.03,.515,.955)',
    easeOutCubic: 'cubic-bezier(.215,.61,.355,1)',
    easeInOutCubic: 'cubic-bezier(.645,.045,.355,1)',
    easeOutQuart: 'cubic-bezier(.165,.84,.44,1)',
    easeOutBack: 'cubic-bezier(.175,.885,.32,1.275)',
};

const cssEase = (e: Easing | undefined) => (typeof e === 'string' ? CSS_EASE[e] ?? 'linear' : 'linear');
const ms = (n: number) => `${Math.max(0, Math.round(n))}ms`;

function addStyle(el: Element, css: string) {
    const current = el.getAttribute('style');
    el.setAttribute('style', current ? `${current.replace(/;?\s*$/, ';')}${css}` : css);
    el.classList.add('do-a');
}

const KEYFRAMES = `
@keyframes do-d{to{stroke-dashoffset:0}}
@keyframes do-h{from,to{stroke-opacity:0}}
@keyframes do-s{from{stroke-opacity:0}}
@keyframes do-f{from{fill-opacity:0}}
@keyframes do-t{from{opacity:0}}
@media (prefers-reduced-motion:reduce){.do-a{animation:none!important;stroke-dashoffset:0!important}}
`.trim();

/**
 * Bakes the draw-on into a standalone SVG string animated with CSS keyframes
 * only - no JavaScript. Works in `<img>`, GitHub READMEs, Notion and static docs.
 *
 * Pass untouched markup or an SVG that has not been passed to `draw()`.
 * Requires a browser (geometry is measured in an off-screen host).
 *
 * @example
 * const file = toAnimatedSVG(markup, { duration: 2500, type: 'stagger' });
 * downloadBlob(new Blob([file], { type: 'image/svg+xml' }), 'logo-animated.svg');
 */
export function toAnimatedSVG(source: SVGSVGElement | string, options: AnimatedSvgOptions = {}): string {
    const svg = typeof source === 'string' ? parseSvg(source) : (source.cloneNode(true) as SVGSVGElement);
    const host = document.createElement('div');
    host.setAttribute('aria-hidden', 'true');
    host.style.cssText = 'position:fixed;left:-100000px;top:0;width:1024px;visibility:hidden;pointer-events:none';
    host.appendChild(svg);
    document.body.appendChild(host);

    try {
        const { scene, segments, totalMs } = prepare(svg, options);
        const ease = resolveEasing(options.ease, 'easeOutCubic');
        const strokeEase = cssEase(options.strokeEase ?? 'linear');
        const delay = options.delay ?? 0;
        const reveal = options.reveal ?? 'end';
        const revealStart = Math.min(0.999, Math.max(0, options.revealStart ?? 0.6));
        const times = segments.map(({ start, end }) => ({
            from: delay + invertEasing(ease, start) * totalMs,
            to: delay + invertEasing(ease, end) * totalMs,
        }));

        scene.strokes.forEach((s, i) => {
            const { from, to } = times[i];
            const hold = from > 0 ? `,do-h ${ms(from)} linear` : '';
            if (s.mode === 'dash') {
                const gap = s.dash * 1.01 + 1;
                addStyle(
                    s.el,
                    `stroke-dasharray:${s.dash} ${gap};stroke-dashoffset:${s.dash};` +
                    `animation:do-d ${ms(to - from)} ${strokeEase} ${ms(from)} both${hold}`,
                );
            } else if (s.mode === 'fade') {
                addStyle(s.el, `animation:do-s ${ms(to - from)} ${strokeEase} ${ms(from)} both`);
            } else if (hold) {
                addStyle(s.el, `animation:${hold.slice(1)}`);
            }
        });

        if (reveal !== 'none') {
            const endFrom = delay + revealStart * totalMs;
            const endDur = (1 - revealStart) * totalMs;
            scene.fills.forEach((f) => {
                let from = endFrom;
                let dur = endDur;
                if (reveal === 'stroke' && f.stroke >= 0) {
                    const t = times[f.stroke];
                    from = t.from + (t.to - t.from) * 0.6;
                    dur = (t.to - t.from) * 0.4;
                }
                const own = f.el.getAttribute('style') ?? '';
                if (/animation:/.test(own)) {
                    f.el.setAttribute('style', own.replace(/animation:([^;]*)/, `animation:$1,do-f ${ms(dur)} linear ${ms(from)} both`));
                } else {
                    addStyle(f.el, `animation:do-f ${ms(dur)} linear ${ms(from)} both`);
                }
            });
        }

        if (options.text !== 'none') {
            scene.texts.forEach((t) => {
                addStyle(t.el, `animation:do-t ${ms((1 - revealStart) * totalMs)} linear ${ms(delay + revealStart * totalMs)} both`);
            });
        }

        const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        style.textContent = KEYFRAMES;
        svg.insertBefore(style, svg.firstChild);
        svg.querySelectorAll('[data-draw-on-use]').forEach((el) => el.removeAttribute('data-draw-on-use'));
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        return new XMLSerializer().serializeToString(svg);
    } finally {
        host.remove();
    }
}
