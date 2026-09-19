<div align="center">
  <img src="./public/draw-on.svg" alt="draw-on" width="120" />
  <h1>@penwell/draw-on - Vanilla JS Demo</h1>
</div>

A pure TypeScript/JavaScript demonstration of `@penwell/draw-on` with zero framework dependencies. Shows the raw power of the core API.

## 🎯 What This Demo Shows

This demo demonstrates framework-agnostic usage:

- **Core API**: Direct use of `createDrawing` and `parseSvg`
- **No Dependencies**: Pure TypeScript with no React or other frameworks
- **Minimal Setup**: Simple HTML, CSS, and TypeScript
- **Direct DOM Manipulation**: Manual SVG mounting and control
- **Essential Controls**: Play and replay functionality

## 🚀 Getting Started

Install dependencies:
```bash
npm install
```

Run development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

## 💡 Core API Usage

### Basic Implementation

```typescript
import { createDrawing, parseSvg } from '@penwell/draw-on/core';

// Parse SVG string
const svg = parseSvg(svgMarkup);

// Mount to DOM
document.getElementById('stage')?.appendChild(svg);

// Create drawing
const drawing = createDrawing(svg, {
  duration: 220,
  type: 'oneByOne'
});

// Play animation
drawing.play(() => {
  console.log('Animation complete!');
});
```

### Available Methods

```typescript
drawing.play();           // Start animation
drawing.stop();           // Stop animation
drawing.reset();          // Reset to beginning
drawing.setProgress(0.5); // Jump to 50%
drawing.hide();           // Hide all elements
drawing.reveal();         // Reveal all elements
drawing.destroy();        // Clean up
```

## 🎨 Features

- **Zero Framework Overhead**: Pure JavaScript/TypeScript
- **Lightweight**: Minimal bundle size
- **Full Control**: Direct API access
- **Tree-Shakeable**: Import only what you need
- **TypeScript Ready**: Full type definitions

## 🛠 Tech Stack

- **Vite** for fast development and building
- **TypeScript** for type safety
- **@penwell/draw-on/core** for SVG animations

## 📖 Learn More

- [npm Package](https://www.npmjs.com/package/@penwell/draw-on)
- [GitHub Repository](https://github.com/penwell-app/draw-on)
- [Core API Documentation](https://github.com/penwell-app/draw-on#without-react)

## 🎬 Use Cases

Perfect for:
- Vanilla JavaScript/TypeScript projects
- Library integration without framework lock-in
- Minimum bundle size requirements
- Learning the core API
- Non-React projects (Vue, Svelte, Angular, etc.)

## 📦 Import Paths

For framework-agnostic usage, always import from `/core`:

```typescript
import { 
  createDrawing, 
  parseSvg,
  computeDims,
  recordDrawToWebM,
  canRecordVideo,
  downloadBlob
} from '@penwell/draw-on/core';
```

## 📄 License

MIT © 2026 Pratik Singh