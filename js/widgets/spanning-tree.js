/**
 * Widget: the spanning tree algorithm, step by step.
 *   R = reached vertices, Q = reached vertices whose edges are not fully explored, T = tree edges.
 * The choice of v ∈ Q can follow BFS (Q is a queue: oldest first) or DFS (Q is a stack: newest first).
 */
import { h, setChildren, segmented, controls, stat, stats } from '../core/dom.js';
import { graphEditor } from '../core/graph-editor.js';
import { createStepper } from '../core/stepper.js';
import { edgeKey } from '../lib/graphs/graph.js';
import { isConnected } from '../lib/graphs/paths.js';
import { spanningTreeSteps } from '../lib/graphs/spanning.js';

export default function mount(el, { example = 'numbered', strategy = 'bfs', chooseStrategy = true, start } = {}) {
  let mode = strategy;
  let source = start;
  let steps = [];
  let current = null;
  const sets = h('div', { class: 'algo-state mono' });
  const figures = h('div');
  const note = h('p', { class: 'verdict' });

  const editor = graphEditor({
    example,
    examples: ['numbered', 'grid', 'petersen', 'tree'],
    maxVertices: 14,
    tools: [{
      value: 'start', label: 'Start vertex', hint: 'Click a vertex to start the algorithm there.',
      onVertexClick: (v) => { source = v; rebuild(); },
    }, 'edit', 'delete'],
    decorate,
    onChange: () => rebuild(),
  });

  function decorate() {
    if (!current) return {};
    const R = new Set(current.R); const Q = new Set(current.Q);
    const T = new Set(current.T.map(([a, b]) => edgeKey(a, b)));
    return {
      vertexClass: (v) => [v === current.v ? 'is-focus' : Q.has(v) ? 'in-queue' : R.has(v) ? 'is-reached' : 'is-muted', v === current.w ? 'is-new-vertex' : ''].join(' '),
      edgeClass: (a, b) => {
        const k = edgeKey(a, b);
        if (current.w && k === edgeKey(current.v, current.w)) return 'is-new';
        return T.has(k) ? 'is-tree' : 'is-muted';
      },
    };
  }

  function rebuild() {
    const G = editor.graph;
    if (!G.hasVertex(source)) source = G.vertices[0];
    if (!source) { steps = []; current = null; note.textContent = 'Add some vertices.'; editor.redraw(); return; }
    steps = spanningTreeSteps(G, source, mode);
    stepper.setCount(steps.length);
  }

  function show(i) {
    current = steps[i];
    if (!current) return;
    const G = editor.graph;
    const Qname = mode === 'dfs' ? 'Q (stack, top = right)' : 'Q (queue, front = left)';
    setChildren(sets,
      h('div', {}, h('strong', {}, 'R = '), `{${current.R.join(', ')}}`),
      h('div', {}, h('strong', {}, `${Qname} = `), `[${current.Q.join(', ')}]`),
      h('div', {}, h('strong', {}, 'T = '), `{${current.T.map(([a, b]) => `${a}${b}`).join(', ')}}`),
    );
    setChildren(figures, stats(
      stat('|R|', `${current.R.length} of ${G.order}`),
      stat('|T|', String(current.T.length), '= |R| − 1 always'),
      stat('pairs (v, w) tested', String(current.tested), `≤ 2·e(G) = ${2 * G.size}`),
    ));
    const last = i === steps.length - 1;
    if (current.action === 'start') note.textContent = `Step 1: R := {${source}}, Q := {${source}}, T := ∅.`;
    else if (current.action === 'add') note.textContent = `Step 2 chooses v = ${current.v}. Step 3: ${current.w} ∈ N(${current.v}) \\ R, so add ${current.w} to R and Q, and the edge ${current.v}${current.w} to T.`;
    else note.textContent = `Step 2 chooses v = ${current.v}. Step 3: every neighbor of ${current.v} is already reached, so remove ${current.v} from Q.`;
    if (last) {
      note.textContent += isConnected(G)
        ? ` Q = ∅: stop. T is a spanning tree with ${current.T.length} = v(G) − 1 edges.`
        : ` Q = ∅: stop. G is not connected, so T only spans the component of ${source}.`;
    }
    editor.redraw();
  }

  const stepper = createStepper({ onStep: show });
  setChildren(el,
    chooseStrategy ? controls(segmented({
      label: 'How Step 2 chooses v ∈ Q',
      options: [{ value: 'bfs', label: 'BFS: oldest (queue)' }, { value: 'dfs', label: 'DFS: newest (stack)' }],
      value: mode, onChange: (v) => { mode = v; rebuild(); },
    })) : null,
    editor.element, stepper.element, sets, figures, note,
    h('p', { class: 'widget__hint' }, 'Filled: current v · orange ring: in Q · blue: reached and finished · thick green: tree edges T.'),
  );
  editor.start();
}
