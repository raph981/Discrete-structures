/**
 * Trees and forests: recognition, leaves, longest paths and the four equivalent
 * characterizations of trees from lectures 2 and 3.
 */
import { allPaths, components, isConnected } from './paths.js';

/** A graph is acyclic iff e(G) = v(G) − (number of components). */
export function isAcyclic(G) {
  return G.size === G.order - components(G).length;
}

/** A forest is an acyclic graph. */
export const isForest = isAcyclic;

/** A tree is a connected acyclic graph (with at least one vertex). */
export function isTree(G) {
  return G.order >= 1 && isConnected(G) && isAcyclic(G);
}

/** Leaves: vertices with exactly one neighbor. */
export function leaves(G) {
  return G.vertices.filter((v) => G.degree(v) === 1);
}

/** A longest path (most vertices) by exhaustive search – fine for the small graphs used here. */
export function longestPath(G) {
  let best = G.vertices.length ? [G.vertices[0]] : [];
  const path = [];
  const onPath = new Set();
  const extend = (x) => {
    if (path.length > best.length) best = [...path];
    for (const w of G.neighbors(x)) {
      if (onPath.has(w)) continue;
      path.push(w); onPath.add(w);
      extend(w);
      path.pop(); onPath.delete(w);
    }
  };
  for (const s of G.vertices) {
    path.push(s); onPath.add(s);
    extend(s);
    path.pop(); onPath.delete(s);
  }
  return best;
}

/**
 * Checks the four statements of the theorem "tree definitions", each with a witness when it fails.
 *   (i)   T is a tree
 *   (ii)  T is minimally connected: connected, and removing any edge disconnects it
 *   (iii) T is maximally acyclic: acyclic, and adding any new edge creates a cycle
 *   (iv)  between any two vertices there is exactly one path
 */
export function treeCharacterizations(G) {
  const connected = isConnected(G);
  const acyclic = isAcyclic(G);

  // (ii): an edge whose removal keeps the graph connected
  let keepsConnected = null;
  if (connected) {
    for (const [u, v] of G.edges) {
      if (isConnected(G.clone().removeEdge(u, v))) { keepsConnected = [u, v]; break; }
    }
  }

  // (iii): a non-edge whose addition creates no cycle (its endpoints lie in different components)
  let addableEdge = null;
  if (acyclic) {
    const comp = new Map();
    components(G).forEach((c, i) => c.forEach((v) => comp.set(v, i)));
    outer: for (const u of G.vertices) {
      for (const v of G.vertices) {
        if (u < v && comp.get(u) !== comp.get(v)) { addableEdge = [u, v]; break outer; }
      }
    }
  }

  // (iv): a pair with zero or at least two paths
  let badPair = null;
  outer2: for (const u of G.vertices) {
    for (const v of G.vertices) {
      if (u >= v) continue;
      const paths = allPaths(G, u, v, 2);
      if (paths.length !== 1) { badPair = { u, v, paths }; break outer2; }
    }
  }

  return {
    tree: { holds: G.order >= 1 && connected && acyclic, connected, acyclic },
    minimallyConnected: { holds: connected && !keepsConnected, connected, witness: keepsConnected },
    maximallyAcyclic: { holds: acyclic && !addableEdge, acyclic, witness: addableEdge },
    uniquePaths: { holds: !badPair, witness: badPair },
  };
}
