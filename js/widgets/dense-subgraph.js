/**
 * Widget: the proof of "subgraph with large degrees" as an algorithm.
 * While δ(H) ≤ ε(H), delete a vertex of minimum degree; the table shows that ε never decreases.
 */
import { h, setChildren, button, table, fmtFraction } from '../core/dom.js';
import { graphEditor } from '../core/graph-editor.js';
import { denseSubgraphSteps } from '../lib/graphs/dense-subgraph.js';

export default function mount(el, { example = 'coreWithTail' } = {}) {
  let steps = [];
  let shown = 0;

  const status = h('p', { class: 'verdict' });
  const log = h('div');
  const back = button('← Back', () => go(shown - 1), { secondary: true });
  const next = button('Delete next vertex →', () => go(shown + 1));
  const end = button('Run to the end', () => go(steps.length - 1), { secondary: true });

  const editor = graphEditor({
    example,
    examples: ['coreWithTail', 'lecture', 'petersen', 'path4'],
    maxVertices: 14,
    decorate,
    onChange: rebuild,
  });

  function decorate() {
    if (!steps.length) return {};
    const step = steps[shown];
    const H = step.graph;
    return {
      vertexClass: (v) => (!H.hasVertex(v) ? 'is-removed' : v === step.removed ? 'is-next' : step.removed === null ? 'is-result' : ''),
      edgeClass: (u, v) => (!H.hasEdge(u, v) ? 'is-removed' : step.removed === null ? 'is-result' : ''),
    };
  }

  function rebuild(G) {
    steps = G.size >= 1 ? denseSubgraphSteps(G) : [];
    shown = 0;
    go(0);
  }

  function go(index) {
    if (!steps.length) {
      status.textContent = 'The lemma needs at least one edge: e(G) ≥ 1.';
      setChildren(log);
      [back, next, end].forEach((b) => { b.disabled = true; });
      editor.redraw();
      return;
    }
    shown = Math.max(0, Math.min(index, steps.length - 1));
    const step = steps[shown];
    const s = step.stats;
    const epsG = fmtFraction(steps[0].stats.size, steps[0].stats.order);
    back.disabled = shown === 0;
    next.disabled = end.disabled = step.removed === null;

    status.textContent = step.removed !== null
      ? `δ(H) = ${s.min} ≤ ε(H) = ${fmtFraction(s.size, s.order)}. Vertex ${step.removed} has minimum degree ${s.min} ≤ ε(H), so by the Claim deleting it does not decrease ε.`
      : `Done: δ(H) = ${s.min} > ε(H) = ${fmtFraction(s.size, s.order)} ≥ ε(G) = ${epsG}. The green subgraph H is the one promised by the lemma.`;

    setChildren(log, table(
      ['step', 'v(H)', 'e(H)', 'δ(H)', 'ε(H) = e/v', 'δ(H) > ε(H)?', 'action'],
      steps.slice(0, shown + 1).map((st, i) => ({
        className: i === shown ? 'row-current' : '',
        cells: [
          String(i), String(st.stats.order), String(st.stats.size), String(st.stats.min),
          fmtFraction(st.stats.size, st.stats.order),
          st.removed === null ? 'yes ✓' : 'no',
          st.removed === null ? 'stop: H found' : `delete ${st.removed} (degree ${st.stats.min})`,
        ],
      })),
    ));
    editor.redraw();
  }

  setChildren(el, editor.element, h('div', { class: 'button-row' }, back, next, end), status, log);
  editor.start();
}
