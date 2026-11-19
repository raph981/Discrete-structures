/**
 * Widget: minimum, maximum and average degree, edge density and regularity.
 * Colors follow the lecture notes: δ(G) blue, Δ(G) red, d(G) green.
 */
import { h, setChildren, stat, stats, fmtFraction } from '../core/dom.js';
import { graphEditor } from '../core/graph-editor.js';
import { degreeStats, isRegular } from '../lib/graphs/degrees.js';

export default function mount(el, { example = 'lecture' } = {}) {
  const figures = h('div');
  const sequence = h('div', { class: 'degree-chips' });
  const verdict = h('p', { class: 'verdict' });

  const editor = graphEditor({
    example,
    examples: ['lecture', 'square', 'cube', 'petersen', 'star'],
    decorate,
    onChange: update,
  });

  function decorate() {
    const G = editor.graph;
    const { min, max } = degreeStats(G);
    return {
      vertexLabel: (v) => String(G.degree(v)),
      vertexClass: (v) => {
        const d = G.degree(v);
        if (min === max) return 'is-regular';
        return d === min ? 'is-min' : d === max ? 'is-max' : '';
      },
    };
  }

  function update(G) {
    const s = degreeStats(G);
    if (!s.order) {
      setChildren(figures, h('p', { class: 'widget__hint' }, 'Add some vertices.'));
      setChildren(sequence);
      verdict.textContent = '';
      return;
    }
    setChildren(figures, stats(
      stat(h('span', { class: 'text-min' }, 'minimum degree δ(G)'), String(s.min)),
      stat(h('span', { class: 'text-max' }, 'maximum degree Δ(G)'), String(s.max)),
      stat(h('span', { class: 'text-avg' }, 'average degree d(G)'), fmtFraction(s.degreeSum, s.order), `= 2e(G)/v(G) = 2·${s.size}/${s.order}`),
      stat('edge density ε(G) = e(G)/v(G)', fmtFraction(s.size, s.order), 'ε(G) = d(G)/2'),
    ));
    setChildren(sequence,
      h('span', { class: 'widget__hint' }, 'Degree sequence: '),
      G.vertices.map((v) => {
        const d = G.degree(v);
        const cls = s.min === s.max ? 'chip-static' : d === s.min ? 'chip-static is-min' : d === s.max ? 'chip-static is-max' : 'chip-static';
        return h('span', { class: cls, title: `d(${v}) = ${d}` }, `${v}: ${d}`);
      }));
    verdict.textContent = isRegular(G)
      ? `✓ G is ${s.min}-regular: every vertex has degree ${s.min}, so δ(G) = d(G) = Δ(G).`
      : `G is not regular: δ(G) = ${s.min} < Δ(G) = ${s.max}. (Always δ(G) ≤ d(G) ≤ Δ(G).)`;
  }

  setChildren(el,
    editor.element,
    h('p', { class: 'widget__hint' }, 'Each vertex shows its degree. Blue: degree δ(G), red: degree Δ(G).'),
    figures, sequence, verdict);
  editor.start();
}
