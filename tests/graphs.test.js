import { test } from 'node:test';
import assert from 'node:assert/strict';

import { Graph, pairCount } from '../js/lib/graphs/graph.js';
import { degreeStats, degreeSequence, incidenceMatrix, isGraphicSequence, isRegular } from '../js/lib/graphs/degrees.js';
import { checkInduced, checkSubgraph } from '../js/lib/graphs/subgraph.js';
import { automorphisms, checkMapping, cycleNotation, findIsomorphism } from '../js/lib/graphs/isomorphism.js';
import { regularizationSteps } from '../js/lib/graphs/regularize.js';
import { denseSubgraphSteps } from '../js/lib/graphs/dense-subgraph.js';
import { EXAMPLES, ISOMORPHISM_PAIRS, fromSpec, loadExample } from '../js/data/graphs.js';

const lecture = () => loadExample('lecture').graph;

/** Deterministic pseudo-random graph (linear congruential generator). */
function randomGraph(n, p, seed) {
  let state = seed;
  const rand = () => ((state = (state * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
  const vertices = Array.from({ length: n }, (_, i) => `v${i}`);
  const G = new Graph(vertices);
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (rand() < p) G.addEdge(vertices[i], vertices[j]);
  return G;
}

test('graphs are simple: no loops, no multiple edges, unordered pairs', () => {
  const G = new Graph(['a', 'b']);
  assert.throws(() => G.addEdge('a', 'a'), /Loop/);
  G.addEdge('a', 'b');
  G.addEdge('b', 'a');
  assert.equal(G.size, 1);
  assert.ok(G.hasEdge('b', 'a'));
  assert.throws(() => G.addEdge('a', 'z'), /Unknown vertex/);
  assert.equal(pairCount(6), 15);
});

test('lecture example: neighborhoods and degrees (page 2)', () => {
  const G = lecture();
  assert.deepEqual(G.neighbors('w').sort(), ['t', 'y']);
  assert.equal(G.degree('w'), 2);
  assert.deepEqual(degreeSequence(G), [3, 3, 3, 2, 2, 1]);
});

test('Handshake Lemma holds for every example and for random graphs', () => {
  const graphs = [...Object.keys(EXAMPLES).map((k) => loadExample(k).graph), ...[1, 2, 3, 4, 5].map((s) => randomGraph(12, 0.3, s))];
  for (const G of graphs) {
    const { degreeSum, size } = degreeStats(G);
    assert.equal(degreeSum, 2 * size);
    const { rowSums, columnSums } = incidenceMatrix(G);
    assert.equal(rowSums.reduce((a, b) => a + b, 0), columnSums.reduce((a, b) => a + b, 0));
    assert.equal(G.vertices.filter((v) => G.degree(v) % 2).length % 2, 0);
  }
});

test('degree parameters: δ, Δ, d(G) = 2e/v, ε = e/v and regularity', () => {
  const s = degreeStats(lecture());
  assert.equal(s.min, 1);
  assert.equal(s.max, 3);
  assert.equal(s.average, 14 / 6);
  assert.equal(s.density, 7 / 6);
  assert.ok(isRegular(loadExample('petersen').graph, 3));
  assert.ok(isRegular(loadExample('cube').graph, 3));
  assert.ok(!isRegular(lecture()));
});

test('degree sequences: parity and Havel–Hakimi', () => {
  assert.deepEqual(isGraphicSequence([3, 3, 3, 3, 3]), { graphic: false, evenSum: false });
  assert.deepEqual(isGraphicSequence([3, 3, 3, 1]), { graphic: false, evenSum: true });
  assert.deepEqual(isGraphicSequence([3, 3, 2, 2, 2]), { graphic: true, evenSum: true });
  assert.equal(isGraphicSequence(degreeSequence(loadExample('petersen').graph)).graphic, true);
});

test('subgraphs: the lecture H is a subgraph but not induced (page 3)', () => {
  const G = lecture();
  const H = new Graph(['u', 'v', 'x', 'w', 'y'], [['u', 'v'], ['v', 'x'], ['w', 'y']]);
  assert.ok(checkSubgraph(H, G).isSubgraph);
  const result = checkInduced(H, G);
  assert.equal(result.isInduced, false);
  assert.deepEqual(result.missingEdges, [['u', 'x']]);
  assert.ok(checkInduced(G.induced(H.vertices), G).isInduced);
  assert.equal(checkSubgraph(new Graph(['u', 'w'], [['u', 'w']]), G).isSubgraph, false);
});

test('G − x equals G[V(G) \\ {x}]', () => {
  const G = lecture();
  const a = G.without('t');
  const b = G.induced(G.vertices.filter((v) => v !== 't'));
  assert.deepEqual(a.edges, b.edges);
  assert.equal(a.size, G.size - G.degree('t'));
});

test('isomorphism pairs are classified correctly', () => {
  const expected = { pentagram: true, lectureRedrawn: true, k33: true, prism: false, c6: false };
  for (const [key, iso] of Object.entries(expected)) {
    const G = fromSpec(ISOMORPHISM_PAIRS[key].G).graph;
    const H = fromSpec(ISOMORPHISM_PAIRS[key].H).graph;
    const f = findIsomorphism(G, H);
    assert.equal(f !== null, iso, key);
    if (f) assert.ok(checkMapping(G, H, f).isIsomorphism, key);
  }
});

test('checkMapping reports violated pairs in both directions', () => {
  const G = new Graph(['1', '2', '3'], [['1', '2']]);
  const H = new Graph(['a', 'b', 'c'], [['b', 'c']]);
  const bad = checkMapping(G, H, { 1: 'a', 2: 'b', 3: 'c' });
  assert.equal(bad.isIsomorphism, false);
  assert.equal(bad.pairs.filter((p) => !p.ok).length, 2); // edge → non-edge and non-edge → edge
  assert.ok(checkMapping(G, H, { 1: 'b', 2: 'c', 3: 'a' }).isIsomorphism);
});

test('automorphism counts (page 4 and classic graphs)', () => {
  const counts = { lecture: 2, path4: 2, star: 6, square: 8, c5: 10, k4: 24, cube: 48, petersen: 120 };
  for (const [key, n] of Object.entries(counts)) {
    assert.equal(automorphisms(loadExample(key).graph).length, n, key);
  }
  const [identity, swap] = automorphisms(lecture());
  assert.equal(cycleNotation(identity), 'id');
  assert.equal(cycleNotation(swap), '(u x)');
});

test('Regularizing Lemma: H is Δ(G)-regular and contains G as an induced subgraph', () => {
  for (const G of [lecture(), loadExample('star').graph, loadExample('path4').graph, randomGraph(6, 0.4, 7)]) {
    const steps = regularizationSteps(G);
    const { min, max } = degreeStats(G);
    assert.equal(steps.length - 1, max - min);
    steps.forEach((step, k) => {
      assert.equal(step.stats.max, max);
      assert.equal(step.stats.min, min + k);
      assert.equal(step.graph.order, G.order * 2 ** k);
    });
    const H = steps.at(-1).graph;
    assert.ok(isRegular(H, max));
    assert.ok(checkInduced(G, H).isInduced);
  }
});

test('regularizing step 1 on the lecture example adds exactly the edge between y and its copy (page 5)', () => {
  const [, first] = regularizationSteps(lecture());
  assert.deepEqual(first.newEdges, [['y', 'y^1']]);
});

test('subgraph with large degrees: δ(H) > ε(H) ≥ ε(G), and ε never decreases', () => {
  const graphs = [loadExample('coreWithTail').graph, lecture(), loadExample('path4').graph,
    ...[11, 12, 13, 14, 15, 16].map((s) => randomGraph(10, 0.25, s))].filter((G) => G.size >= 1);
  for (const G of graphs) {
    const steps = denseSubgraphSteps(G);
    for (let i = 1; i < steps.length; i++) assert.ok(steps[i].stats.density >= steps[i - 1].stats.density - 1e-12);
    const { stats, graph } = steps.at(-1);
    assert.ok(stats.min > stats.density);
    assert.ok(stats.density >= degreeStats(G).density - 1e-12);
    assert.ok(checkSubgraph(graph, G).isSubgraph);
  }
  const H = denseSubgraphSteps(loadExample('coreWithTail').graph).at(-1).graph;
  assert.deepEqual(H.vertices.sort(), ['a', 'b', 'c', 'd']);
  assert.throws(() => denseSubgraphSteps(new Graph(['a'])), /e\(G\) ≥ 1/);
});
