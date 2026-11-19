# Discrete Structures – interactive

An interactive website that explains the Discrete Structures lectures step by step. Every definition
comes with an example graph you can edit, and every proof with a figure that shows why it works.

Covered so far:

| Lecture | Topics | Interactive figures |
|---|---|---|
| 1 – Graph intro | Graphs as $E \subseteq \binom{V}{2}$, adjacent/incident, neighborhood and degree, Handshake Lemma, δ/Δ/d(G), regular graphs, subgraphs and induced subgraphs, isomorphisms, automorphisms, Regularizing Lemma, subgraphs with large minimum degree | Graph builder with live V(G)/E(G), neighborhood inspector, incidence matrix (double counting), degree-sequence checker, degree statistics, subgraph picker, isomorphism builder, animated automorphisms, step-by-step regularization, min-degree deletion algorithm |

## Running it

The site is fully static (no build step, no dependencies). Because it uses ES modules it has to be
served over HTTP:

```bash
npm start            # = python3 -m http.server 8000
# then open http://localhost:8000
```

It can be published as-is, e.g. with GitHub Pages.

## Tests

The graph algorithms are pure functions and can be tested without a browser (Node ≥ 18):

```bash
npm test
```

The tests check, among other things, the examples from the lecture notes (N(w), the non-induced
subgraph H, the 2 automorphisms, the first regularizing step), the Handshake Lemma on random graphs,
that the regularized graph is Δ(G)-regular and contains G as an induced subgraph, and that the
deletion process really ends with δ(H) > ε(H) ≥ ε(G).

## Structure

```
index.html               page skeleton
css/main.css             styling (design tokens, light/dark mode, graph styles)
js/app.js                navigation and hash routing (#/lecture1/section)
js/core/                 infrastructure without subject logic
  dom.js                 DOM helpers and controls (sliders, segmented controls, tables, …)
  math.js                math typesetting with KaTeX
  graph-view.js          SVG drawing of a graph (click and drag handling)
  graph-editor.js        graph editor with tools and example graphs, built on graph-view
  widgets.js             mounts widget placeholders into pages
js/lib/graphs/           pure, tested graph algorithms (no DOM)
  graph.js               the Graph class (simple graphs)
  degrees.js             degrees, δ, Δ, d(G), ε(G), incidence matrix, Havel–Hakimi
  subgraph.js            subgraph / induced subgraph checks
  isomorphism.js         isomorphism search, automorphisms, cycle notation
  regularize.js          construction from the Regularizing Lemma
  dense-subgraph.js      deletion process from the large-degree lemma
js/data/graphs.js        example graphs with drawing positions
js/widgets/              interactive figures, one file each
js/content/              lecture content, one file per lecture
  blocks.js              building blocks: box(), proof(), exercise(), widget(), …
tests/                   unit tests (node:test)
vendor/katex/            bundled KaTeX (MIT license)
```

Layers only depend "downwards": `content → widgets → core + lib/graphs`. The graph library knows
nothing about the DOM, which keeps it easy to test.

## Extending

**New lecture**

1. Create `js/content/lecture02.js` following `lecture01.js`: an object with `id`, `number`, `title`,
   `summary` and `sections` (each with `id`, `title`, `body`).
2. Import it in `js/content/index.js` and append it to `LECTURES`.

Navigation, table of contents and previous/next links are generated automatically.

**New widget**

1. Put the algorithm as a pure function into `js/lib/graphs/` and test it in `tests/`.
2. Create `js/widgets/my-widget.js` with `export default function mount(element, props) { … }`.
   For an editable graph use `graphEditor()` from `js/core/graph-editor.js`; it handles adding,
   connecting, deleting and dragging vertices, and lets you add your own tools and highlighting.
3. Register it in `js/widgets/index.js`.
4. Use it in content with `widget('my-widget', { …props }, 'Caption')`.

**New example graph**: add an entry to `EXAMPLES` in `js/data/graphs.js` (vertex positions in a
600 × 360 drawing area); it can then be offered in any editor via `examples: ['myKey']`.

Formulas in content are written as `$…$` or `$$…$$`; with the template tag `tx` (= `String.raw`)
backslashes need not be doubled.
