/**
 * Widget: adjacent, incident, neighborhood N(w) and degree d(w).
 * Inspect a vertex to highlight its neighbors and incident edges, or an edge to see
 * which vertices it is incident to.
 */
import { h, setChildren } from '../core/dom.js';
import { graphEditor } from '../core/graph-editor.js';
import { renderMath } from '../core/math.js';

const set = (items) => (items.length ? `\\{${items.join(', ')}\\}` : '\\emptyset');

export default function mount(el, { example = 'lecture', focus = 'w' } = {}) {
  /** @type {{kind: 'vertex', v: string} | {kind: 'edge', u: string, v: string} | null} */
  let selection = { kind: 'vertex', v: focus };
  const panel = h('div', { class: 'inspect-panel' });

  const editor = graphEditor({
    example,
    examples: ['lecture', 'star', 'k4', 'petersen'],
    tools: [
      {
        value: 'inspect',
        label: 'Inspect',
        hint: 'Click a vertex to see its neighborhood, or an edge to see its endpoints.',
        onVertexClick: (v) => { selection = { kind: 'vertex', v }; describe(); },
        onEdgeClick: (u, v) => { selection = { kind: 'edge', u, v }; describe(); },
        onBackgroundClick: () => { selection = null; describe(); },
      },
      'edit',
      'delete',
    ],
    decorate,
    onChange: () => describe(),
  });

  function decorate() {
    const G = editor.graph;
    if (selection?.kind === 'vertex' && G.hasVertex(selection.v)) {
      const w = selection.v;
      return {
        vertexClass: (v) => (v === w ? 'is-focus' : G.hasEdge(v, w) ? 'is-neighbor' : 'is-muted'),
        edgeClass: (a, b) => (a === w || b === w ? 'is-incident' : 'is-muted'),
      };
    }
    if (selection?.kind === 'edge' && G.hasEdge(selection.u, selection.v)) {
      const { u, v } = selection;
      return {
        vertexClass: (x) => (x === u || x === v ? 'is-neighbor' : 'is-muted'),
        edgeClass: (a, b) => ((a === u && b === v) || (a === v && b === u) ? 'is-focus' : 'is-muted'),
      };
    }
    return {};
  }

  function describe() {
    const G = editor.graph;
    if (selection?.kind === 'vertex' && G.hasVertex(selection.v)) {
      const w = selection.v;
      const N = G.neighbors(w);
      const incident = N.map((n) => `\\{${w}, ${n}\\}`);
      const others = G.vertices.filter((v) => v !== w && !G.hasEdge(v, w));
      panel.innerHTML = `
        <p><strong>Vertex ${w}</strong></p>
        <ul>
          <li><span class="swatch swatch--neighbor"></span>Neighborhood: $N(${w}) = ${set(N)}$</li>
          <li>Degree: $d(${w}) = |N(${w})| = ${N.length}$</li>
          <li><span class="swatch swatch--incident"></span>Incident edges: $${set(incident)}$</li>
          <li>Not adjacent to ${w}: $${set(others)}$</li>
        </ul>`;
    } else if (selection?.kind === 'edge' && G.hasEdge(selection.u, selection.v)) {
      const { u, v } = selection;
      panel.innerHTML = `
        <p><strong>Edge $e = \\{${u}, ${v}\\}$</strong></p>
        <ul>
          <li>$e$ is <em>incident</em> to $${u}$ and to $${v}$ (because $${u} \\in e$ and $${v} \\in e$).</li>
          <li>$${u}$ and $${v}$ are <em>adjacent</em> (because $\\{${u}, ${v}\\} \\in E(G)$).</li>
          <li>Every edge is incident to exactly 2 vertices.</li>
        </ul>`;
    } else {
      selection = null;
      panel.innerHTML = '<p class="widget__hint">Nothing selected. Use the “Inspect” tool and click a vertex or an edge.</p>';
    }
    renderMath(panel);
    editor.redraw();
  }

  setChildren(el, h('div', { class: 'widget-columns widget-columns--wide-left' }, editor.element, panel));
  editor.start();
}
