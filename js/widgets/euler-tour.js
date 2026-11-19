/**
 * Widget: Euler's theorem and the tour-building algorithm.
 * First the graph is checked (connected, all degrees even). Then each step picks v ∈ Q, walks greedily
 * along untraveled edges until it is stuck – back at v, by the Lemma – and splices this walk Y into W.
 */
import { h, setChildren } from '../core/dom.js';
import { graphEditor } from '../core/graph-editor.js';
import { createStepper } from '../core/stepper.js';
import { edgeKey } from '../lib/graphs/graph.js';
import { eulerCheck, eulerTourSteps } from '../lib/graphs/euler.js';

export default function mount(el, { example = 'eulerian' } = {}) {
  let check = null;
  let steps = [];
  let current = null;
  const status = h('div', { class: 'verdict' });
  const walkBox = h('div', { class: 'algo-state mono' });

  const editor = graphEditor({
    example,
    examples: ['eulerian', 'konigsberg', 'k5', 'walks', 'cube'],
    decorate,
    onChange: rebuild,
  });

  function decorate() {
    const odd = new Set(check?.odd ?? []);
    const base = { vertexClass: (v) => (odd.has(v) ? 'is-odd' : '') };
    if (!current || !check?.has) return base;
    const order = new Map();
    current.W.slice(1).forEach((v, i) => { const k = edgeKey(current.W[i], v); if (!order.has(k)) order.set(k, i + 1); });
    const Y = new Set(current.Y.slice(1).map((v, i) => edgeKey(current.Y[i], v)));
    const Q = new Set(current.Q);
    return {
      vertexClass: (v) => (v === current.v ? 'is-focus' : Q.has(v) ? 'in-queue' : ''),
      edgeClass: (a, b) => {
        const k = edgeKey(a, b);
        return Y.has(k) ? 'is-new' : order.has(k) ? 'is-tree' : 'is-muted';
      },
      edgeLabel: (a, b) => (order.has(edgeKey(a, b)) ? String(order.get(edgeKey(a, b))) : ''),
    };
  }

  function rebuild(G) {
    check = eulerCheck(G);
    setChildren(status, h('p', {}, check.has
      ? h('span', { class: 'good' }, `✓ ${check.reason} By Euler's theorem there is an Eulerian tour – step through the algorithm below.`)
      : h('span', { class: 'bad' }, `✗ No Eulerian tour: ${check.reason}`)),
    check.odd.length ? h('p', { class: 'widget__hint' }, `Odd-degree vertices are outlined in red: ${check.odd.join(', ')}.`) : null);
    if (check.has) {
      steps = eulerTourSteps(G, G.vertices.find((v) => G.degree(v) > 0));
      stepperBox.hidden = false;
      stepper.setCount(steps.length);
    } else {
      steps = []; current = null;
      stepperBox.hidden = true;
      setChildren(walkBox);
      editor.redraw();
    }
  }

  function show(i) {
    current = steps[i];
    const done = i === steps.length - 1;
    setChildren(walkBox,
      current.v ? h('div', {}, h('strong', {}, `v = ${current.v}, Y = `), `(${current.Y.join(', ')})`) : h('div', {}, `Start: W = (${current.W[0]}), Q = {${current.W[0]}}`),
      h('div', {}, h('strong', {}, 'W = '), `(${current.W.join(', ')})`, ` — ${current.W.length - 1} of ${editor.graph.size} edges`),
      h('div', {}, h('strong', {}, 'Q = '), `{${current.Q.join(', ')}}`),
      done ? h('div', { class: 'good' }, '✓ Q = ∅: W is an Eulerian tour (edge numbers show the order).') : null,
    );
    editor.redraw();
  }

  const stepper = createStepper({ onStep: show });
  const stepperBox = h('div', {}, stepper.element);
  setChildren(el, editor.element, status, stepperBox, walkBox,
    h('p', { class: 'widget__hint' }, 'Red: the new closed walk Y · green with numbers: edges of W in tour order · orange ring: vertices in Q.'));
  editor.start();
}
