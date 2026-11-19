/**
 * Widget: all u–v paths between two chosen vertices. In a tree there is exactly one; as soon as there
 * are two different paths, the "2 paths give a cycle" construction extracts a cycle from them.
 */
import { h, setChildren } from '../core/dom.js';
import { graphEditor } from '../core/graph-editor.js';
import { edgeKey } from '../lib/graphs/graph.js';
import { allPaths, cycleEdges, cycleFromTwoPaths } from '../lib/graphs/paths.js';

const LIMIT = 40;

export default function mount(el, { example = 'walks', u = 'e', v = 'd' } = {}) {
  let ends = [u, v];
  let paths = [];
  let shown = [0, 1];
  const info = h('div', { class: 'verdict' });
  const list = h('div', { class: 'auto-list' });

  const editor = graphEditor({
    example,
    examples: ['walks', 'tree', 'cube'],
    maxVertices: 12,
    tools: [{
      value: 'pick',
      label: 'Pick u, v',
      hint: 'Click two vertices u and v. Then click paths in the list to compare two of them.',
      onVertexClick: (x) => { ends = ends.length === 1 ? [ends[0], x] : [x]; compute(); },
    }, 'edit', 'delete'],
    decorate,
    onChange: () => { ends = ends.filter((x) => editor.graph.hasVertex(x)); compute(); },
  });

  const cycle = () => (paths.length >= 2 ? cycleFromTwoPaths(paths[shown[0]], paths[shown[1]]) : null);

  function decorate() {
    const [P, Q] = shown.map((i) => paths[i]);
    const keys = [P, Q].map((p) => new Set((p ?? []).slice(1).map((x, i) => edgeKey(p[i], x))));
    const c = cycle();
    const cKeys = new Set(c ? cycleEdges(c).map(([a, b]) => edgeKey(a, b)) : []);
    return {
      vertexClass: (x) => (ends.includes(x) ? 'is-focus' : ''),
      edgeClass: (a, b) => {
        const k = edgeKey(a, b);
        const inP = keys[0].has(k); const inQ = keys[1].has(k);
        return [inP && inQ ? 'is-incident' : inP ? 'path-p' : inQ ? 'path-q' : 'is-muted', cKeys.has(k) ? 'in-cycle' : ''].join(' ');
      },
    };
  }

  function compute() {
    paths = ends.length === 2 && ends[0] !== ends[1] ? allPaths(editor.graph, ends[0], ends[1], LIMIT) : [];
    shown = [0, 1];
    render();
  }

  function render() {
    const [a, b] = ends;
    let text;
    if (ends.length < 2) text = `u = ${a ?? '?'}; now click v.`;
    else if (a === b) text = 'Choose two different vertices.';
    else if (!paths.length) text = `There is no ${a}–${b} path: the vertices lie in different components.`;
    else if (paths.length === 1) text = `Exactly one ${a}–${b} path.`;
    else {
      const c = cycle();
      text = `${paths.length}${paths.length >= LIMIT ? '+' : ''} different ${a}–${b} paths. Comparing P (blue) and Q (green): they split and rejoin, enclosing the cycle (${[...c, c[0]].join(', ')}) (thick).`;
    }
    setChildren(info, h('p', {}, text));
    setChildren(list, paths.map((p, i) => h('button', {
      type: 'button', class: `chip mono${i === shown[0] ? ' chip--p' : i === shown[1] ? ' chip--q' : ''}`,
      onclick: () => { if (i !== shown[0]) shown = [shown[0], i]; render(); },
      oncontextmenu: (e) => { e.preventDefault(); if (i !== shown[1]) shown = [i, shown[1]]; render(); },
    }, p.join('–'))));
    editor.redraw();
  }

  setChildren(el, editor.element, info, list,
    h('p', { class: 'widget__hint' }, 'Click a path in the list to make it Q (right-click: make it P).'));
  editor.start();
  compute();
}
