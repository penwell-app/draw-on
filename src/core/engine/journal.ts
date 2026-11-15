type Entry =
    | { kind: 'attr'; el: Element; name: string; value: string | null }
    | { kind: 'style'; el: HTMLElement | SVGElement; prop: string; value: string; priority: string }
    | { kind: 'text'; node: Text; value: string }
    | { kind: 'replace'; original: Element; replacement: Element }
    | { kind: 'insert'; node: Node };

/**
 * Records every DOM mutation the engine makes so `restore()` can undo them in
 * place, keeping nodes owned by frameworks (React, Vue) intact.
 */
export class Journal {
    private entries: Entry[] = [];
    private seenAttr = new WeakMap<Element, Set<string>>();
    private seenStyle = new WeakMap<Element, Set<string>>();
    private seenText = new WeakSet<Text>();

    setAttr(el: Element, name: string, value: string) {
        let seen = this.seenAttr.get(el);
        if (!seen) this.seenAttr.set(el, (seen = new Set()));
        if (!seen.has(name)) {
            seen.add(name);
            this.entries.push({ kind: 'attr', el, name, value: el.getAttribute(name) });
        }
        el.setAttribute(name, value);
    }

    setStyle(el: HTMLElement | SVGElement, prop: string, value: string) {
        let seen = this.seenStyle.get(el);
        if (!seen) this.seenStyle.set(el, (seen = new Set()));
        if (!seen.has(prop)) {
            seen.add(prop);
            this.entries.push({
                kind: 'style',
                el,
                prop,
                value: el.style.getPropertyValue(prop),
                priority: el.style.getPropertyPriority(prop),
            });
        }
        el.style.setProperty(prop, value);
    }

    setText(node: Text, value: string) {
        if (!this.seenText.has(node)) {
            this.seenText.add(node);
            this.entries.push({ kind: 'text', node, value: node.data });
        }
        if (node.data !== value) node.data = value;
    }

    replace(original: Element, replacement: Element) {
        original.replaceWith(replacement);
        this.entries.push({ kind: 'replace', original, replacement });
    }

    insert(parent: Node, node: Node) {
        parent.appendChild(node);
        this.entries.push({ kind: 'insert', node });
    }

    restore() {
        for (let i = this.entries.length - 1; i >= 0; i--) {
            const e = this.entries[i];
            if (e.kind === 'attr') {
                if (e.value === null) e.el.removeAttribute(e.name);
                else e.el.setAttribute(e.name, e.value);
            } else if (e.kind === 'style') {
                e.el.style.setProperty(e.prop, e.value, e.priority);
                if (!e.el.getAttribute('style')) e.el.removeAttribute('style');
            } else if (e.kind === 'text') {
                e.node.data = e.value;
            } else if (e.kind === 'replace') {
                if (e.replacement.parentNode) e.replacement.replaceWith(e.original);
            } else {
                e.node.parentNode?.removeChild(e.node);
            }
        }
        this.entries = [];
        this.seenAttr = new WeakMap();
        this.seenStyle = new WeakMap();
        this.seenText = new WeakSet();
    }
}
