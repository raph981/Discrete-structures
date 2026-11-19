/**
 * Widget: comparing growth rates. Pick f and g; the plot shows f(n)/g(n), and the verdict names the
 * relation (Θ, O, o, Ω, ω) from the definitions.
 */
import { h, setChildren, segmented, slider, controls } from '../core/dom.js';
import { renderPlot } from '../core/plot.js';

/** Functions with their growth class (equal class ⇔ same order). */
const FUNCTIONS = {
  log: { label: 'log₂ n', f: (n) => Math.log2(n), cls: 1 },
  sqrt: { label: '√n', f: (n) => Math.sqrt(n), cls: 2 },
  n: { label: 'n', f: (n) => n, cls: 3 },
  hundred: { label: '100n', f: (n) => 100 * n, cls: 3 },
  nlog: { label: 'n log₂ n', f: (n) => n * Math.log2(n), cls: 4 },
  sq: { label: 'n²', f: (n) => n * n, cls: 5 },
  poly: { label: '3n² + 5n', f: (n) => 3 * n * n + 5 * n, cls: 5 },
  exp: { label: '2ⁿ', f: (n) => 2 ** n, cls: 6 },
};

const options = Object.entries(FUNCTIONS).map(([value, { label }]) => ({ value, label }));

function verdict(fk, gk) {
  const f = FUNCTIONS[fk]; const g = FUNCTIONS[gk];
  if (f.cls === g.cls) return `f = Θ(g): the ratio ${f.label} / ${g.label} stays between two positive constants. In particular f = O(g) and f = Ω(g).`;
  if (f.cls < g.cls) return `f = o(g): the ratio ${f.label} / ${g.label} tends to 0. In particular f = O(g), but not Θ(g).`;
  return `f = ω(g): the ratio ${f.label} / ${g.label} grows without bound (g = o(f)). In particular f = Ω(g), but f ≠ O(g).`;
}

export default function mount(el, { f = 'poly', g = 'sq' } = {}) {
  const state = { f, g, max: 40 };
  const plotAll = h('div', { class: 'plot-container' });
  const plotRatio = h('div', { class: 'plot-container' });
  const text = h('p', { class: 'verdict' });

  function update() {
    const ns = Array.from({ length: state.max }, (_, i) => i + 1).filter((n) => n >= 2);
    const shown = [...new Set([state.f, state.g, 'log', 'n', 'nlog', 'sq', 'exp'])];
    renderPlot(plotAll, {
      x: { min: 2, max: state.max, label: 'n' },
      y: { min: 1, max: 1e6, log: true },
      series: shown.map((k, i) => ({ label: FUNCTIONS[k].label, color: (i % 6) + 1, points: ns.map((n) => [n, FUNCTIONS[k].f(n)]), dashed: k !== state.f && k !== state.g })),
      ariaLabel: 'Growth of common functions (logarithmic scale)',
    });
    const ratio = ns.map((n) => [n, FUNCTIONS[state.f].f(n) / FUNCTIONS[state.g].f(n)]);
    const maxRatio = Math.max(...ratio.map(([, r]) => r));
    renderPlot(plotRatio, {
      x: { min: 2, max: state.max, label: 'n' },
      y: { min: 0, max: Math.min(Math.max(maxRatio * 1.1, 1), 1e3) },
      series: [{ label: `f(n) / g(n) = ${FUNCTIONS[state.f].label} / ${FUNCTIONS[state.g].label}`, color: 1, points: ratio }],
      ariaLabel: 'Ratio f(n)/g(n)',
    });
    text.textContent = verdict(state.f, state.g);
  }

  setChildren(el,
    controls(
      segmented({ label: 'f(n)', options, value: f, onChange: (v) => { state.f = v; update(); } }),
      segmented({ label: 'g(n)', options, value: g, onChange: (v) => { state.g = v; update(); } }),
    ),
    controls(slider({ label: 'n up to', min: 10, max: 100, value: state.max, onInput: (v) => { state.max = v; update(); } })),
    h('div', { class: 'widget-columns' }, plotAll, plotRatio),
    text,
  );
  update();
}
