/**
 * Widget: trees, forests and leaves. Shows whether the graph is connected and acyclic, marks the leaves,
 * compares e(G) with v(G) − 1 and can highlight a longest path – whose endpoints are always leaves.
 */
import { h, setChildren, stat, stats, button } from '../core/dom.js';
import { graphEditor } from '../core/graph-editor.js';
import { edgeKey } from '../lib/graphs/graph.js';
import { components } from '../lib/graphs/paths.js';
import { isAcyclic, isTree, leaves, longestPath } from '../lib/graphs/trees.js';

export default function mount(el, { example = 'tree' } = {}) {
  let path = null;
  const figures = h('div');
  const verdict = h('p', { class: 'verdict' });

  const editor = graphEditor({
    example,
    examples: ['tree', 'forest', 'path4', 'walks'],
    maxVertices: 12,
    decorate: () => {
      const G = editor.graph;
      const leafSet = new Set(leaves(G));
      const pathKeys = new Set((path ?? []).slice(1).map((v, i) => edgeKey(path[i], v)));
      return {
        vertexClass: (v) => [leafSet.has(v) ? 'is-leaf' : '', path && (v === path[0] || v === path.at(-1)) ? 'is-focus' : ''].join(' '),
        edgeClass: (u, v) => (path ? (pathKeys.has(edgeKey(u, v)) ? 'is-incident' : 'is-muted') : ''),
      };
    },
    onChange: (G) => { path = null; describe(G); },
  });

  function describe(G) {
    const c = components(G).length;
    const acyclic = isAcyclic(G);
    const L = leaves(G);
    setChildren(figures, stats(
      stat('connected?', c <= 1 ? 'yes' : `no (${c} components)`),
      stat('acyclic?', acyclic ? 'yes' : 'no'),
      stat('edges vs. v(G) − 1', `${G.size} vs. ${Math.max(0, G.order - 1)}`),
      stat('leaves (green)', L.length ? `${L.length}: ${L.join(', ')}` : '0'),
    ));
    verdict.textContent = isTree(G)
      ? `✓ A tree: connected and acyclic. It has ${L.length} leaves and exactly v − 1 = ${G.order - 1} edges.`
      : acyclic
        ? `A forest with ${c} trees as components (e = v − ${c} = ${G.size}).`
        : 'Not a forest: the graph contains a cycle.';
    editor.redraw();
  }

  setChildren(el, editor.element,
    h('div', { class: 'button-row' },
      button('Highlight a longest path', () => { path = longestPath(editor.graph); editor.redraw(); }),
      button('Hide path', () => { path = null; editor.redraw(); }, { secondary: true })),
    figures, verdict);
  editor.start();
}
