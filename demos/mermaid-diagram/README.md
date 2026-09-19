<div align="center">
  <img src="./public/draw-on.svg" alt="draw-on" width="120" />
  <h1>@penwell/draw-on - Mermaid Diagram Demo</h1>
</div>

The flagship use case: Mermaid renders a real diagram to SVG at runtime, and `@penwell/draw-on` animates whatever comes out — no pre-baked markup required.

## 🎯 What This Demo Shows

This demo demonstrates real-time integration between Mermaid.js and @penwell/draw-on:

- **Dynamic SVG Generation**: Mermaid renders diagrams from text definitions
- **Automatic Animation**: Any Mermaid diagram type gets animated automatically
- **Live Editing**: Change the diagram definition and see it animate
- **Multiple Diagram Types**: Flowcharts, sequence diagrams, class diagrams, and more

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

## 💡 How It Works

1. **Define** a Mermaid diagram using text syntax
2. **Render** the diagram to SVG using Mermaid.js
3. **Animate** the generated SVG with @penwell/draw-on
4. **Replay** or scrub through the animation

## 📝 Example Usage

Edit `DEFINITION` in `src/App.tsx` to try your own diagram:

```typescript
const DEFINITION = `
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process]
    B -->|No| D[Alternative]
    C --> E[End]
    D --> E
`;
```

## 🎨 Supported Diagram Types

- **Flowcharts** (`graph`, `flowchart`)
- **Sequence Diagrams** (`sequenceDiagram`)
- **Class Diagrams** (`classDiagram`)
- **State Diagrams** (`stateDiagram`)
- **Entity Relationship** (`erDiagram`)
- **Gantt Charts** (`gantt`)
- **Pie Charts** (`pie`)
- And more!

## 🛠 Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **Mermaid.js** for diagram rendering
- **@penwell/draw-on** for SVG animations

## 📖 Learn More

- [npm Package](https://www.npmjs.com/package/@penwell/draw-on)
- [GitHub Repository](https://github.com/penwell-app/draw-on)
- [Mermaid Documentation](https://mermaid.js.org/)

## 🎬 Use Cases

Perfect for:
- Technical documentation with animated diagrams
- Educational content and tutorials
- Presentation slides with dynamic flow
- Interactive architecture documentation
- Animated API documentation

## 📄 License

MIT © 2026 Pratik Singh 