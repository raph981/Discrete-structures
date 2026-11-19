/**
 * Widget: build a bijection f: V(G) → V(H) by hand and check the isomorphism condition
 *   {u, v} ∈ E(G)  ⇔  {f(u), f(v)} ∈ E(H)
 * pair by pair. Matched vertices share a color; edges turn green or red once both ends are mapped.
 */
import { h, setChildren, chips, button, table } from '../core/dom.js';
import { graphView } from '../core/graph-view.js';
import { ISOMORPHISM_PAIRS, fromSpec } from '../data/graphs.js';
import { degreeSequence } from '../lib/graphs/degrees.js';
import { checkMapping, findIsomorphism } from '../lib/graphs/isomorphism.js';

const COLORS = 8;

export default function mount(el, { pair = 'pentagram' } = {}) {
  let G; let H; let posG; let posH;
  let f = new Map(); // u ∈ V(G) → f(u) ∈ V(H)
  let selected = null; // vertex of G waiting for its image
  let searchNote = '';

  const viewG = graphView({ ariaLabel: 'Graph G', radius: 20, onVertexClick: pickG, onBackgroundClick: () => { selected = null; render(); } });
  const viewH = graphView({ ariaLabel: 'Graph H', radius: 20, onVertexClick: pickH });
  const status = h('div', { class: 'verdict' });
  const details = h('div');
  const mapping = h('p', { class: 'mapping mono' });

  function load(key) {
    ({ graph: G, positions: posG } = fromSpec(ISOMORPHISM_PAIRS[key].G));
    ({ graph: H, positions: posH } = fromSpec(ISOMORPHISM_PAIRS[key].H));
    f = new Map();
    selected = null;
    searchNote = '';
    render();
  }

  function pickG(u) {
    selected = u;
    searchNote = '';
    render();
  }

  function pickH(x) {
    if (!selected) return;
    for (const [u, image] of f) if (image === x) f.delete(u); // keep f injective
    f.set(selected, x);
    const next = G.vertices.find((v) => !f.has(v));
    selected = next ?? null;
    render();
  }

  function autoFind() {
    const iso = findIsomorphism(G, H);
    if (iso) {
      f = iso;
      searchNote = 'Found by a computer search (backtracking).';
    } else {
      f = new Map();
      const sg = degreeSequence(G).join(',');
      const sh = degreeSequence(H).join(',');
      searchNote = sg !== sh
        ? 'No isomorphism exists: the degree sequences differ.'
        : 'No isomorphism exists: every bijection was checked (the degree sequences agree, but the structure does not).';
    }
    selected = null;
    render();
  }

  const colorOf = (u) => `color-${(G.vertices.indexOf(u) % COLORS) + 1}`;

  function render() {
    const inverse = new Map([...f].map(([u, x]) => [x, u]));
    const check = checkMapping(G, H, f);

    viewG.update({
      graph: G,
      positions: posG,
      vertexClass: (u) => `${f.has(u) ? colorOf(u) : ''}${u === selected ? ' is-selected' : ''}`,
      edgeClass: (u, v) => (f.has(u) && f.has(v) ? (H.hasEdge(f.get(u), f.get(v)) ? 'is-good' : 'is-bad') : ''),
    });
    viewH.update({
      graph: H,
      positions: posH,
      vertexClass: (x) => (inverse.has(x) ? colorOf(inverse.get(x)) : ''),
      edgeClass: (x, y) => (inverse.has(x) && inverse.has(y) ? (G.hasEdge(inverse.get(x), inverse.get(y)) ? 'is-good' : 'is-bad') : ''),
      vertexLabel: (x) => x,
    });

    mapping.textContent = G.vertices.map((u) => `f(${u}) = ${f.get(u) ?? '?'}`).join('   ');

    const bad = check.pairs.filter((p) => !p.ok);
    let verdict;
    if (G.order !== H.order) verdict = h('span', { class: 'bad' }, `No bijection possible: |V(G)| = ${G.order} ≠ ${H.order} = |V(H)|.`);
    else if (check.isIsomorphism) verdict = h('span', { class: 'good' }, '✓ f is an isomorphism: every edge goes to an edge and every non-edge to a non-edge.');
    else if (bad.length) verdict = h('span', { class: 'bad' }, `✗ ${bad.length} pair${bad.length > 1 ? 's' : ''} violate${bad.length > 1 ? '' : 's'} the condition (red edges).`);
    else if (selected) verdict = `Now click the image f(${selected}) in H.`;
    else verdict = 'Click a vertex in G, then its image in H.';

    setChildren(status, h('p', {}, verdict), searchNote ? h('p', { class: 'widget__hint' }, searchNote) : null);

    setChildren(details, check.pairs.length
      ? h('details', { class: 'widget__details' },
        h('summary', {}, 'Check every pair'),
        table(['pair {u, v} in G', 'edge in G?', 'pair {f(u), f(v)} in H', 'edge in H?', ''],
          check.pairs.map((p) => ({
            className: p.ok ? '' : 'row-bad',
            cells: [`{${p.u}, ${p.v}}`, p.inG ? 'yes' : 'no', `{${f.get(p.u)}, ${f.get(p.v)}}`, p.inH ? 'yes' : 'no', p.ok ? '✓' : '✗'],
          }))))
      : null);
  }

  const legend = (name) => h('figcaption', { class: 'graph-caption' }, name);

  viewG.element.classList.add('graph--large');
  viewH.element.classList.add('graph--large');

  setChildren(el,
    chips('Pairs:', Object.entries(ISOMORPHISM_PAIRS).map(([key, p]) => ({ key, label: p.label })), (item) => load(item.key)),
    h('div', { class: 'widget-columns' },
      h('figure', { class: 'graph-figure' }, legend('G'), viewG.element),
      h('figure', { class: 'graph-figure' }, legend('H'), viewH.element),
    ),
    mapping,
    h('div', { class: 'button-row' },
      button('Find an isomorphism', autoFind),
      button('Clear f', () => { f = new Map(); selected = null; searchNote = ''; render(); }, { secondary: true }),
    ),
    status,
    details,
  );
  load(pair);
}
