/**
 * Widget: list all cycles of a graph. A cycle is treated as a set of vertices and edges,
 * so (a,b,f,e,a), (b,f,e,a,b) and (b,a,e,f,b) count once.
 */
import { h, setChildren } from '../core/dom.js';
import { graphEditor } from '../core/graph-editor.js';
import { edgeKey } from '../lib/graphs/graph.js';
import { allCycles, cycleEdges } from '../lib/graphs/paths.js';

const MAX_LISTED = 60;

export default function mount(el, { example = 'walks' } = {}) {
  let cycles = [];
  let selected = 0;
  const list = h('div', { class: 'auto-list' });
  const info = h('p');

  const editor = graphEditor({
    example,
    examples: ['walks', 'k4', 'cube', 'tree'],
    maxVertices: 10,
    decorate: () => {
      const c = cycles[selected];
      if (!c) return {};
      const keys = new Set(cycleEdges(c).map(([u, v]) => edgeKey(u, v)));
      return {
        vertexClass: (v) => (c.includes(v) ? 'is-neighbor' : 'is-muted'),
        edgeClass: (u, v) => (keys.has(edgeKey(u, v)) ? 'is-incident' : 'is-muted'),
      };
    },
    onChange: (G) => { cycles = allCycles(G, 500); selected = 0; renderList(); },
  });

  function renderList() {
    info.textContent = cycles.length
      ? `This graph has ${cycles.length}${cycles.length >= 500 ? '+' : ''} distinct cycle${cycles.length === 1 ? '' : 's'}. Click one to highlight it:`
      : 'This graph has no cycles – it is acyclic.';
    setChildren(list, cycles.slice(0, MAX_LISTED).map((c, i) => h('button', {
      type: 'button', class: 'chip mono', 'aria-pressed': String(i === selected),
      onclick: () => { selected = i; renderList(); },
    }, `(${[...c, c[0]].join(',')})`)));
    editor.redraw();
  }

  setChildren(el, editor.element, info, list);
  editor.start();
}
