/**
 * Minimal SVG line plot (linear x, linear or logarithmic y).
 *
 *   renderPlot(container, { x: {min, max, label}, y: {min, max, log, label},
 *                           series: [{ label, color: 1…6, points: [[x, y], …] }] })
 */
const NS = 'http://www.w3.org/2000/svg';
const W = 600;
const H = 300;
const PAD = { left: 56, right: 14, top: 12, bottom: 38 };

function el(tag, attrs = {}, text) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text !== undefined) node.textContent = text;
  return node;
}

const niceTicks = (min, max, n = 6) => {
  const step = 10 ** Math.floor(Math.log10((max - min) / n));
  const mult = [1, 2, 5, 10].find((m) => (max - min) / (step * m) <= n) * step;
  const ticks = [];
  for (let t = Math.ceil(min / mult) * mult; t <= max + 1e-9; t += mult) ticks.push(t);
  return ticks;
};

const fmtTick = (t) => (Math.abs(t) >= 1e4 ? `10^${Math.round(Math.log10(t))}` : String(+t.toFixed(2)));

export function renderPlot(container, { x, y, series, ariaLabel = 'Plot' }) {
  const ty = (v) => (y.log ? Math.log10(Math.max(v, y.min)) : v);
  const [y0, y1] = [ty(y.min), ty(y.max)];
  const sx = (v) => PAD.left + ((v - x.min) / (x.max - x.min)) * (W - PAD.left - PAD.right);
  const sy = (v) => H - PAD.bottom - ((Math.min(Math.max(ty(v), y0), y1) - y0) / (y1 - y0)) * (H - PAD.top - PAD.bottom);

  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'plot', role: 'img', 'aria-label': ariaLabel });
  const yTicks = y.log
    ? Array.from({ length: Math.floor(y1) - Math.ceil(y0) + 1 }, (_, i) => 10 ** (Math.ceil(y0) + i))
    : niceTicks(y.min, y.max);
  for (const t of yTicks) {
    svg.append(el('line', { x1: PAD.left, x2: W - PAD.right, y1: sy(t), y2: sy(t), class: 'plot__grid' }));
    svg.append(el('text', { x: PAD.left - 6, y: sy(t) + 4, class: 'plot__tick', 'text-anchor': 'end' }, fmtTick(t)));
  }
  for (const t of niceTicks(x.min, x.max)) {
    svg.append(el('text', { x: sx(t), y: H - PAD.bottom + 16, class: 'plot__tick', 'text-anchor': 'middle' }, fmtTick(t)));
  }
  svg.append(el('rect', { x: PAD.left, y: PAD.top, width: W - PAD.left - PAD.right, height: H - PAD.top - PAD.bottom, class: 'plot__frame' }));
  svg.append(el('text', { x: (W + PAD.left) / 2, y: H - 4, class: 'plot__axis-label', 'text-anchor': 'middle' }, x.label ?? ''));
  if (y.label) svg.append(el('text', { x: 12, y: PAD.top + 8, class: 'plot__axis-label' }, y.label));

  for (const s of series) {
    const d = s.points.map(([a, b], i) => `${i ? 'L' : 'M'}${sx(a).toFixed(1)},${sy(b).toFixed(1)}`).join('');
    svg.append(el('path', { d, class: `plot__line${s.dashed ? ' plot__line--dashed' : ''}`, style: `--series-color: var(--series-${s.color})` }));
  }

  const legend = document.createElement('ul');
  legend.className = 'plot-legend';
  for (const s of series) {
    const li = document.createElement('li');
    li.innerHTML = `<span class="plot-legend__swatch" style="--series-color: var(--series-${s.color})"></span>${s.label}`;
    legend.append(li);
  }
  container.replaceChildren(legend, svg);
}
