/**
 * Widget: the distance layers N₀, N₁, …, N_r around a root, drawn as a tree-like picture.
 * For odd girth g = 2r + 1 the proof shows: no edges inside N_i for i < r (Lemma 2), each vertex of N_i
 * has exactly one neighbor in N_{i−1} (Lemma 1), hence |N_i| ≥ δ(δ − 1)^{i−1}.
 */
import { h, setChildren, chips, table } from '../core/dom.js';
import { graphView } from '../core/graph-view.js';
import { exampleChoices, loadExample } from '../data/graphs.js';
import { degreeStats } from '../lib/graphs/degrees.js';
import { bfs, girth } from '../lib/graphs/paths.js';
import { layerBound } from '../lib/graphs/moore.js';

const COLORS = 8;

export default function mount(el, { example = 'petersen' } = {}) {
  let graph; let root; let layout;
  const view = graphView({ ariaLabel: 'Distance layers', draggable: false, onVertexClick: (v) => { root = v; draw(); } });
  const info = h('div');

  function load(key) {
    graph = loadExample(key).graph;
    root = graph.vertices[0];
    draw();
  }

  function draw() {
    const { layers, dist } = bfs(graph, root);
    layout = {};
    layers.forEach((L, i) => {
      const y = 40 + i * (280 / Math.max(1, layers.length - 1));
      // order each layer by the mean position of its neighbors one layer up, to reduce crossings
      const key = (v) => {
        const up = graph.neighbors(v).filter((w) => dist.get(w) === i - 1).map((w) => layout[w].x);
        return up.length ? up.reduce((s, x) => s + x, 0) / up.length : 0;
      };
      [...L].sort((a, b) => key(a) - key(b)).forEach((v, k) => { layout[v] = { x: (600 * (k + 1)) / (L.length + 1), y }; });
    });
    const sameLayer = (u, v) => dist.get(u) === dist.get(v);
    view.update({
      graph,
      positions: layout,
      vertexClass: (v) => `color-${(dist.get(v) % COLORS) + 1}${v === root ? ' is-selected' : ''}`,
      edgeClass: (u, v) => (sameLayer(u, v) ? 'is-bad' : ''),
    });

    const d = degreeStats(graph).min;
    const g = girth(graph).girth;
    const r = Math.floor(g / 2);
    setChildren(info,
      h('p', {}, `δ(G) = ${d}, g(G) = ${g}${g % 2 ? ` = 2r + 1 with r = ${r}` : ` = 2r with r = ${r}`}. Red edges lie inside a layer.`),
      table(['layer', 'vertices', '|N_i|', 'bound from the proof', 'edges inside N_i'], layers.map((L, i) => {
        const inside = graph.edges.filter(([a, b]) => dist.get(a) === i && dist.get(b) === i).length;
        return {
          cells: [`N${i}`, L.join(', '), String(L.length), i <= r ? `≥ ${layerBound(d, i)}` : '–', String(inside)],
        };
      })),
      h('p', { class: 'widget__hint' }, 'Click any vertex to make it the root.'),
    );
  }

  setChildren(el, chips('Graph:', exampleChoices(['petersen', 'heawood', 'cube', 'k33', 'k4']), (item) => load(item.key)), view.element, info);
  load(example);
}
