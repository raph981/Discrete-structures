/**
 * Widget: Moore's number n₀(δ, g) for chosen δ and g, compared with 2^{g/2} and with known graphs.
 */
import { h, setChildren, slider, controls, table, fmt } from '../core/dom.js';
import { renderMath } from '../core/math.js';
import { loadExample } from '../data/graphs.js';
import { degreeStats } from '../lib/graphs/degrees.js';
import { girth } from '../lib/graphs/paths.js';
import { mooreBound } from '../lib/graphs/moore.js';

const KNOWN = ['k4', 'k33', 'cube', 'petersen', 'heawood'];

export default function mount(el, { delta = 3, g = 5 } = {}) {
  const state = { delta, g };
  const formula = h('div', { class: 'formal-sets' });
  const known = KNOWN.map((key) => {
    const G = loadExample(key).graph;
    return { name: key, label: { k4: 'K₄', k33: 'K₃,₃', cube: 'cube Q₃', petersen: 'Petersen', heawood: 'Heawood' }[key], n: G.order, delta: degreeStats(G).min, g: girth(G).girth };
  });

  function update() {
    const { delta: d, g: gg } = state;
    const r = Math.floor(gg / 2);
    const terms = Array.from({ length: r }, (_, i) => `${d - 1}^{${i}}`).join(' + ');
    const n0 = mooreBound(d, gg);
    formula.innerHTML = gg % 2 === 0
      ? `<p>$g = ${gg} = 2r$ with $r = ${r}$: &nbsp; $n_0(${d}, ${gg}) = 2\\,(${terms}) = ${n0}$</p>`
      : `<p>$g = ${gg} = 2r + 1$ with $r = ${r}$: &nbsp; $n_0(${d}, ${gg}) = 1 + ${d}\\,(${terms}) = ${n0}$</p>`;
    formula.innerHTML += `<p>So every graph with $\\delta(G) \\ge ${d}$ and $g(G) \\ge ${gg}$ has at least <strong>${n0}</strong> vertices.
      ${d === 3 ? `Compare $2^{g/2} = ${fmt(2 ** (gg / 2), 1)}$.` : ''}</p>`;
    renderMath(formula);
  }

  setChildren(el,
    controls(
      slider({ label: 'minimum degree δ =', min: 3, max: 6, value: delta, onInput: (v) => { state.delta = v; update(); } }),
      slider({ label: 'girth g =', min: 3, max: 12, value: g, onInput: (v) => { state.g = v; update(); } }),
    ),
    formula,
    h('p', { class: 'widget__hint' }, 'Known graphs: some meet the bound exactly (“Moore graphs”).'),
    table(['graph', 'δ', 'g', 'n₀(δ, g)', 'actual |V|'], known.map((k) => {
      const n0 = mooreBound(k.delta, k.g);
      return { className: n0 === k.n ? 'row-current' : '', cells: [k.label, String(k.delta), String(k.g), String(n0), `${k.n}${n0 === k.n ? ' (equal!)' : ''}`] };
    })),
  );
  update();
}
