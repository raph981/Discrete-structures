/**
 * Interactive graph editor built on core/graph-view.js.
 *
 * Built-in tools
 *   edit    click empty space → new vertex; click two vertices → add/remove the edge; drag → move
 *   delete  click a vertex or an edge → remove it
 * Widgets can add their own tools (e.g. "inspect") with custom click handlers and
 * decorate the drawing via `decorate()`, which is called on every redraw.
 *
 * The editor owns the graph object; widgets read it through `editor.graph` and are
 * notified of structural changes through `onChange`.
 */
import { h, segmented, chips } from './dom.js';
import { graphView } from './graph-view.js';
import { EXAMPLES, loadExample } from '../data/graphs.js';

const BUILT_IN_TOOLS = {
  edit: {
    label: 'Edit',
    hint: 'Click empty space to add a vertex · click two vertices to add or remove an edge · drag to move.',
  },
  delete: {
    label: 'Delete',
    hint: 'Click a vertex or an edge to delete it.',
  },
};

/** Next unused vertex name: a, b, …, z, then v27, v28, … */
function nextVertexName(graph) {
  for (let i = 0; i < 26; i++) {
    const name = String.fromCharCode(97 + i);
    if (!graph.hasVertex(name)) return name;
  }
  for (let i = 27; ; i++) if (!graph.hasVertex(`v${i}`)) return `v${i}`;
}

/**
 * @param {{
 *   example?: string,                         key of EXAMPLES to start with
 *   examples?: string[],                      keys offered as chips (empty → no chips)
 *   tools?: (string | {value: string, label: string, hint?: string,
 *            onVertexClick?: (v: string) => void, onEdgeClick?: (u: string, v: string) => void})[],
 *   tool?: string,                            initially active tool
 *   maxVertices?: number,
 *   decorate?: () => object,                  extra view state (vertexClass, edgeClass, …)
 *   onChange?: (graph) => void,               called after every structural change (and on load)
 *   view?: object,                            options passed to graphView
 * }} options
 */
export function graphEditor({
  example = 'lecture', examples = [], tools = ['edit', 'delete'], tool, maxVertices = 16,
  decorate = () => ({}), onChange = () => {}, view: viewOptions = {},
} = {}) {
  const toolList = tools.map((t) => (typeof t === 'string' ? { value: t, ...BUILT_IN_TOOLS[t] } : t));
  let activeTool = tool ?? toolList[0].value;
  let { graph, positions } = loadExample(example);
  let selected = null;

  const hint = h('p', { class: 'widget__hint graph-editor__hint' });
  const message = h('p', { class: 'graph-editor__message', role: 'status' });

  const view = graphView({
    ...viewOptions,
    onVertexClick: (v) => handle('vertex', v),
    onEdgeClick: (u, v) => handle('edge', u, v),
    onBackgroundClick: (p) => handle('background', p),
  });

  function say(text) {
    message.textContent = text ?? '';
  }

  function changed() {
    onChange(graph);
    redraw();
  }

  function handle(kind, a, b) {
    say('');
    const current = toolList.find((t) => t.value === activeTool);
    if (activeTool === 'edit') return handleEdit(kind, a, b);
    if (activeTool === 'delete') return handleDelete(kind, a, b);
    if (kind === 'vertex') current.onVertexClick?.(a);
    else if (kind === 'edge') current.onEdgeClick?.(a, b);
    else current.onBackgroundClick?.(a);
    redraw();
  }

  function handleEdit(kind, a, b) {
    if (kind === 'background') {
      if (selected) { selected = null; return redraw(); }
      if (graph.order >= maxVertices) return say(`At most ${maxVertices} vertices in this figure.`);
      const name = nextVertexName(graph);
      graph.addVertex(name);
      positions[name] = a;
      return changed();
    }
    if (kind === 'edge') {
      graph.removeEdge(a, b);
      return changed();
    }
    if (selected === null) { selected = a; return redraw(); }
    if (selected === a) {
      selected = null;
      say('Loops are not allowed: an edge always joins two distinct vertices.');
      return redraw();
    }
    graph.toggleEdge(selected, a);
    selected = null;
    return changed();
  }

  function handleDelete(kind, a, b) {
    if (kind === 'vertex') {
      graph.removeVertex(a);
      delete positions[a];
      changed();
    } else if (kind === 'edge') {
      graph.removeEdge(a, b);
      changed();
    }
  }

  function redraw() {
    const extra = decorate();
    const baseVertexClass = extra.vertexClass ?? (() => '');
    view.update({
      graph,
      positions,
      ...extra,
      vertexClass: (v) => `${baseVertexClass(v)}${v === selected ? ' is-selected' : ''}`,
    });
  }

  function setTool(value) {
    activeTool = value;
    selected = null;
    hint.textContent = toolList.find((t) => t.value === value)?.hint ?? '';
    redraw();
  }

  /** Replaces the graph (e.g. when an example is chosen). */
  function load(next) {
    graph = next.graph;
    positions = next.positions;
    selected = null;
    say('');
    changed();
  }

  const toolbar = h('div', { class: 'graph-editor__toolbar' },
    toolList.length > 1
      ? segmented({ label: 'Tool', options: toolList.map((t) => ({ value: t.value, label: t.label })), value: activeTool, onChange: setTool }).element
      : null,
    examples.length
      ? chips('Examples:', examples.map((key) => ({ key, label: EXAMPLES[key].label })), (item) => load(loadExample(item.key)))
      : null,
  );

  const element = h('div', { class: 'graph-editor' }, toolbar, view.element, hint, message);
  hint.textContent = toolList.find((t) => t.value === activeTool)?.hint ?? '';

  return {
    element,
    view,
    get graph() { return graph; },
    get positions() { return positions; },
    get tool() { return activeTool; },
    /** Redraws, e.g. after the widget's decoration state changed. */
    redraw,
    load,
    say,
    /** Call once after the widget has wired everything up. */
    start() { changed(); },
  };
}
