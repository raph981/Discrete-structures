/**
 * Widget: build a graph by clicking and watch its formal description V(G), E(G) update.
 * Makes the definition E ⊆ (V choose 2) tangible: every edge is an unordered pair of distinct vertices.
 */
import { h, setChildren, stat, stats } from '../core/dom.js';
import { graphEditor } from '../core/graph-editor.js';
import { renderMath } from '../core/math.js';
import { pairCount } from '../lib/graphs/graph.js';

const set = (items) => (items.length ? `\\{${items.join(',\\ ')}\\}` : '\\emptyset');

export default function mount(el, { example = 'lecture' } = {}) {
  const formal = h('div', { class: 'formal-sets' });
  const figures = h('div');

  const editor = graphEditor({
    example,
    examples: ['lecture', 'path4', 'k4', 'empty'],
    onChange: update,
  });

  function update(graph) {
    const n = graph.order;
    const m = graph.size;
    formal.innerHTML = `
      <p>$V(G) = ${set(graph.vertices)}$</p>
      <p>$E(G) = ${set(graph.edges.map(([u, v]) => `\\{${u},${v}\\}`))}$</p>`;
    renderMath(formal);
    setChildren(figures, stats(
      stat('vertices v(G) = |V(G)|', String(n)),
      stat('edges e(G) = |E(G)|', String(m)),
      stat('possible pairs |(V choose 2)|', String(pairCount(n)), `n(n−1)/2 for n = ${n}`),
      stat('pairs that are edges', n > 1 ? `${m} of ${pairCount(n)}` : '–'),
    ));
  }

  setChildren(el, editor.element, figures, formal);
  editor.start();
}
