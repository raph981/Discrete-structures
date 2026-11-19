/**
 * Widget: the Regularizing Lemma, step by step.
 * Left: edit the starting graph G. Right: the graph after k doubling steps.
 * Each copy is drawn as a mirror image of the previous graph, so the new edges between a vertex
 * and its copy are straight lines across the mirror axis.
 */
import { h, setChildren, slider, stat, stats } from '../core/dom.js';
import { graphEditor } from '../core/graph-editor.js';
import { graphView } from '../core/graph-view.js';
import { edgeKey } from '../lib/graphs/graph.js';
import { originOf, regularizationSteps } from '../lib/graphs/regularize.js';

const W = 600;
const H = 360;
const MARGIN = 18;
const GAP = 70;
const MAX_VERTICES = 96;
const COLORS = 8;

/** Index of the copy a vertex belongs to (0 … 2^k − 1), read off its name ("u^1^2" → 0b11). */
const copyIndex = (v) => v.split('^').slice(1).reduce((s, step) => s + 2 ** (Number(step) - 1), 0);

/** Positions for every step: copy j mirrors the previous picture horizontally (odd j) or vertically (even j). */
function mirroredPositions(steps, base) {
  const all = [{ ...base }];
  let positions = { ...base };
  steps.slice(1).forEach((step, i) => {
    const horizontal = i % 2 === 0;
    const coords = Object.values(positions).map((p) => (horizontal ? p.x : p.y));
    const axis = Math.max(...coords) + GAP / 2;
    const next = { ...positions };
    for (const [v, c] of step.copy) {
      const p = positions[v];
      next[c] = horizontal ? { x: 2 * axis - p.x, y: p.y } : { x: p.x, y: 2 * axis - p.y };
    }
    positions = next;
    all.push(positions);
  });
  return all;
}

/** Scales positions uniformly to fit into the drawing area. */
function fit(positions) {
  const pts = Object.values(positions);
  const xs = pts.map((p) => p.x); const ys = pts.map((p) => p.y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const scale = Math.min((W - 2 * MARGIN) / Math.max(1, x1 - x0), (H - 2 * MARGIN) / Math.max(1, y1 - y0), 1);
  const dx = (W - (x1 - x0) * scale) / 2; const dy = (H - (y1 - y0) * scale) / 2;
  return Object.fromEntries(Object.entries(positions).map(([v, p]) => [v, { x: dx + (p.x - x0) * scale, y: dy + (p.y - y0) * scale }]));
}

export default function mount(el, { example = 'lecture' } = {}) {
  let steps = [];
  let layouts = [];
  let shown = 0;

  const resultView = graphView({ ariaLabel: 'Graph after the construction steps', radius: 9, draggable: false });
  resultView.element.classList.add('graph--compact');
  const stepControl = h('div');
  const figures = h('div');
  const explanation = h('p', { class: 'verdict' });

  const editor = graphEditor({
    example,
    examples: ['lecture', 'path4', 'star'],
    maxVertices: 7,
    onChange: rebuild,
    view: { onDrag: () => rebuild(editor.graph, { keepStep: true }) },
  });

  function rebuild(G, { keepStep = false } = {}) {
    steps = G.order ? regularizationSteps(G) : [];
    // Stop drawing once the graph gets too large for a readable picture.
    while (steps.length > 1 && steps.at(-1).graph.order > MAX_VERTICES) steps.pop();
    layouts = steps.length ? mirroredPositions(steps, editor.positions) : [];
    shown = keepStep ? Math.min(shown, Math.max(0, steps.length - 1)) : Math.max(0, steps.length - 1);
    setChildren(stepControl, steps.length > 1
      ? slider({ label: 'Show step', min: 0, max: steps.length - 1, value: shown, format: (k) => `${k} of ${steps.length - 1}`, onInput: (k) => { shown = k; draw(); } }).element
      : null);
    draw();
  }

  function draw() {
    const G = editor.graph;
    if (!steps.length) {
      resultView.update({ graph: G, positions: {} });
      setChildren(figures);
      explanation.textContent = 'Add some vertices to the starting graph.';
      return;
    }
    const step = steps[shown];
    const fresh = new Set(step.newEdges.map(([u, v]) => edgeKey(u, v)));
    const { min, max } = step.stats;
    resultView.update({
      graph: step.graph,
      positions: fit(layouts[shown]),
      vertexLabel: originOf,
      vertexClass: (v) => `color-${(copyIndex(v) % COLORS) + 1}${step.graph.degree(v) === min && min < max ? ' is-min' : ''}`,
      edgeClass: (u, v) => (fresh.has(edgeKey(u, v)) ? 'is-new' : ''),
    });
    const target = steps[0].stats.max;
    setChildren(figures, stats(
      stat('vertices', String(step.stats.order), `= 2^${shown} · ${steps[0].stats.order}`),
      stat('edges', String(step.stats.size)),
      stat('δ', String(min), shown ? `was ${steps[shown - 1].stats.min}` : 'of G'),
      stat('Δ', String(max), 'never changes'),
    ));
    const truncated = steps.at(-1).stats.min !== steps.at(-1).stats.max;
    if (shown === 0) {
      explanation.textContent = min === max
        ? `G is already ${max}-regular, so H = G.`
        : `δ(G) = ${min} < Δ(G) = ${max}: we need k = Δ(G) − δ(G) = ${max - min} doubling step${max - min > 1 ? 's' : ''}.`;
    } else {
      explanation.textContent = `Step ${shown}: two copies of the previous graph; each of its ${step.newEdges.length} vertices of degree ${steps[shown - 1].stats.min} is joined to its copy (red). `
        + (min === max ? `Now every degree is ${target}: H is Δ(G)-regular and contains G as an induced subgraph.` : `δ grew by one to ${min}.`);
    }
    if (truncated && shown === steps.length - 1) {
      explanation.textContent += ` (Further steps would exceed ${MAX_VERTICES} vertices and are not drawn.)`;
    }
  }

  setChildren(el,
    h('div', { class: 'widget-columns' },
      h('figure', { class: 'graph-figure' }, h('figcaption', { class: 'graph-caption' }, 'Starting graph G (editable)'), editor.element),
      h('figure', { class: 'graph-figure' }, h('figcaption', { class: 'graph-caption' }, 'After the construction'), resultView.element, stepControl),
    ),
    figures,
    explanation,
  );
  editor.start();
}
