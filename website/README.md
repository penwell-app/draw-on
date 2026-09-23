# Draw-On documentation website

The documentation, live demos and playground for
[`@penwell/draw-on`](https://www.npmjs.com/package/@penwell/draw-on).

Built with Vite 8, React 19, TypeScript, MDX and build-time Shiki highlighting.
It imports the library **from the repo's `src/`** through a Vite alias, so the
demos on the site are always the code you are editing - never a stale published
build.

```bash
npm install
npm run dev          # http://localhost:5180
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Type check, then a production build into `dist/` |
| `npm run preview` | Serve the production build (port 4180) |
| `npm run typecheck` | `tsc --noEmit` for the site |
| `npm run typecheck:package` | `tsc --noEmit` over the library's own `src/` |
| `npm test` | Vitest + jsdom: nav integrity, samples, codegen, documented defaults |
| `npm run lint` | ESLint (flat config, same setup as the demos) |

> **Type checking note.** The site type-checks against the package's *published
> declarations* (`../dist/*.d.ts`) while running its code from `../src/`. If
> types are missing, build the package once (`npm run build` in the repository
> root). This split exists on purpose: API changes must be reviewed at the public
> surface, while demos keep running against the working tree.

## Layout

```
website/
├─ public/              logo, favicon, demo GIFs and WebM clips
├─ src/
│  ├─ content/
│  │  ├─ docs/**/*.mdx  every documentation page
│  │  ├─ nav.ts         sidebar, slugs, summaries, prev/next, edit links
│  │  └─ samples.ts     SVG samples for the playground and gallery
│  ├─ demos/            live demo components; each is also the code shown on its page
│  ├─ components/
│  │  ├─ docs/          MDX component map, code blocks, callouts, tables, headings
│  │  ├─ demo/          demo frame, options lab, sample explorer, controls
│  │  └─ layout/        header, footer, docs shell, sidebar, TOC, search, theme
│  ├─ lib/              live-drawing hook, codegen, headings, theme, misc hooks
│  ├─ pages/            landing, doc page, playground, examples, 404
│  ├─ styles/           tokens + chrome + docs + demo + landing + code styling
│  └─ tests/            Vitest suites
├─ vite.config.ts       MDX + Shiki + react plugin + library alias + version define
├─ vitest.config.ts     same aliases, jsdom environment
└─ vercel.json          SPA rewrites for deep links
```

## Content workflow

- **New page:** add an MDX file under `src/content/docs/` and a `NAV` entry in
  `src/content/nav.ts` (sidebar, search, pagination and the "edit this page" link
  all come from that entry). `npm test` fails if the two get out of sync.
- **New sample:** add a `SampleDef` to `src/content/samples.ts`. It appears in the
  playground picker and the examples gallery automatically, and a test checks that
  every sample parses with the real `parseSvg`.
- **New demo:** add a component to `src/demos/`, register it in `src/demos/sources.ts`,
  then use `<LiveDemo sourceId="…">` in a page — the demo runs live *and* shows its
  own source, so examples cannot drift from behaviour.
- **Components in MDX** need no imports: `Callout`, `PropTable`, `ApiSignature`,
  `Card`, `CardGrid`, `CodeBlock`, `CodeTabs`, `LiveDemo`, `OptionsLab`,
  `SampleExplorer` and `MediaGallery` are provided through the MDX component map.

## Design system

Colours, type and radii come from the package's existing brand language
(`draw-on.svg`, `demos/*/src/styles.css`): cream paper surfaces, ink text, a green
accent and gold highlights, Georgia headings with Urbanist body text. Code blocks
are highlighted by Shiki at build time (`github-dark`) on an ink panel, so no
highlighter ships to the browser.
