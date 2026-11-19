/**
 * Widget: connected components as equivalence classes of "u is connected to v".
 * Every component gets its own color; adding or deleting an edge merges or splits components.
 */
import { h, setChildren } from '../core/dom.js';
import { graphEditor } from '../core/graph-editor.js';
import { components } from '../lib/graphs/paths.js';

const COLORS = 8;

export default function mount(el, { example = 'components' } = {}) {
  let comps = [];
  const info = h('div', { class: 'verdict' });

  const editor = graphEditor({
    example,
    examples: ['components', 'walks', 'forest', 'empty'],
    maxVertices: 18,
    decorate: () => {
      const index = new Map();
      comps.forEach((c, i) => c.forEach((v) => index.set(v, i)));
      return { vertexClass: (v) => `color-${(index.get(v) % COLORS) + 1}` };
    },
    onChange: (G) => {
      comps = components(G);
      setChildren(info,
        h('p', {}, h('strong', {}, `${comps.length} component${comps.length === 1 ? '' : 's'}: `),
          comps.map((c, i) => h('span', { class: `comp-chip color-${(i % COLORS) + 1}` }, `{${c.join(', ')}}`))),
        h('p', {}, comps.length <= 1
          ? h('span', { class: 'good' }, '✓ G is connected: it consists of a single component.')
          : `G is not connected. Vertices in different components have no path between them.`),
      );
    },
  });

  setChildren(el, editor.element, info);
  editor.start();
}
