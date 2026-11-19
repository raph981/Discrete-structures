/**
 * SVG drawing of a graph with optional dragging and click handling.
 *
 * The view never changes the graph itself. It only reads `graph` and `positions`
 * and reports interactions through callbacks; dragging moves entries of the
 * `positions` object it was given (the caller owns that object).
 *
 * Styling hooks (see css/main.css, section "Graphs"):
 *   vertexClass(v) / edgeClass(u, v) return extra CSS classes such as
 *   "is-focus", "is-neighbor", "is-muted", "is-good", "is-bad", "color-1" … "color-8".
 */
const SVG_NS = 'http://www.w3.org/2000/svg';
const DRAG_THRESHOLD = 4; // screen pixels before a press counts as a drag

function svg(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) el.setAttribute(k, v);
  return el;
}

/**
 * @typedef {Object} GraphViewState
 * @property {import('../lib/graphs/graph.js').Graph} graph
 * @property {Record<string, {x: number, y: number}>} positions
 * @property {(v: string) => string} [vertexClass]
 * @property {(u: string, v: string) => string} [edgeClass]
 * @property {(v: string) => string} [vertexLabel]   text inside the vertex (default: its id)
 * @property {(u: string, v: string) => string} [edgeLabel]
 * @property {[string, string][]} [ghostEdges]       dashed edges that are not part of the graph (e.g. "missing" edges)
 */

/**
 * @param {{width?: number, height?: number, ariaLabel?: string, radius?: number, draggable?: boolean,
 *          onVertexClick?: (v: string) => void, onEdgeClick?: (u: string, v: string) => void,
 *          onBackgroundClick?: (p: {x: number, y: number}) => void, onDrag?: () => void}} options
 */
export function graphView({
  width = 600, height = 360, ariaLabel = 'Graph', radius = 15, draggable = true,
  onVertexClick, onEdgeClick, onBackgroundClick, onDrag,
} = {}) {
  const element = svg('svg', { viewBox: `0 0 ${width} ${height}`, class: 'graph', role: 'img', 'aria-label': ariaLabel });
  const edgeLayer = svg('g', { class: 'graph__edges' });
  const vertexLayer = svg('g', { class: 'graph__vertices' });
  element.append(edgeLayer, vertexLayer);

  /** @type {GraphViewState} */
  let state = { graph: null, positions: {} };
  let press = null; // { kind: 'vertex'|'edge'|'background', id?, u?, v?, startX, startY, dragging }

  const pos = (v) => state.positions[v] ?? { x: width / 2, y: height / 2 };

  function draw() {
    const { graph, vertexClass, edgeClass, vertexLabel = (v) => v, edgeLabel, ghostEdges = [] } = state;
    edgeLayer.replaceChildren();
    vertexLayer.replaceChildren();
    if (!graph) return;

    for (const [u, v] of ghostEdges) {
      const a = pos(u); const b = pos(v);
      edgeLayer.append(svg('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: 'graph__edge graph__edge--ghost' }));
    }
    for (const [u, v] of graph.edges) {
      const a = pos(u); const b = pos(v);
      const group = svg('g', { 'data-u': u, 'data-v': v });
      group.append(
        svg('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: `graph__edge ${edgeClass?.(u, v) ?? ''}` }),
        svg('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, class: 'graph__edge-hit' }),
      );
      const label = edgeLabel?.(u, v);
      if (label) {
        const text = svg('text', { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 8, class: 'graph__edge-label' });
        text.textContent = label;
        group.append(text);
      }
      edgeLayer.append(group);
    }
    for (const v of graph.vertices) {
      const p = pos(v);
      const group = svg('g', { class: `graph__vertex ${vertexClass?.(v) ?? ''}`, 'data-vertex': v, transform: `translate(${p.x} ${p.y})` });
      const title = svg('title');
      title.textContent = `${v}: degree ${graph.degree(v)}`;
      const text = svg('text');
      text.textContent = vertexLabel(v);
      group.append(title, svg('circle', { r: radius }), text);
      vertexLayer.append(group);
    }
  }

  /** Converts a pointer event to drawing coordinates. */
  function toLocal(event) {
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(element.getScreenCTM().inverse());
    return {
      x: Math.min(width - radius, Math.max(radius, point.x)),
      y: Math.min(height - radius, Math.max(radius, point.y)),
    };
  }

  element.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    const vertexEl = event.target.closest('[data-vertex]');
    const edgeEl = event.target.closest('[data-u]');
    press = { startX: event.clientX, startY: event.clientY, dragging: false };
    if (vertexEl) Object.assign(press, { kind: 'vertex', id: vertexEl.dataset.vertex });
    else if (edgeEl) Object.assign(press, { kind: 'edge', u: edgeEl.dataset.u, v: edgeEl.dataset.v });
    else press.kind = 'background';
    element.setPointerCapture(event.pointerId);
  });

  element.addEventListener('pointermove', (event) => {
    if (!press || press.kind !== 'vertex' || !draggable) return;
    if (!press.dragging && Math.hypot(event.clientX - press.startX, event.clientY - press.startY) < DRAG_THRESHOLD) return;
    press.dragging = true;
    state.positions[press.id] = toLocal(event);
    draw();
    onDrag?.();
  });

  element.addEventListener('pointerup', (event) => {
    if (!press) return;
    const { kind, dragging } = press;
    const current = press;
    press = null;
    if (dragging) return;
    if (kind === 'vertex') onVertexClick?.(current.id);
    else if (kind === 'edge') onEdgeClick?.(current.u, current.v);
    else onBackgroundClick?.(toLocal(event));
  });

  element.addEventListener('pointercancel', () => { press = null; });

  return {
    element,
    /** Merges `next` into the current state and redraws. */
    update(next) {
      state = { ...state, ...next };
      draw();
    },
    get state() { return state; },
  };
}
