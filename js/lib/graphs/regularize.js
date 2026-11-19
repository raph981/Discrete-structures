/**
 * Regularizing Lemma: every graph G is an (even induced) subgraph of a Δ(G)-regular graph H.
 *
 * Construction from the lecture: if δ(G) < Δ(G), take two copies G₁ = G and G₂ of G and join
 * every vertex of degree δ(G) in G₁ to its copy in G₂. The new graph G′ satisfies
 *   G ⊆ G′,  Δ(G′) = Δ(G),  δ(G′) = δ(G) + 1.
 * After k = Δ(G) − δ(G) steps the graph is Δ(G)-regular.
 */
import { Graph } from './graph.js';
import { degreeStats } from './degrees.js';

/** Default name of the copy of v made in step `step` (1, 2, …). */
export const copyName = (v, step) => `${v}^${step}`;

/** The original vertex of G that v descends from (across several copy steps). */
export const originOf = (v) => v.split('^')[0];

/**
 * One construction step G → G′.
 * @param {Graph} G  with δ(G) < Δ(G)
 * @param {number} step  step number (used to name the copies)
 * @returns {{graph: Graph, copy: Map<string, string>, newEdges: [string, string][], minDegree: number}}
 */
export function regularizeStep(G, step = 1, rename = copyName) {
  const { min } = degreeStats(G);
  const copy = new Map(G.vertices.map((v) => [v, rename(v, step)]));
  const graph = G.clone();
  for (const v of copy.values()) graph.addVertex(v);
  for (const [u, v] of G.edges) graph.addEdge(copy.get(u), copy.get(v));
  const newEdges = G.vertices.filter((v) => G.degree(v) === min).map((v) => [v, copy.get(v)]);
  for (const [u, v] of newEdges) graph.addEdge(u, v);
  return { graph, copy, newEdges, minDegree: min };
}

/**
 * All intermediate graphs G = G⁽⁰⁾, G⁽¹⁾, …, G⁽ᵏ⁾ = H.
 * @returns {{graph: Graph, copy: Map<string, string>|null, newEdges: [string, string][], stats: ReturnType<typeof degreeStats>}[]}
 */
export function regularizationSteps(G, rename = copyName) {
  const steps = [{ graph: G.clone(), copy: null, newEdges: [], stats: degreeStats(G) }];
  let current = G.clone();
  for (let step = 1; ; step++) {
    const { min, max } = degreeStats(current);
    if (current.order === 0 || min === max) break;
    const next = regularizeStep(current, step, rename);
    current = next.graph;
    steps.push({ graph: current, copy: next.copy, newEdges: next.newEdges, stats: degreeStats(current) });
  }
  return steps;
}
