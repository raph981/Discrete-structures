/**
 * Separators and k-connectivity (lecture 7).
 *
 * X ⊆ V(G) is a separator if G \ X is disconnected. G is k-connected if |V(G)| ≥ k + 1 and G has
 * no separator with fewer than k vertices. The connectivity κ(G) is the largest such k.
 * Computed by brute force over vertex subsets – fine for the small graphs used here.
 */
import { components } from './paths.js';

/** G \ X: delete the vertices in X (and their incident edges). */
export function removeVertices(G, X) {
  const drop = new Set(X);
  return G.induced(G.vertices.filter((v) => !drop.has(v)));
}

export function isSeparator(G, X) {
  return components(removeVertices(G, X)).length >= 2;
}

/** All k-element subsets of an array, in lexicographic order. */
function* subsets(items, k, start = 0, chosen = []) {
  if (chosen.length === k) { yield [...chosen]; return; }
  for (let i = start; i <= items.length - (k - chosen.length); i++) {
    chosen.push(items[i]);
    yield* subsets(items, k, i + 1, chosen);
    chosen.pop();
  }
}

/** A smallest separator, or null if there is none (complete graphs). */
export function minimumSeparator(G) {
  for (let k = 0; k <= G.order - 2; k++) {
    for (const X of subsets(G.vertices, k)) if (isSeparator(G, X)) return X;
  }
  return null;
}

/**
 * κ(G): the largest k such that G is k-connected.
 * Without a separator (complete graph K_n) this is n − 1, limited by the condition |V(G)| ≥ k + 1.
 */
export function connectivity(G) {
  if (G.order === 0) return { kappa: 0, separator: null };
  const separator = minimumSeparator(G);
  return { kappa: separator ? separator.length : G.order - 1, separator };
}

export function isKConnected(G, k) {
  return G.order >= k + 1 && connectivity(G).kappa >= k;
}
