export interface MediaItem {
    src: string;
    kind: 'image' | 'video';
    caption: string;
}

/** The demo clips shipped with the repository, kept small on purpose. */
export const MEDIA_ITEMS: MediaItem[] = [
    {
        src: '/media/demo-notebook.gif',
        kind: 'image',
        caption: 'Notebook page: handwriting, checkboxes and highlights draw on in order.',
    },
    {
        src: '/media/demo-diagram.gif',
        kind: 'image',
        caption: 'Flowchart: strokes first, then fills and labels fade in behind them.',
    },
    {
        src: '/media/demo-annotate.gif',
        kind: 'image',
        caption: 'Annotation layer: underlines and margin notes on a document.',
    },
    {
        src: '/media/draw-on-demo.webm',
        kind: 'video',
        caption: 'A full WebM export produced by recordDrawToWebM, in the browser.',
    },
];
