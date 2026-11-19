/**
 * Lemma (subgraph with large degrees): if e(G) ≥ 1, there is H ⊆ G with δ(H) > ε(H) ≥ ε(G),
 * where ε(G) = e(G)/v(G) is the edge density.
 *
 * The induction proof is constructive: while δ(H) ≤ ε(H), delete a vertex x of minimum degree.
 * By the Claim, ε never decreases in doing so: ε(H − x) ≥ ε(H).
 */
import { degreeStats, minDegreeVertices } from './degrees.js';

/**
 * Runs the procedure from the proof.
 * @returns {{graph: import('./graph.js').Graph, removed: string|null, stats: ReturnType<typeof degreeStats>}[]}
 *   Each entry describes an intermediate graph; `removed` is the vertex deleted next
 *   (null in the last entry, once δ(H) > ε(H) holds).
 */
export function denseSubgraphSteps(G) {
  if (G.size < 1) throw new Error('The lemma requires e(G) ≥ 1');
  const steps = [];
  let H = G.clone();
  for (;;) {
    const stats = degreeStats(H);
    if (stats.min > stats.density) {
      steps.push({ graph: H, removed: null, stats });
      return steps;
    }
    const [x] = minDegreeVertices(H);
    steps.push({ graph: H, removed: x, stats });
    H = H.without(x);
  }
}

/** Returns only the result H of the procedure. */
export function denseSubgraph(G) {
  return denseSubgraphSteps(G).at(-1).graph;
}
