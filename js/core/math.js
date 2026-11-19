/**
 * Math typesetting with KaTeX (loaded via <script> in index.html).
 * Inline: $…$, display: $$…$$.
 */
const OPTIONS = {
  delimiters: [
    { left: '$$', right: '$$', display: true },
    { left: '$', right: '$', display: false },
  ],
  throwOnError: false,
  macros: {
    '\\N': '\\mathbb{N}',
    '\\R': '\\mathbb{R}',
    '\\eps': '\\varepsilon',
    // \pairs{V} = set of all unordered pairs of distinct elements of V
    '\\pairs': '\\binom{#1}{2}',
  },
};

/** Typesets all formulas inside `element`. */
export function renderMath(element) {
  if (typeof window.renderMathInElement === 'function') {
    window.renderMathInElement(element, OPTIONS);
  }
}

/** Renders a single TeX expression to an HTML string. */
export function tex(source, displayMode = false) {
  if (window.katex) {
    return window.katex.renderToString(source, { ...OPTIONS, displayMode });
  }
  return source;
}
