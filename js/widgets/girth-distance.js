/**
 * Widget: girth and distances. The shortest cycle is highlighted; clicking a vertex v labels every
 * vertex with dist(v, ·) and colors the distance layers N₀, N₁, N₂, …
 */
import { h, setChildren, stat, stats } from '../core/dom.js';
import { graphEditor } from '../core/graph-editor.js';
import { edgeKey } from '../lib/graphs/graph.js';
import { bfs, cycleEdges, girth } from '../lib/graphs/paths.js';

const COLORS = 8;

export default function mount(el, { example = 'petersen', root = '1' } = {}) {
  let source = root;
  let g = null;
  const figures = h('div');
  const layersInfo = h('p', { class: 'mono' });

  const editor = graphEditor({
    example,
    examples: ['petersen', 'cube', 'heawood', 'walks', 'tree'],
    maxVertices: 14,
    tools: [{
      value: 'inspect', label: 'Distances', hint: 'Click a vertex to measure all distances from it.',
      onVertexClick: (v) => { source = v; describe(); },
    }, 'edit', 'delete'],
    decorate,
    onChange: () => describe(),
  });

  function decorate() {
    const G = editor.graph;
    const dist = G.hasVertex(source) ? bfs(G, source).dist : new Map();
    const cKeys = new Set(g?.cycle ? cycleEdges(g.cycle).map(([u, v]) => edgeKey(u, v)) : []);
    return {
      vertexLabel: (v) => (dist.has(v) ? String(dist.get(v)) : '∞'),
      vertexClass: (v) => (dist.has(v) ? `color-${(dist.get(v) % COLORS) + 1}` : 'is-muted') + (v === source ? ' is-selected' : ''),
      edgeClass: (u, v) => (cKeys.has(edgeKey(u, v)) ? 'in-cycle' : ''),
    };
  }

  function describe() {
    const G = editor.graph;
    if (!G.hasVertex(source)) source = G.vertices[0];
    g = girth(G);
    setChildren(figures, stats(
      stat('girth g(G)', g.girth === Infinity ? '∞ (forest)' : String(g.girth), g.cycle ? `shortest cycle: ${g.cycle.join('–')}–${g.cycle[0]}` : 'no cycle'),
      stat('distances from', source ?? '–', 'labels show dist(source, ·)'),
    ));
    layersInfo.textContent = source
      ? bfs(G, source).layers.map((L, i) => `N${i} = {${L.join(', ')}}`).join('   ')
      : '';
    editor.redraw();
  }

  setChildren(el, editor.element, figures, layersInfo,
    h('p', { class: 'widget__hint' }, 'Thick red: a shortest cycle. Each vertex shows its distance from the selected vertex.'));
  editor.start();
}
