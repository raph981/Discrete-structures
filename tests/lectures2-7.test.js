import { test } from 'node:test';
import assert from 'node:assert/strict';

import { Graph, edgeKey } from '../js/lib/graphs/graph.js';
import { allCycles, allPaths, bfs, classifyWalk, components, girth, isConnected, shortcutSteps, shortestPath } from '../js/lib/graphs/paths.js';
import { isTree, leaves, longestPath, treeCharacterizations } from '../js/lib/graphs/trees.js';
import { isSpanningTree, kruskalSteps, mstViolations, spanningTreeSteps, weightOf } from '../js/lib/graphs/spanning.js';
import { bipartition } from '../js/lib/graphs/bipartite.js';
import { eulerCheck, eulerTourSteps } from '../js/lib/graphs/euler.js';
import { connectivity, isKConnected } from '../js/lib/graphs/connectivity.js';
import { layerBound, log2Factorial, mooreBound } from '../js/lib/graphs/moore.js';
import { degreeStats } from '../js/lib/graphs/degrees.js';
import { EXAMPLES, loadExample, loadWeightedExample } from '../js/data/graphs.js';

const ex = (key) => loadExample(key).graph;

/** Deterministic pseudo-random graph. */
function randomGraph(n, p, seed) {
  let state = seed;
  const rand = () => ((state = (state * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
  const vs = Array.from({ length: n }, (_, i) => `v${String(i).padStart(2, '0')}`);
  const G = new Graph(vs);
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (rand() < p) G.addEdge(vs[i], vs[j]);
  return G;
}

/** Brute-force minimum spanning tree weight over all edge subsets of size n − 1 (small graphs only). */
function bruteForceMst(G, weights) {
  const edges = G.edges;
  let best = Infinity;
  const pick = [];
  (function choose(i) {
    if (pick.length === G.order - 1) {
      if (isSpanningTree(G, pick)) best = Math.min(best, weightOf(pick, weights));
      return;
    }
    if (i === edges.length) return;
    pick.push(edges[i]); choose(i + 1); pick.pop(); choose(i + 1);
  }(0));
  return best;
}

test('lecture 2: walks, paths and the walk-to-path shortcut', () => {
  const G = ex('walks');
  const walk = ['a', 'b', 'c', 'b', 'f', 'a', 'e'];
  const w = classifyWalk(G, walk);
  assert.ok(w.isWalk && !w.isPath);
  assert.deepEqual(w.edges.length, 6);
  assert.ok(classifyWalk(G, ['a', 'f', 'b', 'c']).isPath);
  assert.equal(classifyWalk(G, ['a', 'c']).brokenAt, 1);
  const steps = shortcutSteps(walk);
  const path = steps.at(-1).walk;
  assert.ok(classifyWalk(G, path).isPath);
  assert.equal(path[0], 'a');
  assert.equal(path.at(-1), 'e');
  assert.ok(classifyWalk(G, ['a', 'b', 'f', 'e', 'a']).isCycle);
  assert.ok(!classifyWalk(G, ['a', 'b', 'a']).isCycle);
});

test('lecture 2: the example graph has exactly 3 cycles; components', () => {
  assert.equal(allCycles(ex('walks')).length, 3);
  assert.equal(components(ex('components')).length, 5);
  assert.ok(isConnected(ex('walks')));
  assert.equal(allCycles(ex('k4')).length, 7);
  assert.equal(allCycles(ex('petersen')).filter((c) => c.length === 5).length, 12);
});

test('lecture 2: trees – at least two leaves, n − 1 edges, endpoints of a longest path are leaves', () => {
  for (const G of [ex('tree'), ex('path4'), ex('star')]) {
    assert.ok(isTree(G));
    assert.ok(leaves(G).length >= 2);
    assert.equal(G.size, G.order - 1);
    const P = longestPath(G);
    assert.equal(G.degree(P[0]), 1);
    assert.equal(G.degree(P.at(-1)), 1);
  }
  assert.ok(!isTree(ex('forest')));
  assert.ok(!isTree(ex('walks')));
});

test('lectures 2/3: the four tree characterizations agree on every example and random graphs', () => {
  const graphs = [...Object.keys(EXAMPLES).filter((k) => k !== 'empty').map(ex), ...[1, 2, 3, 4, 5, 6, 7, 8].map((s) => randomGraph(7, 0.3, s))];
  for (const G of graphs) {
    const c = treeCharacterizations(G);
    const values = [c.tree.holds, c.minimallyConnected.holds, c.maximallyAcyclic.holds, c.uniquePaths.holds];
    assert.ok(values.every((x) => x === values[0]), JSON.stringify(values));
  }
});

test('lecture 3: girth, distances and shortest paths', () => {
  assert.equal(girth(ex('petersen')).girth, 5);
  assert.equal(girth(ex('heawood')).girth, 6);
  assert.equal(girth(ex('cube')).girth, 4);
  assert.equal(girth(ex('k4')).girth, 3);
  assert.equal(girth(ex('tree')).girth, Infinity);
  const { layers } = bfs(ex('petersen'), '1');
  assert.deepEqual(layers.map((l) => l.length), [1, 3, 6]);
  assert.equal(shortestPath(ex('walks'), 'e', 'd').length, 5);
  assert.equal(allPaths(ex('walks'), 'a', 'f').length, 3);
});

test("lecture 3: Moore's bound", () => {
  assert.equal(mooreBound(3, 5), 10); // Petersen graph meets it
  assert.equal(mooreBound(3, 6), 14); // Heawood graph meets it
  assert.equal(mooreBound(3, 4), 6); // K3,3
  assert.equal(mooreBound(3, 3), 4); // K4
  for (const key of ['petersen', 'heawood', 'cube', 'k4', 'k33']) {
    const G = ex(key);
    assert.ok(G.order >= mooreBound(degreeStats(G).min, girth(G).girth), key);
  }
  for (let g = 3; g <= 20; g++) assert.ok(mooreBound(3, g) >= 2 ** (g / 2));
  assert.equal(layerBound(3, 2), 6);
});

test('lecture 4: sorting lower bound', () => {
  assert.equal(Math.ceil(log2Factorial(3)), 3);
  assert.ok(Math.abs(log2Factorial(10) - Math.log2(3628800)) < 1e-9);
});

test('lectures 4/5: the spanning tree algorithm outputs a spanning tree (BFS and DFS), testing each edge at most twice', () => {
  for (const G of [ex('numbered'), ex('petersen'), ex('grid'), randomGraph(9, 0.5, 3)].filter(isConnected)) {
    for (const strategy of ['bfs', 'dfs']) {
      const steps = spanningTreeSteps(G, G.vertices[0], strategy);
      const last = steps.at(-1);
      assert.equal(last.R.length, G.order);
      assert.ok(isSpanningTree(G, last.T));
      assert.ok(last.tested <= 2 * G.size + G.order);
      for (const st of steps) {
        const T = new Graph(st.R, st.T);
        assert.ok(isTree(T)); // T is always a spanning tree of G[R]
      }
    }
  }
  // BFS reaches vertices in order of distance
  const G = ex('grid');
  const order = spanningTreeSteps(G, 'a', 'bfs').at(-1).R;
  const { dist } = bfs(G, 'a');
  for (let i = 1; i < order.length; i++) assert.ok(dist.get(order[i - 1]) <= dist.get(order[i]));
});

test('lectures 5/6: Kruskal finds a minimum spanning tree and satisfies the MST property', () => {
  for (const key of ['walks', 'grid', 'k5', 'petersen']) {
    const { graph, weights } = loadWeightedExample(key);
    const steps = kruskalSteps(graph, weights);
    const T = steps.at(-1).T;
    assert.ok(isSpanningTree(graph, T), key);
    assert.deepEqual(mstViolations(graph, weights, T), [], key);
    if (graph.size <= 15) assert.equal(weightOf(T, weights), bruteForceMst(graph, weights), key);
    // relabeling the smaller component: each vertex is relabeled at most log2(n) times
    assert.ok(steps.at(-1).relabelTotal <= graph.order * Math.log2(graph.order), key);
  }
  // a non-minimal spanning tree violates the MST property
  const { graph, weights } = loadWeightedExample('walks');
  const bad = [['a', 'b'], ['b', 'f'], ['e', 'f'], ['b', 'c'], ['c', 'd']];
  assert.ok(isSpanningTree(graph, bad));
  assert.ok(mstViolations(graph, weights, bad).length > 0);
});

test('lecture 6: bipartite iff no odd cycle; the odd cycle found is real', () => {
  for (const key of ['cube', 'k33', 'tree', 'grid', 'c6', 'square']) assert.ok(bipartition(ex(key)).bipartite, key);
  for (const G of [ex('c5'), ex('petersen'), ex('k4'), ex('walks'), ...[1, 2, 3, 4].map((s) => randomGraph(9, 0.3, s))]) {
    const result = bipartition(G);
    const hasOdd = allCycles(G).some((c) => c.length % 2 === 1);
    assert.equal(result.bipartite, !hasOdd);
    if (result.bipartite) {
      for (const [u, v] of G.edges) assert.notEqual(result.A.includes(u), result.A.includes(v));
    } else {
      const c = result.oddCycle;
      assert.equal(c.length % 2, 1);
      assert.equal(new Set(c).size, c.length);
      c.forEach((v, i) => assert.ok(G.hasEdge(v, c[(i + 1) % c.length])));
    }
  }
});

test('lecture 7: Euler tours', () => {
  assert.equal(eulerCheck(ex('konigsberg')).has, false);
  assert.equal(eulerCheck(ex('konigsberg')).odd.length, 4);
  for (const key of ['eulerian', 'c5', 'square', 'k5']) {
    const G = ex(key);
    assert.ok(eulerCheck(G).has, key);
    const W = eulerTourSteps(G, G.vertices[0]).at(-1).W;
    assert.equal(W[0], W.at(-1));
    assert.equal(W.length - 1, G.size);
    const used = new Set(W.slice(1).map((v, i) => edgeKey(W[i], v)));
    assert.equal(used.size, G.size, key);
    for (const k of used) assert.ok(G.hasEdge(...k.split('|')));
  }
});

test('lecture 7: connectivity', () => {
  assert.equal(connectivity(ex('bowtie')).kappa, 1);
  assert.deepEqual(connectivity(ex('bowtie')).separator, ['x']);
  assert.equal(connectivity(ex('petersen')).kappa, 3);
  assert.equal(connectivity(ex('k5')).kappa, 4);
  assert.equal(connectivity(ex('c5')).kappa, 2);
  assert.equal(connectivity(ex('tree')).kappa, 1);
  assert.equal(connectivity(ex('forest')).kappa, 0);
  assert.ok(isKConnected(ex('cube'), 3));
  // Fact: k-connected ⇒ δ(G) ≥ k
  for (const key of Object.keys(EXAMPLES).filter((k) => k !== 'empty')) {
    const G = ex(key);
    assert.ok(connectivity(G).kappa <= degreeStats(G).min, key);
  }
});

test('lecture 3: two different u–v paths contain a cycle', async () => {
  const { cycleFromTwoPaths } = await import('../js/lib/graphs/paths.js');
  for (const key of ['walks', 'petersen', 'cube', 'grid', 'k5']) {
    const G = ex(key);
    const [u, v] = [G.vertices[0], G.vertices.at(-1)];
    const paths = allPaths(G, u, v, 30);
    for (let a = 0; a < paths.length; a++) {
      for (let b = a + 1; b < paths.length; b++) {
        const c = cycleFromTwoPaths(paths[a], paths[b]);
        assert.ok(c.length >= 3 && new Set(c).size === c.length, key);
        c.forEach((x, i) => assert.ok(G.hasEdge(x, c[(i + 1) % c.length]), key));
      }
    }
  }
});
