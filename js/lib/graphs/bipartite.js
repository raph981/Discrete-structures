/**
 * Bipartite graphs: a graph is bipartite iff it contains no odd cycle.
 * The proof is constructive: color every vertex by the parity of its distance from a root
 * (per component). Either this is a valid bipartition, or some edge joins two vertices of the
 * same layer N_i – and then two shortest paths plus that edge contain an odd cycle.
 */
import { bfs, components } from './paths.js';

/**
 * @returns {{bipartite: boolean, A: string[], B: string[], layers: Map<string, number>, oddCycle: string[]|null,
 *            conflict: [string, string]|null}}
 */
export function bipartition(G) {
  const layer = new Map();
  const parent = new Map();
  for (const comp of components(G)) {
    const result = bfs(G, comp[0]);
    for (const [v, d] of result.dist) { layer.set(v, d); parent.set(v, result.parent.get(v)); }
  }
  const A = G.vertices.filter((v) => layer.get(v) % 2 === 0);
  const B = G.vertices.filter((v) => layer.get(v) % 2 === 1);
  const conflict = G.edges.find(([u, v]) => layer.get(u) === layer.get(v)) ?? null;
  if (!conflict) return { bipartite: true, A, B, layers: layer, oddCycle: null, conflict: null };

  // Two shortest paths from the root to w and x; walk back until they meet at their last common vertex.
  const [w, x] = conflict;
  const toRoot = (v) => { const p = [v]; while (parent.get(p.at(-1)) !== null) p.push(parent.get(p.at(-1))); return p.reverse(); };
  const W = toRoot(w);
  const X = toRoot(x);
  let j = 0;
  while (j + 1 < W.length && W[j + 1] === X[j + 1]) j++;
  const oddCycle = [...W.slice(j), ...X.slice(j + 1).reverse()];
  return { bipartite: false, A, B, layers: layer, oddCycle, conflict };
}
