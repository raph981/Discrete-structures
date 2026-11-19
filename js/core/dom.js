/**
 * Small DOM helpers and reusable controls for widgets.
 */

/**
 * Creates an element.
 * @param {string} tag
 * @param {Record<string, any>} [attrs]  attributes; `on*` functions become event listeners,
 *                                        `class` / `text` / `html` are handled specially
 * @param {...(Node|string|null|undefined|false)} children
 */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key === 'text') el.textContent = value;
    else if (key === 'html') el.innerHTML = value;
    else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2), value);
    else el.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}

/** Replaces an element's children; null/undefined/false are skipped. */
export function setChildren(el, ...children) {
  el.replaceChildren(...children.flat().filter((c) => c !== null && c !== undefined && c !== false));
}

let idCounter = 0;
const uid = (prefix) => `${prefix}-${++idCounter}`;

/**
 * Range slider with label and value display.
 * @returns {{element: HTMLElement, get value(): number, set value(v: number)}}
 */
export function slider({ label, min, max, step = 1, value, format = String, onInput }) {
  const id = uid('slider');
  const output = h('output', { for: id, class: 'control__value' }, format(value));
  const input = h('input', { id, type: 'range', min, max, step, value });
  input.addEventListener('input', () => {
    output.textContent = format(Number(input.value));
    onInput?.(Number(input.value));
  });
  const element = h('div', { class: 'control' },
    h('label', { for: id, class: 'control__label' }, label, ' ', output),
    input,
  );
  return {
    element,
    get value() { return Number(input.value); },
    set value(v) { input.value = v; output.textContent = format(Number(v)); },
  };
}

/**
 * Segmented control (radio buttons rendered as buttons).
 * @param {{label?: string, options: {value: string, label: string}[], value: string, onChange?: (v: string) => void}} config
 */
export function segmented({ label, options, value, onChange }) {
  let current = value;
  const buttons = options.map((opt) => h('button', {
    type: 'button',
    class: 'segmented__option',
    'aria-pressed': String(opt.value === current),
    onclick: () => select(opt.value),
  }, opt.label));

  function select(v) {
    current = v;
    buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(options[i].value === v)));
    onChange?.(v);
  }

  const group = h('div', { class: 'segmented', role: 'group', 'aria-label': label }, buttons);
  const element = label ? h('div', { class: 'control' }, h('span', { class: 'control__label' }, label), group) : group;
  return { element, get value() { return current; }, select };
}

/** Text field with label. */
export function textField({ label, value, onInput, placeholder, inputmode = 'text' }) {
  const id = uid('field');
  const input = h('input', { id, type: 'text', value, placeholder, inputmode, class: 'text-input', spellcheck: 'false' });
  input.addEventListener('input', () => onInput?.(input.value));
  const element = h('div', { class: 'control' }, h('label', { for: id, class: 'control__label' }, label), input);
  return { element, input, get value() { return input.value; } };
}

/** Container for a row of controls. */
export function controls(...items) {
  return h('div', { class: 'controls' }, items.map((i) => i.element ?? i));
}

/** Small key figure ("stat tile"). */
export function stat(label, value, hint) {
  return h('div', { class: 'stat' },
    h('div', { class: 'stat__label' }, label),
    h('div', { class: 'stat__value' }, value),
    hint ? h('div', { class: 'stat__hint' }, hint) : null,
  );
}

/** Row of stat tiles. */
export function stats(...tiles) {
  return h('div', { class: 'stats' }, tiles);
}

/** Table from a header row and body rows (cells may be nodes or strings). */
export function table(head, rows, { className = 'data-table' } = {}) {
  return h('div', { class: 'table-scroll' },
    h('table', { class: className },
      h('thead', {}, h('tr', {}, head.map((c) => h('th', { scope: 'col' }, c)))),
      h('tbody', {}, rows.map((r) => h('tr', { class: r.className }, (r.cells ?? r).map((c) => h('td', {}, c))))),
    ),
  );
}

/* ---------- Number formatting ---------- */

/** Compact number formatting. */
export function fmt(x, digits = 3) {
  if (x === null || x === undefined) return '–';
  if (!Number.isFinite(x)) return String(x);
  return x.toLocaleString('en-US', { maximumFractionDigits: digits });
}

/** Shows p/q in lowest terms (e.g. "7/3 ≈ 2.333"); integers without denominator. */
export function fmtFraction(p, q) {
  if (q === 0) return '–';
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const g = gcd(Math.abs(p), Math.abs(q)) || 1;
  const [n, d] = [p / g, q / g];
  return d === 1 ? String(n) : `${n}/${d} ≈ ${fmt(n / d)}`;
}

/* ---------- Buttons ---------- */

/** Button. */
export function button(label, onClick, { secondary = false, disabled = false } = {}) {
  return h('button', { type: 'button', class: `button${secondary ? ' button--secondary' : ''}`, onclick: onClick, disabled }, label);
}

/** Row of small buttons ("chips"), e.g. for choosing an example graph. */
export function chips(label, items, onSelect) {
  return h('div', { class: 'example-buttons' },
    label ? h('span', {}, label) : null,
    items.map((item) => h('button', { type: 'button', class: 'chip', onclick: () => onSelect(item) }, item.label)),
  );
}
