/**
 * Widget: is there a graph with this degree sequence?
 * Applies the Handshake Lemma (sum must be even) and, for a definite answer, Havel–Hakimi.
 */
import { h, setChildren, textField, chips } from '../core/dom.js';
import { isGraphicSequence } from '../lib/graphs/degrees.js';

const PRESETS = [
  { label: '3, 3, 3, 1', value: '3, 3, 3, 1' },
  { label: '3, 3, 3, 3, 3', value: '3, 3, 3, 3, 3' },
  { label: '3, 3, 2, 2, 2', value: '3, 3, 2, 2, 2' },
  { label: '4, 4, 1, 1, 1, 1', value: '4, 4, 1, 1, 1, 1' },
  { label: '3, 3, 2, 2, 1, 1', value: '3, 3, 2, 2, 1, 1' },
];

function parse(text) {
  const parts = text.split(/[\s,;]+/).filter(Boolean);
  const numbers = parts.map(Number);
  return numbers.every((x) => Number.isInteger(x) && x >= 0) ? numbers : null;
}

export default function mount(el, { value = '3, 3, 3, 1' } = {}) {
  const result = h('div', { class: 'verdict' });
  const field = textField({ label: 'Degrees, separated by commas', value, onInput: update });

  function update(text) {
    const seq = parse(text);
    if (!seq || seq.length === 0) {
      setChildren(result, h('p', { class: 'widget__error' }, 'Please enter non-negative integers, e.g. 3, 2, 2, 1.'));
      return;
    }
    const sum = seq.reduce((s, d) => s + d, 0);
    const { graphic, evenSum } = isGraphicSequence(seq);
    const maxTooBig = Math.max(...seq) > seq.length - 1;
    setChildren(result,
      h('p', {}, `Sum of degrees: ${seq.join(' + ')} = ${sum} → `,
        evenSum
          ? h('span', { class: 'good' }, 'even, so the Handshake Lemma does not rule it out.')
          : h('span', { class: 'bad' }, `odd, impossible: Σ d(v) = 2·e(G) is always even.`)),
      maxTooBig && evenSum
        ? h('p', {}, h('span', { class: 'bad' }, `A vertex of degree ${Math.max(...seq)} needs that many distinct neighbors, but there are only ${seq.length - 1} other vertices.`))
        : null,
      h('p', { class: 'verdict__final' }, graphic
        ? h('span', { class: 'good' }, '✓ Some simple graph has exactly these degrees.')
        : h('span', { class: 'bad' }, '✗ No simple graph has exactly these degrees.')),
      evenSum && !graphic && !maxTooBig
        ? h('p', { class: 'widget__hint' }, 'An even sum is necessary but not sufficient. (Verified with the Havel–Hakimi algorithm.)')
        : null,
    );
  }

  setChildren(el,
    chips('Try:', PRESETS, (p) => { field.input.value = p.value; update(p.value); }),
    field.element,
    result,
  );
  update(value);
}
