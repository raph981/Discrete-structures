/**
 * Widget: bipartite or not? Vertices are colored by the parity of their BFS distance from a root.
 * If no edge joins two vertices of the same color, the colors are the partite sets A and B; otherwise
 * the widget highlights the odd cycle constructed in the proof.
 */
import { h, setChildren } from '../core/dom.js';
import { graphEditor } from '../core/graph-editor.js';
import { edgeKey } from '../lib/graphs/graph.js';
import { cycleEdges } from '../lib/graphs/paths.js';
import { bipartition } from '../lib/graphs/bipartite.js';

export default function mount(el, { example = 'cube' } = {}) {
  let result = null;
  const status = h('div', { class: 'verdict' });

  const editor = graphEditor({
    example,
    examples: ['cube', 'grid', 'c5', 'petersen', 'k33', 'tree'],
    decorate: () => {
      if (!result) return {};
      const cyc = new Set(result.oddCycle ? cycleEdges(result.oddCycle).map(([a, b]) => edgeKey(a, b)) : []);
      const conflict = result.conflict ? edgeKey(...result.conflict) : null;
      return {
        vertexClass: (v) => (result.layers.get(v) % 2 === 0 ? 'side-a' : 'side-b'),
        edgeClass: (a, b) => {
          const k = edgeKey(a, b);
          if (k === conflict) return 'is-bad';
          return cyc.has(k) ? 'in-cycle' : '';
        },
      };
    },
    onChange: (G) => {
      result = bipartition(G);
      const { bipartite, A, B, oddCycle, conflict, layers } = result;
      setChildren(status, bipartite
        ? [h('p', {}, h('span', { class: 'good' }, '✓ Bipartite. '), 'Partite sets (by even/odd distance from the root of each component):'),
          h('p', { class: 'mono' }, `A = {${A.join(', ')}}   B = {${B.join(', ')}}`)]
        : [h('p', {}, h('span', { class: 'bad' }, '✗ Not bipartite. '),
          `The edge {${conflict.join(', ')}} (red, dashed) joins two vertices in the same layer N${layers.get(conflict[0])}. `,
          `Following both shortest paths back to where they meet gives an odd cycle of length ${oddCycle.length}: (${[...oddCycle, oddCycle[0]].join(', ')}).`)]);
    },
  });

  setChildren(el, editor.element, status,
    h('p', { class: 'widget__hint' }, 'Blue vertices: even distance (A) · orange vertices: odd distance (B).'));
  editor.start();
}
