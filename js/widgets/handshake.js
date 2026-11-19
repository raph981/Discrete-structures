/**
 * Widget: the Handshake Lemma as double counting in the incidence matrix.
 * Rows are vertices, columns are edges. Counting the 1-entries row by row gives Σ d(v);
 * counting column by column gives 2·e(G). Hovering a row or column highlights it in the drawing.
 */
import { h, setChildren, stat, stats } from '../core/dom.js';
import { graphEditor } from '../core/graph-editor.js';
import { incidenceMatrix } from '../lib/graphs/degrees.js';

export default function mount(el, { example = 'lecture' } = {}) {
  let hover = null; // { vertex } | { edge: [u, v] }
  const matrixBox = h('div', { class: 'table-scroll' });
  const summary = h('div');

  const editor = graphEditor({
    example,
    examples: ['lecture', 'star', 'cube', 'empty'],
    maxVertices: 10,
    decorate,
    onChange: update,
  });

  function decorate() {
    if (hover?.vertex) {
      const w = hover.vertex;
      return {
        vertexClass: (v) => (v === w ? 'is-focus' : ''),
        edgeClass: (a, b) => (a === w || b === w ? 'is-incident' : 'is-muted'),
      };
    }
    if (hover?.edge) {
      const [u, v] = hover.edge;
      return {
        vertexClass: (x) => (x === u || x === v ? 'is-focus' : ''),
        edgeClass: (a, b) => (a === u && b === v ? 'is-incident' : 'is-muted'),
      };
    }
    return {};
  }

  function setHover(next) {
    hover = next;
    editor.redraw();
  }

  function update(graph) {
    const { vertices, edges, rows, rowSums, columnSums } = incidenceMatrix(graph);
    const total = rowSums.reduce((s, x) => s + x, 0);
    const edgeName = ([u, v]) => `${u}${v}`;

    const head = h('tr', {},
      h('th', { scope: 'col' }, ''),
      edges.map((e) => h('th', {
        scope: 'col', class: 'incidence__col', onmouseenter: () => setHover({ edge: e }), onmouseleave: () => setHover(null),
      }, edgeName(e))),
      h('th', { scope: 'col', class: 'incidence__sum' }, 'd(v)'),
    );
    const body = vertices.map((v, i) => h('tr', {
      onmouseenter: () => setHover({ vertex: v }), onmouseleave: () => setHover(null),
    },
    h('th', { scope: 'row' }, v),
    rows[i].map((x) => h('td', { class: x ? 'incidence__one' : 'incidence__zero' }, String(x))),
    h('td', { class: 'incidence__sum' }, String(rowSums[i])),
    ));
    const foot = h('tr', { class: 'incidence__foot' },
      h('th', { scope: 'row' }, 'Σ'),
      columnSums.map((s) => h('td', {}, String(s))),
      h('td', { class: 'incidence__total' }, String(total)),
    );
    setChildren(matrixBox, edges.length
      ? h('table', { class: 'data-table incidence' }, h('thead', {}, head), h('tbody', {}, body, foot))
      : h('p', { class: 'widget__hint' }, 'The graph has no edges yet – every degree is 0 and both counts are 0.'));

    const odd = vertices.filter((v, i) => rowSums[i] % 2 === 1);
    setChildren(summary, stats(
      stat('count by vertices: Σ d(v)', `${rowSums.join(' + ') || '0'} = ${total}`, 'row sums'),
      stat('count by edges: 2 · e(G)', `2 · ${edges.length} = ${2 * edges.length}`, 'every column sums to 2'),
      stat('vertices of odd degree', `${odd.length}${odd.length ? ` (${odd.join(', ')})` : ''}`, 'always an even number'),
    ));
  }

  setChildren(el, editor.element, summary,
    h('p', { class: 'widget__hint' }, 'Incidence matrix: entry 1 iff vertex and edge are incident. Hover a row or column.'),
    matrixBox);
  editor.start();
}
