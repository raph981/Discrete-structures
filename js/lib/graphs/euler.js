/**
 * Eulerian tours (closed walks using every edge exactly once).
 *
 * Euler's theorem: a connected graph has an Eulerian tour iff all degrees are even.
 * The algorithm from lecture 7 grows a closed walk W: pick v ∈ Q (reached vertices that still have
 * untraveled edges), walk greedily from v along untraveled edges until stuck – by the Lemma the walk
 * Y ends at v again – and splice Y into W at v.
 */
import { edgeKey } from './graph.js';
import { components } from './paths.js';

/** Vertices of odd degree. */
export function oddVertices(G) {
  return G.vertices.filter((v) => G.degree(v) % 2 === 1);
}

/**
 * Does G have an Eulerian tour? Isolated vertices are ignored for connectivity.
 * @returns {{has: boolean, reason: string, odd: string[]}}
 */
export function eulerCheck(G) {
  const odd = oddVertices(G);
  const nonTrivial = components(G).filter((c) => c.length > 1);
  if (G.size === 0) return { has: false, reason: 'The graph has no edges.', odd };
  if (nonTrivial.length > 1) return { has: false, reason: 'The edges do not all lie in one component.', odd };
  if (odd.length) return { has: false, reason: `Not all degrees are even (odd: ${odd.join(', ')}).`, odd };
  return { has: true, reason: 'Connected and all degrees are even.', odd };
}

/**
 * A maximal walk from v in the graph of untraveled edges (always taking the alphabetically first edge).
 * Mutates `used` (a Set of edge keys).
 */
function maximalWalk(G, v, used) {
  const walk = [v];
  for (;;) {
    const x = walk.at(-1);
    const next = [...G.neighbors(x)].sort().find((y) => !used.has(edgeKey(x, y)));
    if (next === undefined) return walk;
    used.add(edgeKey(x, next));
    walk.push(next);
  }
}

/**
 * Runs the algorithm; one entry per iteration of the while loop.
 * @returns {{v: string|null, Y: string[], W: string[], Q: string[]}[]}  W is a closed walk (first = last vertex)
 */
export function eulerTourSteps(G, s) {
  const used = new Set();
  let W = [s];
  let Q = [s];
  const reached = new Set([s]);
  const steps = [{ v: null, Y: [], W: [...W], Q: [...Q] }];
  const hasUntraveled = (x) => G.neighbors(x).some((y) => !used.has(edgeKey(x, y)));

  while (Q.length) {
    const v = Q[0];
    const Y = maximalWalk(G, v, used);
    // rotate W so that it starts and ends at v, then append Y (which also ends at v if all degrees are even)
    if (W.length > 1) {
      const i = W.indexOf(v);
      W = [...W.slice(i, -1), ...W.slice(0, i), v];
    }
    W = [...W, ...Y.slice(1)];
    for (const y of Y) reached.add(y);
    Q = [...reached].filter(hasUntraveled);
    steps.push({ v, Y, W: [...W], Q: [...Q] });
  }
  return steps;
}
