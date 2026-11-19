/**
 * Widget: all automorphisms of a small graph.
 * Choosing an automorphism f animates every vertex v to the place of f(v). Because f preserves
 * adjacency, the picture after the move looks exactly like before – only the labels have moved.
 */
import { h, setChildren, chips, table } from '../core/dom.js';
import { graphView } from '../core/graph-view.js';
import { exampleChoices, loadExample } from '../data/graphs.js';
import { automorphisms, cycleNotation, movedVertices } from '../lib/graphs/isomorphism.js';

const COLORS = 8;
const DURATION = 700; // ms
const MAX_BUTTONS = 48;
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function mount(el, { example = 'lecture', examples = ['lecture', 'path4', 'star', 'square', 'c5', 'k4', 'petersen'] } = {}) {
  let graph; let home; // home = original positions
  let autos = [];
  let current = 0;
  let animation = 0;

  const view = graphView({ ariaLabel: 'Graph with automorphisms', draggable: false });
  const list = h('div', { class: 'auto-list', role: 'group', 'aria-label': 'Automorphisms' });
  const info = h('div');

  const colorOf = (v) => `color-${(graph.vertices.indexOf(v) % COLORS) + 1}`;

  function load(key) {
    ({ graph, positions: home } = loadExample(key));
    autos = automorphisms(graph);
    current = 0;
    renderList();
    show(0, false);
  }

  function renderList() {
    setChildren(list,
      autos.slice(0, MAX_BUTTONS).map((f, i) => h('button', {
        type: 'button', class: 'chip mono', 'aria-pressed': String(i === current), onclick: () => show(i, true),
      }, cycleNotation(f))),
      autos.length > MAX_BUTTONS ? h('span', { class: 'widget__hint' }, `… and ${autos.length - MAX_BUTTONS} more`) : null,
    );
  }

  /** Draws vertex v at a point between home[v] and home[f(v)]. */
  function frame(f, t) {
    const positions = Object.fromEntries(graph.vertices.map((v) => {
      const a = home[v]; const b = home[f.get(v)];
      return [v, { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }];
    }));
    const moved = new Set(movedVertices(f));
    view.update({ graph, positions, vertexClass: (v) => `${colorOf(v)}${moved.has(v) ? '' : ' is-fixed'}` });
  }

  function show(index, animate) {
    current = index;
    const f = autos[index];
    list.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));
    cancelAnimationFrame(animation);
    if (!animate || reducedMotion()) {
      frame(f, animate ? 1 : 0);
    } else {
      frame(f, 0);
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / DURATION);
        frame(f, t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2); // ease in-out
        if (t < 1) animation = requestAnimationFrame(step);
      };
      animation = requestAnimationFrame(step);
    }
    const moved = movedVertices(f);
    setChildren(info,
      h('p', {}, h('strong', {}, `${autos.length} automorphism${autos.length === 1 ? '' : 's'}`),
        ` in total. Selected: f = ${cycleNotation(f)}`,
        index === 0 ? ' (the trivial automorphism: f(v) = v for every v).' : '.'),
      moved.length
        ? table(['v', ...moved], [['f(v)', ...moved.map((v) => f.get(v))]])
        : h('p', { class: 'widget__hint' }, 'Every vertex stays where it is.'),
      moved.length ? h('p', { class: 'widget__hint' }, 'All other vertices are fixed. Notice: f only swaps vertices of equal degree.') : null,
    );
  }

  setChildren(el,
    chips('Graph:', exampleChoices(examples), (item) => load(item.key)),
    view.element,
    h('p', { class: 'widget__hint' }, 'Click an automorphism (cycle notation: “(u x)” swaps u and x):'),
    list,
    info,
  );
  load(example);
}
