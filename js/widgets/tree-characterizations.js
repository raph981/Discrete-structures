/**
 * Widget: the four equivalent "definitions" of a tree, checked live. When a statement fails,
 * hovering (or focusing) its row highlights a witness in the drawing.
 */
import { h, setChildren } from '../core/dom.js';
import { graphEditor } from '../core/graph-editor.js';
import { edgeKey } from '../lib/graphs/graph.js';
import { treeCharacterizations } from '../lib/graphs/trees.js';

export default function mount(el, { example = 'tree' } = {}) {
  let result = null;
  let focus = null; // 'ii' | 'iii' | 'iv'
  const rows = h('div', { class: 'char-list' });

  const editor = graphEditor({
    example,
    examples: ['tree', 'walks', 'forest', 'path4'],
    maxVertices: 10,
    decorate,
    onChange: (G) => { result = treeCharacterizations(G); render(); },
  });

  function decorate() {
    if (!result || !focus) return {};
    if (focus === 'ii' && result.minimallyConnected.witness) {
      const k = edgeKey(...result.minimallyConnected.witness);
      return { edgeClass: (u, v) => (edgeKey(u, v) === k ? 'is-bad' : '') };
    }
    if (focus === 'iii' && result.maximallyAcyclic.witness) {
      const [u, v] = result.maximallyAcyclic.witness;
      return { ghostEdges: [[u, v]], vertexClass: (x) => (x === u || x === v ? 'is-neighbor' : '') };
    }
    if (focus === 'iv' && result.uniquePaths.witness) {
      const { u, v, paths } = result.uniquePaths.witness;
      const keys = paths.map((p) => new Set(p.slice(1).map((x, i) => edgeKey(p[i], x))));
      return {
        vertexClass: (x) => (x === u || x === v ? 'is-focus' : ''),
        edgeClass: (a, b) => {
          const k = edgeKey(a, b);
          return keys[0]?.has(k) ? 'is-incident' : keys[1]?.has(k) ? 'is-good' : 'is-muted';
        },
      };
    }
    return {};
  }

  function row(id, label, holds, detail) {
    return h('div', {
      class: `char-row ${holds ? 'char-row--ok' : 'char-row--fail'}`, tabindex: holds ? null : 0,
      onmouseenter: () => { focus = id; editor.redraw(); }, onmouseleave: () => { focus = null; editor.redraw(); },
      onfocus: () => { focus = id; editor.redraw(); }, onblur: () => { focus = null; editor.redraw(); },
    },
    h('span', { class: 'char-row__mark' }, holds ? '✓' : '✗'),
    h('span', {}, h('strong', {}, label), detail ? h('span', { class: 'char-row__detail' }, ` — ${detail}`) : null));
  }

  function render() {
    const { tree, minimallyConnected: mc, maximallyAcyclic: ma, uniquePaths: up } = result;
    const w = up.witness;
    setChildren(rows,
      row('i', '(i) T is a tree', tree.holds,
        tree.holds ? 'connected and acyclic' : [!tree.connected && 'not connected', !tree.acyclic && 'has a cycle'].filter(Boolean).join(', ')),
      row('ii', '(ii) minimally connected', mc.holds,
        !mc.connected ? 'not even connected' : mc.witness ? `removing {${mc.witness.join(', ')}} keeps it connected (red)` : 'removing any edge disconnects it'),
      row('iii', '(iii) maximally acyclic', ma.holds,
        !ma.acyclic ? 'not even acyclic' : ma.witness ? `adding {${ma.witness.join(', ')}} creates no cycle (dashed)` : 'adding any new edge creates a cycle'),
      row('iv', '(iv) exactly one path between any two vertices', up.holds,
        w ? (w.paths.length ? `${w.u} and ${w.v} are joined by ≥ 2 paths` : `no path between ${w.u} and ${w.v}`) : 'every pair has a unique path'),
      h('p', { class: 'widget__hint' }, 'The theorem says: all four rows are always equal. Hover a failing row to see why it fails.'),
    );
    editor.redraw();
  }

  setChildren(el, h('div', { class: 'widget-columns widget-columns--wide-left' }, editor.element, rows));
  editor.start();
}
