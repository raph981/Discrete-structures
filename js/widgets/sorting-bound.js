/**
 * Widget: the comparison lower bound for sorting. There are n! possible orders; each comparison can rule
 * out at most half of the remaining ones, so at least ⌈log₂(n!)⌉ comparisons are needed in the worst case.
 */
import { h, setChildren, slider, controls, table, fmt } from '../core/dom.js';
import { log2Factorial } from '../lib/graphs/moore.js';

const factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1));

export default function mount(el, { n = 4 } = {}) {
  const halving = h('div');
  const rows = [2, 3, 4, 5, 8, 10, 16, 32, 64, 100, 1000].map((k) => [
    String(k),
    k <= 20 ? factorial(k).toLocaleString('en-US') : `≈ 10^${Math.floor(log2Factorial(k) / Math.log2(10))}`,
    String(Math.ceil(log2Factorial(k))),
    fmt(k * Math.log2(k), 0),
    fmt(log2Factorial(k) / (k * Math.log2(k)), 3),
  ]);

  function update(k) {
    let remaining = factorial(k);
    const chain = [remaining];
    while (remaining > 1) { remaining = Math.ceil(remaining / 2); chain.push(remaining); }
    setChildren(halving,
      h('p', {}, `n = ${k}: there are ${k}! = ${factorial(k)} possible orders. In the worst case each comparison keeps the larger half:`),
      h('p', { class: 'mono halving' }, chain.join(' → ')),
      h('p', {}, `That is ${chain.length - 1} = ⌈log₂(${k}!)⌉ comparisons before only one order is left.`),
    );
  }

  setChildren(el,
    controls(slider({ label: 'list length n =', min: 2, max: 10, value: n, onInput: update })),
    halving,
    table(['n', 'n!', '⌈log₂ n!⌉', 'n log₂ n', 'ratio'], rows),
    h('p', { class: 'widget__hint' }, 'The ratio log₂(n!) / (n log₂ n) tends to 1: log₂(n!) = Θ(n log n).'),
  );
  update(n);
}
