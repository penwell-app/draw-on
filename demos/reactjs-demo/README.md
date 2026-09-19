<div align="center">
  <img src="./public/draw-on.svg" alt="draw-on" width="120" />
  <h1>@penwell/draw-on - React Demo</h1>
</div>

A clean React demonstration of `@penwell/draw-on` showcasing the `SketchDraw` component and `useSketchDraw` hook with practical examples.

## 🎯 What This Demo Shows

This demo focuses on React integration patterns:

- **SketchDraw Component**: Declarative SVG animation component
- **useSketchDraw Hook**: Low-level hook for custom implementations
- **State Management**: React state integration with animation lifecycle
- **Event Handling**: Play, pause, replay, and scrubbing controls
- **WebM Export**: Browser-based recording functionality
- **Render Props**: Flexible UI composition patterns

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

## 💡 Component API

### SketchDraw Component

```tsx
import { SketchDraw } from '@penwell/draw-on';

<SketchDraw
  svgMarkup={mySvg}
  duration={220}
  className="w-full"
>
  {({ play, status, exportWebM }) => (
    <div>
      <button onClick={play}>Play</button>
      <span>{status}</span>
    </div>
  )}
</SketchDraw>
```

### useSketchDraw Hook

```tsx
import { useSketchDraw } from '@penwell/draw-on';

const {
  containerRef,
  status,
  play,
  stop,
  reset,
  setProgress,
  exportWebM,
  canRecord
} = useSketchDraw({
  svgMarkup: mySvg,
  duration: 220,
  type: 'oneByOne'
});
```

## 🎨 Features

- **Declarative API**: React-friendly component interface
- **TypeScript Support**: Full type definitions included
- **Flexible Rendering**: Render prop pattern for custom UIs
- **Animation Controls**: Play, stop, reset, and scrub
- **Recording Support**: Export animations to WebM
- **Status Tracking**: Real-time animation state

## 🛠 Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **@penwell/draw-on** for SVG animations

## 📖 Learn More

- [npm Package](https://www.npmjs.com/package/@penwell/draw-on)
- [GitHub Repository](https://github.com/penwell-app/draw-on)
- [React Documentation](https://react.dev/)

## 🎬 Use Cases

Perfect for:
- React applications with SVG animations
- Interactive dashboards with animated diagrams
- Educational platforms with step-by-step visualizations
- Documentation sites with animated examples
- Presentation tools built with React

## 📄 License

MIT © 2026 Pratik Singh
