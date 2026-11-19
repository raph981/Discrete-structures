/**
 * Widget: finding the maximum with a "current leader". One comparison per element after the first,
 * so n − 1 comparisons in total – linear time.
 */
import { h, setChildren, button, stat, stats } from '../core/dom.js';
import { createStepper } from '../core/stepper.js';

function randomList(n) {
  const pool = Array.from({ length: 99 }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

export default function mount(el, { list = [23, 7, 61, 42, 15, 88, 30, 54, 9, 71] } = {}) {
  let L = [...list];
  let steps = [];
  const row = h('div', { class: 'array-row' });
  const figures = h('div');
  const note = h('p', { class: 'verdict' });

  function build() {
    steps = [{ i: 0, leader: 0, comparisons: 0 }];
    let leader = 0;
    for (let i = 1; i < L.length; i++) {
      if (L[i] > L[leader]) leader = i;
      steps.push({ i, leader, comparisons: i });
    }
    stepper.setCount(steps.length);
  }

  function show(k) {
    const s = steps[k];
    setChildren(row, L.map((x, i) => h('span', {
      class: `array-cell${i === s.leader ? ' is-leader' : ''}${i === s.i && k > 0 ? ' is-current' : ''}${i > s.i ? ' is-pending' : ''}`,
    }, String(x))));
    setChildren(figures, stats(
      stat('current leader x', String(L[s.leader])),
      stat('comparisons so far', String(s.comparisons), `of n − 1 = ${L.length - 1}`),
    ));
    note.textContent = k === 0
      ? 'Start: x := ℓ₁.'
      : k === steps.length - 1
        ? `Done after ${L.length - 1} comparisons: the maximum is ${L[s.leader]}.`
        : `Compare x with ℓ${s.i + 1} = ${L[s.i]}: x := max{x, ℓ${s.i + 1}} = ${L[s.leader]}.`;
  }

  const stepper = createStepper({ onStep: show });
  setChildren(el, row, stepper.element, figures, note,
    h('div', { class: 'button-row' }, button('New random list', () => { L = randomList(10); build(); }, { secondary: true })));
  build();
}
