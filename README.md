<div align="center">
  <img src="https://raw.githubusercontent.com/penwell-app/draw-on/master/draw-on.svg" alt="draw-on" width="200" />
  <h1>@penwell/draw-on</h1>
  <p><strong>Make any inline SVG draw itself.</strong></p>
  <p>Strokes animate one by one, then fills and labels fade in. Scrub to any point, or record the whole animation to a WebM clip - entirely in the browser, without a server.</p>
  
  [![npm version](https://img.shields.io/npm/v/@penwell/draw-on)](https://www.npmjs.com/package/@penwell/draw-on)
  [![npm downloads](https://img.shields.io/npm/dm/@penwell/draw-on)](https://www.npmjs.com/package/@penwell/draw-on)
  [![License](https://img.shields.io/npm/l/@penwell/draw-on)](https://github.com/penwell-app/draw-on/blob/master/LICENSE)
</div>

---

Built on [Vivus](https://github.com/maxwellito/vivus), extended for real-world SVGs containing strokes, fills, and text.

Originally created for [Penwell](https://usepenwell.com/) to animate Mermaid diagrams and handwritten notebook pages, `@penwell/draw-on` is now available as a standalone open-source library.

## 📺 Demo Videos

<div align="center">
  
### Annotate Documents
![Annotate Demo](https://raw.githubusercontent.com/penwell-app/draw-on/master/demo-annotate.gif)

### Draw Diagrams
![Diagram Demo](https://raw.githubusercontent.com/penwell-app/draw-on/master/demo-diagram.gif)

### Notebook Animation
![Notebook Demo](https://raw.githubusercontent.com/penwell-app/draw-on/master/demo-notebook.gif)

### Full Video Demos

- [Penwell Draw On Demo](https://github.com/penwell-app/draw-on/raw/master/penwell-drawon-demo.mp4)
- [Practical MP4 Demo](https://github.com/penwell-app/draw-on/raw/master/drawon_demo_vid.mp4)
- [WebM Demo](https://github.com/penwell-app/draw-on/raw/master/draw-on-demo.webm)

### Demo Folder in Github

- [Demo Folder in Github](https://github.com/penwell-app/draw-on/tree/master/demos)

</div>

---

## 📖 Documentation

The full documentation site lives in [`website/`](./website) and covers everything in this README in more depth, with live demos you can replay, scrub and record, and a playground for your own SVG.

- **Start here** - [Introduction](https://github.com/penwell-app/draw-on/blob/master/website/src/content/docs/introduction.mdx), Installation, Quickstart, How it works
- **Guides** - React, Vanilla JS and TypeScript, scrubbing and scroll, recording to WebM
- **Recipes** - Mermaid, Excalidraw and tldraw, Figma and handwriting, preparing your SVGs
- **Reference** - `createDrawing`, `DrawingOptions`, `useSketchDraw`, `SketchDraw`, `parseSvg`, `computeDims`, the recording API, constants and types
- **Playground** - Paste any inline SVG, tune the real options, copy the generated code

Run it locally:

```bash
cd website
npm install
npm run dev        # http://localhost:5180
```

The site imports this package straight from `src/`, so every demo runs the code in your working tree.

---

## Features

- Animate SVG strokes progressively
- Reveal fill-only shapes with temporary outlines
- Fade in SVG text, labels, and other visual elements
- Scrub to any point in the animation with `setProgress(0..1)`
- Record the animation to WebM directly in the browser
- React support with a hook and component
- Framework-agnostic core API for vanilla JavaScript/TypeScript
- ESM and CommonJS builds
- Tree-shakeable
- No server or ffmpeg required for recording

## Why not just Vivus?

[Vivus](https://github.com/maxwellito/vivus) is excellent for animating SVG strokes, but real-world diagrams such as Mermaid, Excalidraw, and exported Figma designs often contain mostly filled shapes and `<text>` elements.

Without additional handling, Vivus can leave these elements invisible or reveal them at the wrong time.

`@penwell/draw-on` extends the draw-on approach by:

- giving fill-only shapes a temporary outline so there is something to draw
- hiding fills and labels while the strokes animate
- fading fills and labels back in during the final part of the animation
- exposing `setProgress(0..1)` for scrubbing, scroll-linked animations, and frame-accurate recording
- providing a browser-based WebM recorder using `MediaRecorder` and `canvas.captureStream()`

## Installation

```bash
npm install @penwell/draw-on
```

React is an optional peer dependency.

If you are not using React, import the framework-agnostic core API:

```ts
import { createDrawing, parseSvg } from '@penwell/draw-on/core';
```

## React

### Hook

```tsx
import { useSketchDraw } from '@penwell/draw-on';

function Diagram({ svgMarkup }: { svgMarkup: string }) {
  const {
    containerRef,
    status,
    play,
    exportWebM,
    canRecord,
  } = useSketchDraw({
    svgMarkup,
    duration: 220,
  });

  return (
    <>
      <div ref={containerRef} />

      <button
        onClick={play}
        disabled={status === 'error'}
      >
        Replay
      </button>

      {canRecord && (
        <button onClick={() => exportWebM()}>
          Export
        </button>
      )}
    </>
  );
}
```

### Component

`SketchDraw` provides an unstyled host with a render prop for your own controls:

```tsx
import { SketchDraw } from '@penwell/draw-on';

<SketchDraw
  svgMarkup={markup}
  className="w-full"
>
  {({ play, status }) => (
    <button onClick={play}>
      {status}
    </button>
  )}
</SketchDraw>;
```

## Without React

The core API can be used directly from JavaScript or TypeScript:

```ts
import {
  createDrawing,
  parseSvg,
  computeDims,
} from '@penwell/draw-on/core';

const svg = parseSvg(markup);

host.appendChild(svg);

const drawing = createDrawing(svg, {
  duration: 220,
});

drawing.play(() => {
  console.log('done');
});

// Scrub to any point
drawing.setProgress(0.5);
```

## Recording to WebM

You can record the draw-on animation entirely in the browser:

```ts
import {
  canRecordVideo,
  recordDrawToWebM,
  downloadBlob,
} from '@penwell/draw-on/core';

if (canRecordVideo()) {
  const { width, height } = computeDims(drawing.el);

  const blob = await recordDrawToWebM(
    drawing.el,
    drawing.setProgress,
    {
      width,
      height,
      durationMs: 4200,
      onProgress: (fraction) => {
        console.log(Math.round(fraction * 100));
      },
    }
  );

  downloadBlob(blob, 'diagram.webm');
}
```

### Browser support

Recording currently produces **WebM** and depends on browser support for `MediaRecorder` and `canvas.captureStream()`.

In practice, Chromium-based browsers provide the most reliable support.

MP4 is intentionally not offered because `MediaRecorder` MP4 support is inconsistent across browsers.

Always gate recording UI behind:

```ts
canRecordVideo()
```

## API

### `createDrawing`

Creates a draw-on animation from an SVG element.

```ts
const drawing = createDrawing(svg, {
  duration: 220,
  type: 'oneByOne',
});
```

Available methods:

```ts
drawing.play();
drawing.stop();
drawing.reset();
drawing.hide();
drawing.reveal();
drawing.setProgress(0.5);
drawing.destroy();
```

### `parseSvg`

Parses serialized SVG markup and imports it into the current document:

```ts
const svg = parseSvg(markup);
```

It throws `InvalidSvgError` when the markup does not contain a usable SVG root.

### `computeDims`

Calculates dimensions suitable for rendering or video recording:

```ts
const { width, height } = computeDims(svg);
```

### `setProgress`

Set the animation to any point between `0` and `1`:

```ts
drawing.setProgress(0);
drawing.setProgress(0.5);
drawing.setProgress(1);
```

This makes it possible to build:

- scroll-linked animations
- custom animation controls
- timeline scrubbing
- frame-accurate recording

## Options

| Option | Default | Description |
| --- | --- | --- |
| `duration` | `220` | Vivus animation length in frames. Higher is slower. |
| `type` | `'oneByOne'` | Stroke ordering: `'oneByOne'`, `'delayed'`, or `'sync'`. |
| `stroke` | `'#27241a'` | Outline applied to fill-only shapes. |
| `strokeWidth` | `'1.25'` | Stroke width applied when a shape has no stroke width. |
| `revealStart` | `0.6` | Progress at which fills and labels begin appearing. |
| `revealMs` | `500` | Fade duration for fills and labels. |

## Contributing

Contributions are welcome! ❤️

Whether you want to fix a bug, improve browser compatibility, add a feature, improve documentation, or suggest an idea, feel free to contribute.

### Getting started

Clone the repository:

```bash
git clone https://github.com/penwell-app/draw-on.git
cd draw-on
```

Install dependencies:

```bash
npm install
```

Run type checking:

```bash
npm run typecheck
```

Build the package:

```bash
npm run build
```

### Pull requests

1. Fork the repository or create a branch from `master`.
2. Make your changes.
3. Run the type checker and build.
4. Update documentation when necessary.
5. Commit your changes.
6. Open a pull request with a clear description of what changed and why.

For larger changes, opening an issue first is encouraged so we can discuss the approach before implementation.

### Good first contributions

Some areas where contributions are especially welcome:

- 🐛 Bug fixes
- 🌐 Cross-browser compatibility
- 🎥 Video recording improvements
- ⚡ Performance improvements
- 🧪 Test coverage
- 📚 Documentation improvements
- 🎨 SVG compatibility improvements
- 💡 New animation or reveal capabilities

Please keep pull requests focused and avoid unrelated changes.

## Development

The project uses:

- TypeScript
- React (optional peer dependency)
- Vivus
- tsup
- ESM + CommonJS builds

Build the package:

```bash
npm run build
```

Run TypeScript checks:

```bash
npm run typecheck
```

Watch the package during development:

```bash
npm run dev
```

## Important implementation notes

### SVG mutation

`createDrawing` mutates the SVG in place because Vivus rewrites SVG shapes into paths.

If you need to preserve the original SVG, pass a clone.

`parseSvg` handles importing a parsed SVG into the current document.

### External stylesheets and fonts

SVGs referencing external stylesheets or fonts may not rasterize correctly during WebM recording.

For reliable recording, inline the required styles and fonts where possible.

## Used by Penwell

`@penwell/draw-on` was originally built as part of [Penwell](https://usepenwell.com/) to animate Mermaid diagrams and handwritten notebook pages.

It is now available as a standalone open-source library for developers who want to add draw-on animations to their own SVG-based experiences.

## License

MIT © 2026 Pratik Singh