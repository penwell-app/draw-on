import { draw, type DrawOptions, type Drawing, type RevealMode, type TextMode } from '../core/draw';
import type { EasingName } from '../core/engine/easing';
import type { DrawType } from '../core/engine/timeline';
import { loadSvg } from '../core/parseSvg';
import { presets, type PresetName } from '../core/presets';
import { inView } from '../core/scroll';

export interface DrawOnElement extends HTMLElement {
    readonly drawing: Drawing | null;
    play(): Promise<boolean>;
    restart(): Promise<boolean>;
    reverse(): Promise<boolean>;
    pause(): void;
    seek(fraction: number): void;
}

const ATTRIBUTES = [
    'src',
    'preset',
    'trigger',
    'duration',
    'type',
    'stagger',
    'speed',
    'delay',
    'ease',
    'stroke-ease',
    'stroke',
    'stroke-width',
    'reveal',
    'reveal-start',
    'text',
    'loop',
    'yoyo',
    'pen',
    'sketchy',
    'no-outline',
] as const;

/**
 * Registers `<draw-on>`, usable in plain HTML, Vue, Svelte, Angular and Astro.
 * Call once on the client. Safe to call repeatedly.
 *
 * @example
 * defineDrawOn();
 * <draw-on src="/logo.svg" trigger="inView" type="stagger"></draw-on>
 * <draw-on duration="1500"><svg>…</svg></draw-on>
 *
 * Events: `draw-start`, `draw-progress` (detail.progress), `draw-complete`.
 */
export function defineDrawOn(tagName = 'draw-on'): void {
    if (typeof customElements === 'undefined' || customElements.get(tagName)) return;

    class DrawOnHost extends HTMLElement implements DrawOnElement {
        static get observedAttributes() {
            return ATTRIBUTES as unknown as string[];
        }

        private current: Drawing | null = null;
        private cleanups: Array<() => void> = [];
        private generation = 0;
        private ownsSvg = false;

        get drawing() {
            return this.current;
        }

        connectedCallback() {
            // Children may not be parsed yet when the element upgrades during HTML parsing.
            requestAnimationFrame(() => this.build());
        }

        disconnectedCallback() {
            this.teardown();
        }

        attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null) {
            if (oldValue !== newValue && this.isConnected && this.current) this.build();
        }

        play() {
            return this.current?.play() ?? Promise.resolve(false);
        }
        restart() {
            return this.current?.restart() ?? Promise.resolve(false);
        }
        reverse() {
            return this.current?.reverse() ?? Promise.resolve(false);
        }
        pause() {
            this.current?.pause();
        }
        seek(fraction: number) {
            this.current?.seek(fraction);
        }

        private options(): DrawOptions {
            const attr = (name: string) => this.getAttribute(name);
            const number = (name: string) => {
                const v = attr(name);
                return v == null || v === '' ? undefined : Number(v);
            };
            const flag = (name: string) => this.hasAttribute(name) && attr(name) !== 'false';
            const preset = attr('preset') as PresetName | null;
            const loop = attr('loop');
            const opts: DrawOptions = {
                ...(preset && preset in presets ? (presets[preset] as DrawOptions) : {}),
            };
            const set = <K extends keyof DrawOptions>(key: K, value: DrawOptions[K] | undefined | null) => {
                if (value != null && !(typeof value === 'number' && Number.isNaN(value))) opts[key] = value;
            };
            set('duration', number('duration'));
            set('type', attr('type') as DrawType | null);
            set('stagger', number('stagger'));
            set('speed', number('speed'));
            set('delay', number('delay'));
            set('ease', attr('ease') as EasingName | null);
            set('strokeEase', attr('stroke-ease') as EasingName | null);
            set('stroke', attr('stroke'));
            set('strokeWidth', attr('stroke-width'));
            set('reveal', attr('reveal') as RevealMode | null);
            set('revealStart', number('reveal-start'));
            set('text', attr('text') as TextMode | null);
            if (loop != null) opts.loop = loop === '' || loop === 'true' ? true : Number(loop) || 0;
            if (this.hasAttribute('yoyo')) opts.yoyo = flag('yoyo');
            if (this.hasAttribute('pen')) opts.pen = flag('pen');
            if (this.hasAttribute('sketchy')) opts.sketchy = flag('sketchy');
            if (flag('no-outline')) opts.outline = false;
            return opts;
        }

        private emit(type: string, progress: number) {
            this.dispatchEvent(new CustomEvent(type, { detail: { progress }, bubbles: true }));
        }

        private teardown() {
            this.generation++;
            this.cleanups.forEach((fn) => fn());
            this.cleanups = [];
            this.current?.destroy();
            this.current = null;
            if (this.ownsSvg) this.replaceChildren();
            this.ownsSvg = false;
        }

        private async build() {
            this.teardown();
            const generation = this.generation;
            const src = this.getAttribute('src');
            let svg: SVGSVGElement | null;
            try {
                if (src) {
                    svg = await loadSvg(src);
                    if (generation !== this.generation || !this.isConnected) return;
                    svg.style.maxWidth = '100%';
                    svg.style.height = 'auto';
                    this.replaceChildren(svg);
                    this.ownsSvg = true;
                } else {
                    svg = this.querySelector('svg');
                }
                if (!svg) throw new Error('<draw-on> needs a src attribute or an <svg> child.');

                const d = draw(svg, { ...this.options(), autoplay: false });
                this.current = d;
                this.cleanups.push(
                    d.on('start', (p) => this.emit('draw-start', p)),
                    d.on('progress', (p) => this.emit('draw-progress', p)),
                    d.on('complete', (p) => this.emit('draw-complete', p)),
                );

                const trigger = this.getAttribute('trigger') ?? 'auto';
                const restart = () => void d.restart();
                if (trigger === 'auto') void d.play();
                else if (trigger === 'inView') this.cleanups.push(inView(this, () => void d.play()));
                else if (trigger === 'hover' || trigger === 'click') {
                    const type = trigger === 'hover' ? 'mouseenter' : 'click';
                    this.addEventListener(type, restart);
                    this.cleanups.push(() => this.removeEventListener(type, restart));
                }
            } catch (err) {
                this.dispatchEvent(new CustomEvent('draw-error', { detail: { error: err }, bubbles: true }));
            }
        }
    }

    customElements.define(tagName, DrawOnHost);
}

declare global {
    interface HTMLElementTagNameMap {
        'draw-on': DrawOnElement;
    }
}
