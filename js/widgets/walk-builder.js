/**
 * Widget: build a vertex sequence by clicking and see whether it is a walk, a path or a cycle.
 * "Shorten to a path" applies the shortcut from the proof of the Claim (walk ⇒ path) step by step.
 */
import { h, setChildren, button } from '../core/dom.js';
import { graphEditor } from '../core/graph-editor.js';
import { edgeKey } from '../lib/graphs/graph.js';
import { classifyWalk, shortcutSteps } from '../lib/graphs/paths.js';

const NOTES_WALK = ['a', 'b', 'c', 'b', 'f', 'a', 'e'];

export default function mount(el, { example = 'walks', walk = NOTES_WALK } = {}) {
  let seq = [...walk];
  let shortcut = null; // steps of the shortening, when shown
  const sequence = h('p', { class: 'walk-seq mono' });
  const verdict = h('div', { class: 'verdict' });
  const shortcutBox = h('div');

  const editor = graphEditor({
    example,
    examples: ['walks', 'lecture', 'cube'],
    tools: [{
      value: 'walk',
      label: 'Walk',
      hint: 'Click vertices one after another to build a sequence.',
      onVertexClick: (v) => { seq.push(v); shortcut = null; describe(); },
    }],
    decorate,
    onChange: () => { seq = []; shortcut = null; describe(); },
  });

  function decorate() {
    const G = editor.graph;
    const counts = new Map();
    seq.slice(1).forEach((v, i) => {
      if (G.hasEdge(seq[i], v)) counts.set(edgeKey(seq[i], v), (counts.get(edgeKey(seq[i], v)) ?? 0) + 1);
    });
    const visits = new Map();
    for (const v of seq) visits.set(v, (visits.get(v) ?? 0) + 1);
    return {
      vertexClass: (v) => (v === seq[0] ? 'is-focus' : v === seq.at(-1) ? 'is-neighbor' : visits.has(v) ? 'in-walk' : ''),
      edgeClass: (u, v) => (counts.has(edgeKey(u, v)) ? 'is-incident' : 'is-muted'),
      edgeLabel: (u, v) => (counts.get(edgeKey(u, v)) > 1 ? `×${counts.get(edgeKey(u, v))}` : ''),
    };
  }

  function describe() {
    const G = editor.graph;
    const c = classifyWalk(G, seq);
    const repeated = [...new Set(seq.filter((v, i) => seq.indexOf(v) !== i))];
    sequence.textContent = seq.length ? `(${seq.join(', ')})` : '( )';
    let text;
    if (!seq.length) text = 'Start clicking vertices.';
    else if (!c.isWalk) text = h('span', { class: 'bad' }, `✗ Not a walk: ${seq[c.brokenAt - 1]} and ${seq[c.brokenAt]} are not adjacent.`);
    else if (c.isCycle) text = h('span', { class: 'good' }, `✓ A cycle of length ${seq.length - 1}: closed, at least 3 distinct vertices, no other repetitions.`);
    else if (c.isPath) text = h('span', { class: 'good' }, `✓ A ${seq[0]}–${seq.at(-1)} path: a walk without repeated vertices (length ${seq.length - 1}).`);
    else text = h('span', {}, `A ${seq[0]}–${seq.at(-1)} walk, but not a path: ${repeated.join(', ')} ${repeated.length > 1 ? 'repeat' : 'repeats'}.`);
    setChildren(verdict, h('p', {}, text),
      c.isWalk && c.edges.length ? h('p', { class: 'widget__hint' }, `Edges used: ${c.edges.map(([u, v]) => `{${u},${v}}`).join(', ')}`) : null);

    if (shortcut) {
      setChildren(shortcutBox, h('ol', { class: 'shortcut-steps mono' }, shortcut.map((s, i) => h('li', {},
        `(${s.walk.join(', ')})`,
        i ? h('span', { class: 'widget__hint' }, `  — ${s.vertex} repeats: cut out ${s.removed.slice(0, -1).join(', ') || 'nothing between'} and one ${s.vertex}`) : null))));
    } else setChildren(shortcutBox);
    shortenButton.disabled = !(c.isWalk && !c.isPath);
    editor.redraw();
  }

  const shortenButton = button('Shorten to a path', () => {
    shortcut = shortcutSteps(seq);
    seq = [...shortcut.at(-1).walk];
    describe();
  });

  setChildren(el,
    editor.element,
    sequence,
    h('div', { class: 'button-row' },
      shortenButton,
      button('Undo', () => { seq.pop(); shortcut = null; describe(); }, { secondary: true }),
      button('Clear', () => { seq = []; shortcut = null; describe(); }, { secondary: true }),
      button('Walk from the notes', () => {
        if (!NOTES_WALK.every((v) => editor.graph.hasVertex(v))) return editor.say('Choose the “Lecture 2 example” first.');
        seq = [...NOTES_WALK]; shortcut = null; describe();
      }, { secondary: true }),
    ),
    verdict,
    shortcutBox,
  );
  editor.start();
  if (example === 'walks') { seq = [...walk]; describe(); }
}
