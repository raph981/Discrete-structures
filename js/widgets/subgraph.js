/**
 * Widget: subgraphs and induced subgraphs.
 * The host graph G is drawn in blue; the user picks the vertices and edges of H (red).
 * Edges of G between two vertices of H that are missing in H are drawn dashed: they are
 * exactly what prevents H from being an induced subgraph.
 */
import { h, setChildren, button } from '../core/dom.js';
import { graphEditor } from '../core/graph-editor.js';
import { renderMath } from '../core/math.js';
import { Graph, edgeKey } from '../lib/graphs/graph.js';
import { loadExample } from '../data/graphs.js';
import { checkInduced } from '../lib/graphs/subgraph.js';

/** H from the lecture notes (page 3): not induced, because the diagonal {u, x} is missing. */
const LECTURE_H = { vertices: ['u', 'v', 'x', 'w', 'y'], edges: [['u', 'v'], ['v', 'x'], ['w', 'y']] };

const set = (items) => (items.length ? `\\{${items.join(', ')}\\}` : '\\emptyset');

export default function mount(el, { example = 'lecture', preset = true } = {}) {
  let hVertices = new Set();
  let hEdges = new Set(); // edge keys
  const status = h('div', { class: 'verdict' });

  const editor = graphEditor({
    example,
    examples: ['lecture', 'cube', 'petersen'],
    tools: [{
      value: 'pick',
      label: 'Pick H',
      hint: 'Click vertices and edges of G to add them to H (or remove them). An edge brings its endpoints along.',
      onVertexClick: toggleVertex,
      onEdgeClick: toggleEdge,
    }],
    decorate,
    onChange: () => { clear(); },
  });

  function toggleVertex(v) {
    if (hVertices.has(v)) {
      hVertices.delete(v);
      for (const key of [...hEdges]) if (key.split('|').includes(v)) hEdges.delete(key);
    } else {
      hVertices.add(v);
    }
    describe();
  }

  function toggleEdge(u, v) {
    const key = edgeKey(u, v);
    if (hEdges.has(key)) hEdges.delete(key);
    else {
      hEdges.add(key);
      hVertices.add(u);
      hVertices.add(v);
    }
    describe();
  }

  function currentH() {
    const G = editor.graph;
    const vertices = G.vertices.filter((v) => hVertices.has(v));
    const edges = G.edges.filter(([u, v]) => hEdges.has(edgeKey(u, v)));
    return new Graph(vertices, edges);
  }

  function decorate() {
    const { missingEdges } = checkInduced(currentH(), editor.graph);
    const missing = new Set(missingEdges.map(([u, v]) => edgeKey(u, v)));
    return {
      vertexClass: (v) => (hVertices.has(v) ? 'in-h' : 'in-g'),
      edgeClass: (u, v) => {
        const key = edgeKey(u, v);
        return hEdges.has(key) ? 'in-h' : missing.has(key) ? 'is-missing' : 'in-g';
      },
    };
  }

  function describe() {
    const H = currentH();
    const { isInduced, missingEdges } = checkInduced(H, editor.graph);
    status.innerHTML = `
      <p>$V(H) = ${set(H.vertices)}$, &nbsp; $E(H) = ${set(H.edges.map(([u, v]) => `\\{${u},${v}\\}`))}$</p>
      <p><span class="good">✓ $H \\subseteq G$</span> – every vertex and edge of H is taken from G.</p>
      <p>${H.order === 0
    ? 'H is empty – pick some vertices.'
    : isInduced
      ? `<span class="good">✓ H is an induced subgraph:</span> $H = G[${set(H.vertices)}]$.`
      : `<span class="bad">✗ H is not induced:</span> G has the edge${missingEdges.length > 1 ? 's' : ''}
         $${missingEdges.map(([u, v]) => `\\{${u},${v}\\}`).join(', ')}$ between vertices of H, but H does not (dashed).`}</p>`;
    renderMath(status);
    editor.redraw();
  }

  function clear() {
    hVertices = new Set();
    hEdges = new Set();
    describe();
  }

  function loadLectureH() {
    const G = editor.graph;
    const fits = LECTURE_H.vertices.every((v) => G.hasVertex(v)) && LECTURE_H.edges.every(([u, v]) => G.hasEdge(u, v));
    if (!fits) editor.load(loadExample('lecture'));
    hVertices = new Set(LECTURE_H.vertices);
    hEdges = new Set(LECTURE_H.edges.map(([u, v]) => edgeKey(u, v)));
    describe();
  }

  function induce() {
    hEdges = new Set(editor.graph.induced([...hVertices]).edges.map(([u, v]) => edgeKey(u, v)));
    describe();
  }

  function takeAll() {
    hVertices = new Set(editor.graph.vertices);
    hEdges = new Set(editor.graph.edges.map(([u, v]) => edgeKey(u, v)));
    describe();
  }

  const lectureButton = button('H from the lecture', loadLectureH, { secondary: true });

  setChildren(el,
    editor.element,
    h('div', { class: 'button-row' },
      button('Induce: G[V(H)]', induce),
      button('H = G', takeAll, { secondary: true }),
      button('Clear H', clear, { secondary: true }),
      preset ? lectureButton : null,
    ),
    status,
  );
  editor.start();
  if (preset && example === 'lecture') loadLectureH();
}
