/**
 * Widget: separators and k-connectivity. Shows κ(G), a smallest separator and the components left after
 * deleting it, and compares κ(G) with δ(G) (Fact: k-connected ⇒ δ(G) ≥ k). Clicking vertices in
 * "Separate" mode deletes a chosen set X to test whether it is a separator.
 */
import { h, setChildren, stat, stats, button } from '../core/dom.js';
import { graphEditor } from '../core/graph-editor.js';
import { degreeStats } from '../lib/graphs/degrees.js';
import { components } from '../lib/graphs/paths.js';
import { connectivity, removeVertices } from '../lib/graphs/connectivity.js';

const COLORS = 8;

export default function mount(el, { example = 'bowtie' } = {}) {
  let X = new Set();
  const figures = h('div');
  const status = h('div', { class: 'verdict' });

  const editor = graphEditor({
    example,
    examples: ['bowtie', 'c6', 'petersen', 'cube', 'k5', 'tree'],
    maxVertices: 11,
    tools: [{
      value: 'separate', label: 'Choose X', hint: 'Click vertices to put them into X (or take them out).',
      onVertexClick: (v) => { if (X.has(v)) X.delete(v); else X.add(v); describe(); },
    }, 'edit', 'delete'],
    decorate,
    onChange: () => { X = new Set(); describe(); },
  });

  function decorate() {
    const rest = removeVertices(editor.graph, X);
    const index = new Map();
    components(rest).forEach((c, i) => c.forEach((v) => index.set(v, i)));
    return {
      vertexClass: (v) => (X.has(v) ? 'is-removed-x' : `color-${(index.get(v) % COLORS) + 1}`),
      edgeClass: (a, b) => (X.has(a) || X.has(b) ? 'is-removed' : ''),
    };
  }

  function describe() {
    const G = editor.graph;
    const { kappa, separator } = connectivity(G);
    const { min } = degreeStats(G);
    setChildren(figures, stats(
      stat('connectivity κ(G)', String(kappa), separator ? `smallest separator: {${separator.join(', ')}}` : 'no separator: complete graph'),
      stat('minimum degree δ(G)', String(min ?? '–'), 'always κ(G) ≤ δ(G)'),
      stat('G is k-connected for', kappa ? `k ≤ ${kappa}` : 'no k ≥ 1'),
    ));
    const rest = removeVertices(G, X);
    const comps = components(rest);
    setChildren(status, h('p', {}, X.size === 0
      ? 'X = ∅. Choose vertices for X, or show a smallest separator.'
      : comps.length >= 2
        ? h('span', { class: 'good' }, `✓ X = {${[...X].join(', ')}} is a separator: G \\ X has ${comps.length} components (colors).`)
        : h('span', {}, `X = {${[...X].join(', ')}} is not a separator: G \\ X is still connected.`)));
    editor.redraw();
  }

  setChildren(el, editor.element,
    h('div', { class: 'button-row' },
      button('Show a smallest separator', () => { X = new Set(connectivity(editor.graph).separator ?? []); describe(); }),
      button('Clear X', () => { X = new Set(); describe(); }, { secondary: true })),
    figures, status);
  editor.start();
}
