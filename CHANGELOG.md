# Changelog

## 1.0.0

### Added

- New zero-dependency engine replacing Vivus. Timing in milliseconds.
- `draw(target, options)`: promise-based `play()`, `pause`, `resume`, `reverse`, `restart`, `seek`, `seekTime`, `progress`, `playbackRate`, `loop`, `yoyo`, `delay`, events, `stats`.
- `<use>`, `<symbol>` and shared-path resolution, including sprites defined elsewhere on the page, nested `<use>`, `viewBox` and `preserveAspectRatio`.
- Ordering modes `stagger` and `speed` (constant pen speed); `data-draw-order` and `data-draw-skip`.
- Easing by name or function, global `ease` plus per-stroke `strokeEase`.
- Reveal modes `end`, `stroke`, `none`; label modes `fade`, `type`, `none`.
- `pen` nib, `sketchy` hand-drawn mode, `presets`.
- `toAnimatedSVG()`: CSS-only animated SVG export for READMEs, `<img>` and email.
- `mount()`, `loadSvg()`, `sanitizeSvg()`, `scrollScrub()`, `inView()`.
- `recordFrames()` for PNG frames; `scale` and `inlineImages` recording options; wall-clock frame pacing.
- React `<DrawOn>` (JSX children, `svg`, `src`, triggers, controlled `progress`, ref handle) and `useDrawOn`.
- `<draw-on>` Web Component via `@penwell/draw-on/element`.
- `@penwell/draw-on/react` and `@penwell/draw-on/element` entry points.
- `prefers-reduced-motion` support and dev-only warnings.

### Fixed

- Stray dots from round line caps before a stroke starts.
- SVGs built from `<use>`/`<symbol>` showed nothing.
- Dashed strokes lost their dash pattern; they now fade in.
- CSS-styled fills and strokes were not overridden reliably.

### Changed

- `destroy()` restores the SVG exactly; shapes are no longer converted to `<path>`.
- `parseSvg()` strips scripts, event handlers and `javascript:` links.

### Deprecated

- `createDrawing`, `useSketchDraw`, `SketchDraw`. They keep working on the new engine.
