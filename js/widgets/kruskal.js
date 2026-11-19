/**
 * Widget: Kruskal's algorithm. Edges are considered in order of increasing weight; an edge is thrown
 * away if its endpoints are already connected in T. With `labels`, connectivity is tested with
 * component labels (lecture 6): the smaller component is relabeled whenever two components merge.
 */
import { h, setChildren, chips, button, table, stat, stats } from '../core/dom.js';
import { graphView } from '../core/graph-view.js';
import { createStepper } from '../core/stepper.js';
import { loadWeightedExample } from '../data/graphs.js';
import { edgeKey } from '../lib/graphs/graph.js';
import { kruskalSteps, sortedEdges, weightOf } from '../lib/graphs/spanning.js';

const EXAMPLE_LABELS = { walks: 'Lecture 2 graph', grid: 'Grid', k5: 'K₅', petersen: 'Petersen' };
const COLORS = 8;

export default function mount(el, { example = 'grid', labels = false } = {}) {
  let graph; let positions; let weights; let steps = []; let order = [];
  const view = graphView({ ariaLabel: 'Weighted graph', draggable: true, onDrag: () => show(stepper.index) });
  const edgeTable = h('div');
  const figures = h('div');
  const note = h('p', { class: 'verdict' });
  const labelBox = h('div');

  function load(key) {
    ({ graph, positions, weights } = loadWeightedExample(key));
    rebuild();
  }

  function randomize() {
    for (const k of weights.keys()) weights.set(k, 1 + Math.floor(Math.random() * 9));
    rebuild();
  }

  function rebuild() {
    steps = kruskalSteps(graph, weights);
    order = sortedEdges(graph, weights);
    stepper.setCount(steps.length);
  }

  function show(i) {
    const s = steps[i];
    const T = new Set(s.T.map(([a, b]) => edgeKey(a, b)));
    const current = s.edge ? edgeKey(...s.edge) : null;
    const labelIndex = new Map([...new Set(s.labels.values())].map((l, k) => [l, k]));
    const relabeled = new Set(s.relabeled);
    view.update({
      graph, positions,
      edgeLabel: (a, b) => String(weights.get(edgeKey(a, b))),
      edgeClass: (a, b) => {
        const k = edgeKey(a, b);
        if (k === current) return s.accepted ? 'is-new' : 'is-bad';
        return T.has(k) ? 'is-tree' : 'is-muted';
      },
      vertexClass: (v) => `color-${(labelIndex.get(s.labels.get(v)) % COLORS) + 1}${relabeled.has(v) ? ' is-selected' : ''}`,
    });

    setChildren(edgeTable, table(['#', 'edge', 'weight', 'decision'], order.map((e, k) => {
      const step = steps[k + 1];
      const decided = k + 1 <= i;
      return {
        className: k + 1 === i ? 'row-current' : '',
        cells: [String(k + 1), `{${e.join(', ')}}`, String(weights.get(edgeKey(...e))),
          decided ? (step.accepted ? 'add to T' : 'throw away (endpoints already connected)') : '–'],
      };
    })));

    setChildren(figures, stats(
      stat('edges in T', `${s.T.length} of ${graph.order - 1}`),
      stat('weight of T', String(weightOf(s.T, weights))),
      labels ? stat('label updates so far', String(s.relabelTotal), `n log₂ n ≈ ${Math.round(graph.order * Math.log2(graph.order))}`) : null,
    ));

    if (!s.edge) note.textContent = 'Sorted all edges by weight. T := ∅. Each vertex is its own component (its own color).';
    else if (s.accepted) {
      note.textContent = `Edge {${s.edge.join(', ')}} (weight ${s.weight}) joins two different components: add it to T.`
        + (labels ? ` Relabel the smaller component: ${s.relabeled.join(', ')} (outlined) get label ${s.labels.get(s.edge[0])}.` : '');
    } else {
      note.textContent = `Edge {${s.edge.join(', ')}} (weight ${s.weight}): ${s.edge[0]} and ${s.edge[1]} are already connected in T`
        + (labels ? ` (same label ${s.labels.get(s.edge[0])})` : '') + ' – it would close a cycle. Throw it away.';
    }
    if (i === steps.length - 1) note.textContent += ` Done: a minimum spanning tree of weight ${weightOf(s.T, weights)}.`;

    if (labels) {
      setChildren(labelBox, table(['vertex', ...graph.vertices], [['label', ...graph.vertices.map((v) => s.labels.get(v))]]));
    }
  }

  const stepper = createStepper({ onStep: show });
  setChildren(el,
    chips('Graph:', Object.entries(EXAMPLE_LABELS).map(([key, label]) => ({ key, label })), (item) => load(item.key)),
    view.element, stepper.element, figures, note, labelBox,
    h('div', { class: 'button-row' }, button('Random weights', randomize, { secondary: true })),
    h('details', { class: 'widget__details', open: true }, h('summary', {}, 'Sorted edge list'), edgeTable),
  );
  load(example);
}
