/**
 * Widget: the adjacency list of a graph – a main list with one entry per vertex, each entry the list
 * of that vertex's neighbors. Its total length is Σ d(v) = 2e(G).
 */
import { h, setChildren } from '../core/dom.js';
import { graphEditor } from '../core/graph-editor.js';

export default function mount(el, { example = 'numbered' } = {}) {
  let hover = null;
  const out = h('div', { class: 'adjacency' });

  const editor = graphEditor({
    example,
    examples: ['numbered', 'walks', 'star'],
    decorate: () => (hover ? {
      vertexClass: (v) => (v === hover ? 'is-focus' : editor.graph.hasEdge(v, hover) ? 'is-neighbor' : ''),
      edgeClass: (a, b) => (a === hover || b === hover ? 'is-incident' : 'is-muted'),
    } : {}),
    onChange: render,
  });

  function render(G) {
    const sorted = (xs) => [...xs].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
    setChildren(out,
      h('p', { class: 'mono adjacency__compact' }, `{ ${G.vertices.map((v) => `{${sorted(G.neighbors(v)).join(',')}}`).join(', ')} }`),
      h('table', { class: 'data-table adjacency__table' }, h('tbody', {}, G.vertices.map((v) => h('tr', {
        onmouseenter: () => { hover = v; editor.redraw(); }, onmouseleave: () => { hover = null; editor.redraw(); },
      }, h('th', { scope: 'row' }, `${v} →`), h('td', { class: 'mono' }, sorted(G.neighbors(v)).join(', ') || '(empty)'))))),
      h('p', { class: 'widget__hint' }, `Total length of all neighbor lists: ${2 * G.size} = 2 · e(G). Hover a row.`),
    );
  }

  setChildren(el, h('div', { class: 'widget-columns widget-columns--wide-left' }, editor.element, out));
  editor.start();
}
