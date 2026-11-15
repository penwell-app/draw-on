/**
 * Records an SVG draw-on animation to a downloadable WebM video, fully in the
 * browser — no server, no ffmpeg.
 *
 * The approach: step a progress value 0 to 1, let the caller advance the
 * animation to that progress, rasterize the current SVG state onto a `<canvas>`,
 * and feed those frames to a `MediaRecorder` via `canvas.captureStream`.
 *
 * WebM only. MP4 encoding from `MediaRecorder` is unreliable across engines.
 */

export interface RecordOptions {
    width: number;
    height: number;
    /** Frames per second of the output video. */
    fps?: number;
    /** Total animation length, in milliseconds. */
    durationMs?: number;
    /** How long to hold the finished frame at the end, in milliseconds. */
    holdMs?: number;
    /** Canvas background colour. Use `'transparent'` to keep alpha (PNG frames). */
    background?: string;
    /** Pixel density multiplier for sharper output. Defaults to 1. */
    scale?: number;
    /** Embed external `<image>` sources so frames are not blank or tainted. Defaults to true. */
    inlineImages?: boolean;
    onProgress?: (fraction: number) => void;
}

/** Returns true when this browser can record canvas streams to WebM. */
export function canRecordVideo(): boolean {
    return (
        typeof MediaRecorder !== 'undefined' &&
        typeof HTMLCanvasElement !== 'undefined' &&
        typeof HTMLCanvasElement.prototype.captureStream === 'function'
    );
}

function pickMimeType(): string {
    const candidates = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
    for (const type of candidates) {
        if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return 'video/webm';
}

function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to rasterize a frame.'));
        img.src = url;
    });
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const XLINK_NS = 'http://www.w3.org/1999/xlink';

function imageHref(el: Element) {
    return el.getAttribute('href') ?? el.getAttributeNS(XLINK_NS, 'href') ?? '';
}

function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
}

/** Fetches every external `<image>` once and maps its href to a data URL. */
async function collectImages(svg: SVGSVGElement): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    const hrefs = new Set(
        Array.from(svg.querySelectorAll('image'))
            .map(imageHref)
            .filter((h) => h && !h.startsWith('data:')),
    );
    await Promise.all(
        Array.from(hrefs).map(async (href) => {
            try {
                const res = await fetch(new URL(href, document.baseURI).href);
                if (res.ok) map.set(href, await blobToDataUrl(await res.blob()));
            } catch {
                /* leave the original href; the frame renders without it */
            }
        }),
    );
    return map;
}

async function drawFrame(
    svg: SVGSVGElement,
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    background: string,
    images: Map<string, string>,
) {
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', String(width));
    clone.setAttribute('height', String(height));
    if (images.size) {
        clone.querySelectorAll('image').forEach((img) => {
            const data = images.get(imageHref(img));
            if (data) {
                img.setAttribute('href', data);
                img.removeAttributeNS(XLINK_NS, 'href');
            }
        });
    }
    const xml = new XMLSerializer().serializeToString(clone);
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
    const img = await loadImage(url);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (background !== 'transparent') {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(img, 0, 0, width, height);
}

function createCanvas(opts: RecordOptions) {
    const scale = Math.max(0.1, opts.scale ?? 1);
    const width = Math.max(2, Math.round(opts.width * scale));
    const height = Math.max(2, Math.round(opts.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create a drawing canvas.');
    return { canvas, ctx, width, height };
}

/**
 * Renders the drawing frame by frame to PNG blobs - as fast as the browser can
 * rasterize, not in real time. Feed them to an encoder, a GIF maker or a ZIP.
 */
export async function recordFrames(
    svg: SVGSVGElement,
    setProgress: (fraction: number) => void,
    opts: RecordOptions,
): Promise<Blob[]> {
    const { canvas, ctx, width, height } = createCanvas(opts);
    const fps = opts.fps ?? 30;
    const total = Math.max(1, Math.round(((opts.durationMs ?? 4000) / 1000) * fps));
    const images = opts.inlineImages === false ? new Map<string, string>() : await collectImages(svg);
    const background = opts.background ?? 'transparent';
    const frames: Blob[] = [];
    for (let i = 0; i <= total; i++) {
        const fraction = i / total;
        setProgress(fraction);
        opts.onProgress?.(fraction);
        await drawFrame(svg, ctx, width, height, background, images);
        const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
        if (blob) frames.push(blob);
    }
    return frames;
}

/**
 * Drives `setProgress` from 0 to 1 while capturing each rendered SVG state into
 * a WebM blob. Pass `Drawing.setProgress` here.
 */
export async function recordDrawToWebM(
    svg: SVGSVGElement,
    setProgress: (fraction: number) => void,
    opts: RecordOptions,
): Promise<Blob> {
    if (!canRecordVideo()) {
        throw new Error('Video recording is not supported in this browser.');
    }
    const { canvas, ctx, width, height } = createCanvas(opts);
    const fps = opts.fps ?? 30;
    const durationMs = opts.durationMs ?? 4000;
    const holdMs = opts.holdMs ?? 900;
    const background = opts.background ?? '#faf8f3';
    const images = opts.inlineImages === false ? new Map<string, string>() : await collectImages(svg);

    // Prime the canvas so the stream has a first frame.
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    const stream = canvas.captureStream(fps);
    const track = stream.getVideoTracks()[0] as CanvasCaptureMediaStreamTrack | undefined;
    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    const stopped = new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
    });

    recorder.start();

    const frameInterval = 1000 / fps;
    const totalFrames = Math.max(1, Math.round((durationMs / 1000) * fps));

    const started = performance.now();
    for (let i = 0; i <= totalFrames; i++) {
        const fraction = i / totalFrames;
        setProgress(fraction);
        opts.onProgress?.(fraction);
        await drawFrame(svg, ctx, width, height, background, images);
        track?.requestFrame?.();
        // Pace against the wall clock so slow rasterization doesn't stretch the video.
        await sleep(Math.max(0, started + (i + 1) * frameInterval - performance.now()));
    }

    // Hold the completed frame so the video doesn't snap shut.
    setProgress(1);
    await drawFrame(svg, ctx, width, height, background, images);
    track?.requestFrame?.();
    await sleep(holdMs);

    recorder.stop();
    await stopped;
    return new Blob(chunks, { type: mimeType });
}

/** Triggers a browser download for a recorded blob. */
export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
