/**
 * Building blocks for writing lecture content.
 *
 * All functions return HTML strings. Formulas are written as $…$ or $$…$$
 * and typeset by KaTeX on render. For text with many backslashes use the
 * `tx` template tag (= String.raw) so they need not be doubled.
 */

/** Template tag that leaves backslashes untouched (for TeX). */
export const tx = String.raw;

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeAttr = (s) => escapeHtml(s).replace(/'/g, '&#39;').replace(/"/g, '&quot;');

const BOX_KINDS = {
  definition: 'Definition',
  theorem: 'Theorem',
  lemma: 'Lemma',
  claim: 'Claim',
  corollary: 'Corollary',
  example: 'Example',
  note: 'Note',
  intuition: 'Intuition',
};

/**
 * Highlighted box (definition, lemma, example, …).
 * @param {keyof BOX_KINDS} kind
 * @param {string} title  e.g. "(Handshake Lemma)"; may be empty
 * @param {string} body
 */
export function box(kind, title, body) {
  const heading = [BOX_KINDS[kind], title].filter(Boolean).join(' ');
  return `<aside class="box box--${kind}">
    <div class="box__title">${heading}</div>
    <div class="box__body">${body}</div>
  </aside>`;
}

/** Collapsible proof. */
export function proof(body, summary = 'Proof') {
  return `<details class="proof"><summary>${summary}</summary><div class="proof__body">${body}<span class="qed" aria-hidden="true">□</span></div></details>`;
}

/** Check-your-understanding question with a collapsible answer. */
export function exercise(question, solution, title = 'Check yourself') {
  return `<aside class="exercise">
    <div class="exercise__title">${title}</div>
    <p class="exercise__question">${question}</p>
    <details><summary>Show answer</summary><div class="exercise__solution">${solution}</div></details>
  </aside>`;
}

/**
 * Placeholder for an interactive widget.
 * @param {string} name   key in js/widgets/index.js
 * @param {object} [props]
 * @param {string} [caption]
 */
export function widget(name, props = {}, caption = '') {
  return `<figure class="widget-figure">
    <div class="widget" data-widget="${name}" data-props='${escapeAttr(JSON.stringify(props))}'>
      <p class="widget__loading">Loading interactive figure …</p>
    </div>
    ${caption ? `<figcaption>${caption}</figcaption>` : ''}
  </figure>`;
}

/** Ordered or unordered list. */
export function list(items, ordered = false) {
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag}>${items.map((i) => `<li>${i}</li>`).join('')}</${tag}>`;
}

/** Short "what is this about?" intro for a section. */
export function lead(text) {
  return `<p class="lead">${text}</p>`;
}

/** A newly defined term, visually emphasized. */
export function term(text) {
  return `<dfn class="term">${text}</dfn>`;
}
