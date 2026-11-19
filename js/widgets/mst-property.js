/**
 * Widget: the MST property. Choose a spanning tree T by clicking edges. For every non-tree edge (x, y)
 * the widget checks whether some edge on the x–y path in T is heavier than (x, y). If so, T is not
 * minimal – and swapping the two edges (T + xy − e) gives a lighter spanning tree.
 */
import { h, setChildren, chips, button, stat, stats } from '../core/dom.js';
import { graphView } from '../core/graph-view.js';
import { loadWeightedExample } from '../data/graphs.js';
import { edgeKey } from '../lib/graphs/graph.js';
import { isSpanningTree, kruskalSteps, mstViolations, weightOf } from '../lib/graphs/spanning.js';

/** A deliberately non-minimal starting tree for the lecture 2 graph. */
const START = { walks: [['a', 'b'], ['b', 'f'], ['e', 'f'], ['b', 'c'], ['c', 'd']] };

export default function mount(el, { example = 'walks' } = {}) {
  let graph; let positions; let weights; let tree; let violations = []; let focus = 0;
  const view = graphView({ ariaLabel: 'Weighted graph with a chosen spanning tree', onEdgeClick: toggle });
  const figures = h('div');
  const status = h('div', { class: 'verdict' });
  const list = h('div', { class: 'auto-list' });

  function load(key) {
    ({ graph, positions, weights } = loadWeightedExample(key));
    tree = new Set((START[key] ?? graph.edges.slice(0, graph.order - 1)).map(([a, b]) => edgeKey(a, b)));
    render();
  }

  function toggle(a, b) {
    const k = edgeKey(a, b);
    if (tree.has(k)) tree.delete(k); else tree.add(k);
    render();
  }

  const treeEdges = () => graph.edges.filter(([a, b]) => tree.has(edgeKey(a, b)));

  function swap() {
    const v = violations[focus];
    if (!v) return;
    const heaviest = v.heavier.reduce((m, e) => (weights.get(edgeKey(...e)) > weights.get(edgeKey(...m)) ? e : m));
    tree.delete(edgeKey(...heaviest));
    tree.add(edgeKey(...v.edge));
    render();
  }

  function render() {
    const T = treeEdges();
    const spanning = isSpanningTree(graph, T);
    violations = spanning ? mstViolations(graph, weights, T) : [];
    focus = Math.min(focus, Math.max(0, violations.length - 1));
    const v = violations[focus];
    const pathKeys = new Set(v ? v.path.slice(1).map((x, i) => edgeKey(v.path[i], x)) : []);
    const heavy = new Set(v ? v.heavier.map((e) => edgeKey(...e)) : []);
    view.update({
      graph, positions,
      edgeLabel: (a, b) => String(weights.get(edgeKey(a, b))),
      edgeClass: (a, b) => {
        const k = edgeKey(a, b);
        if (v && k === edgeKey(...v.edge)) return 'is-new';
        if (heavy.has(k)) return 'is-bad';
        if (pathKeys.has(k)) return 'is-tree in-cycle';
        return tree.has(k) ? 'is-tree' : 'is-muted';
      },
    });
    const optimum = weightOf(kruskalSteps(graph, weights).at(-1).T, weights);
    setChildren(figures, stats(
      stat('T is a spanning tree?', spanning ? 'yes' : `no (${T.length} edges, need ${graph.order - 1} and no cycle)`),
      stat('weight of T', String(weightOf(T, weights)), `minimum possible: ${optimum}`),
    ));
    if (!spanning) setChildren(status, h('p', {}, 'Click edges to add or remove them until T is a spanning tree.'));
    else if (!violations.length) setChildren(status, h('p', {}, h('span', { class: 'good' }, '✓ No violation: every non-tree edge is at least as heavy as all edges on its tree path. By the lemma, T is a minimum spanning tree.')));
    else {
      setChildren(status, h('p', {}, h('span', { class: 'bad' }, `✗ ${violations.length} violation${violations.length > 1 ? 's' : ''}. `),
        `Non-tree edge {${v.edge.join(', ')}} (weight ${weights.get(edgeKey(...v.edge))}, red) is lighter than ${v.heavier.map((e) => `{${e.join(', ')}}`).join(', ')} (dashed) on its tree path. `,
        'Swapping them gives a lighter spanning tree.'));
    }
    setChildren(list, violations.map((x, i) => h('button', {
      type: 'button', class: 'chip mono', 'aria-pressed': String(i === focus), onclick: () => { focus = i; render(); },
    }, `{${x.edge.join(',')}}`)));
    swapButton.disabled = !v;
  }

  const swapButton = button('Swap: T + xy − (heaviest e)', swap);
  setChildren(el,
    chips('Graph:', [{ key: 'walks', label: 'Lecture 2 graph' }, { key: 'grid', label: 'Grid' }, { key: 'k5', label: 'K₅' }], (item) => load(item.key)),
    view.element, figures, status, list,
    h('div', { class: 'button-row' }, swapButton),
    h('p', { class: 'widget__hint' }, 'Click edges to change T. Green: tree edges · red: the non-tree edge being checked · dashed: heavier edges on its tree path.'),
  );
  load(example);
}
